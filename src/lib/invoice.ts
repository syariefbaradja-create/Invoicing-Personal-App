export type DiscountKind = "PERCENT" | "FIXED";

export type LineItemInput = {
  qty: number;
  unitPrice: number;
  discountType?: DiscountKind | null;
  discountValue?: number;
};

export type ChargeInput = {
  amount: number;
  isPercent: boolean;
};

export type InvoiceTotals = {
  subtotal: number;
  discountAmount: number;
  chargesTotal: number;
  taxAmount: number;
  total: number;
};

export function calculateItemNet(item: LineItemInput) {
  const gross = item.qty * item.unitPrice;
  let discount = 0;
  if (item.discountType === "PERCENT") {
    discount = gross * ((item.discountValue ?? 0) / 100);
  } else if (item.discountType === "FIXED") {
    discount = item.discountValue ?? 0;
  }
  discount = Math.min(Math.max(discount, 0), gross);
  return { gross, discount, net: gross - discount };
}

export function calculateInvoiceTotals(
  items: LineItemInput[],
  opts: {
    discountType?: DiscountKind | null;
    discountValue?: number;
    taxEnabled?: boolean;
    taxRate?: number;
    charges?: ChargeInput[];
  }
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + calculateItemNet(item).net, 0);

  let discountAmount = 0;
  if (opts.discountType === "PERCENT") {
    discountAmount = subtotal * ((opts.discountValue ?? 0) / 100);
  } else if (opts.discountType === "FIXED") {
    discountAmount = opts.discountValue ?? 0;
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const afterDiscount = subtotal - discountAmount;

  const chargesTotal = (opts.charges ?? []).reduce(
    (sum, c) => sum + (c.isPercent ? afterDiscount * (c.amount / 100) : c.amount),
    0
  );

  const taxableBase = afterDiscount + chargesTotal;
  const taxAmount = opts.taxEnabled ? taxableBase * ((opts.taxRate ?? 0) / 100) : 0;
  const total = taxableBase + taxAmount;

  return { subtotal, discountAmount, chargesTotal, taxAmount, total };
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

const SATUAN = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

function terbilangInt(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${terbilangInt(n - 10)} belas`;
  if (n < 100) {
    const rest = n % 10;
    return `${terbilangInt(Math.floor(n / 10))} puluh${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  if (n < 200) {
    const rest = n % 100;
    return `seratus${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  if (n < 1000) {
    const rest = n % 100;
    return `${terbilangInt(Math.floor(n / 100))} ratus${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  if (n < 2000) {
    const rest = n % 1000;
    return `seribu${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  if (n < 1_000_000) {
    const rest = n % 1000;
    return `${terbilangInt(Math.floor(n / 1000))} ribu${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  if (n < 1_000_000_000) {
    const rest = n % 1_000_000;
    return `${terbilangInt(Math.floor(n / 1_000_000))} juta${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  if (n < 1_000_000_000_000) {
    const rest = n % 1_000_000_000;
    return `${terbilangInt(Math.floor(n / 1_000_000_000))} miliar${rest ? ` ${terbilangInt(rest)}` : ""}`;
  }
  const rest = n % 1_000_000_000_000;
  return `${terbilangInt(Math.floor(n / 1_000_000_000_000))} triliun${rest ? ` ${terbilangInt(rest)}` : ""}`;
}

export function terbilang(amount: number): string {
  const rounded = Math.max(0, Math.round(amount));
  const words = rounded === 0 ? "nol" : terbilangInt(rounded);
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function terbilangRupiah(amount: number): string {
  return `${terbilang(amount)} Rupiah`;
}
