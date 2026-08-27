import { formatIdr, formatPercent, getBudgetStatus } from "@/lib/finance";
import { budgets } from "@/lib/mockData";

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Monthly Budget Status
        </h2>
        <p className="text-sm text-slate-500">
          Healthy under 75%, Watch 75-89%, Warning 90-99%, Exceeded 100%+
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {budgets.map((item) => {
          const usage = (item.spent / item.limit) * 100;
          const remaining = item.limit - item.spent;
          const status = getBudgetStatus(usage);

          return (
            <article
              key={item.category}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.category}
                </h3>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${status.tone}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600">
                  Budget: {formatIdr(item.limit)}
                </p>
                <p className="text-slate-600">Spent: {formatIdr(item.spent)}</p>
                <p className="font-medium text-slate-800">
                  Remaining: {formatIdr(remaining)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-cyan-600"
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formatPercent(usage)} used
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-xl border border-dashed bg-white p-5 text-sm text-slate-600 shadow-sm">
        Alert examples: Food budget is 82% used. Shopping budget has been
        exceeded by Rp 50,000.
      </section>
    </div>
  );
}
