import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import path from "path";
import { getInvoiceByPublicToken } from "@/lib/actions/invoices";
import { getSettings } from "@/lib/actions/settings";
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

  const logoSrc =
    profile.logoUrl && !profile.logoUrl.endsWith(".svg")
      ? path.join(process.cwd(), "public", profile.logoUrl)
      : null;

  const buffer = await renderToBuffer(
    <InvoiceDocument invoice={invoice} profile={profile} logoSrc={logoSrc} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
