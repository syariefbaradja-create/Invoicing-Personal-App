"use server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { calculateInvoiceTotals } from "@/lib/invoice";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DiscountType, InvoiceStatus, Theme } from "@prisma/client";

export type InvoiceItemInput = {
  description: string;
  qty: number;
  unitPrice: number;
};

export type InvoiceInput = {
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  theme: Theme;
  currency: string;
  discountType: DiscountType | null;
  discountValue: number;
  taxEnabled: boolean;
  taxRate: number;
  notes: string;
  items: InvoiceItemInput[];
};

export type InvoiceListFilter = {
  status?: "ALL" | "DRAFT" | "SENT" | "PAID" | "UNPAID" | "OVERDUE";
  from?: string;
  to?: string;
};

function validateInput(input: InvoiceInput) {
  if (!input.clientId) throw new Error("Klien wajib dipilih");
  if (!input.items.length) throw new Error("Minimal 1 item invoice");
  for (const item of input.items) {
    if (!item.description.trim()) throw new Error("Deskripsi item wajib diisi");
  }
}

export async function createInvoice(input: InvoiceInput) {
  validateInput(input);

  const totals = calculateInvoiceTotals(input.items, {
    discountType: input.discountType,
    discountValue: input.discountValue,
    taxEnabled: input.taxEnabled,
    taxRate: input.taxRate,
  });

  const number = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: input.clientId,
      issueDate: new Date(input.issueDate),
      dueDate: new Date(input.dueDate),
      status: input.status,
      theme: input.theme,
      currency: input.currency,
      discountType: input.discountType,
      discountValue: input.discountValue,
      taxEnabled: input.taxEnabled,
      taxRate: input.taxRate,
      notes: input.notes,
      ...totals,
      items: {
        create: input.items.map((item, i) => ({
          description: item.description,
          qty: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.qty * item.unitPrice,
          position: i,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  validateInput(input);

  const totals = calculateInvoiceTotals(input.items, {
    discountType: input.discountType,
    discountValue: input.discountValue,
    taxEnabled: input.taxEnabled,
    taxRate: input.taxRate,
  });

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        clientId: input.clientId,
        issueDate: new Date(input.issueDate),
        dueDate: new Date(input.dueDate),
        status: input.status,
        theme: input.theme,
        currency: input.currency,
        discountType: input.discountType,
        discountValue: input.discountValue,
        taxEnabled: input.taxEnabled,
        taxRate: input.taxRate,
        notes: input.notes,
        ...totals,
        paidAt: input.status === "PAID" ? new Date() : null,
        items: {
          create: input.items.map((item, i) => ({
            description: item.description,
            qty: item.qty,
            unitPrice: item.unitPrice,
            subtotal: item.qty * item.unitPrice,
            position: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  await prisma.invoice.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect("/invoices");
}

export async function duplicateInvoice(id: string) {
  const original = await prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  const number = await generateInvoiceNumber();
  const today = new Date();
  const dayDiff = Math.round(
    (original.dueDate.getTime() - original.issueDate.getTime()) / 86400000
  );
  const dueDate = new Date(today.getTime() + dayDiff * 86400000);

  const clone = await prisma.invoice.create({
    data: {
      number,
      clientId: original.clientId,
      issueDate: today,
      dueDate,
      status: "DRAFT",
      theme: original.theme,
      currency: original.currency,
      discountType: original.discountType,
      discountValue: original.discountValue,
      taxEnabled: original.taxEnabled,
      taxRate: original.taxRate,
      notes: original.notes,
      subtotal: original.subtotal,
      discountAmount: original.discountAmount,
      taxAmount: original.taxAmount,
      total: original.total,
      items: {
        create: original.items.map((item) => ({
          description: item.description,
          qty: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          position: item.position,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${clone.id}`);
}

export async function getInvoices(filter: InvoiceListFilter = {}) {
  const invoices = await prisma.invoice.findMany({
    where: {
      status:
        filter.status && filter.status !== "ALL" && filter.status !== "OVERDUE"
          ? filter.status
          : undefined,
      issueDate: {
        gte: filter.from ? new Date(filter.from) : undefined,
        lte: filter.to ? new Date(filter.to) : undefined,
      },
    },
    include: { client: true },
    orderBy: { dueDate: "asc" },
  });

  if (filter.status === "OVERDUE") {
    return invoices.filter(
      (inv) =>
        (inv.status === "SENT" || inv.status === "UNPAID") &&
        inv.dueDate.getTime() < Date.now()
    );
  }

  return invoices;
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { position: "asc" } } },
  });
}
