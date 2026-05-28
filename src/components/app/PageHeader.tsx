import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-white/55 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
