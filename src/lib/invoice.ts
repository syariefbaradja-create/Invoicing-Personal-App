export type LineItemInput = {
  qty: number;
  unitPrice: number;
};

export type InvoiceTotals = {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
};

export function calculateInvoiceTotals(
  items: LineItemInput[],
  opts: {
    discountType?: "PERCENT" | "FIXED" | null;
    discountValue?: number;
    taxEnabled?: boolean;
    taxRate?: number;
  }
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  let discountAmount = 0;
  if (opts.discountType === "PERCENT") {
    discountAmount = subtotal * ((opts.discountValue ?? 0) / 100);
  } else if (opts.discountType === "FIXED") {
    discountAmount = opts.discountValue ?? 0;
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = opts.taxEnabled ? afterDiscount * ((opts.taxRate ?? 0) / 100) : 0;
  const total = afterDiscount + taxAmount;

  return { subtotal, discountAmount, taxAmount, total };
}

export function formatCurrency(amount: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isOverdue(dueDate: Date, status: string) {
  return (status === "SENT" || status === "UNPAID") && dueDate.getTime() < Date.now();
}
