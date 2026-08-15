import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, Lightbulb, BookOpen, Target } from 'lucide-react';
import { ProgressBar } from '@/components/common/ProgressBar';
import type { Recommendation } from '@/types';

interface RecommendationCardProps {
  rec: Recommendation;
  index?: number;
}

const typeConfig = {
  weak_topic: { icon: TrendingDown, color: 'text-error-600 dark:text-error-400', bg: 'bg-error-100 dark:bg-error-900/30' },
  recommended_quiz: { icon: Target, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-100 dark:bg-brand-900/30' },
  revision: { icon: BookOpen, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-100 dark:bg-warning-900/30' },
};

export function RecommendationCard({ rec, index = 0 }: RecommendationCardProps) {
  const safeType = rec?.type && rec.type in typeConfig ? rec.type : 'recommended_quiz';
  const config = typeConfig[safeType] ?? typeConfig.recommended_quiz;
  const Icon = config.icon ?? Target;
  const title = rec?.title || 'Recommended practice';
  const description = rec?.description || 'Continue improving your skills.';
  const actionLabel = rec?.actionLabel || 'Start practice';
  const accuracy = typeof rec?.accuracy === 'number' ? rec.accuracy : undefined;

  if (!rec) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink-900 dark:text-white">{title}</h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>

      {accuracy !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-500">Accuracy</span>
            <span className={`font-bold ${accuracy < 60 ? 'text-error-600' : 'text-warning-600'}`}>{accuracy}%</span>
          </div>
          <ProgressBar value={accuracy} barClassName={accuracy < 60 ? 'bg-error-500' : 'bg-warning-500'} />
        </div>
      )}

      <Link
        to="/create-quiz"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-ink-50 dark:bg-ink-800 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

interface WeakTopicCardProps {
  topic: string;
  accuracy: number;
  index?: number;
}

export function WeakTopicCard({ topic, accuracy, index = 0 }: WeakTopicCardProps) {
  const color = accuracy < 60 ? 'bg-error-500' : accuracy < 75 ? 'bg-warning-500' : 'bg-success-500';
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-4 flex items-center gap-4"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm truncate">{topic}</p>
        <div className="mt-2">
          <ProgressBar value={accuracy} barClassName={color} size="sm" />
        </div>
      </div>
      <span className={`text-lg font-extrabold ${accuracy < 60 ? 'text-error-600' : accuracy < 75 ? 'text-warning-600' : 'text-success-600'}`}>
        {accuracy}%
      </span>
    </motion.div>
  );
}
