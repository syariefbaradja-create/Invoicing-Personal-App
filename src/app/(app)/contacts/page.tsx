import Link from "next/link";
import { getClients } from "@/lib/actions/clients";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <Link
          href="/contacts/new"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Tambah Klien
        </Link>
      </div>

      <form className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari klien..."
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </form>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">Nama</th>
            <th className="py-2">Perusahaan</th>
            <th className="py-2">Email</th>
            <th className="py-2">Telepon</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">
                <Link href={`/contacts/${c.id}`} className="text-slate-900 underline">
                  {c.name}
                </Link>
              </td>
              <td className="py-2">{c.company || "-"}</td>
              <td className="py-2">{c.email || "-"}</td>
              <td className="py-2">{c.phone || "-"}</td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-slate-400">
                Belum ada klien
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
