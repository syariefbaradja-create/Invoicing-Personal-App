import Link from "next/link";
import { Wallet, Hourglass, WarningCircle, Plus } from "@phosphor-icons/react/dist/ssr";
import { getDashboardSummary, getMonthlyCashflowTrend } from "@/lib/actions/dashboard";
import { formatCurrency, isOverdue } from "@/lib/invoice";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CashflowChart } from "@/components/CashflowChart";

export default async function DashboardPage() {
  const [summary, cashflowTrend] = await Promise.all([
    getDashboardSummary(),
    getMonthlyCashflowTrend(),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <LinkButton href="/invoices/new">
            <Plus size={16} weight="bold" aria-hidden="true" />
            Buat Invoice Baru
          </LinkButton>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          icon={Wallet}
          iconClass="bg-paid text-paid-foreground"
          label="Tertagih Bulan Ini"
          value={formatCurrency(summary.totalTertagihBulanIni)}
        />
        <KpiCard
          icon={Hourglass}
          iconClass="bg-unpaid text-unpaid-foreground"
          label="Belum Dibayar"
          value={formatCurrency(summary.totalBelumDibayar)}
        />
        <KpiCard
          icon={WarningCircle}
          iconClass="bg-overdue text-overdue-foreground"
          label="Overdue"
          value={`${summary.overdueCount} invoice`}
        />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-base font-semibold text-foreground">Tren Cashflow Bulanan</h2>
        <CashflowChart data={cashflowTrend} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-foreground">Invoice Terbaru</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">No. Invoice</th>
                <th className="px-4 py-2.5">Klien</th>
                <th className="px-4 py-2.5">Jatuh Tempo</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentInvoices.map((inv) => (
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
              {summary.recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada invoice
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${iconClass}`}>
          <Icon size={18} weight="fill" aria-hidden="true" />
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
