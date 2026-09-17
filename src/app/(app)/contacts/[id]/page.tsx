import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import { getClient, updateClient, deleteClient } from "@/lib/actions/clients";
import { ClientForm } from "@/components/ClientForm";
import { formatCurrency, isOverdue } from "@/lib/invoice";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const updateWithId = updateClient.bind(null, id);
  const deleteWithId = deleteClient.bind(null, id);

  return (
    <div>
      <PageHeader
        title={client.name}
        action={
          <form action={deleteWithId}>
            <button className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
              <Trash size={16} aria-hidden="true" />
              Hapus Klien
            </button>
          </form>
        }
      />

      <div className="grid grid-cols-[1fr,1.4fr] gap-6">
        <ClientForm client={client} action={updateWithId} />

        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">Riwayat Invoice</h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5">No. Invoice</th>
                  <th className="px-4 py-2.5">Tanggal</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {client.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {inv.issueDate.toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        status={inv.status}
                        overdue={isOverdue(inv.dueDate, inv.status)}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                  </tr>
                ))}
                {client.invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      Belum ada invoice untuk klien ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
