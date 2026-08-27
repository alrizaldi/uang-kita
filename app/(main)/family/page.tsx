import { familyMembers } from "@/lib/mockData";

export default function FamilyPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Family Members</h2>
        <p className="text-sm text-slate-500">
          A member record can exist even without a login account
        </p>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Login Access</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map((member) => (
                <tr key={member.name} className="border-b last:border-none">
                  <td className="py-3 font-semibold text-slate-800">
                    {member.name}
                  </td>
                  <td className="py-3 text-slate-700">{member.role}</td>
                  <td className="py-3 text-slate-700">
                    {member.hasLogin ? "Connected" : "No login required"}
                  </td>
                  <td className="py-3">
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
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
