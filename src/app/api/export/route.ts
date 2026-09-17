import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export const runtime = "nodejs";

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function jsonResponse(data: unknown, filename: string) {
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "all";
  const format = req.nextUrl.searchParams.get("format") ?? "csv";
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    const [businessProfile, clients, invoices, invoiceItems] = await Promise.all([
      prisma.businessProfile.findFirst(),
      prisma.client.findMany(),
      prisma.invoice.findMany(),
      prisma.invoiceItem.findMany(),
    ]);

    return jsonResponse(
      { exportedAt: new Date().toISOString(), businessProfile, clients, invoices, invoiceItems },
      `invoicing-backup-${stamp}.json`
    );
  }

  if (type === "clients") {
    const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
    const csv = toCsv(clients, [
      "id",
      "name",
      "company",
      "email",
      "phone",
      "address",
      "createdAt",
      "updatedAt",
    ]);
    return csvResponse(csv, `contacts-${stamp}.csv`);
  }

  if (type === "invoices") {
    const invoices = await prisma.invoice.findMany({
      include: { client: true },
      orderBy: { issueDate: "desc" },
    });
    const rows = invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      clientName: inv.client.name,
      clientCompany: inv.client.company,
      issueDate: inv.issueDate.toISOString().slice(0, 10),
      dueDate: inv.dueDate.toISOString().slice(0, 10),
      status: inv.status,
      theme: inv.theme,
      currency: inv.currency,
      subtotal: inv.subtotal,
      discountAmount: inv.discountAmount,
      taxAmount: inv.taxAmount,
      total: inv.total,
      notes: inv.notes,
    }));
    const csv = toCsv(rows, [
      "id",
      "number",
      "clientName",
      "clientCompany",
      "issueDate",
      "dueDate",
      "status",
      "theme",
      "currency",
      "subtotal",
      "discountAmount",
      "taxAmount",
      "total",
      "notes",
    ]);
    return csvResponse(csv, `invoices-${stamp}.csv`);
  }

  if (type === "invoice-items") {
    const items = await prisma.invoiceItem.findMany({
      include: { invoice: { select: { number: true } } },
      orderBy: [{ invoiceId: "asc" }, { position: "asc" }],
    });
    const rows = items.map((item) => ({
      invoiceNumber: item.invoice.number,
      description: item.description,
      qty: item.qty,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));
    const csv = toCsv(rows, ["invoiceNumber", "description", "qty", "unitPrice", "subtotal"]);
    return csvResponse(csv, `invoice-items-${stamp}.csv`);
  }

  return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
}
