"use client";

import { useState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

type RecurringInterval = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

const INTERVAL_LABELS: Record<RecurringInterval, string> = {
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  QUARTERLY: "Tiap 3 Bulan",
  YEARLY: "Tahunan",
};

export function RecurringSettings({
  invoiceId,
  isRecurring: initialIsRecurring,
  recurringInterval: initialInterval,
  recurringNextDate,
  setRecurring,
}: {
  invoiceId: string;
  isRecurring: boolean;
  recurringInterval: RecurringInterval | null;
  recurringNextDate: Date | null;
  setRecurring: (
    invoiceId: string,
    isRecurring: boolean,
    interval: RecurringInterval | null
  ) => Promise<void>;
}) {
  const [isRecurring, setIsRecurring] = useState(initialIsRecurring);
  const [interval, setInterval] = useState<RecurringInterval>(initialInterval ?? "MONTHLY");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setPending(true);
    setSaved(false);
    try {
      await setRecurring(invoiceId, isRecurring, isRecurring ? interval : null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
        <ArrowsClockwise size={16} aria-hidden="true" />
        Recurring Invoice
      </div>

      <label className="mb-3 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Jadikan invoice ini sebagai template recurring
      </label>

      {isRecurring && (
        <div className="mb-3">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value as RecurringInterval)}
            className={`${inputClass} max-w-[200px]`}
          >
            {Object.entries(INTERVAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      {initialIsRecurring && recurringNextDate && (
        <p className="mb-3 text-xs text-muted-foreground">
          Draft berikutnya dibuat otomatis pada{" "}
          <span className="font-medium text-foreground">
            {recurringNextDate.toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          .
        </p>
      )}

      <Button type="button" variant="secondary" size="sm" onClick={handleSave} disabled={pending}>
        {pending ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan"}
      </Button>
    </div>
  );
}
