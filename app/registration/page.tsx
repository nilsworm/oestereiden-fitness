import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import RegistrationClient from "./client";

export default async function RegistrationPage() {
  const session = await auth();
  if (session?.user?.role === "user") redirect("/code");
  if (session?.user?.role === "admin") redirect("/admin/dashboard");

  return <RegistrationClient />;
}
