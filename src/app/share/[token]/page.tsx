import { notFound } from "next/navigation";
import { FilePdf, Receipt, Paperclip, FileImage } from "@phosphor-icons/react/dist/ssr";
import { getInvoiceByPublicToken } from "@/lib/actions/invoices";
import { getSettings } from "@/lib/actions/settings";
import { getPaymentSummary } from "@/lib/paymentSummary";
import { formatCurrency, isOverdue, terbilangRupiah } from "@/lib/invoice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LinkButton } from "@/components/ui/Button";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [invoice, profile] = await Promise.all([
    getInvoiceByPublicToken(token),
    getSettings(),
  ]);

  if (!invoice) notFound();

  const paymentSummary = getPaymentSummary(invoice);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-center gap-2 text-muted-foreground">
          <Receipt size={18} aria-hidden="true" />
          <span className="text-sm">{profile.businessName || profile.ownerName}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between border-b border-border pb-5">
            <div>
              <div className="text-xl font-bold tracking-tight text-primary">INVOICE</div>
              <div className="text-sm text-muted-foreground">{invoice.number}</div>
            </div>
            <StatusBadge status={invoice.status} overdue={isOverdue(invoice.dueDate, invoice.status)} />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ditagihkan kepada
              </div>
              <div className="mt-1 font-semibold text-foreground">{invoice.client.name}</div>
              {invoice.client.company && (
                <div className="text-sm text-muted-foreground">{invoice.client.company}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Jatuh Tempo
              </div>
              <div className="mt-1 font-medium text-foreground">
                {invoice.dueDate.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="mb-4 overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2">Deskripsi</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-2 text-foreground">{item.description}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {item.qty}
                    </td>
                    <td className="py-2 text-right font-medium tabular-nums text-foreground">
                      {formatCurrency(item.subtotal, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-[260px] space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Diskon</span>
                <span className="tabular-nums">
                  -{formatCurrency(invoice.discountAmount, invoice.currency)}
                </span>
              </div>
            )}
            {invoice.charges.map((charge) => (
              <div key={charge.id} className="flex justify-between text-muted-foreground">
                <span>{charge.label}</span>
                <span className="tabular-nums">
                  {formatCurrency(
                    charge.isPercent
                      ? (invoice.subtotal - invoice.discountAmount) * (charge.amount / 100)
                      : charge.amount,
                    invoice.currency
                  )}
                </span>
              </div>
            ))}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Pajak</span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.taxAmount, invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
            {invoice.currency === "IDR" && (
              <div className="pt-1 text-xs italic text-muted-foreground">
                Terbilang: {terbilangRupiah(invoice.total)}
              </div>
            )}
          </div>

          {paymentSummary.isPartial && (
            <div className="mb-6">
              <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-paid-foreground"
                  style={{
                    width: `${Math.min(100, (paymentSummary.collected / invoice.total) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(paymentSummary.collected, invoice.currency)} Collected</span>
                <span>{formatCurrency(paymentSummary.due, invoice.currency)} Due</span>
              </div>
            </div>
          )}

          {(profile.bankName || profile.bankAccountNumber) && (
            <div className="mt-6 rounded-md bg-muted/50 p-4 text-sm">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Metode Pembayaran
              </div>
              <div className="text-foreground">{profile.bankName}</div>
              <div className="text-foreground">{profile.bankAccountName}</div>
              <div className="text-foreground">{profile.bankAccountNumber}</div>
            </div>
          )}

          {invoice.notes && (
            <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground">
                Catatan
              </div>
              {invoice.notes}
            </div>
          )}

          {invoice.attachments.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-foreground">
                <Paperclip size={14} aria-hidden="true" />
                Lampiran
              </div>
              <ul className="space-y-1">
                {invoice.attachments.map((att) => {
                  const Icon = att.mimeType === "application/pdf" ? FilePdf : FileImage;
                  return (
                    <li key={att.id}>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Icon size={16} className="shrink-0" aria-hidden="true" />
                        {att.filename}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-center border-t border-border pt-5">
            <LinkButton href={`/api/public/invoice/${token}/pdf`} target="_blank">
              <FilePdf size={16} aria-hidden="true" />
              Download PDF
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
