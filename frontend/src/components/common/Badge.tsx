import { type ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'brand' | 'accent';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
  success: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  error: 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
};

export function Badge({ variant = 'default', children, className = '', icon }: BadgeProps) {
  return (
    <span className={`chip ${variantClasses[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}
