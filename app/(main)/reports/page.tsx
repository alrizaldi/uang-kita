import { formatIdr, formatPercent, getSavingsRate } from "@/lib/finance";
import { expenseByCategory, monthlyTrend, summary } from "@/lib/mockData";

export default function ReportsPage() {
  const savings = summary.monthlyIncome - summary.monthlyExpense;
  const savingsRate = getSavingsRate(
    summary.monthlyIncome,
    summary.monthlyExpense,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          August 2026 Summary
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Income</p>
            <p className="font-semibold text-cyan-700">
              {formatIdr(summary.monthlyIncome)}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Expense</p>
            <p className="font-semibold text-rose-600">
              {formatIdr(summary.monthlyExpense)}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Savings</p>
            <p className="font-semibold text-slate-800">{formatIdr(savings)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">Savings Rate</p>
            <p className="font-semibold text-slate-800">
              {formatPercent(savingsRate)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-1">
          <h3 className="text-base font-semibold text-slate-900">
            Expense by Category
          </h3>
          <div className="mt-4 space-y-2">
            {expenseByCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">
                  {item.category}
                </span>
                <span className="text-slate-600">{formatIdr(item.amount)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">
            Monthly Trend
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Income</th>
                  <th className="pb-2 font-medium">Expense</th>
                  <th className="pb-2 font-medium">Savings</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((row) => {
                  const monthlySavings = row.income - row.expense;
                  return (
                    <tr key={row.month} className="border-b last:border-none">
                      <td className="py-2.5 font-medium text-slate-800">
                        {row.month}
                      </td>
                      <td className="py-2.5 text-slate-700">
                        {formatIdr(row.income)}
                      </td>
                      <td className="py-2.5 text-slate-700">
                        {formatIdr(row.expense)}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-900">
                        {formatIdr(monthlySavings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
