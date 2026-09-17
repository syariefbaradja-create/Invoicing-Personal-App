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
