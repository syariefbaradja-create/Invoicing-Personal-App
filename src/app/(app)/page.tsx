import Link from "next/link";
import { getDashboardSummary } from "@/lib/actions/dashboard";
import { formatCurrency, isOverdue } from "@/lib/invoice";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Buat Invoice Baru
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Tertagih Bulan Ini</div>
          <div className="mt-1 text-xl font-semibold">
            {formatCurrency(summary.totalTertagihBulanIni)}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Belum Dibayar</div>
          <div className="mt-1 text-xl font-semibold">
            {formatCurrency(summary.totalBelumDibayar)}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Overdue</div>
          <div className="mt-1 text-xl font-semibold">
            {summary.overdueCount} invoice
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Invoice Terbaru</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">No. Invoice</th>
              <th className="py-2">Klien</th>
              <th className="py-2">Jatuh Tempo</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {summary.recentInvoices.map((inv) => (
              <tr key={inv.id} className="border-b">
                <td className="py-2">
                  <Link href={`/invoices/${inv.id}`} className="text-slate-900 underline">
                    {inv.number}
                  </Link>
                </td>
                <td className="py-2">{inv.client.name}</td>
                <td className="py-2">
                  {inv.dueDate.toLocaleDateString("id-ID")}
                </td>
                <td className="py-2">
                  {isOverdue(inv.dueDate, inv.status) ? "Overdue" : inv.status}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatCurrency(inv.total, inv.currency)}
                </td>
              </tr>
            ))}
            {summary.recentInvoices.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Belum ada invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
