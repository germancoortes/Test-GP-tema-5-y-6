import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-sun-500 text-navy-900 hover:bg-sun-600 focus-visible:outline-navy-900',
  secondary:
    'bg-teal-500 text-white hover:bg-teal-600 focus-visible:outline-sun-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-800',
  ghost:
    'bg-transparent text-teal-600 border-2 border-teal-500 hover:bg-teal-50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
