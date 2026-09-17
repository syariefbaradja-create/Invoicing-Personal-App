import { Sidebar } from "@/components/Sidebar";
import { getSettings } from "@/lib/actions/settings";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSettings();

  return (
    <div className="flex min-h-screen">
      <Sidebar logoUrl={profile.logoUrl} businessName={profile.businessName} />
      <main className="flex-1 overflow-x-auto bg-background px-8 py-7">{children}</main>
    </div>
  );
}
