import type { ReactNode } from 'react';

export function EmptyState({
  icon = '🏊',
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-teal-200 bg-white/60 p-10 text-center text-navy-900">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="text-sm text-navy-900/70">{children}</div>}
    </div>
  );
}
