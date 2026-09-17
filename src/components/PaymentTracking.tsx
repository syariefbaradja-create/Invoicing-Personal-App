"use client";

import { useState } from "react";
import { Wallet, Trash, Plus } from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/lib/invoice";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Payment = {
  id: string;
  amountReceived: number;
  transactionCharge: number;
  paymentDate: Date;
  paymentMethod: string | null;
  note: string | null;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentTracking({
  invoiceId,
  total,
  currency,
  payments,
  recordPayment,
  deletePayment,
}: {
  invoiceId: string;
  total: number;
  currency: string;
  payments: Payment[];
  recordPayment: (invoiceId: string, formData: FormData) => Promise<void>;
  deletePayment: (paymentId: string, invoiceId: string) => Promise<void>;
}) {
  const collected = payments.reduce((sum, p) => sum + p.amountReceived, 0);
  const due = Math.max(total - collected, 0);
  const percent = total > 0 ? Math.min(100, (collected / total) * 100) : 0;

  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await recordPayment(invoiceId, new FormData(e.currentTarget));
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencatat pembayaran");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Wallet size={16} aria-hidden="true" />
          Payment Tracking
        </span>
        {due > 0 && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus size={14} weight="bold" aria-hidden="true" />
            Record Payment
          </button>
        )}
      </div>

      <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-paid-foreground transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mb-4 flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(collected, currency)} Collected</span>
        <span>{formatCurrency(due, currency)} Due</span>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 space-y-3 rounded-md border border-border p-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount Received" required>
              <input
                type="number"
                name="amountReceived"
                min={0}
                step="any"
                defaultValue={due}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Transaction Charge">
              <input
                type="number"
                name="transactionCharge"
                min={0}
                step="any"
                defaultValue={0}
                className={inputClass}
              />
            </Field>
            <Field label="Payment Date">
              <input
                type="date"
                name="paymentDate"
                defaultValue={todayISO()}
                className={inputClass}
              />
            </Field>
            <Field label="Payment Method">
              <select name="paymentMethod" defaultValue="Transfer Bank" className={inputClass}>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="Cash">Cash</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </Field>
          </div>
          <Field label="Catatan">
            <input type="text" name="note" className={inputClass} />
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      {payments.length > 0 && (
        <ul className="space-y-1.5">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <div className="font-medium tabular-nums text-foreground">
                  {formatCurrency(p.amountReceived, currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.paymentDate.toLocaleDateString("id-ID")}
                  {p.paymentMethod ? ` · ${p.paymentMethod}` : ""}
                  {p.note ? ` · ${p.note}` : ""}
                </div>
              </div>
              <form action={deletePayment.bind(null, p.id, invoiceId)}>
                <button
                  type="submit"
                  aria-label="Hapus pembayaran"
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                >
                  <Trash size={14} aria-hidden="true" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
