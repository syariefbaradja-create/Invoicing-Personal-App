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

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

async function removeUploadedFile(url: string | null) {
  if (!url?.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // file already gone, ignore
  }
}

async function processImageField(
  formData: FormData,
  opts: { fieldName: string; removeFieldName: string; currentUrl: string | null; prefix: string }
): Promise<string | null> {
  const remove = formData.get(opts.removeFieldName) === "on";
  const file = formData.get(opts.fieldName);

  if (remove) {
    await removeUploadedFile(opts.currentUrl);
    return null;
  }

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Format gambar harus PNG, JPG, WEBP, atau SVG");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("Ukuran gambar maksimal 2MB");
    }

    await removeUploadedFile(opts.currentUrl);

    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
    const filename = `${opts.prefix}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);
    return `/uploads/${filename}`;
  }

  return opts.currentUrl;
}

export async function updateSettings(formData: FormData) {
  const profile = await getOrCreateBusinessProfile();

  const logoUrl = await processImageField(formData, {
    fieldName: "logo",
    removeFieldName: "removeLogo",
    currentUrl: profile.logoUrl,
    prefix: "logo",
  });

  const signatureUrl = await processImageField(formData, {
    fieldName: "signature",
    removeFieldName: "removeSignature",
    currentUrl: profile.signatureUrl,
    prefix: "signature",
  });

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
      signatureUrl,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
}
