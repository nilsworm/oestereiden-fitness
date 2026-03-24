"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

type SortKey = "name" | "email" | "phone" | "createdAt";
type SortDir = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "E-Mail" },
  { key: "phone", label: "Telefon" },
  { key: "createdAt", label: "Registriert" },
];

function matchesSearch(user: User, q: string) {
  const lower = q.toLowerCase();
  return user.name.toLowerCase().includes(lower)
    || user.email.toLowerCase().includes(lower)
    || user.phone.includes(q);
}

export default function DashboardClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const router = useRouter();
  const perPage = 10;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) return setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    setSortKey(key);
    setSortDir("asc");
  };

  const filtered = useMemo(() => {
    const q = search.trim();
    const list = q ? users.filter((u) => matchesSearch(u, q)) : [...users];

    list.sort((a, b) => {
      const cmp = sortKey === "createdAt"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [users, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  // Reset page when filter/sort changes
  const resetPage = () => setPage(0);

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center">
      <Image src="/Background_Oestereiden.jpg" alt="" fill className="object-cover" priority />

      <div className="relative z-10 flex w-full max-w-3xl flex-col gap-4 p-6 pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
            Dashboard – Benutzer
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/admin/code")}
              className="rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2 text-sm text-white transition-colors hover:bg-white/35"
            >
              Code
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2 text-sm text-white transition-colors hover:bg-white/35"
            >
              Abmelden
            </button>
          </div>
        </div>

        <input
          type="search"
          placeholder="Suche nach Name, E-Mail oder Telefon…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-white/50 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/40"
        />

        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/20 backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left text-sm text-white">
            <thead>
              <tr className="border-b border-white/20">
                {columns.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="cursor-pointer select-none px-4 py-3 font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] hover:bg-white/10 transition-colors"
                  >
                    {label} {sortKey === key && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-white/60">
                    Keine Benutzer gefunden
                  </td>
                </tr>
              ) : (
                paginated.map((user) => (
                  <tr key={user._id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone}</td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString("de-DE")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/35 disabled:opacity-30"
            >
              Zurück
            </button>
            <span className="text-sm text-white/70">
              Seite {page + 1} von {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/35 disabled:opacity-30"
            >
              Weiter
            </button>
          </div>
        )}

        <p className="text-center text-xs text-white/50">
          {filtered.length} von {users.length} Benutzer{users.length !== 1 && "n"}
        </p>
      </div>
    </div>
  );
}
