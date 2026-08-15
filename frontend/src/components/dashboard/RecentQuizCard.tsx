import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ListChecks } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { getDifficultyColor, formatRelativeDate } from '@/lib/utils';
import type { Quiz } from '@/types';

interface RecentQuizCardProps {
  quiz: Quiz;
  score?: number;
  progress?: number;
  index?: number;
}

export function RecentQuizCard({ quiz, score, progress = 0, index = 0 }: RecentQuizCardProps) {
  const safeQuiz = quiz ?? {
    id: 'unknown',
    title: 'Quiz',
    topic: 'General',
    difficulty: 'medium' as const,
    mode: 'practice' as const,
    source: 'topic' as const,
    sourceLabel: 'General',
    questions: [],
    config: { numQuestions: 0, difficulty: 'medium' as const, questionType: 'mcq' as const, timeLimit: 0, negativeMarking: false, explanationsEnabled: true, randomizeQuestions: false },
    createdAt: new Date().toISOString(),
  };

  const questionCount = safeQuiz.questions?.length ?? 0;
  const timeLimit = safeQuiz.config?.timeLimit ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-5 hover:shadow-card-hover transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink-900 dark:text-white truncate">{safeQuiz.title}</h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{safeQuiz.topic} · {formatRelativeDate(safeQuiz.createdAt)}</p>
        </div>
        <Badge variant="default" className={getDifficultyColor(safeQuiz.difficulty)}>
          {safeQuiz.difficulty}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400 mb-3">
        <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {questionCount} questions</span>
        {timeLimit > 0 && (
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeLimit} min</span>
        )}
      </div>

      {score !== undefined ? (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-500">Score</span>
            <span className="font-bold text-ink-900 dark:text-ink-100">{score}%</span>
          </div>
          <ProgressBar value={score} barClassName={score >= 80 ? 'bg-success-500' : score >= 60 ? 'bg-warning-500' : 'bg-error-500'} />
        </div>
      ) : (
        progress > 0 && (
          <div className="mb-3">
            <ProgressBar value={progress} />
          </div>
        )
      )}

      <Link
        to={`/quiz/${quiz.id}`}
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-ink-50 dark:bg-ink-800 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group"
      >
        Continue
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </motion.div>
  );
}
