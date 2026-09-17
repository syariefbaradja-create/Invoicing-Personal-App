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

    let seq = profile.invoiceSeqYear === year ? profile.nextInvoiceSeq : 1;
    let candidate = `${profile.invoicePrefix}-${year}-${String(seq).padStart(3, "0")}`;

    // Guard against a stale/out-of-sync counter colliding with an existing
    // number (e.g. manually seeded or imported invoices).
    while (await tx.invoice.findUnique({ where: { number: candidate } })) {
      seq += 1;
      candidate = `${profile.invoicePrefix}-${year}-${String(seq).padStart(3, "0")}`;
    }

    await tx.businessProfile.update({
      where: { id: profile.id },
      data: { nextInvoiceSeq: seq + 1, invoiceSeqYear: year },
    });

    return candidate;
  });
}
