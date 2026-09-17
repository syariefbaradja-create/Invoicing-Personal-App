"use server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { addInterval } from "@/lib/recurringInterval";
import { revalidatePath } from "next/cache";
import type { RecurringInterval } from "@prisma/client";

/**
 * Auto-generates the next draft invoice for every recurring template whose
 * recurringNextDate has passed. Called opportunistically on dashboard load
 * since this app has no external cron/scheduler.
 */
export async function processRecurringInvoices() {
  const due = await prisma.invoice.findMany({
    where: {
      isRecurring: true,
      recurringNextDate: { lte: new Date() },
    },
    include: { items: true, charges: true },
  });

  for (const template of due) {
    const number = await generateInvoiceNumber();
    const dayDiff = Math.round(
      (template.dueDate.getTime() - template.issueDate.getTime()) / 86400000
    );
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + dayDiff * 86400000);

    await prisma.invoice.create({
      data: {
        number,
        clientId: template.clientId,
        issueDate,
        dueDate,
        status: "DRAFT",
        theme: template.theme,
        currency: template.currency,
        discountType: template.discountType,
        discountValue: template.discountValue,
        taxEnabled: template.taxEnabled,
        taxRate: template.taxRate,
        notes: template.notes,
        subtotal: template.subtotal,
        discountAmount: template.discountAmount,
        chargesTotal: template.chargesTotal,
        taxAmount: template.taxAmount,
        total: template.total,
        recurringSourceId: template.id,
        items: {
          create: template.items.map((item) => ({
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
          create: template.charges.map((charge) => ({
            label: charge.label,
            amount: charge.amount,
            isPercent: charge.isPercent,
            position: charge.position,
          })),
        },
      },
    });

    await prisma.invoice.update({
      where: { id: template.id },
      data: {
        recurringNextDate: addInterval(template.recurringNextDate!, template.recurringInterval!),
      },
    });
  }

  if (due.length > 0) {
    revalidatePath("/invoices");
    revalidatePath("/");
  }

  return due.length;
}

export async function setRecurring(
  invoiceId: string,
  isRecurring: boolean,
  interval: RecurringInterval | null
) {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      isRecurring,
      recurringInterval: isRecurring ? interval : null,
      recurringNextDate:
        isRecurring && interval ? addInterval(invoice.issueDate, interval) : null,
    },
  });

  revalidatePath(`/invoices/${invoiceId}`);
}
