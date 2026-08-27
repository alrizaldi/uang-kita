import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border bg-white/90 p-8 shadow-lg backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
          Uang Kita
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900 md:text-5xl">
          Family Finance
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Simple frontend MVP focused on one account today, ready for family
          members, budgets, bills, goals, and multi-account growth tomorrow.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            Open Dashboard
          </Link>
          <Link
            href="/transactions"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}
