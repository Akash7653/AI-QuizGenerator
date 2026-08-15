import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Circle, BookOpen, ArrowLeft,
  Filter, Tag, BarChart3,
} from 'lucide-react';
import type { QuizResult } from '@/types';
import { getDifficultyColor } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

type FilterType = 'all' | 'correct' | 'incorrect' | 'skipped';

export function QuizReviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const result = (location.state as { result?: QuizResult } | null)?.result;
  const [filter, setFilter] = useState<FilterType>('all');

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-500 mb-4">No review data found.</p>
        <Link to="/dashboard" className="btn-primary px-4 py-2.5">Back to Dashboard</Link>
      </div>
    );
  }

  const filtered = result.answers.filter((a) => {
    if (filter === 'correct') return a.isCorrect;
    if (filter === 'incorrect') return !a.isCorrect && !a.skipped;
    if (filter === 'skipped') return a.skipped;
    return true;
  });

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: result.answers.length },
    { id: 'correct', label: 'Correct', count: result.correct },
    { id: 'incorrect', label: 'Incorrect', count: result.wrong },
    { id: 'skipped', label: 'Skipped', count: result.unanswered },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/quiz/${id}/results`} className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white">Detailed Answer Review</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">{result.quizTitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1.5 text-sm text-ink-500 shrink-0">
          <Filter className="w-4 h-4" /> Filter:
        </span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`chip shrink-0 transition-colors ${
              filter === f.id
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Circle className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500">No questions match this filter.</p>
          </div>
        ) : (
          filtered.map((answer, i) => {
            const status = answer.skipped ? 'skipped' : answer.isCorrect ? 'correct' : 'incorrect';
            const statusConfig = {
              correct: { icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-100 dark:bg-success-900/30', label: 'Correct' },
              incorrect: { icon: XCircle, color: 'text-error-600', bg: 'bg-error-100 dark:bg-error-900/30', label: 'Incorrect' },
              skipped: { icon: Circle, color: 'text-ink-500', bg: 'bg-ink-100 dark:bg-ink-800', label: 'Skipped' },
            };
            const cfg = statusConfig[status];
            const StatusIcon = cfg.icon;

            // Find question details
            const question = result.answers.find((a) => a.questionId === answer.questionId);
            const userOptionText = answer.selectedOptionId
              ? `Option ${answer.selectedOptionId.split('_opt').pop()}`
              : 'Not answered';
            const correctOptionText = `Option ${answer.correctOptionId.split('_opt').pop()}`;

            return (
              <motion.div
                key={answer.questionId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-6"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      Question {result.answers.indexOf(answer) + 1}
                    </span>
                    <Badge variant="default" className={getDifficultyColor(answer.difficulty)}>
                      {answer.difficulty}
                    </Badge>
                  </div>
                  <span className={`chip ${cfg.bg} ${cfg.color} font-semibold`}>
                    <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                  </span>
                </div>

                {/* Question text */}
                <h3 className="text-base font-bold text-ink-900 dark:text-white mb-4 leading-relaxed">
                  {answer.questionText}
                </h3>

                {/* Answers */}
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div className={`p-3 rounded-xl border ${
                    answer.skipped
                      ? 'border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50'
                      : answer.isCorrect
                      ? 'border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/20'
                      : 'border-error-300 dark:border-error-700 bg-error-50 dark:bg-error-900/20'
                  }`}>
                    <p className="text-xs font-semibold text-ink-500 mb-1">Your Answer</p>
                    <p className={`text-sm font-medium ${
                      answer.skipped ? 'text-ink-500' : answer.isCorrect ? 'text-success-700 dark:text-success-300' : 'text-error-700 dark:text-error-300'
                    }`}>{userOptionText}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/20">
                    <p className="text-xs font-semibold text-ink-500 mb-1">Correct Answer</p>
                    <p className="text-sm font-medium text-success-700 dark:text-success-300">{correctOptionText}</p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-brand-700 dark:text-brand-300 mb-1">Explanation</p>
                      <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed">{answer.explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-ink-500">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {answer.topic}</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {answer.difficulty}</span>
                  {answer.sourceReference && <span className="text-ink-400">Source: {answer.sourceReference}</span>}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Link to={`/quiz/${id}/results`} className="btn-outline px-4 py-2.5">
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </Link>
      </div>
    </div>
  );
}
