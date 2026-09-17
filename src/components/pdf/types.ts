export type PdfInvoice = {
  number: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  currency: string;
  subtotal: number;
  discountAmount: number;
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
};

export type ThemeTemplateProps = {
  invoice: PdfInvoice;
  profile: PdfProfile;
  logoSrc?: string | null;
};

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}
