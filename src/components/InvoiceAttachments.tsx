"use client";

import { useRef, useState } from "react";
import {
  Paperclip,
  FilePdf,
  FileImage,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";

type Attachment = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InvoiceAttachments({
  invoiceId,
  attachments,
  addAttachment,
  deleteAttachment,
}: {
  invoiceId: string;
  attachments: Attachment[];
  addAttachment: (invoiceId: string, formData: FormData) => Promise<void>;
  deleteAttachment: (attachmentId: string, invoiceId: string) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      await addAttachment(invoiceId, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload file");
    } finally {
      setPending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Paperclip size={16} aria-hidden="true" />
          Attachments
        </span>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
          <UploadSimple size={14} aria-hidden="true" />
          {pending ? "Mengupload..." : "Tambah File"}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={pending}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada lampiran. Maks 5MB — PDF, PNG, JPG, atau WEBP.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((att) => {
            const Icon = att.mimeType === "application/pdf" ? FilePdf : FileImage;
            return (
              <li
                key={att.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 text-foreground hover:text-primary"
                >
                  <Icon size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{att.filename}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatSize(att.size)}
                  </span>
                </a>
                <form action={deleteAttachment.bind(null, att.id, invoiceId)}>
                  <button
                    type="submit"
                    aria-label={`Hapus ${att.filename}`}
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                  >
                    <Trash size={14} aria-hidden="true" />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
