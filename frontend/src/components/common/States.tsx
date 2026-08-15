import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
      )}
      <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm mb-4">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary px-4 py-2.5 text-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary px-4 py-2.5 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, children }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-error-100 dark:bg-error-900/30 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm mb-4">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-primary px-4 py-2.5 text-sm">
          Try Again
        </button>
      )}
      {children}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative flex items-center justify-center mb-3">
        <div className="absolute h-12 w-12 rounded-full bg-brand-200/70 dark:bg-brand-900/50 animate-ping" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
          <span className="text-lg font-black text-white">Q</span>
        </div>
      </div>
      {label && label !== 'Loading...' ? <p className="text-sm text-ink-500 dark:text-ink-400">{label}</p> : null}
    </div>
  );
}
