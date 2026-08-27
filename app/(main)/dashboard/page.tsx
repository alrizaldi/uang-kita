import {
  formatIdr,
  formatPercent,
  getBudgetStatus,
  getSavingsRate,
} from "@/lib/finance";
import {
  budgets,
  cashFlowByMonth,
  expenseByCategory,
  goals,
  summary,
  transactions,
  upcomingBills,
} from "@/lib/mockData";

export default function DashboardPage() {
  const monthlySavings = summary.monthlyIncome - summary.monthlyExpense;
  const savingsRate = getSavingsRate(
    summary.monthlyIncome,
    summary.monthlyExpense,
  );
  const maxCashFlow = Math.max(
    ...cashFlowByMonth.map((item) => Math.max(item.income, item.expense)),
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Balance</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatIdr(summary.totalBalance)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Income This Month</p>
          <p className="mt-2 text-2xl font-bold text-cyan-700">
            {formatIdr(summary.monthlyIncome)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expense This Month</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {formatIdr(summary.monthlyExpense)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Savings This Month</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatIdr(monthlySavings)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Savings rate {formatPercent(savingsRate)}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="text-lg font-semibold text-slate-900">Cash Flow</h2>
          <p className="text-sm text-slate-500">Income vs expense trend</p>
          <div className="mt-5 space-y-4">
            {cashFlowByMonth.map((item) => (
              <div key={item.month}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {item.month}
                  </span>
                  <span className="text-slate-500">
                    {formatIdr(item.income)} / {formatIdr(item.expense)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-cyan-600"
                      style={{ width: `${(item.income / maxCashFlow) * 100}%` }}
                    />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{
                        width: `${(item.expense / maxCashFlow) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Expense Breakdown
          </h2>
          <p className="text-sm text-slate-500">
            Top spending categories this month
          </p>
          <div className="mt-4 space-y-3">
            {expenseByCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.category}
                </span>
                <span className="text-sm text-slate-600">
                  {formatIdr(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Budget Status
          </h2>
          <div className="mt-4 space-y-3">
            {budgets.map((item) => {
              const usage = (item.spent / item.limit) * 100;
              const status = getBudgetStatus(usage);

              return (
                <div
                  key={item.category}
                  className="rounded-md border bg-slate-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      {item.category}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-cyan-600"
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {formatPercent(usage)} used
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Upcoming Bills
          </h2>
          <div className="mt-4 space-y-3">
            {upcomingBills.slice(0, 3).map((bill) => (
              <div
                key={`${bill.dueDate}-${bill.name}`}
                className="rounded-md border border-slate-200 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    {bill.name}
                  </p>
                  <span className="text-xs text-slate-500">{bill.dueDate}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatIdr(bill.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Goal Progress
          </h2>
          <div className="mt-4 space-y-4">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">
                      {goal.name}
                    </span>
                    <span className="text-slate-500">
                      {formatPercent(progress)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatIdr(goal.currentAmount)} /{" "}
                    {formatIdr(goal.targetAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Transactions
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Member</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr
                  key={`${item.date}-${item.description}`}
                  className="border-b last:border-none"
                >
                  <td className="py-3 text-slate-600">{item.date}</td>
                  <td className="py-3">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-800">{item.description}</td>
                  <td className="py-3 text-slate-600">{item.member}</td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    {formatIdr(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
