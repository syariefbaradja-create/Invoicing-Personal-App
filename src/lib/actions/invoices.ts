"use server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { calculateInvoiceTotals, calculateItemNet } from "@/lib/invoice";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import type { DiscountType, InvoiceStatus, Theme } from "@prisma/client";

export type InvoiceItemInput = {
  description: string;
  qty: number;
  unitPrice: number;
  discountType?: DiscountType | null;
  discountValue?: number;
};

export type ChargeItemInput = {
  label: string;
  amount: number;
  isPercent: boolean;
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
  charges: ChargeItemInput[];
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
  for (const charge of input.charges) {
    if (!charge.label.trim()) throw new Error("Label additional charge wajib diisi");
  }
}

function buildItemsCreate(items: InvoiceItemInput[]) {
  return items.map((item, i) => ({
    description: item.description,
    qty: item.qty,
    unitPrice: item.unitPrice,
    discountType: item.discountType ?? null,
    discountValue: item.discountValue ?? 0,
    subtotal: calculateItemNet(item).net,
    position: i,
  }));
}

function buildChargesCreate(charges: ChargeItemInput[]) {
  return charges.map((charge, i) => ({
    label: charge.label,
    amount: charge.amount,
    isPercent: charge.isPercent,
    position: i,
  }));
}

export async function createInvoice(input: InvoiceInput) {
  validateInput(input);

  const totals = calculateInvoiceTotals(input.items, {
    discountType: input.discountType,
    discountValue: input.discountValue,
    taxEnabled: input.taxEnabled,
    taxRate: input.taxRate,
    charges: input.charges,
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
      items: { create: buildItemsCreate(input.items) },
      charges: { create: buildChargesCreate(input.charges) },
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
    charges: input.charges,
  });

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.additionalCharge.deleteMany({ where: { invoiceId: id } }),
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
        items: { create: buildItemsCreate(input.items) },
        charges: { create: buildChargesCreate(input.charges) },
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
    include: { items: true, charges: true },
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
      chargesTotal: original.chargesTotal,
      taxAmount: original.taxAmount,
      total: original.total,
      items: {
        create: original.items.map((item) => ({
          description: item.description,
          qty: item.qty,
          unitPrice: item.unitPrice,
          discountType: item.discountType,
          discountValue: item.discountValue,
          subtotal: item.subtotal,
          position: item.position,
        })),
      },
      charges: {
        create: original.charges.map((charge) => ({
          label: charge.label,
          amount: charge.amount,
          isPercent: charge.isPercent,
          position: charge.position,
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
    include: {
      client: true,
      items: { orderBy: { position: "asc" } },
      charges: { orderBy: { position: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
}

export async function getInvoiceByPublicToken(token: string) {
  return prisma.invoice.findUnique({
    where: { publicToken: token },
    include: {
      client: true,
      items: { orderBy: { position: "asc" } },
      charges: { orderBy: { position: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
}

export async function getOrCreateShareLink(id: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id } });
  if (invoice.publicToken) return invoice.publicToken;

  const token = randomBytes(12).toString("hex");
  await prisma.invoice.update({ where: { id }, data: { publicToken: token } });
  revalidatePath(`/invoices/${id}`);
  return token;
}

export async function revokeShareLink(id: string) {
  await prisma.invoice.update({ where: { id }, data: { publicToken: null } });
  revalidatePath(`/invoices/${id}`);
}
