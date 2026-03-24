"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCode } from "@/lib/actions";

export default function AdminCodeClient({ initialCode }: { initialCode: string }) {
  const [digits, setDigits] = useState(initialCode.split(""));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const router = useRouter();

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    setSaved(false);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 3) refs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  async function handleSave() {
    const code = digits.join("");
    if (!/^\d{4}$/.test(code)) return;

    setSaving(true);
    try {
      await updateCode(code);
      setSaved(true);
    } catch {
      setSaved(false);
    }
    setSaving(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Image src="/Background_Oestereiden.jpg" alt="" fill className="object-cover" priority />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl p-10 shadow-2xl">
        <div className="flex justify-center">
          <Image src="/oestereiden-logo.png" alt="SuS Oestereiden Logo" width={80} height={80} className="drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)] brightness-110 contrast-[0.9] saturate-[0.85] opacity-90" />
        </div>
        <h1 className="text-center text-xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
          Code verwalten
        </h1>

        <div className="flex gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="flex h-16 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-center text-3xl font-bold text-white shadow-inner outline-none focus:border-white/60 focus:ring-1 focus:ring-white/40 [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]"
            />
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || digits.join("").length !== 4}
          className="w-full rounded-xl border border-white/30 bg-white/25 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/35 disabled:opacity-50"
        >
          {saving ? "Speichern…" : "Code speichern"}
        </button>

        {saved && (
          <p className="text-sm text-green-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
            Code gespeichert
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-sm text-white/50 transition-colors hover:text-white/80"
          >
            Dashboard
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-sm text-white/50 transition-colors hover:text-white/80"
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
