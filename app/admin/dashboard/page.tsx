import { RevenueChart } from "@/components/charts/revenue-chart";
import { RecentActivityTable } from "@/components/tables/recent-activity-table";
import { PageHeader } from "@/components/ui/page-header";
import { getAllowedSections } from "@/lib/permissions";

const revenueData = [
  { month: "Jan", revenue: 24 },
  { month: "Feb", revenue: 28 },
  { month: "Mar", revenue: 31 },
  { month: "Apr", revenue: 37 },
  { month: "May", revenue: 42 },
  { month: "Jun", revenue: 46 },
];

const recentActivity = [
  { label: "Pipeline health export", owner: "Ops team", status: "Reviewed", updatedAt: "10 mins ago" },
  { label: "Role access sync", owner: "Admin", status: "Pending", updatedAt: "35 mins ago" },
  { label: "Monthly executive report", owner: "Analytics", status: "Scheduled", updatedAt: "2 hours ago" },
];

export default function AdminDashboardPage() {
  const allowedSections = getAllowedSections("ADMIN");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:px-10">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Operational visibility for Kalnet FS3"
        description="Use this baseline dashboard to extend metrics, admin workflows, and reporting features while keeping structure and permissions consistent across the team."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {allowedSections.map((section) => (
          <article key={section} className="panel p-5">
            <p className="eyebrow">{section}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              This area is enabled for administrator access in the shared permissions helper.
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <RevenueChart data={revenueData} />
        <div className="panel p-6">
          <p className="eyebrow">Health snapshot</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ink-strong)]">
            Release readiness
          </h2>
          <div className="mt-6 space-y-4 text-sm text-[var(--ink-muted)]">
            <div className="rounded-2xl bg-slate-50/80 p-4">
              <p className="font-medium text-[var(--ink-strong)]">Pull request policy</p>
              <p className="mt-2">All changes flow from feature branches into develop, then into main.</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 p-4">
              <p className="font-medium text-[var(--ink-strong)]">Approval rule</p>
              <p className="mt-2">The production branch requires at least one approval before merge.</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 p-4">
              <p className="font-medium text-[var(--ink-strong)]">Data layer</p>
              <p className="mt-2">Prisma is configured for local SQLite development and future service expansion.</p>
            </div>
          </div>
        </div>
      </section>

      <RecentActivityTable rows={recentActivity} />
    </main>
  );
}
