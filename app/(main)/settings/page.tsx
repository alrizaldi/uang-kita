export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          General Settings
        </h2>
        <p className="text-sm text-slate-500">
          Manage profile preferences, security defaults, and data behavior
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">
            Family Profile
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="rounded-md border px-3 py-2 text-sm"
              defaultValue="Akbar Family"
            />
            <input
              className="rounded-md border px-3 py-2 text-sm"
              defaultValue="Asia/Jakarta"
            />
            <input
              className="rounded-md border px-3 py-2 text-sm"
              defaultValue="IDR"
            />
            <input
              className="rounded-md border px-3 py-2 text-sm"
              defaultValue="27 Aug 2026"
            />
          </div>
          <button className="mt-4 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            Save Changes
          </button>
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Security</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Email/password authentication enabled</li>
            <li>Password reset enabled</li>
            <li>Private receipt access only</li>
            <li>RLS planned for every family-owned table</li>
          </ul>
        </article>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Danger Zone</h3>
        <p className="mt-2 text-sm text-slate-600">
          Deleting a transaction, account, or family should require explicit
          confirmation and soft delete/archive where possible.
        </p>
      </section>
    </div>
  );
}
