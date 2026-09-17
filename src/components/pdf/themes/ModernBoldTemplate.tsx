import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatMoney, formatDate, resolveFontFamilies, type ThemeTemplateProps } from "../types";
import { terbilangRupiah } from "@/lib/invoice";

export function ModernBoldTemplate({ invoice, profile, logoSrc, signatureSrc }: ThemeTemplateProps) {
  const primary = profile.primaryColor;
  const accent = profile.accentColor;
  const font = resolveFontFamilies(profile.fontChoice);

  const styles = StyleSheet.create({
    page: { fontSize: 10, fontFamily: font.regular, color: "#0F172A" },
    headerBand: {
      backgroundColor: primary,
      paddingHorizontal: 40,
      paddingVertical: 28,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
    },
    logo: { width: 36, height: 36, objectFit: "contain", borderRadius: 4 },
    businessName: { fontSize: 17, fontFamily: font.bold, color: "#FFFFFF" },
    headerMuted: { color: "#CBD5E1", fontSize: 9, marginTop: 1 },
    invoiceTitle: { fontSize: 22, fontFamily: font.bold, textAlign: "right", color: "#FFFFFF" },
    invoiceNumber: { textAlign: "right", color: "#CBD5E1", marginTop: 2, fontSize: 10 },
    body: { paddingHorizontal: 40, paddingBottom: 40 },
    muted: { color: "#64748B" },
    section: { marginBottom: 20 },
    label: { color: "#64748B", fontSize: 9, marginBottom: 2, letterSpacing: 0.5 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    table: { marginBottom: 20 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#F1F5F9",
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginBottom: 2,
    },
    tableHeaderText: { fontSize: 9, fontFamily: font.bold, color: primary, letterSpacing: 0.3 },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1px solid #E4E7EB",
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    colDesc: { flex: 3 },
    colQty: { flex: 1, textAlign: "right" },
    colPrice: { flex: 1.5, textAlign: "right" },
    colSubtotal: { flex: 1.5, textAlign: "right" },
    totalsBlock: { alignSelf: "flex-end", width: 220, marginBottom: 24 },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
    totalsFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: accent,
      color: "#FFFFFF",
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginTop: 4,
      fontFamily: font.bold,
      fontSize: 12,
    },
    paymentBox: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 4, marginBottom: 20 },
    footer: { marginTop: 20, fontSize: 9, color: "#94A3B8", textAlign: "center" },
    itemDiscount: { fontSize: 8, color: "#94A3B8" },
    terbilang: { fontSize: 9, fontFamily: font.italic, color: "#64748B", marginTop: 4 },
    signatureBlock: { alignSelf: "flex-end", alignItems: "center", marginBottom: 20 },
    signatureImage: { width: 100, height: 50, objectFit: "contain", marginBottom: 4 },
    signatureLine: { width: 140, borderBottom: "1px solid #CBD5E1", marginBottom: 4 },
    signatureName: { fontSize: 9, color: "#475569" },
  });

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerBand}>
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
          <Text style={styles.invoiceNumber}>{invoice.number}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>DITAGIHKAN KEPADA</Text>
            <Text>{invoice.client.name}</Text>
            {invoice.client.company && <Text>{invoice.client.company}</Text>}
            {invoice.client.address && (
              <Text style={styles.muted}>{invoice.client.address}</Text>
            )}
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
            <Text style={[styles.colDesc, styles.tableHeaderText]}>Deskripsi</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>Harga Satuan</Text>
            <Text style={[styles.colSubtotal, styles.tableHeaderText]}>Subtotal</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.colDesc}>
                <Text>{item.description}</Text>
                {item.discountType && (item.discountValue ?? 0) > 0 && (
                  <Text style={styles.itemDiscount}>
                    diskon {item.discountType === "PERCENT" ? `${item.discountValue}%` : formatMoney(item.discountValue ?? 0, invoice.currency)}
                  </Text>
                )}
              </View>
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
          {invoice.charges.map((charge, i) => (
            <View style={styles.totalsRow} key={i}>
              <Text>{charge.label}</Text>
              <Text>
                {formatMoney(
                  charge.isPercent
                    ? (invoice.subtotal - invoice.discountAmount) * (charge.amount / 100)
                    : charge.amount,
                  invoice.currency
                )}
              </Text>
            </View>
          ))}
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
          {invoice.currency === "IDR" && (
            <Text style={styles.terbilang}>Terbilang: {terbilangRupiah(invoice.total)}</Text>
          )}
        </View>

        {(profile.bankName || profile.bankAccountNumber) && (
          <View style={styles.paymentBox}>
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

        {signatureSrc && (
          <View style={styles.signatureBlock}>
            <Image src={signatureSrc} style={styles.signatureImage} />
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{profile.businessName || profile.ownerName}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {profile.businessName || profile.ownerName} · Dibuat dengan invoicing tool internal
        </Text>
      </View>
    </Page>
  );
}
