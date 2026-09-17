import { getSettings, updateSettings } from "@/lib/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LogoUploadField } from "@/components/LogoUploadField";

export default async function SettingsPage() {
  const profile = await getSettings();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />

      <form action={updateSettings} className="space-y-6">
        <fieldset className="space-y-4 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-semibold text-foreground">Profil Bisnis</legend>
          <LogoUploadField currentLogoUrl={profile.logoUrl} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Bisnis">
              <input
                name="businessName"
                defaultValue={profile.businessName}
                className={inputClass}
              />
            </Field>
            <Field label="Nama Pemilik">
              <input name="ownerName" defaultValue={profile.ownerName} className={inputClass} />
            </Field>
            <Field label="Email">
              <input
                name="email"
                type="email"
                defaultValue={profile.email}
                className={inputClass}
              />
            </Field>
            <Field label="Telepon">
              <input name="phone" defaultValue={profile.phone} className={inputClass} />
            </Field>
          </div>
          <Field label="Alamat">
            <textarea
              name="address"
              defaultValue={profile.address}
              rows={2}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-semibold text-foreground">Rekening Bank</legend>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Bank">
              <input
                name="bankName"
                defaultValue={profile.bankName ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Atas Nama">
              <input
                name="bankAccountName"
                defaultValue={profile.bankAccountName ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="No. Rekening">
              <input
                name="bankAccountNumber"
                defaultValue={profile.bankAccountNumber ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Cabang">
              <input
                name="bankBranch"
                defaultValue={profile.bankBranch ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-semibold text-foreground">Preferensi Invoice</legend>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Prefix No. Invoice">
              <input
                name="invoicePrefix"
                defaultValue={profile.invoicePrefix}
                className={inputClass}
              />
            </Field>
            <Field label="Default Theme">
              <select
                name="defaultTheme"
                defaultValue={profile.defaultTheme}
                className={inputClass}
              >
                <option value="MODERN_BOLD">Modern Bold</option>
                <option value="MINIMAL_CLEAN">Minimal Clean</option>
                <option value="CLASSIC_PROFESSIONAL">Classic Professional</option>
              </select>
            </Field>
            <Field label="Currency">
              <input name="currency" defaultValue={profile.currency} className={inputClass} />
            </Field>
          </div>
          <Field label="Default Catatan / Terms & Conditions">
            <textarea
              name="defaultTerms"
              defaultValue={profile.defaultTerms ?? ""}
              rows={3}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <Button type="submit">Simpan</Button>
      </form>
    </div>
  );
}
