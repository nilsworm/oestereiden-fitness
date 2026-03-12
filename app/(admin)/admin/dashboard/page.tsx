import { getUsers } from "@/lib/actions";
import DashboardClient from "./client";

export default async function DashboardPage() {
  const users = await getUsers();
  return <DashboardClient users={users} />;
}
