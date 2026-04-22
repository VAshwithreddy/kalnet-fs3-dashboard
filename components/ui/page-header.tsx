type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink-strong)] sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-3xl text-sm leading-7 text-[var(--ink-muted)] sm:text-base">
        {description}
      </p>
    </header>
  );
}
