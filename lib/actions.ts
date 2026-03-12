"use server";

import connectDB from "@/lib/mongodb";
import { auth, signIn } from "@/lib/auth";
import User from "@/app/database/user.model";
import Code from "@/app/database/code.model";
import LoginAttempt from "@/app/database/login-attempt.model";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Session } from "next-auth";

const REG_MAX = 10;
const REG_WINDOW_MS = 15 * 60 * 1000;

function sanitize(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// --- Helpers ---

function requireAuth(session: Session | null, role?: string) {
  if (!session?.user) redirect(role === "admin" ? "/admin/login" : "/registration");
  if (role && session.user.role !== role) redirect(role === "admin" ? "/admin/login" : "/registration");
}

// --- Registration ---

const rules: Record<string, (v: string) => string | null> = {
  name: (v) => {
    if (!v.trim()) return "Name ist erforderlich";
    if (v.trim().length < 2) return "Name muss mindestens 2 Zeichen lang sein";
    if (/\d/.test(v)) return "Name darf keine Zahlen enthalten";
    return null;
  },
  email: (v) => {
    if (!v.trim()) return "E-Mail ist erforderlich";
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/.test(v)) return "Ungültige E-Mail-Adresse";
    return null;
  },
  phone: (v) => {
    if (!v.trim()) return "Telefonnummer ist erforderlich";
    const cleaned = v.trim().replace(/[\s\-/()]/g, "");
    if (!/^\+?\d{7,15}$/.test(cleaned)) return "Ungültige Telefonnummer";
    return null;
  },
};

type FormState = { errors?: Record<string, string>; message?: string };

export async function registerUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const error = rule((formData.get(field) as string) ?? "");
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length > 0) return { errors };

  const name = sanitize((formData.get("name") as string).trim());
  const email = sanitize((formData.get("email") as string).trim().toLowerCase());
  const phone = sanitize((formData.get("phone") as string).trim());

  try {
    await connectDB();

    // Rate limiting: max 10 Registrierungen pro IP in 15 Minuten
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const since = new Date(Date.now() - REG_WINDOW_MS);
    const attempts = await LoginAttempt.countDocuments({ ip, type: "registration", createdAt: { $gt: since } });
    if (attempts >= REG_MAX) return { message: "Zu viele Versuche. Bitte warte 15 Minuten." };

    await LoginAttempt.create({ ip, type: "registration" });
    await User.create({ name, email, phone });
    await signIn("user-registration", { email, redirect: false });
  } catch {
    return { message: "Registrierung fehlgeschlagen. Bitte versuche es erneut." };
  }
  redirect("/code");
}

// --- User: Get Code ---

export async function getCodeForUser() {
  const session = await auth();
  requireAuth(session);

  try {
    await connectDB();
    const doc = await Code.findOne().lean();
    return doc?.value ?? "0000";
  } catch {
    throw new Error("Daten konnten nicht geladen werden.");
  }
}

// --- Admin: Get Users ---

export async function getUsers() {
  const session = await auth();
  requireAuth(session, "admin");

  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(users));
  } catch {
    throw new Error("Benutzerdaten konnten nicht geladen werden.");
  }
}

// --- Admin: Code ---

export async function getCode() {
  const session = await auth();
  requireAuth(session, "admin");

  try {
    await connectDB();
    const doc = await Code.findOne().lean();
    return doc?.value ?? "0000";
  } catch {
    throw new Error("Code konnte nicht geladen werden.");
  }
}

export async function updateCode(value: string) {
  const session = await auth();
  requireAuth(session, "admin");

  if (!/^\d{4}$/.test(value)) throw new Error("Code muss genau 4 Ziffern haben.");

  try {
    await connectDB();
    await Code.findOneAndUpdate({}, { value }, { upsert: true });
    return value;
  } catch {
    throw new Error("Code konnte nicht gespeichert werden.");
  }
}
