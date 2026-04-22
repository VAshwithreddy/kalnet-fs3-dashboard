import { PageHeader } from "@/components/ui/page-header";
import { canManageReports } from "@/lib/permissions";

const reports = [
  { title: "Executive KPI Pack", cadence: "Weekly", status: "Delivered" },
  { title: "Customer Health Summary", cadence: "Daily", status: "Scheduled" },
  { title: "Compliance Exception Log", cadence: "Monthly", status: "Draft" },
];

export default function AdminReportsPage() {
  const reportsEnabled = canManageReports("ANALYST");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:px-10">
      <PageHeader
        eyebrow="Reporting"
        title="Reports and delivery cadence"
        description="Use this area to extend CSV export flows, reporting schedules, and stakeholder-ready dashboards."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <article key={report.title} className="panel p-6">
            <p className="eyebrow">{report.cadence}</p>
            <h2 className="mt-3 text-lg font-semibold text-[var(--ink-strong)]">
              {report.title}
            </h2>
            <p className="mt-4 text-sm text-[var(--ink-muted)]">Status: {report.status}</p>
          </article>
        ))}
      </section>

      <section className="panel p-6">
        <p className="text-sm text-[var(--ink-muted)]">
          Report automation access for analysts:{" "}
          <span className="font-semibold text-[var(--ink-strong)]">
            {reportsEnabled ? "enabled" : "disabled"}
          </span>
        </p>
      </section>
    </main>
  );
}
