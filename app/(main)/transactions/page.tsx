import { formatIdr } from "@/lib/finance";
import { transactions } from "@/lib/mockData";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Quick Add Transaction
            </h2>
            <p className="text-sm text-slate-500">
              Fast entry flow for daily expenses and income
            </p>
          </div>
          <button className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            Save
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <select className="rounded-md border px-3 py-2 text-sm">
            <option>Expense</option>
            <option>Income</option>
            <option>Transfer</option>
          </select>
          <input
            className="rounded-md border px-3 py-2 text-sm"
            defaultValue="150000"
            placeholder="Amount"
          />
          <select className="rounded-md border px-3 py-2 text-sm">
            <option>Food</option>
            <option>Utilities</option>
            <option>Salary</option>
            <option>Transfer</option>
          </select>
          <input
            className="rounded-md border px-3 py-2 text-sm"
            defaultValue="27 Aug 2026"
            placeholder="Date"
          />
          <select className="rounded-md border px-3 py-2 text-sm">
            <option>BCA</option>
          </select>
          <input
            className="rounded-md border px-3 py-2 text-sm"
            defaultValue="Lunch"
            placeholder="Note"
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {["This Month", "Expense", "Income", "Transfer", "Food", "BCA"].map(
            (item) => (
              <button
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {item}
              </button>
            ),
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium">Member</th>
                <th className="pb-3 font-medium">Description</th>
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
                  <td className="py-3 text-slate-700">{item.category}</td>
                  <td className="py-3 text-slate-700">{item.account}</td>
                  <td className="py-3 text-slate-700">{item.member}</td>
                  <td className="py-3 text-slate-800">{item.description}</td>
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
