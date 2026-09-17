"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function addAttachment(invoiceId: string, formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Pilih file untuk diupload");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Format file harus PDF, PNG, JPG, atau WEBP");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Ukuran file maksimal 5MB");
  }

  const ext = file.name.split(".").pop() || file.type.split("/")[1];
  const storedName = `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(
    path.join(process.cwd(), "public", "uploads", "attachments", storedName),
    buffer
  );

  await prisma.invoiceAttachment.create({
    data: {
      invoiceId,
      filename: file.name,
      url: `/uploads/attachments/${storedName}`,
      size: file.size,
      mimeType: file.type,
    },
  });

  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteAttachment(attachmentId: string, invoiceId: string) {
  const attachment = await prisma.invoiceAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (attachment) {
    try {
      await unlink(path.join(process.cwd(), "public", attachment.url));
    } catch {
      // file already gone, ignore
    }
    await prisma.invoiceAttachment.delete({ where: { id: attachmentId } });
  }

  revalidatePath(`/invoices/${invoiceId}`);
}
