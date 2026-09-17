import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { getInvoices, type InvoiceListFilter } from "@/lib/actions/invoices";
import { formatCurrency, isOverdue } from "@/lib/invoice";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Terkirim" },
  { value: "PAID", label: "Lunas" },
  { value: "UNPAID", label: "Belum Lunas" },
  { value: "OVERDUE", label: "Overdue" },
] as const;

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
    <div>
      <PageHeader
        title="Invoices"
        action={
          <LinkButton href="/invoices/new">
            <Plus size={16} weight="bold" aria-hidden="true" />
            Buat Invoice Baru
          </LinkButton>
        }
      />

      <div className="mb-4 flex gap-1.5">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s.value}
            href={`/invoices?status=${s.value}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              (filter.status ?? "ALL") === s.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5">No. Invoice</th>
              <th className="px-4 py-2.5">Klien</th>
              <th className="px-4 py-2.5">Terbit</th>
              <th className="px-4 py-2.5">Jatuh Tempo</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {inv.number}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-foreground">{inv.client.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {inv.issueDate.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {inv.dueDate.toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={inv.status} overdue={isOverdue(inv.dueDate, inv.status)} />
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                  {formatCurrency(inv.total, inv.currency)}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Tidak ada invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
