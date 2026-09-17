import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getInvoiceByPublicToken } from "@/lib/actions/invoices";
import { getSettings } from "@/lib/actions/settings";
import { resolveRasterImagePath } from "@/lib/pdfAssets";
import { InvoiceDocument } from "@/components/pdf/InvoiceDocument";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const [invoice, profile] = await Promise.all([
    getInvoiceByPublicToken(token),
    getSettings(),
  ]);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const logoSrc = resolveRasterImagePath(profile.logoUrl);
  const signatureSrc = resolveRasterImagePath(profile.signatureUrl);

  const buffer = await renderToBuffer(
    <InvoiceDocument
      invoice={invoice}
      profile={profile}
      logoSrc={logoSrc}
      signatureSrc={signatureSrc}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
