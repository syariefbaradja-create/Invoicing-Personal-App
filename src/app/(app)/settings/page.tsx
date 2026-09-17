import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { getSettings, updateSettings } from "@/lib/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LogoUploadField } from "@/components/LogoUploadField";

const EXPORT_LINKS = [
  { href: "/api/export?type=clients&format=csv", label: "Contacts (CSV)" },
  { href: "/api/export?type=invoices&format=csv", label: "Invoices (CSV)" },
  { href: "/api/export?type=invoice-items&format=csv", label: "Invoice Items (CSV)" },
  { href: "/api/export?format=json", label: "Semua Data (JSON)" },
];

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

        <fieldset className="space-y-3 rounded-lg border border-border bg-card p-5">
          <legend className="px-1 text-sm font-semibold text-foreground">
            Tampilan Invoice (PDF)
          </legend>
          <p className="text-sm text-muted-foreground">
            Berlaku di semua theme PDF — mengganti warna utama/aksen dan font default.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Warna Utama">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  defaultValue={profile.primaryColor}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-card p-1"
                />
                <span className="text-sm text-muted-foreground">{profile.primaryColor}</span>
              </div>
            </Field>
            <Field label="Warna Aksen">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="accentColor"
                  defaultValue={profile.accentColor}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-card p-1"
                />
                <span className="text-sm text-muted-foreground">{profile.accentColor}</span>
              </div>
            </Field>
            <Field label="Font">
              <select name="fontChoice" defaultValue={profile.fontChoice} className={inputClass}>
                <option value="Helvetica">Sans Modern (Helvetica)</option>
                <option value="Times-Roman">Serif Klasik (Times)</option>
                <option value="Courier">Mono Teknikal (Courier)</option>
              </select>
            </Field>
          </div>
        </fieldset>

        <Button type="submit">Simpan</Button>
      </form>

      <fieldset className="mt-6 space-y-3 rounded-lg border border-border bg-card p-5">
        <legend className="px-1 text-sm font-semibold text-foreground">Export Data</legend>
        <p className="text-sm text-muted-foreground">
          Backup data klien &amp; invoice untuk jaga-jaga migrasi ke tool lain di masa depan.
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPORT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <DownloadSimple size={16} aria-hidden="true" />
              {link.label}
            </a>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
