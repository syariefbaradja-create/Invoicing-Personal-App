"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordPayment(invoiceId: string, formData: FormData) {
  const amountReceived = Number(formData.get("amountReceived") ?? 0);
  const transactionCharge = Number(formData.get("transactionCharge") ?? 0);
  const paymentDate = String(formData.get("paymentDate") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "") || null;
  const note = String(formData.get("note") ?? "") || null;

  if (amountReceived <= 0) {
    throw new Error("Amount received harus lebih dari 0");
  }

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: true },
  });

  await prisma.paymentRecord.create({
    data: {
      invoiceId,
      amountReceived,
      transactionCharge,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      note,
    },
  });

  const totalCollected =
    invoice.payments.reduce((sum, p) => sum + p.amountReceived, 0) + amountReceived;

  if (totalCollected >= invoice.total) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date() },
    });
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/");
}

export async function deletePayment(paymentId: string, invoiceId: string) {
  await prisma.paymentRecord.delete({ where: { id: paymentId } });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/");
}
