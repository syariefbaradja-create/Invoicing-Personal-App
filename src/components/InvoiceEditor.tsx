"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/invoice";
import type { InvoiceInput, InvoiceItemInput } from "@/lib/actions/invoices";

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
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function inTwoWeeksISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

const emptyItem: InvoiceItemInput = { description: "", qty: 1, unitPrice: 0 };

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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      calculateInvoiceTotals(items, {
        discountType: discountType || null,
        discountValue,
        taxEnabled,
        taxRate,
      }),
    [items, discountType, discountValue, taxEnabled, taxRate]
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
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
      {/* Left: form */}
      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm text-slate-600">Klien *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full rounded border px-3 py-2 text-sm"
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Tanggal Terbit</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Jatuh Tempo</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Terkirim</option>
              <option value="PAID">Lunas</option>
              <option value="UNPAID">Belum Lunas</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="MODERN_BOLD">Modern Bold</option>
              <option value="MINIMAL_CLEAN">Minimal Clean</option>
              <option value="CLASSIC_PROFESSIONAL">Classic Professional</option>
            </select>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm text-slate-600">Item</label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-slate-900 underline"
            >
              + Tambah Item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Deskripsi jasa"
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  className="flex-1 rounded border px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                  className="w-16 rounded border px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Harga satuan"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                  className="w-32 rounded border px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="text-sm text-red-600 disabled:opacity-30"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Diskon</label>
            <div className="flex gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
                className="rounded border px-2 py-2 text-sm"
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
                className="w-full rounded border px-2 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Pajak/PPN</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
              />
              <input
                type="number"
                min={0}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                disabled={!taxEnabled}
                placeholder="% pajak"
                className="w-full rounded border px-2 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-600">
            Catatan / Terms & Conditions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border px-4 py-2 text-sm"
          >
            Batal
          </button>
        </div>
      </div>

      {/* Right: live preview */}
      <div className="rounded border bg-white p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">INVOICE</div>
            <div className="text-sm text-slate-500">{theme.replace("_", " ")}</div>
          </div>
          <div className="text-right text-sm">
            <div>Terbit: {issueDate}</div>
            <div>Jatuh Tempo: {dueDate}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-slate-500">Ditagihkan kepada</div>
          <div className="font-medium">{selectedClient?.name || "-"}</div>
          <div className="text-sm text-slate-500">{selectedClient?.company}</div>
        </div>

        <table className="mb-4 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-1">Deskripsi</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Harga</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-1">{item.description || "-"}</td>
                <td className="py-1 text-right tabular-nums">{item.qty}</td>
                <td className="py-1 text-right tabular-nums">
                  {formatCurrency(item.unitPrice, currency)}
                </td>
                <td className="py-1 text-right tabular-nums">
                  {formatCurrency(item.qty * item.unitPrice, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-[240px] space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Diskon</span>
              <span className="tabular-nums">
                -{formatCurrency(totals.discountAmount, currency)}
              </span>
            </div>
          )}
          {totals.taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Pajak</span>
              <span className="tabular-nums">{formatCurrency(totals.taxAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(totals.total, currency)}</span>
          </div>
        </div>

        {notes && (
          <div className="mt-6 text-sm text-slate-500">
            <div className="mb-1 font-medium text-slate-700">Catatan</div>
            {notes}
          </div>
        )}
      </div>
    </form>
  );
}
