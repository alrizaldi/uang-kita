import { formatIdr } from "@/lib/finance";
import { upcomingBills } from "@/lib/mockData";

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Bills and Recurring Transactions
        </h2>
        <p className="text-sm text-slate-500">
          Due date creates pending item first, then user confirms payment
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Upcoming Bills
          </h3>
          <div className="mt-4 space-y-3">
            {upcomingBills.map((bill) => (
              <div
                key={`${bill.dueDate}-${bill.name}`}
                className="rounded-md border border-slate-200 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {bill.name}
                  </span>
                  <span className="text-xs text-slate-500">{bill.dueDate}</span>
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  {formatIdr(bill.amount)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Recurring Rules
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Frequency</th>
                  <th className="pb-2 font-medium">Next Due</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "Electricity",
                    frequency: "MONTHLY",
                    due: "29 Aug 2026",
                    amount: 450000,
                  },
                  {
                    name: "Internet",
                    frequency: "MONTHLY",
                    due: "01 Sep 2026",
                    amount: 350000,
                  },
                  {
                    name: "Insurance",
                    frequency: "MONTHLY",
                    due: "15 Sep 2026",
                    amount: 750000,
                  },
                ].map((row) => (
                  <tr key={row.name} className="border-b last:border-none">
                    <td className="py-2.5 text-slate-800">{row.name}</td>
                    <td className="py-2.5 text-slate-600">{row.frequency}</td>
                    <td className="py-2.5 text-slate-600">{row.due}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      {formatIdr(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
