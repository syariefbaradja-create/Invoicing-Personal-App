import { InvoiceEditor } from "@/components/InvoiceEditor";
import { getClients } from "@/lib/actions/clients";
import { createInvoice, type InvoiceInput } from "@/lib/actions/invoices";

export default async function NewInvoicePage() {
  const clients = await getClients();

  async function handleCreate(input: InvoiceInput) {
    "use server";
    await createInvoice(input);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Invoice Baru</h1>
      {clients.length === 0 ? (
        <p className="text-slate-500">
          Belum ada klien. Tambahkan klien terlebih dahulu di halaman Contacts.
        </p>
      ) : (
        <InvoiceEditor clients={clients} onSubmit={handleCreate} />
      )}
    </div>
  );
}
