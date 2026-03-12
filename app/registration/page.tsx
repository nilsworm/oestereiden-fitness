"use client";

import { useActionState, useState, useCallback } from "react";
import Image from "next/image";
import { registerUser } from "@/lib/actions";

type InputFieldProps = {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  error?: string;
  onBlur?: (name: string, value: string) => void;
};

function InputField({ label, name, type, placeholder, required, error, onBlur }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        onBlur={onBlur ? (e) => onBlur(name, e.target.value) : undefined}
        className="peer rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-2.5 text-sm text-white shadow-inner placeholder:text-white/50 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/40 aria-[invalid=true]:border-red-400/70 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-400/50"
      />
      {error && <p className="text-xs text-red-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">{error}</p>}
    </div>
  );
}

const validationRules: Record<string, (value: string) => string | null> = {
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

export default function RegistrationPage() {
  const [state, formAction, isPending] = useActionState(registerUser, {});
  const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});

  const handleBlur = useCallback((field: string, value: string) => {
    const rule = validationRules[field];
    if (!rule) return;
    setBlurErrors((prev) => {
      const error = rule(value);
      if (error) return { ...prev, [field]: error };
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const errors = state.errors ?? {};

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Image src="/Background_Oestereiden.jpg" alt="" fill className="object-cover" priority />
      <form
        action={formAction}
        className="relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl p-10 shadow-2xl"
      >
        <div className="flex justify-center">
          <Image src="/oestereiden-logo.png" alt="SuS Oestereiden Logo" width={80} height={80} />
        </div>
        <h1 className="text-center text-xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">Registrierung</h1>
        <InputField label="Name" name="name" type="text" placeholder="Max Mustermann" required error={errors.name ?? blurErrors.name} onBlur={handleBlur} />
        <InputField label="E-Mail" name="email" type="email" placeholder="max@beispiel.de" required error={errors.email ?? blurErrors.email} onBlur={handleBlur} />
        <InputField label="Telefonnummer" name="phone" type="tel" placeholder="+49 123 456789" required error={errors.phone ?? blurErrors.phone} onBlur={handleBlur} />
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-xl border border-white/30 bg-white/25 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/35 disabled:opacity-50 disabled:cursor-not-allowed"
        >{isPending ? "Wird gesendet…" : "Absenden"}</button>
      </form>
    </div>
  );
}
