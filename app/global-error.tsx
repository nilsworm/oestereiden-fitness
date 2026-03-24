"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="de">
      <body className="flex min-h-[100dvh] items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4 p-10">
          <h1 className="text-xl font-semibold text-white">Etwas ist schiefgelaufen</h1>
          <button
            onClick={reset}
            className="rounded-xl bg-white/20 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/30"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
