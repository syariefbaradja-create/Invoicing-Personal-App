"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateBusinessProfile } from "@/lib/invoiceNumber";
import { revalidatePath } from "next/cache";
import type { Theme } from "@prisma/client";

export async function getSettings() {
  return getOrCreateBusinessProfile();
}

export async function updateSettings(formData: FormData) {
  const profile = await getOrCreateBusinessProfile();

  await prisma.businessProfile.update({
    where: { id: profile.id },
    data: {
      businessName: String(formData.get("businessName") ?? ""),
      ownerName: String(formData.get("ownerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      bankName: String(formData.get("bankName") ?? "") || null,
      bankAccountName: String(formData.get("bankAccountName") ?? "") || null,
      bankAccountNumber: String(formData.get("bankAccountNumber") ?? "") || null,
      bankBranch: String(formData.get("bankBranch") ?? "") || null,
      defaultTheme: String(formData.get("defaultTheme") ?? "MODERN_BOLD") as Theme,
      invoicePrefix: String(formData.get("invoicePrefix") ?? "INV"),
      defaultTerms: String(formData.get("defaultTerms") ?? "") || null,
      currency: String(formData.get("currency") ?? "IDR"),
    },
  });

  revalidatePath("/settings");
}
