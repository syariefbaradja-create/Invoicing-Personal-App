import {
  Circle,
  PaperPlaneTilt,
  CheckCircle,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

type Status = "DRAFT" | "SENT" | "PAID" | "UNPAID";

const CONFIG: Record<
  Status | "OVERDUE",
  { label: string; bg: string; fg: string; icon: React.ElementType }
> = {
  DRAFT: { label: "Draft", bg: "bg-draft", fg: "text-draft-foreground", icon: Circle },
  SENT: { label: "Terkirim", bg: "bg-sent", fg: "text-sent-foreground", icon: PaperPlaneTilt },
  PAID: { label: "Lunas", bg: "bg-paid", fg: "text-paid-foreground", icon: CheckCircle },
  UNPAID: { label: "Belum Lunas", bg: "bg-unpaid", fg: "text-unpaid-foreground", icon: Clock },
  OVERDUE: {
    label: "Overdue",
    bg: "bg-overdue",
    fg: "text-overdue-foreground",
    icon: WarningCircle,
  },
};

export function StatusBadge({
  status,
  overdue = false,
}: {
  status: Status;
  overdue?: boolean;
}) {
  const config = overdue ? CONFIG.OVERDUE : CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.fg}`}
    >
      <Icon size={12} weight="fill" aria-hidden="true" />
      {config.label}
    </span>
  );
}
