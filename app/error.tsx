"use client";

import Image from "next/image";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Image src="/Background_Oestereiden.jpg" alt="" fill className="object-cover" priority />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl p-10 shadow-2xl">
        <div className="flex justify-center">
          <Image src="/oestereiden-logo.png" alt="SuS Oestereiden Logo" width={80} height={80} className="drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)] brightness-110 contrast-[0.9] saturate-[0.85] opacity-90" />
        </div>
        <h1 className="text-center text-xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
          Etwas ist schiefgelaufen
        </h1>
        <p className="text-center text-sm text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          Bitte versuche es erneut.
        </p>
        <button
          onClick={reset}
          className="w-full rounded-xl border border-white/30 bg-white/25 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/35"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
