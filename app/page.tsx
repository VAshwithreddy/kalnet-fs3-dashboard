import Link from "next/link";

const sections = [
  {
    href: "/admin/dashboard",
    title: "Dashboard",
    description: "Monitor KPIs, operational trends, and team activity in one view.",
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Review user access, permissions, and lifecycle readiness.",
  },
  {
    href: "/admin/reports",
    title: "Reports",
    description: "Track exports, reporting cadence, and delivery status.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-14 sm:px-10">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_32px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur">
        <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          Full-stack starter
        </span>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-5xl">
              Kalnet FS3 Dashboard is ready for team-based delivery.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
              This repository ships with a protected branch strategy, Next.js 14 App
              Router setup, Tailwind styling, Prisma integration points, and the
              baseline admin areas required for feature delivery.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--panel-border)] bg-[var(--panel-strong)] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              Workflow guardrails
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/90">
              <li>No direct pushes to <code>main</code>.</li>
              <li>Feature work lands in <code>develop</code> through pull requests.</li>
              <li><code>main</code> requires review approval before merge.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-[1.5rem] border border-[var(--panel-border)] bg-white/80 p-6 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              {section.title}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
              {section.description}
            </p>
            <span className="mt-6 inline-flex text-sm font-medium text-[var(--ink-strong)]">
              Open section
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
