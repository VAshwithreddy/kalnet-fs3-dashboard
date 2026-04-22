import { PageHeader } from "@/components/ui/page-header";
import { canManageUsers } from "@/lib/permissions";

const users = [
  { name: "Avery Jordan", email: "avery@kalnet.dev", role: "ADMIN" },
  { name: "Nadia Khan", email: "nadia@kalnet.dev", role: "ANALYST" },
  { name: "Leo Garcia", email: "leo@kalnet.dev", role: "VIEWER" },
];

export default function AdminUsersPage() {
  const canEditUsers = canManageUsers("ADMIN");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:px-10">
      <PageHeader
        eyebrow="User management"
        title="Baseline user administration"
        description="This page provides a clean starting point for integrating directory sync, internal RBAC, and user provisioning flows."
      />

      <section className="panel p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="eyebrow">Access control</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ink-strong)]">
              Team directory
            </h2>
          </div>
          <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success-strong)]">
            {canEditUsers ? "Admin editing enabled" : "Read only"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--panel-border)] text-left text-sm">
            <thead className="text-[var(--ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--panel-border)]">
              {users.map((user) => (
                <tr key={user.email}>
                  <td className="px-4 py-4 font-medium text-[var(--ink-strong)]">{user.name}</td>
                  <td className="px-4 py-4 text-[var(--ink-muted)]">{user.email}</td>
                  <td className="px-4 py-4 text-[var(--ink-muted)]">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
