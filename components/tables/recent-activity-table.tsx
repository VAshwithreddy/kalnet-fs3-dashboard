type ActivityRow = {
  label: string;
  owner: string;
  status: string;
  updatedAt: string;
};

type RecentActivityTableProps = {
  rows: ActivityRow[];
};

export function RecentActivityTable({ rows }: RecentActivityTableProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-[var(--panel-border)] px-6 py-5">
        <p className="eyebrow">Operations</p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ink-strong)]">
          Recent activity
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--panel-border)] text-left text-sm">
          <thead className="bg-slate-50/80 text-[var(--ink-muted)]">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--panel-border)]">
            {rows.map((row) => (
              <tr key={`${row.label}-${row.updatedAt}`} className="bg-white/60">
                <td className="px-6 py-4 font-medium text-[var(--ink-strong)]">{row.label}</td>
                <td className="px-6 py-4 text-[var(--ink-muted)]">{row.owner}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--warning-strong)]">
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--ink-muted)]">{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
