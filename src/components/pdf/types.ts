export type PdfInvoice = {
  number: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  currency: string;
  subtotal: number;
  discountAmount: number;
  chargesTotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  client: {
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: {
    description: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
    discountType?: string | null;
    discountValue?: number;
  }[];
  charges: {
    label: string;
    amount: number;
    isPercent: boolean;
  }[];
};

export type PdfProfile = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankBranch: string | null;
  primaryColor: string;
  accentColor: string;
  fontChoice: string;
  pdfPageSize: string;
  pdfMargin: string;
  watermarkEnabled: boolean;
  watermarkText: string | null;
};

export type ThemeTemplateProps = {
  invoice: PdfInvoice;
  profile: PdfProfile;
  logoSrc?: string | null;
  signatureSrc?: string | null;
};

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const FONT_FAMILIES: Record<string, { regular: string; bold: string; italic: string }> = {
  Helvetica: { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" },
  "Times-Roman": { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic" },
  Courier: { regular: "Courier", bold: "Courier-Bold", italic: "Courier-Oblique" },
};

export function resolveFontFamilies(fontChoice: string) {
  return FONT_FAMILIES[fontChoice] ?? FONT_FAMILIES.Helvetica;
}

const MARGIN_MULTIPLIER: Record<string, number> = {
  NARROW: 0.6,
  NORMAL: 1,
  WIDE: 1.5,
};

/** Scales a theme's own base padding by the user's margin preset, so each
 * theme keeps its relative character (Minimal Clean stays airier than
 * Classic Professional) while still responding to the global margin knob. */
export function resolveMargin(preset: string, basePx: number) {
  return Math.round(basePx * (MARGIN_MULTIPLIER[preset] ?? 1));
}

export function resolvePageSize(pageSize: string): "A4" | "LETTER" | "LEGAL" {
  return pageSize === "LETTER" || pageSize === "LEGAL" ? pageSize : "A4";
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}
