import Link from "next/link";
import { getInvoices, type InvoiceListFilter } from "@/lib/actions/invoices";
import { formatCurrency, isOverdue } from "@/lib/invoice";

const STATUS_OPTIONS = ["ALL", "DRAFT", "SENT", "PAID", "UNPAID", "OVERDUE"] as const;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: InvoiceListFilter = {
    status: (status as InvoiceListFilter["status"]) ?? "ALL",
  };
  const invoices = await getInvoices(filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Buat Invoice Baru
        </Link>
      </div>

      <div className="flex gap-2">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/invoices?status=${s}`}
            className={`rounded px-3 py-1 text-sm ${
              (filter.status ?? "ALL") === s
                ? "bg-slate-900 text-white"
                : "border hover:bg-slate-50"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">No. Invoice</th>
            <th className="py-2">Klien</th>
            <th className="py-2">Terbit</th>
            <th className="py-2">Jatuh Tempo</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Total</th>
            <th className="py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b">
              <td className="py-2">
                <Link href={`/invoices/${inv.id}`} className="text-slate-900 underline">
                  {inv.number}
                </Link>
              </td>
              <td className="py-2">{inv.client.name}</td>
              <td className="py-2">{inv.issueDate.toLocaleDateString("id-ID")}</td>
              <td className="py-2">{inv.dueDate.toLocaleDateString("id-ID")}</td>
              <td className="py-2">
                {isOverdue(inv.dueDate, inv.status) ? "Overdue" : inv.status}
              </td>
              <td className="py-2 text-right tabular-nums">
                {formatCurrency(inv.total, inv.currency)}
              </td>
              <td className="py-2 text-right">
                <Link href={`/invoices/${inv.id}`} className="text-slate-500 hover:underline">
                  Buka
                </Link>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-slate-400">
                Tidak ada invoice
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
