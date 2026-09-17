import { getSettings, updateSettings } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const profile = await getSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <form action={updateSettings} className="space-y-6">
        <fieldset className="space-y-3 rounded border p-4">
          <legend className="px-1 text-sm font-medium">Profil Bisnis</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Nama Bisnis</label>
              <input
                name="businessName"
                defaultValue={profile.businessName}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Nama Pemilik</label>
              <input
                name="ownerName"
                defaultValue={profile.ownerName}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={profile.email}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Telepon</label>
              <input
                name="phone"
                defaultValue={profile.phone}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Alamat</label>
            <textarea
              name="address"
              defaultValue={profile.address}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded border p-4">
          <legend className="px-1 text-sm font-medium">Rekening Bank</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Nama Bank</label>
              <input
                name="bankName"
                defaultValue={profile.bankName ?? ""}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Atas Nama</label>
              <input
                name="bankAccountName"
                defaultValue={profile.bankAccountName ?? ""}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">No. Rekening</label>
              <input
                name="bankAccountNumber"
                defaultValue={profile.bankAccountNumber ?? ""}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Cabang</label>
              <input
                name="bankBranch"
                defaultValue={profile.bankBranch ?? ""}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded border p-4">
          <legend className="px-1 text-sm font-medium">Preferensi Invoice</legend>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Prefix No. Invoice</label>
              <input
                name="invoicePrefix"
                defaultValue={profile.invoicePrefix}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Default Theme</label>
              <select
                name="defaultTheme"
                defaultValue={profile.defaultTheme}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="MODERN_BOLD">Modern Bold</option>
                <option value="MINIMAL_CLEAN">Minimal Clean</option>
                <option value="CLASSIC_PROFESSIONAL">Classic Professional</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Currency</label>
              <input
                name="currency"
                defaultValue={profile.currency}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">
              Default Catatan / Terms & Conditions
            </label>
            <textarea
              name="defaultTerms"
              defaultValue={profile.defaultTerms ?? ""}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
