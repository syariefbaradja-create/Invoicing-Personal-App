export type PaymentSummary = {
  collected: number;
  due: number;
  isFullyPaid: boolean;
  isPartial: boolean;
};

export function getPaymentSummary(invoice: {
  total: number;
  payments: { amountReceived: number }[];
}): PaymentSummary {
  const collected = invoice.payments.reduce((sum, p) => sum + p.amountReceived, 0);
  const due = Math.max(invoice.total - collected, 0);
  return {
    collected,
    due,
    isFullyPaid: collected >= invoice.total && invoice.total > 0,
    isPartial: collected > 0 && collected < invoice.total,
  };
}
