import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceEditor } from "@/components/InvoiceEditor";
import { getClients } from "@/lib/actions/clients";
import {
  getInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  type InvoiceInput,
} from "@/lib/actions/invoices";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, clients] = await Promise.all([getInvoice(id), getClients()]);
  if (!invoice) notFound();

  async function handleUpdate(input: InvoiceInput) {
    "use server";
    await updateInvoice(id, input);
  }

  const deleteWithId = deleteInvoice.bind(null, id);
  const duplicateWithId = duplicateInvoice.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{invoice.number}</h1>
          <p className="text-sm text-slate-500">{invoice.client.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/invoices/${id}/pdf`}
            target="_blank"
            className="rounded border px-3 py-2 text-sm"
          >
            Export PDF
          </Link>
          <form action={duplicateWithId}>
            <button className="rounded border px-3 py-2 text-sm">Duplicate</button>
          </form>
          <form action={deleteWithId}>
            <button className="rounded border px-3 py-2 text-sm text-red-600">
              Hapus
            </button>
          </form>
        </div>
      </div>

      <InvoiceEditor
        clients={clients}
        initial={{
          id: invoice.id,
          clientId: invoice.clientId,
          issueDate: invoice.issueDate.toISOString().slice(0, 10),
          dueDate: invoice.dueDate.toISOString().slice(0, 10),
          status: invoice.status,
          theme: invoice.theme,
          currency: invoice.currency,
          discountType: invoice.discountType,
          discountValue: invoice.discountValue,
          taxEnabled: invoice.taxEnabled,
          taxRate: invoice.taxRate,
          notes: invoice.notes ?? "",
          items: invoice.items.map((i) => ({
            description: i.description,
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
