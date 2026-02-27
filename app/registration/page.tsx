import Form from "next/form";
import Image from "next/image";

type InputFieldProps = {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  pattern?: string;
};

function InputField({ label, name, type, placeholder, required, pattern }: InputFieldProps) {
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
        pattern={pattern}
        className="rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-2.5 text-sm text-white shadow-inner placeholder:text-white/50 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/40"
      />
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Image
        src="/Background_Oestereiden.jpg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <Form
        action=""
        className="relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl p-10 shadow-2xl"
      >
        <div className="flex justify-center">
          <Image src="/oestereiden-logo.png" alt="SuS Oestereiden Logo" width={80} height={80} />
        </div>
        <h1 className="text-center text-xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">Registrierung</h1>
        <InputField label="Name" name="name" type="text" placeholder="Max Mustermann" required />
        <InputField label="E-Mail" name="email" type="email" placeholder="max@beispiel.de" required />
        <InputField label="Telefonnummer" name="phone" type="tel" placeholder="+49 123 456789" required pattern="[+\d]+" />
        <button
          type="submit"
          className="mt-2 rounded-xl border border-white/30 bg-white/25 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/35"
        >Absenden</button>
      </Form>
    </div>
  );
}


