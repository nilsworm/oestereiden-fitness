"use server";

import connectDB from "@/lib/mongodb";
import { auth, signIn } from "@/lib/auth";
import User from "@/app/database/user.model";
import Code from "@/app/database/code.model";
import { redirect } from "next/navigation";

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Ungültige E-Mail-Adresse";
    return null;
  },
  phone: (v) => {
    if (!v.trim()) return "Telefonnummer ist erforderlich";
    if (!/^\+?[\d\s]{7,}$/.test(v.trim())) return "Ungültige Telefonnummer";
    return null;
  },
};

type FormState = { errors?: Record<string, string> };

export async function registerUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const error = rule((formData.get(field) as string) ?? "");
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length > 0) return { errors };

  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim();
  const phone = (formData.get("phone") as string).trim();

  await connectDB();
  await User.create({ name, email, phone });
  await signIn("user-registration", { email, redirect: false });
  redirect("/code");
}

// --- User: Get Code ---

export async function getCodeForUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectDB();
  const doc = await Code.findOne().lean();
  return doc?.value ?? "0000";
}

// --- Admin: Get Users ---

export async function getUsers() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(users));
}

// --- Admin: Code ---

export async function getCode() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  await connectDB();
  const doc = await Code.findOne().lean();
  return doc?.value ?? "0000";
}

export async function updateCode(value: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized");

  if (!/^\d{4}$/.test(value)) throw new Error("Code muss genau 4 Ziffern haben");

  await connectDB();
  await Code.findOneAndUpdate({}, { value }, { upsert: true });
  return value;
}
