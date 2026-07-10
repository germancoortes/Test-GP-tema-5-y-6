import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

const styles: Record<AlertVariant, string> = {
  error: 'bg-red-50 text-red-800 border-red-300',
  success: 'bg-green-50 text-green-800 border-green-300',
  info: 'bg-teal-50 text-teal-700 border-teal-200',
  warning: 'bg-sun-300/20 text-navy-900 border-sun-500',
};

const icons: Record<AlertVariant, string> = {
  error: '⚠️',
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
};

export function Alert({
  variant = 'info',
  children,
  title,
}: {
  variant?: AlertVariant;
  children: ReactNode;
  title?: string;
}) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${styles[variant]}`}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {icons[variant]}
      </span>
      <div className="text-sm sm:text-base">
        {title && <p className="font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
