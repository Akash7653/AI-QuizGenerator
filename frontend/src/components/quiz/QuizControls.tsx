import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flag, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface QuestionNavigatorProps {
  total: number;
  current: number;
  answers: (string | null)[];
  marked: boolean[];
  onSelect: (index: number) => void;
}

export function QuestionNavigator({ total, current, answers, marked, onSelect }: QuestionNavigatorProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isAnswered = answers[i] !== null;
        const isMarked = marked[i];
        const isCurrent = i === current;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`relative w-9 h-9 rounded-lg text-xs font-bold transition-all ${
              isCurrent
                ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-ink-900 bg-brand-600 text-white'
                : isMarked
                ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300'
                : isAnswered
                ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                : 'bg-ink-100 dark:bg-ink-800 text-ink-500'
            }`}
            aria-label={`Question ${i + 1}`}
          >
            {i + 1}
            {isMarked && (
              <Flag className="absolute -top-1 -right-1 w-3 h-3 text-warning-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface QuizTimerProps {
  timeLeft: number;
  total?: number;
}

export function QuizTimer({ timeLeft, total }: QuizTimerProps) {
  const isLow = timeLeft <= 30;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
      isLow ? 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400' : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200'
    }`}>
      <Clock className="w-4 h-4" />
      {formatTime(timeLeft)}
      {total && (
        <span className="text-xs text-ink-400 font-normal">/ {formatTime(total)}</span>
      )}
    </div>
  );
}

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="flex-1 max-w-xs">
      <div className="flex justify-between text-xs text-ink-500 mb-1">
        <span>Question {current + 1} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
