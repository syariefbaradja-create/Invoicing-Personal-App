"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, X } from "@phosphor-icons/react/dist/ssr";
import { calculateInvoiceTotals, calculateItemNet, formatCurrency, terbilangRupiah } from "@/lib/invoice";
import type { InvoiceInput, InvoiceItemInput, ChargeItemInput } from "@/lib/actions/invoices";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type ClientOption = { id: string; name: string; company: string | null };

type InitialInvoice = {
  id?: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "UNPAID";
  theme: "MINIMAL_CLEAN" | "MODERN_BOLD" | "CLASSIC_PROFESSIONAL";
  currency: string;
  discountType: "PERCENT" | "FIXED" | null;
  discountValue: number;
  taxEnabled: boolean;
  taxRate: number;
  notes: string;
  items: InvoiceItemInput[];
  charges: ChargeItemInput[];
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function inTwoWeeksISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

const emptyItem: InvoiceItemInput = {
  description: "",
  qty: 1,
  unitPrice: 0,
  discountType: null,
  discountValue: 0,
};
const emptyCharge: ChargeItemInput = { label: "", amount: 0, isPercent: false };
const selectClass = inputClass;

export function InvoiceEditor({
  clients,
  initial,
  onSubmit,
}: {
  clients: ClientOption[];
  initial?: InitialInvoice;
  onSubmit: (input: InvoiceInput) => Promise<void>;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initial?.clientId ?? clients[0]?.id ?? "");
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? inTwoWeeksISO());
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [theme, setTheme] = useState(initial?.theme ?? "MODERN_BOLD");
  const [currency] = useState(initial?.currency ?? "IDR");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED" | "">(
    initial?.discountType ?? ""
  );
  const [discountValue, setDiscountValue] = useState(initial?.discountValue ?? 0);
  const [taxEnabled, setTaxEnabled] = useState(initial?.taxEnabled ?? false);
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? 0);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<InvoiceItemInput[]>(
    initial?.items?.length ? initial.items : [emptyItem]
  );
  const [charges, setCharges] = useState<ChargeItemInput[]>(initial?.charges ?? []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      calculateInvoiceTotals(items, {
        discountType: discountType || null,
        discountValue,
        taxEnabled,
        taxRate,
        charges,
      }),
    [items, discountType, discountValue, taxEnabled, taxRate, charges]
  );

  const selectedClient = clients.find((c) => c.id === clientId);

  function updateItem(index: number, patch: Partial<InvoiceItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCharge(index: number, patch: Partial<ChargeItemInput>) {
    setCharges((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function addCharge() {
    setCharges((prev) => [...prev, { ...emptyCharge }]);
  }

  function removeCharge(index: number) {
    setCharges((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await onSubmit({
        clientId,
        issueDate,
        dueDate,
        status,
        theme,
        currency,
        discountType: discountType || null,
        discountValue,
        taxEnabled,
        taxRate,
        notes,
        items,
        charges,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      {/* Left: form */}
      <div className="space-y-5 rounded-lg border border-border bg-card p-5">
        <Field label="Klien" required>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className={selectClass}
          >
            <option value="" disabled>
              Pilih klien
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal Terbit">
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Jatuh Tempo">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={selectClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Terkirim</option>
              <option value="PAID">Lunas</option>
              <option value="UNPAID">Belum Lunas</option>
            </select>
          </Field>
          <Field label="Theme">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
              className={selectClass}
            >
              <option value="MODERN_BOLD">Modern Bold</option>
              <option value="MINIMAL_CLEAN">Minimal Clean</option>
              <option value="CLASSIC_PROFESSIONAL">Classic Professional</option>
            </select>
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Item</span>
            <button
              type="button"
              onClick={addItem}
              className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Plus size={14} weight="bold" aria-hidden="true" />
              Tambah Item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="rounded-md border border-border p-2">
                <div className="mb-1.5 flex gap-2">
                  <input
                    placeholder="Deskripsi jasa"
                    value={item.description}
                    onChange={(e) => updateItem(i, { description: e.target.value })}
                    className={`${inputClass} flex-1 py-1.5`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    aria-label="Hapus item"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                    className={`${inputClass} w-16 py-1.5`}
                  />
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Harga satuan"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                    className={`${inputClass} flex-1 py-1.5`}
                  />
                  <select
                    value={item.discountType ?? ""}
                    onChange={(e) =>
                      updateItem(i, {
                        discountType: (e.target.value || null) as InvoiceItemInput["discountType"],
                      })
                    }
                    className={`${selectClass} w-20 py-1.5 text-xs`}
                    aria-label="Tipe diskon item"
                  >
                    <option value="">Diskon</option>
                    <option value="PERCENT">%</option>
                    <option value="FIXED">Rp</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={item.discountValue ?? 0}
                    onChange={(e) => updateItem(i, { discountValue: Number(e.target.value) })}
                    disabled={!item.discountType}
                    className={`${inputClass} w-20 py-1.5 disabled:opacity-50`}
                    aria-label="Nilai diskon item"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Additional Charges</span>
            <button
              type="button"
              onClick={addCharge}
              className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Plus size={14} weight="bold" aria-hidden="true" />
              Tambah Biaya
            </button>
          </div>
          {charges.length > 0 && (
            <div className="space-y-2">
              {charges.map((charge, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Label (mis. Ongkir)"
                    value={charge.label}
                    onChange={(e) => updateCharge(i, { label: e.target.value })}
                    className={`${inputClass} flex-1 py-1.5`}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Nominal"
                    value={charge.amount}
                    onChange={(e) => updateCharge(i, { amount: Number(e.target.value) })}
                    className={`${inputClass} w-28 py-1.5`}
                  />
                  <select
                    value={charge.isPercent ? "PERCENT" : "FIXED"}
                    onChange={(e) => updateCharge(i, { isPercent: e.target.value === "PERCENT" })}
                    className={`${selectClass} w-20 py-1.5`}
                  >
                    <option value="FIXED">Rp</option>
                    <option value="PERCENT">%</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCharge(i)}
                    aria-label="Hapus biaya"
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                  >
                    <Trash size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Diskon Invoice">
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
                className={`${selectClass} w-24`}
              >
                <option value="">Tidak ada</option>
                <option value="PERCENT">%</option>
                <option value="FIXED">Rp</option>
              </select>
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                disabled={!discountType}
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
          </Field>
          <Field label="Pajak/PPN">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <input
                type="number"
                min={0}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                disabled={!taxEnabled}
                placeholder="% pajak"
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
          </Field>
        </div>

        <Field label="Catatan / Terms & Conditions">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <X size={14} aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </div>

      {/* Right: live preview */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between border-b border-border pb-5">
          <div>
            <div className="text-lg font-bold tracking-tight text-primary">INVOICE</div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {theme.replace("_", " ")}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Terbit: {issueDate}</div>
            <div>Jatuh Tempo: {dueDate}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ditagihkan kepada
          </div>
          <div className="mt-1 font-semibold text-foreground">{selectedClient?.name || "-"}</div>
          <div className="text-sm text-muted-foreground">{selectedClient?.company}</div>
        </div>

        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[440px] table-fixed text-sm">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[12%]" />
              <col className="w-[24%]" />
              <col className="w-[24%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="pb-2">Deskripsi</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Harga</th>
                <th className="pb-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const net = calculateItemNet(item);
                return (
                  <tr key={i} className="border-b border-border align-top last:border-0">
                    <td className="py-1.5 pr-2 break-words text-foreground">
                      {item.description || "-"}
                      {net.discount > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (diskon {item.discountType === "PERCENT" ? `${item.discountValue}%` : formatCurrency(item.discountValue ?? 0, currency)})
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pl-1 text-right tabular-nums text-muted-foreground">
                      {item.qty}
                    </td>
                    <td className="py-1.5 pl-1 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="py-1.5 pl-1 text-right font-medium tabular-nums text-foreground">
                      {formatCurrency(net.net, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="ml-auto max-w-[260px] space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Diskon</span>
              <span className="tabular-nums">
                -{formatCurrency(totals.discountAmount, currency)}
              </span>
            </div>
          )}
          {charges.map((charge, i) => {
            const base = totals.subtotal - totals.discountAmount;
            const amount = charge.isPercent ? base * (charge.amount / 100) : charge.amount;
            return (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>{charge.label || "Biaya Tambahan"}</span>
                <span className="tabular-nums">{formatCurrency(amount, currency)}</span>
              </div>
            );
          })}
          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak</span>
              <span className="tabular-nums">{formatCurrency(totals.taxAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(totals.total, currency)}</span>
          </div>
          {currency === "IDR" && (
            <div className="pt-1 text-xs italic text-muted-foreground">
              Terbilang: {terbilangRupiah(totals.total)}
            </div>
          )}
        </div>

        {notes && (
          <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground">
              Catatan
            </div>
            {notes}
          </div>
        )}
      </div>
    </form>
  );
}
