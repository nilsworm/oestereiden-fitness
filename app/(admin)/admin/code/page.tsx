import { getCode } from "@/lib/actions";
import AdminCodeClient from "./client";

export default async function AdminCodePage() {
  const code = await getCode();
  return <AdminCodeClient initialCode={code} />;
}
