"use server";

import { prisma } from "@/lib/prisma";
import { processRecurringInvoices } from "@/lib/actions/recurring";

export async function getDashboardSummary() {
  await processRecurringInvoices();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [paymentsThisMonth, paidWithoutRecordsThisMonth, outstandingInvoices, recent] =
    await Promise.all([
      prisma.paymentRecord.aggregate({
        _sum: { amountReceived: true },
        where: { paymentDate: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          status: "PAID",
          paidAt: { gte: startOfMonth, lte: endOfMonth },
          payments: { none: {} },
        },
      }),
      prisma.invoice.findMany({
        where: { status: { in: ["SENT", "UNPAID"] } },
        select: {
          id: true,
          dueDate: true,
          total: true,
          payments: { select: { amountReceived: true } },
        },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: true },
      }),
    ]);

  const overdueCount = outstandingInvoices.filter(
    (inv) => inv.dueDate.getTime() < now.getTime()
  ).length;

  const totalBelumDibayar = outstandingInvoices.reduce((sum, inv) => {
    const collected = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
    return sum + Math.max(inv.total - collected, 0);
  }, 0);

  return {
    totalTertagihBulanIni:
      (paymentsThisMonth._sum.amountReceived ?? 0) +
      (paidWithoutRecordsThisMonth._sum.total ?? 0),
    totalBelumDibayar,
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

  const [payments, paidNoRecords, outstanding] = await Promise.all([
    prisma.paymentRecord.findMany({
      where: { paymentDate: { gte: rangeStart } },
      select: { amountReceived: true, paymentDate: true },
    }),
    prisma.invoice.findMany({
      where: { status: "PAID", paidAt: { gte: rangeStart }, payments: { none: {} } },
      select: { total: true, paidAt: true },
    }),
    prisma.invoice.findMany({
      where: {
        status: { in: ["SENT", "UNPAID"] },
        issueDate: { gte: rangeStart },
      },
      select: {
        total: true,
        issueDate: true,
        payments: { select: { amountReceived: true } },
      },
    }),
  ]);

  for (const p of payments) {
    const key = `${p.paymentDate.getFullYear()}-${p.paymentDate.getMonth()}`;
    const point = byKey.get(key);
    if (point) point.tertagih += p.amountReceived;
  }

  for (const inv of paidNoRecords) {
    if (!inv.paidAt) continue;
    const key = `${inv.paidAt.getFullYear()}-${inv.paidAt.getMonth()}`;
    const point = byKey.get(key);
    if (point) point.tertagih += inv.total;
  }

  for (const inv of outstanding) {
    const collected = inv.payments.reduce((s, p) => s + p.amountReceived, 0);
    const due = Math.max(inv.total - collected, 0);
    const key = `${inv.issueDate.getFullYear()}-${inv.issueDate.getMonth()}`;
    const point = byKey.get(key);
    if (point) point.belumDibayar += due;
  }

  return points;
}
