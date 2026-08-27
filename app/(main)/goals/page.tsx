import { formatIdr, formatPercent } from "@/lib/finance";
import { goals } from "@/lib/mockData";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Financial Goals
        </h2>
        <p className="text-sm text-slate-500">
          Track progress and monthly contribution needed to hit each target
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const requiredMonthly = Math.ceil(remaining / 9);

          return (
            <article
              key={goal.name}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {goal.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Target date {goal.targetDate}
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formatPercent(progress)} progress
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {formatIdr(goal.currentAmount)} / {formatIdr(goal.targetAmount)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Remaining: {formatIdr(remaining)}
              </p>
              <p className="mt-2 rounded-md bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
                Approx required monthly contribution:{" "}
                {formatIdr(requiredMonthly)}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
