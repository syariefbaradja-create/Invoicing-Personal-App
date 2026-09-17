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

const PERIOD_OPTIONS = [
  { value: "ALL", label: "Semua Waktu" },
  { value: "MONTH", label: "Bulan Ini" },
  { value: "YEAR", label: "Tahun Ini" },
] as const;

function periodToRange(period: string) {
  const now = new Date();
  if (period === "MONTH") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
    };
  }
  if (period === "YEAR") {
    return {
      from: new Date(now.getFullYear(), 0, 1).toISOString(),
      to: new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString(),
    };
  }
  return {};
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; period?: string }>;
}) {
  const { status, period } = await searchParams;
  const currentStatus = (status as InvoiceListFilter["status"]) ?? "ALL";
  const currentPeriod = period ?? "ALL";

  const filter: InvoiceListFilter = {
    status: currentStatus,
    ...periodToRange(currentPeriod),
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

      <div className="mb-3 flex gap-1.5">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s.value}
            href={`/invoices?status=${s.value}&period=${currentPeriod}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentStatus === s.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex gap-1.5">
        {PERIOD_OPTIONS.map((p) => (
          <Link
            key={p.value}
            href={`/invoices?status=${currentStatus}&period=${p.value}`}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              currentPeriod === p.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {p.label}
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
