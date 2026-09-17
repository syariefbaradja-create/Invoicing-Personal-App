import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import {
  formatMoney,
  formatDate,
  resolveFontFamilies,
  resolveMargin,
  resolvePageSize,
  type ThemeTemplateProps,
} from "../types";
import { terbilangRupiah } from "@/lib/invoice";
import { Watermark } from "../Watermark";

export function MinimalCleanTemplate({ invoice, profile, logoSrc, signatureSrc }: ThemeTemplateProps) {
  const accent = profile.accentColor;
  const font = resolveFontFamilies(profile.fontChoice);
  const margin = resolveMargin(profile.pdfMargin, 56);

  const styles = StyleSheet.create({
    page: { padding: margin, fontSize: 10, fontFamily: font.regular, color: "#1F2937" },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 40,
    },
    logo: { width: 32, height: 32, objectFit: "contain", marginBottom: 8 },
    businessName: { fontSize: 13, fontFamily: font.bold, color: "#1F2937" },
    headerMuted: { color: "#9CA3AF", fontSize: 9, marginTop: 1 },
    invoiceTitle: {
      fontSize: 13,
      fontFamily: font.bold,
      textAlign: "right",
      color: accent,
      letterSpacing: 2,
    },
    invoiceNumber: { textAlign: "right", color: "#9CA3AF", marginTop: 3, fontSize: 9 },
    accentRule: {
      height: 1,
      backgroundColor: accent,
      width: 32,
      marginTop: 6,
      marginLeft: "auto",
    },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 36 },
    label: {
      color: "#9CA3AF",
      fontSize: 8,
      marginBottom: 4,
      letterSpacing: 1,
    },
    muted: { color: "#9CA3AF" },
    table: { marginBottom: 28 },
    tableHeader: {
      flexDirection: "row",
      borderBottom: `0.75px solid ${accent}`,
      paddingBottom: 6,
      marginBottom: 8,
    },
    tableHeaderText: { fontSize: 8, letterSpacing: 1, color: "#9CA3AF" },
    tableRow: {
      flexDirection: "row",
      borderBottom: "0.5px solid #F1F5F9",
      paddingVertical: 8,
    },
    colDesc: { flex: 3 },
    colQty: { flex: 1, textAlign: "right" },
    colPrice: { flex: 1.5, textAlign: "right" },
    colSubtotal: { flex: 1.5, textAlign: "right" },
    totalsBlock: { alignSelf: "flex-end", width: 200, marginBottom: 36 },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    totalsFinal: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTop: `0.75px solid ${accent}`,
      paddingTop: 6,
      marginTop: 2,
      fontFamily: font.bold,
      fontSize: 12,
      color: accent,
    },
    section: { marginBottom: 24 },
    footer: { marginTop: 32, fontSize: 8, color: "#D1D5DB", textAlign: "center" },
    itemDiscount: { fontSize: 7, color: "#D1D5DB", marginTop: 1 },
    terbilang: { fontSize: 8, fontFamily: font.italic, color: "#9CA3AF", marginTop: 6 },
    signatureBlock: { alignSelf: "flex-end", alignItems: "center", marginBottom: 24 },
    signatureImage: { width: 90, height: 45, objectFit: "contain", marginBottom: 4 },
    signatureLine: { width: 130, borderBottom: "0.5px solid #E5E7EB", marginBottom: 4 },
    signatureName: { fontSize: 8, color: "#9CA3AF" },
  });

  return (
    <Page size={resolvePageSize(profile.pdfPageSize)} style={styles.page}>
      {profile.watermarkEnabled && profile.watermarkText && (
        <Watermark text={profile.watermarkText} />
      )}
      <View style={styles.headerRow}>
        <View>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <Text style={styles.businessName}>{profile.businessName || profile.ownerName}</Text>
          <Text style={styles.headerMuted}>{profile.address}</Text>
          <Text style={styles.headerMuted}>{profile.email}</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoice.number}</Text>
          <View style={styles.accentRule} />
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
          <Text style={[styles.label, { marginTop: 10 }]}>JATUH TEMPO</Text>
          <Text>{formatDate(invoice.dueDate)}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.tableHeaderText]}>DESKRIPSI</Text>
          <Text style={[styles.colQty, styles.tableHeaderText]}>QTY</Text>
          <Text style={[styles.colPrice, styles.tableHeaderText]}>HARGA</Text>
          <Text style={[styles.colSubtotal, styles.tableHeaderText]}>SUBTOTAL</Text>
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
            <Text style={styles.colSubtotal}>{formatMoney(item.subtotal, invoice.currency)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsBlock}>
        <View style={styles.totalsRow}>
          <Text style={styles.muted}>Subtotal</Text>
          <Text>{formatMoney(invoice.subtotal, invoice.currency)}</Text>
        </View>
        {invoice.discountAmount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Diskon</Text>
            <Text>-{formatMoney(invoice.discountAmount, invoice.currency)}</Text>
          </View>
        )}
        {invoice.charges.map((charge, i) => (
          <View style={styles.totalsRow} key={i}>
            <Text style={styles.muted}>{charge.label}</Text>
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
            <Text style={styles.muted}>Pajak</Text>
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
          <Text style={styles.muted}>{invoice.notes}</Text>
        </View>
      )}

      {signatureSrc && (
        <View style={styles.signatureBlock}>
          <Image src={signatureSrc} style={styles.signatureImage} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{profile.businessName || profile.ownerName}</Text>
        </View>
      )}

      <Text style={styles.footer}>{profile.businessName || profile.ownerName}</Text>
    </Page>
  );
}
