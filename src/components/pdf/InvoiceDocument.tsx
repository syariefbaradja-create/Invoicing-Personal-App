import { Document } from "@react-pdf/renderer";
import type { ThemeTemplateProps } from "./types";
import { ModernBoldTemplate } from "./themes/ModernBoldTemplate";
import { MinimalCleanTemplate } from "./themes/MinimalCleanTemplate";
import { ClassicProfessionalTemplate } from "./themes/ClassicProfessionalTemplate";

const TEMPLATES = {
  MODERN_BOLD: ModernBoldTemplate,
  MINIMAL_CLEAN: MinimalCleanTemplate,
  CLASSIC_PROFESSIONAL: ClassicProfessionalTemplate,
} as const;

type InvoiceDocumentProps = ThemeTemplateProps & {
  invoice: ThemeTemplateProps["invoice"] & { theme?: string };
};

export function InvoiceDocument({ invoice, profile, logoSrc, signatureSrc }: InvoiceDocumentProps) {
  const Template =
    TEMPLATES[invoice.theme as keyof typeof TEMPLATES] ?? ModernBoldTemplate;

  return (
    <Document title={`Invoice ${invoice.number}`}>
      <Template invoice={invoice} profile={profile} logoSrc={logoSrc} signatureSrc={signatureSrc} />
    </Document>
  );
}
