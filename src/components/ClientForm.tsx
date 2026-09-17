"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";

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
      className="max-w-md space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm text-slate-600">Nama *</label>
        <input
          name="name"
          required
          defaultValue={client?.name}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">Perusahaan</label>
        <input
          name="company"
          defaultValue={client?.company ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={client?.email ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">No. Telepon</label>
        <input
          name="phone"
          defaultValue={client?.phone ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">Alamat</label>
        <textarea
          name="address"
          defaultValue={client?.address ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
