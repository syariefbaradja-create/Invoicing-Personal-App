"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function ClientForm({
  client,
  action,
}: {
  client?: Client;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        await action(formData);
        setPending(false);
      }}
      className="max-w-md space-y-4 rounded-lg border border-border bg-card p-5"
    >
      <Field label="Nama" required>
        <input name="name" required defaultValue={client?.name} className={inputClass} />
      </Field>
      <Field label="Perusahaan">
        <input name="company" defaultValue={client?.company ?? ""} className={inputClass} />
      </Field>
      <Field label="Email">
        <input
          name="email"
          type="email"
          defaultValue={client?.email ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="No. Telepon">
        <input name="phone" defaultValue={client?.phone ?? ""} className={inputClass} />
      </Field>
      <Field label="Alamat">
        <textarea
          name="address"
          defaultValue={client?.address ?? ""}
          className={inputClass}
          rows={3}
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
