"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Trash, UploadSimple } from "@phosphor-icons/react/dist/ssr";

export function LogoUploadField({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [markRemove, setMarkRemove] = useState(false);

  const displayUrl = markRemove ? null : preview ?? currentLogoUrl;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMarkRemove(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-foreground">Logo Bisnis</span>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Logo bisnis"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <ImageIcon size={24} className="text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <UploadSimple size={16} aria-hidden="true" />
            Pilih Logo
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {currentLogoUrl && !preview && (
            <label className="flex w-fit cursor-pointer items-center gap-1.5 text-sm text-destructive hover:underline">
              <input
                type="checkbox"
                name="removeLogo"
                checked={markRemove}
                onChange={(e) => setMarkRemove(e.target.checked)}
                className="accent-destructive"
              />
              <Trash size={14} aria-hidden="true" />
              Hapus logo saat ini
            </label>
          )}
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, atau SVG. Maks 2MB.</p>
        </div>
      </div>
    </div>
  );
}
