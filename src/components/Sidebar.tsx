"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  Receipt,
  Gear,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: SquaresFour },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Gear },
];

export function Sidebar({
  logoUrl,
  businessName,
}: {
  logoUrl?: string | null;
  businessName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-card px-3 py-5">
      <div>
        <div className="mb-6 flex items-center gap-2 px-2">
          {logoUrl ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
              <Image
                src={logoUrl}
                alt={businessName || "Logo bisnis"}
                width={32}
                height={32}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Receipt size={18} weight="fill" aria-hidden="true" />
            </div>
          )}
          <span className="truncate text-base font-semibold text-foreground">
            {businessName || "Invoicing"}
          </span>
        </div>
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <SignOut size={18} aria-hidden="true" />
        Keluar
      </button>
    </aside>
  );
}
