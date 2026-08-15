interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  className = '',
  barClassName = '',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-ink-500 mb-1">
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full ${sizeClasses[size]} bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barClassName || 'bg-brand-500'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
