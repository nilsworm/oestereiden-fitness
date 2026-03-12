import { redirect } from "next/navigation";
import Image from "next/image";
import { getCodeForUser } from "@/lib/actions";

export default async function CodePage() {
  let code: string;
  try {
    code = await getCodeForUser();
  } catch {
    redirect("/registration");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Image src="/Background_Oestereiden.jpg" alt="" fill className="object-cover" priority />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl p-10 shadow-2xl">
        <div className="flex justify-center">
          <Image src="/oestereiden-logo.png" alt="SuS Oestereiden Logo" width={80} height={80} className="drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)] brightness-110 contrast-[0.9] saturate-[0.85] opacity-90" />
        </div>
        <h1 className="text-center text-xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
          Dein Code
        </h1>
        <div className="flex gap-3">
          {code.split("").map((digit, i) => (
            <span
              key={i}
              className="flex h-16 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-3xl font-bold text-white shadow-inner [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]"
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
