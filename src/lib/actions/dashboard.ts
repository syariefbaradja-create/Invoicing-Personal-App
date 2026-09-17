"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [paidThisMonth, unpaidAll, allSentOrUnpaid, recent] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        status: "PAID",
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: { in: ["SENT", "UNPAID"] } },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "UNPAID"] } },
      select: { id: true, dueDate: true },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
  ]);

  const overdueCount = allSentOrUnpaid.filter(
    (inv) => inv.dueDate.getTime() < now.getTime()
  ).length;

  return {
    totalTertagihBulanIni: paidThisMonth._sum.total ?? 0,
    totalBelumDibayar: unpaidAll._sum.total ?? 0,
    overdueCount,
    recentInvoices: recent,
  };
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export type MonthlyCashflowPoint = {
  key: string;
  label: string;
  tertagih: number;
  belumDibayar: number;
};

export async function getMonthlyCashflowTrend(monthsBack = 6): Promise<MonthlyCashflowPoint[]> {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [{ issueDate: { gte: rangeStart } }, { paidAt: { gte: rangeStart } }],
    },
    select: { total: true, status: true, issueDate: true, paidAt: true },
  });

  const points: MonthlyCashflowPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
      tertagih: 0,
      belumDibayar: 0,
    });
  }

  const byKey = new Map(points.map((p) => [p.key, p]));

  for (const inv of invoices) {
    if (inv.status === "PAID" && inv.paidAt) {
      const key = `${inv.paidAt.getFullYear()}-${inv.paidAt.getMonth()}`;
      const point = byKey.get(key);
      if (point) point.tertagih += inv.total;
    } else if (inv.status === "SENT" || inv.status === "UNPAID") {
      const key = `${inv.issueDate.getFullYear()}-${inv.issueDate.getMonth()}`;
      const point = byKey.get(key);
      if (point) point.belumDibayar += inv.total;
    }
  }

  return points;
}
