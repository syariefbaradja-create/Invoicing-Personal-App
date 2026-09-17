import Link from "next/link";
import { MagnifyingGlass, Plus, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { getClients } from "@/lib/actions/clients";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getClients(q);

  return (
    <div>
      <PageHeader
        title="Contacts"
        action={
          <LinkButton href="/contacts/new">
            <Plus size={16} weight="bold" aria-hidden="true" />
            Tambah Klien
          </LinkButton>
        }
      />

      <form className="relative mb-4 max-w-sm">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari klien..."
          className={`${inputClass} pl-9`}
        />
      </form>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5">Nama</th>
              <th className="px-4 py-2.5">Perusahaan</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Telepon</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/contacts/${c.id}`}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <UserCircle size={18} className="text-muted-foreground" aria-hidden="true" />
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.company || "-"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.email || "-"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.phone || "-"}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Belum ada klien
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
