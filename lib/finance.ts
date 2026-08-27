export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getBudgetStatus(usagePercent: number): {
  label: "Healthy" | "Watch" | "Warning" | "Exceeded";
  tone: string;
} {
  if (usagePercent >= 100) {
    return { label: "Exceeded", tone: "text-rose-700 bg-rose-100" };
  }

  if (usagePercent >= 90) {
    return { label: "Warning", tone: "text-amber-700 bg-amber-100" };
  }

  if (usagePercent >= 75) {
    return { label: "Watch", tone: "text-yellow-700 bg-yellow-100" };
  }

  return { label: "Healthy", tone: "text-emerald-700 bg-emerald-100" };
}

export function getSavingsRate(income: number, expense: number): number {
  if (income <= 0) {
    return 0;
  }

  const savings = income - expense;
  return (savings / income) * 100;
}
