import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, updateClient, deleteClient } from "@/lib/actions/clients";
import { ClientForm } from "@/components/ClientForm";
import { formatCurrency } from "@/lib/invoice";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <form action={deleteWithId}>
          <button className="text-sm text-red-600 hover:underline">Hapus Klien</button>
        </form>
      </div>

      <ClientForm client={client} action={updateWithId} />

      <div>
        <h2 className="mb-3 text-lg font-medium">Riwayat Invoice</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">No. Invoice</th>
              <th className="py-2">Tanggal</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {client.invoices.map((inv) => (
              <tr key={inv.id} className="border-b">
                <td className="py-2">
                  <Link href={`/invoices/${inv.id}`} className="text-slate-900 underline">
                    {inv.number}
                  </Link>
                </td>
                <td className="py-2">{inv.issueDate.toLocaleDateString("id-ID")}</td>
                <td className="py-2">{inv.status}</td>
                <td className="py-2 text-right tabular-nums">
                  {formatCurrency(inv.total, inv.currency)}
                </td>
              </tr>
            ))}
            {client.invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Belum ada invoice untuk klien ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
