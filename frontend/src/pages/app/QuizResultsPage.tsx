import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Circle, Clock, Target, TrendingUp,
  ArrowRight, RotateCcw, BookOpen, Home, Share2,
} from 'lucide-react';
import type { QuizResult } from '@/types';
import { formatTime, getScoreColor, getScoreLabel } from '@/lib/utils';
import { Button } from '@/components/common/Button';

export function QuizResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const result = (location.state as { result?: QuizResult } | null)?.result;

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-500 mb-4">No result data found.</p>
        <Link to="/dashboard" className="btn-primary px-4 py-2.5">Back to Dashboard</Link>
      </div>
    );
  }

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (result.score / 100) * circumference;

  const stats = [
    { icon: CheckCircle2, label: 'Correct', value: result.correct, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-100 dark:bg-success-900/30' },
    { icon: XCircle, label: 'Wrong', value: result.wrong, color: 'text-error-600 dark:text-error-400', bg: 'bg-error-100 dark:bg-error-900/30' },
    { icon: Circle, label: 'Unanswered', value: result.unanswered, color: 'text-ink-500', bg: 'bg-ink-100 dark:bg-ink-800' },
    { icon: Clock, label: 'Time Taken', value: formatTime(result.timeTaken), color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-100 dark:bg-brand-900/30' },
    { icon: Target, label: 'Accuracy', value: `${result.accuracy}%`, color: 'text-accent-600 dark:text-accent-400', bg: 'bg-accent-100 dark:bg-accent-900/30' },
  ];

  const summaryTitle = result.score >= 80 ? 'Excellent work' : result.score >= 60 ? 'Solid performance' : 'Nice effort';
  const summaryText = result.score >= 80
    ? 'Outstanding work! You have a strong grasp of this topic and are ready for the next challenge.'
    : result.score >= 60
    ? 'Good effort! You are building momentum. A quick review of the missed questions will push you further.'
    : 'You are making progress. Focus on a few weak areas, then jump back in and try another round.';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-500 blur-3xl" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          className="relative z-10 inline-block text-5xl mb-2"
        >
          🎉
        </motion.div>
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-white mb-2 relative z-10">Quiz Complete</h1>
        <p className="mb-6 text-sm text-ink-600 dark:text-ink-400 relative z-10">{summaryTitle}</p>

        {/* Circular score */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="none" strokeWidth="12" className="stroke-ink-100 dark:stroke-ink-800" />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className={result.score >= 80 ? 'stroke-success-500' : result.score >= 60 ? 'stroke-brand-500' : 'stroke-warning-500'}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-end justify-center gap-1 leading-none"
            >
              <span className={`text-2xl sm:text-3xl font-extrabold ${getScoreColor(result.score)}`}>
                {result.score}
              </span>
              <span className={`text-lg sm:text-xl font-bold ${getScoreColor(result.score)}`}>
                %
              </span>
            </motion.div>
            <p className="text-xs sm:text-sm text-ink-500 mt-2">{getScoreLabel(result.score)}</p>
          </div>
        </div>

        <p className="text-ink-600 dark:text-ink-400 relative z-10">{result.quizTitle}</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-4 text-center"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`card p-6 mb-6 ${
          result.score >= 80 ? 'border-success-200 dark:border-success-900/40' :
          result.score >= 60 ? 'border-brand-200 dark:border-brand-900/40' :
          'border-warning-200 dark:border-warning-900/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            result.score >= 80 ? 'bg-success-100 dark:bg-success-900/30' :
            result.score >= 60 ? 'bg-brand-100 dark:bg-brand-900/30' :
            'bg-warning-100 dark:bg-warning-900/30'
          }`}>
            <TrendingUp className={`w-6 h-6 ${
              result.score >= 80 ? 'text-success-600' :
              result.score >= 60 ? 'text-brand-600' : 'text-warning-600'
            }`} />
          </div>
          <div>
            <h3 className="font-bold text-ink-900 dark:text-white">{summaryTitle}</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400">{summaryText}</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={() => navigate(`/quiz/${id}/review`, { state: { result } })}
          leftIcon={<BookOpen className="w-5 h-5" />}
        >
          Review Answers
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => navigate('/create-quiz')}
          leftIcon={<RotateCcw className="w-5 h-5" />}
        >
          Retake Quiz
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/analytics')}
          leftIcon={<TrendingUp className="w-5 h-5" />}
        >
          View Analytics
        </Button>
      </div>

      <div className="mt-4 flex justify-center">
        <Link to="/dashboard" className="text-sm text-ink-500 hover:text-brand-600 flex items-center gap-1">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
