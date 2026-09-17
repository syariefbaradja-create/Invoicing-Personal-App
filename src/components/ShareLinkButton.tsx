"use client";

import { useState } from "react";
import { Link as LinkIcon, Check, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

export function ShareLinkButton({
  invoiceId,
  getOrCreateShareLink,
}: {
  invoiceId: string;
  getOrCreateShareLink: (id: string) => Promise<string>;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleClick() {
    setPending(true);
    setError("");
    try {
      const token = await getOrCreateShareLink(invoiceId);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);

      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Clipboard write can fail (permissions, non-secure context, etc).
        // The link is still generated and shown below for manual copy.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat share link");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <Button type="button" variant="secondary" onClick={handleClick} disabled={pending}>
        {copied ? <Check size={16} aria-hidden="true" /> : <LinkIcon size={16} aria-hidden="true" />}
        {pending ? "Memuat..." : copied ? "Link Disalin!" : "Share Link"}
      </Button>

      {shareUrl && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-md border border-border bg-card p-3 shadow-md">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Link publik invoice</span>
            <button
              type="button"
              onClick={() => setShareUrl(null)}
              aria-label="Tutup"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className={`${inputClass} text-xs`}
          />
          {!copied && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Auto-copy tidak tersedia — klik teks di atas lalu salin manual (Ctrl+C).
            </p>
          )}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
