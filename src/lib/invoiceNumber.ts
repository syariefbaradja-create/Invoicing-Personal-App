import { prisma } from "@/lib/prisma";

export async function getOrCreateBusinessProfile() {
  const existing = await prisma.businessProfile.findFirst();
  if (existing) return existing;
  return prisma.businessProfile.create({ data: {} });
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    let profile = await tx.businessProfile.findFirst();
    if (!profile) {
      profile = await tx.businessProfile.create({ data: {} });
    }

    const seq = profile.invoiceSeqYear === year ? profile.nextInvoiceSeq : 1;

    await tx.businessProfile.update({
      where: { id: profile.id },
      data: { nextInvoiceSeq: seq + 1, invoiceSeqYear: year },
    });

    const padded = String(seq).padStart(3, "0");
    return `${profile.invoicePrefix}-${year}-${padded}`;
  });
}
