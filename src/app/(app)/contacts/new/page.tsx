import { ClientForm } from "@/components/ClientForm";
import { createClient } from "@/lib/actions/clients";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader title="Tambah Klien" />
      <ClientForm action={createClient} />
    </div>
  );
}
