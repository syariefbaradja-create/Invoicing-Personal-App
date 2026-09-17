import { InvoiceEditor } from "@/components/InvoiceEditor";
import { getClients } from "@/lib/actions/clients";
import { createInvoice, type InvoiceInput } from "@/lib/actions/invoices";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function NewInvoicePage() {
  const clients = await getClients();

  async function handleCreate(input: InvoiceInput) {
    "use server";
    await createInvoice(input);
  }

  return (
    <div>
      <PageHeader title="Invoice Baru" />
      {clients.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-5 text-muted-foreground">
          Belum ada klien. Tambahkan klien terlebih dahulu di halaman Contacts.
        </p>
      ) : (
        <InvoiceEditor clients={clients} onSubmit={handleCreate} />
      )}
    </div>
  );
}
