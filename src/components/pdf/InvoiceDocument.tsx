import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

type PdfInvoice = {
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

type PdfProfile = {
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

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0F172A" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { width: 40, height: 40, objectFit: "contain" },
  businessName: { fontSize: 16, fontWeight: 700, color: "#1E3A5F" },
  muted: { color: "#64748B" },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: "right", color: "#1E3A5F" },
  section: { marginBottom: 20 },
  label: { color: "#64748B", fontSize: 9, marginBottom: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  table: { marginBottom: 20 },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1.5px solid #1E3A5F",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #E4E7EB",
    paddingVertical: 4,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colSubtotal: { flex: 1.5, textAlign: "right" },
  totalsBlock: { alignSelf: "flex-end", width: 200, marginBottom: 24 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  totalsFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1.5px solid #1E3A5F",
    paddingTop: 4,
    fontWeight: 700,
  },
  footer: { marginTop: 24, fontSize: 9, color: "#6B7280" },
});

export function InvoiceDocument({
  invoice,
  profile,
  logoSrc,
}: {
  invoice: PdfInvoice;
  profile: PdfProfile;
  logoSrc?: string | null;
}) {
  return (
    <Document title={`Invoice ${invoice.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            {logoSrc && <Image src={logoSrc} style={styles.logo} />}
            <View>
              <Text style={styles.businessName}>
                {profile.businessName || profile.ownerName}
              </Text>
              <Text style={styles.muted}>{profile.address}</Text>
              <Text style={styles.muted}>{profile.email}</Text>
              <Text style={styles.muted}>{profile.phone}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={{ textAlign: "right" }}>{invoice.number}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>DITAGIHKAN KEPADA</Text>
            <Text>{invoice.client.name}</Text>
            {invoice.client.company && <Text>{invoice.client.company}</Text>}
            {invoice.client.address && <Text style={styles.muted}>{invoice.client.address}</Text>}
            {invoice.client.email && <Text style={styles.muted}>{invoice.client.email}</Text>}
          </View>
          <View>
            <Text style={styles.label}>TANGGAL TERBIT</Text>
            <Text>{formatDate(invoice.issueDate)}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>JATUH TEMPO</Text>
            <Text>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Deskripsi</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Harga Satuan</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{formatMoney(item.unitPrice, invoice.currency)}</Text>
              <Text style={styles.colSubtotal}>
                {formatMoney(item.subtotal, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(invoice.subtotal, invoice.currency)}</Text>
          </View>
          {invoice.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text>Diskon</Text>
              <Text>-{formatMoney(invoice.discountAmount, invoice.currency)}</Text>
            </View>
          )}
          {invoice.taxAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text>Pajak</Text>
              <Text>{formatMoney(invoice.taxAmount, invoice.currency)}</Text>
            </View>
          )}
          <View style={styles.totalsFinal}>
            <Text>Total</Text>
            <Text>{formatMoney(invoice.total, invoice.currency)}</Text>
          </View>
        </View>

        {(profile.bankName || profile.bankAccountNumber) && (
          <View style={styles.section}>
            <Text style={styles.label}>METODE PEMBAYARAN</Text>
            <Text>{profile.bankName}</Text>
            <Text>{profile.bankAccountName}</Text>
            <Text>{profile.bankAccountNumber}</Text>
            {profile.bankBranch && <Text>{profile.bankBranch}</Text>}
          </View>
        )}

        {invoice.notes && (
          <View>
            <Text style={styles.label}>CATATAN</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Dibuat dengan invoicing tool internal — {profile.businessName || profile.ownerName}
        </Text>
      </Page>
    </Document>
  );
}
