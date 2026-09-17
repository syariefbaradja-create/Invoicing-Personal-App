import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatMoney, formatDate, type ThemeTemplateProps } from "../types";

const NAVY = "#1E293B";
const BORDER = "#64748B";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Times-Roman", color: "#1E293B" },
  outerBorder: { border: `1px solid ${BORDER}`, padding: 24, minHeight: "100%" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `1.5px solid ${NAVY}`,
    paddingBottom: 14,
    marginBottom: 18,
  },
  logo: { width: 34, height: 34, objectFit: "contain" },
  businessName: { fontSize: 15, fontFamily: "Times-Bold", color: NAVY },
  headerMuted: { color: "#475569", fontSize: 9, marginTop: 1 },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textAlign: "right",
    color: NAVY,
    letterSpacing: 1,
  },
  invoiceNumber: { textAlign: "right", color: "#475569", marginTop: 2, fontSize: 10 },
  infoBoxes: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  infoBox: {
    border: `1px solid ${BORDER}`,
    padding: 10,
    width: "48%",
  },
  label: {
    color: "#475569",
    fontSize: 8,
    marginBottom: 3,
    fontFamily: "Times-Bold",
    letterSpacing: 0.5,
  },
  muted: { color: "#475569" },
  table: { marginBottom: 18, border: `1px solid ${BORDER}` },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderBottom: `1px solid ${BORDER}`,
    paddingVertical: 5,
  },
  tableHeaderText: { fontFamily: "Times-Bold", fontSize: 9, color: NAVY },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5px solid ${BORDER}`,
    paddingVertical: 5,
  },
  cell: { paddingHorizontal: 6, borderRight: `0.5px solid ${BORDER}` },
  cellLast: { paddingHorizontal: 6 },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colSubtotal: { flex: 1.5, textAlign: "right" },
  totalsBlock: { alignSelf: "flex-end", width: 220, marginBottom: 20 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  totalsFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1.5px solid ${NAVY}`,
    borderBottom: `1.5px solid ${NAVY}`,
    paddingVertical: 5,
    marginTop: 4,
    fontFamily: "Times-Bold",
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
    border: `1px solid ${BORDER}`,
    padding: 10,
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: "#475569",
    textAlign: "center",
    fontFamily: "Times-Italic",
  },
});

export function ClassicProfessionalTemplate({ invoice, profile, logoSrc }: ThemeTemplateProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.outerBorder}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {logoSrc && <Image src={logoSrc} style={styles.logo} />}
            <View>
              <Text style={styles.businessName}>{profile.businessName || profile.ownerName}</Text>
              <Text style={styles.headerMuted}>{profile.address}</Text>
              <Text style={styles.headerMuted}>
                {profile.email} {profile.phone ? `· ${profile.phone}` : ""}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>No. {invoice.number}</Text>
          </View>
        </View>

        <View style={styles.infoBoxes}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>DITAGIHKAN KEPADA</Text>
            <Text>{invoice.client.name}</Text>
            {invoice.client.company && <Text>{invoice.client.company}</Text>}
            {invoice.client.address && (
              <Text style={styles.muted}>{invoice.client.address}</Text>
            )}
            {invoice.client.email && <Text style={styles.muted}>{invoice.client.email}</Text>}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>TANGGAL TERBIT</Text>
            <Text>{formatDate(invoice.issueDate)}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>JATUH TEMPO</Text>
            <Text>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.cell, styles.tableHeaderText]}>Deskripsi</Text>
            <Text style={[styles.colQty, styles.cell, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.cell, styles.tableHeaderText]}>
              Harga Satuan
            </Text>
            <Text style={[styles.colSubtotal, styles.cellLast, styles.tableHeaderText]}>
              Subtotal
            </Text>
          </View>
          {invoice.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.colDesc, styles.cell]}>{item.description}</Text>
              <Text style={[styles.colQty, styles.cell]}>{item.qty}</Text>
              <Text style={[styles.colPrice, styles.cell]}>
                {formatMoney(item.unitPrice, invoice.currency)}
              </Text>
              <Text style={[styles.colSubtotal, styles.cellLast]}>
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
          <View style={styles.section}>
            <Text style={styles.label}>CATATAN</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>{profile.businessName || profile.ownerName}</Text>
      </View>
    </Page>
  );
}
