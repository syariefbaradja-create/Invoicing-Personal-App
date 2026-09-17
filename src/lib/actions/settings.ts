"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateBusinessProfile } from "@/lib/invoiceNumber";
import { revalidatePath } from "next/cache";
import type { Theme } from "@prisma/client";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function getSettings() {
  return getOrCreateBusinessProfile();
}

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

async function removeUploadedFile(logoUrl: string | null) {
  if (!logoUrl?.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", logoUrl));
  } catch {
    // file already gone, ignore
  }
}

export async function updateSettings(formData: FormData) {
  const profile = await getOrCreateBusinessProfile();

  let logoUrl = profile.logoUrl;
  const removeLogo = formData.get("removeLogo") === "on";
  const logoFile = formData.get("logo");

  if (removeLogo) {
    await removeUploadedFile(logoUrl);
    logoUrl = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      throw new Error("Format logo harus PNG, JPG, WEBP, atau SVG");
    }
    if (logoFile.size > MAX_LOGO_SIZE) {
      throw new Error("Ukuran logo maksimal 2MB");
    }

    await removeUploadedFile(logoUrl);

    const ext = logoFile.type === "image/svg+xml" ? "svg" : logoFile.type.split("/")[1];
    const filename = `logo-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
    logoUrl = `/uploads/${filename}`;
  }

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
      primaryColor: String(formData.get("primaryColor") ?? "#1E3A5F"),
      accentColor: String(formData.get("accentColor") ?? "#059669"),
      fontChoice: String(formData.get("fontChoice") ?? "Helvetica"),
      logoUrl,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
}
