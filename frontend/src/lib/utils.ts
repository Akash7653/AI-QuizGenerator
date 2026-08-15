export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateStr);
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300';
    case 'medium':
      return 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300';
    case 'hard':
      return 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300';
    case 'adaptive':
      return 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300';
    default:
      return 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-success-600 dark:text-success-400';
  if (score >= 70) return 'text-brand-600 dark:text-brand-400';
  if (score >= 50) return 'text-warning-600 dark:text-warning-400';
  return 'text-error-600 dark:text-error-400';
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Keep Practicing';
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
