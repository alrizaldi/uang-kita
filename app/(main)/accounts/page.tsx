import { formatIdr } from "@/lib/finance";
import { accounts } from "@/lib/mockData";

export default function AccountsPage() {
  const totalBalance = accounts.reduce(
    (acc, item) => acc + item.currentBalance,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Account Overview
            </h2>
            <p className="text-sm text-slate-500">
              Supports one-account MVP with future multi-account readiness
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Balance</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatIdr(totalBalance)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {accounts.map((account) => (
          <article
            key={account.name}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {account.name}
              </h3>
              {account.isPrimary ? (
                <span className="rounded bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">
                  Primary
                </span>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Type</dt>
                <dd className="font-medium text-slate-800">{account.type}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Owner</dt>
                <dd className="font-medium text-slate-800">{account.owner}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Opening Balance</dt>
                <dd className="font-medium text-slate-800">
                  {formatIdr(account.openingBalance)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Current Balance</dt>
                <dd className="font-bold text-emerald-600">
                  {formatIdr(account.currentBalance)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-dashed bg-white p-5 text-sm text-slate-600 shadow-sm">
        For single-account families, transaction forms can default to the
        primary account and hide account selection.
      </section>
    </div>
  );
}
