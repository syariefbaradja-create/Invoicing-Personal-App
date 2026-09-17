import { notFound } from "next/navigation";
import { FilePdf, Copy, Trash } from "@phosphor-icons/react/dist/ssr";
import { InvoiceEditor } from "@/components/InvoiceEditor";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import { InvoiceAttachments } from "@/components/InvoiceAttachments";
import { getClients } from "@/lib/actions/clients";
import {
  getInvoice,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  getOrCreateShareLink,
  type InvoiceInput,
} from "@/lib/actions/invoices";
import { addAttachment, deleteAttachment } from "@/lib/actions/attachments";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton, Button } from "@/components/ui/Button";

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
    <div>
      <PageHeader
        title={invoice.number}
        subtitle={invoice.client.name}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/invoices/${id}/pdf`} target="_blank" variant="secondary">
              <FilePdf size={16} aria-hidden="true" />
              Export PDF
            </LinkButton>
            <ShareLinkButton invoiceId={id} getOrCreateShareLink={getOrCreateShareLink} />
            <form action={duplicateWithId}>
              <Button type="submit" variant="secondary">
                <Copy size={16} aria-hidden="true" />
                Duplicate
              </Button>
            </form>
            <form action={deleteWithId}>
              <Button type="submit" variant="destructive">
                <Trash size={16} aria-hidden="true" />
                Hapus
              </Button>
            </form>
          </div>
        }
      />

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
            discountType: i.discountType,
            discountValue: i.discountValue,
          })),
          charges: invoice.charges.map((c) => ({
            label: c.label,
            amount: c.amount,
            isPercent: c.isPercent,
          })),
        }}
        onSubmit={handleUpdate}
      />

      <div className="mt-6">
        <InvoiceAttachments
          invoiceId={id}
          attachments={invoice.attachments}
          addAttachment={addAttachment}
          deleteAttachment={deleteAttachment}
        />
      </div>
    </div>
  );
}
