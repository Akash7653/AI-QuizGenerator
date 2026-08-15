import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Target, Trophy, Zap, ArrowRight, Clock,
  CheckCircle2, AlertCircle, Sparkles, Flame, Star, Medal,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/common/Badge';
import { recentQuizzes } from '@/data/mockData';
import type { QuizMode } from '@/types';

interface QuizModePageProps {
  mode: QuizMode;
}

const modeConfig: Record<QuizMode, {
  label: string;
  icon: typeof BookOpen;
  description: string;
  features: { icon: typeof Clock; label: string; desc: string }[];
  gradient: string;
  accent: string;
}> = {
  practice: {
    label: 'Practice Mode',
    icon: BookOpen,
    description: 'Learn at your own pace with instant feedback and explanations after every question.',
    features: [
      { icon: CheckCircle2, label: 'Instant Feedback', desc: 'See if you are right immediately' },
      { icon: BookOpen, label: 'Explanations', desc: 'Detailed explanation after each answer' },
      { icon: Clock, label: 'No Timer Pressure', desc: 'Take as long as you need' },
      { icon: Sparkles, label: 'Encouraging UI', desc: 'Positive reinforcement throughout' },
    ],
    gradient: 'from-brand-600 to-brand-800',
    accent: 'text-brand-600 dark:text-brand-400',
  },
  exam: {
    label: 'Exam Mode',
    icon: Target,
    description: 'Simulate real exam conditions with a strict countdown timer and no immediate answers.',
    features: [
      { icon: Clock, label: 'Countdown Timer', desc: 'Strict time limit enforcement' },
      { icon: AlertCircle, label: 'No Immediate Answers', desc: 'See results only after submission' },
      { icon: Target, label: 'Question Navigation', desc: 'Jump between questions freely' },
      { icon: CheckCircle2, label: 'Submit Confirmation', desc: 'Review before final submission' },
    ],
    gradient: 'from-accent-600 to-accent-800',
    accent: 'text-accent-600 dark:text-accent-400',
  },
  adaptive: {
    label: 'Adaptive Mode',
    icon: Sparkles,
    description: 'Questions dynamically adjust difficulty based on your real-time performance. Get harder questions when you excel, easier ones when you struggle.',
    features: [
      { icon: Sparkles, label: 'Dynamic Difficulty', desc: 'Questions adapt to your skill level' },
      { icon: TrendingUp, label: 'Real-time Adjustment', desc: 'Difficulty changes as you answer' },
      { icon: Target, label: 'Personalized Path', desc: 'Tailored to your performance' },
      { icon: CheckCircle2, label: 'Smart Scoring', desc: 'Rewards consistent improvement' },
    ],
    gradient: 'from-success-600 to-success-800',
    accent: 'text-success-600 dark:text-success-400',
  },
  challenge: {
    label: 'Challenge Mode',
    icon: Trophy,
    description: 'Gamified quiz experience with XP, streaks, achievements, and a competitive leaderboard.',
    features: [
      { icon: Trophy, label: 'Score Points', desc: 'Earn points for correct answers' },
      { icon: Flame, label: 'Build Streaks', desc: 'Bonus points for consecutive correct' },
      { icon: Zap, label: 'Earn XP', desc: 'Level up with experience points' },
      { icon: Medal, label: 'Leaderboard', desc: 'Compete with other learners' },
    ],
    gradient: 'from-warning-600 to-warning-800',
    accent: 'text-warning-600 dark:text-warning-400',
  },
};

const leaderboard = [
  { rank: 1, name: 'Priya P.', xp: 12450, avatar: 'P' },
  { rank: 2, name: 'Rahul M.', xp: 11200, avatar: 'R' },
  { rank: 3, name: 'Akash S.', xp: 8450, avatar: 'A' },
  { rank: 4, name: 'Sneha K.', xp: 7800, avatar: 'S' },
  { rank: 5, name: 'Vikram J.', xp: 6900, avatar: 'V' },
];

import { TrendingUp } from 'lucide-react';

export function QuizModePage({ mode }: QuizModePageProps) {
  const navigate = useNavigate();
  const config = modeConfig[mode];
  const Icon = config.icon;
  const modeQuizzes = recentQuizzes.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl bg-gradient-to-br ${config.gradient} p-6 sm:p-8 mb-6 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white">{config.label}</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">{config.description}</p>
          </div>
          <button
            onClick={() => navigate('/create-quiz')}
            className="btn bg-white text-ink-900 hover:bg-ink-50 px-5 py-2.5 font-bold shadow-lg shrink-0"
          >
            Start Quiz <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {config.features.map((feat, i) => (
          <motion.div
            key={feat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 flex items-start gap-3"
          >
            <div className={`w-10 h-10 rounded-xl bg-ink-50 dark:bg-ink-800 flex items-center justify-center shrink-0 ${config.accent}`}>
              <feat.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900 dark:text-white text-sm">{feat.label}</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Available quizzes for this mode */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink-900 dark:text-white mb-4">Available Quizzes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modeQuizzes.map((quiz, i) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <Badge variant="default" className="capitalize">{quiz.difficulty}</Badge>
              </div>
              <h3 className="font-bold text-ink-900 dark:text-white text-sm mb-1">{quiz.title}</h3>
              <p className="text-xs text-ink-500 mb-3">{quiz.topic} · {quiz.questions.length} questions</p>
              <button
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                className="w-full py-2 rounded-xl bg-ink-50 dark:bg-ink-800 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300 transition-colors flex items-center justify-center gap-1.5"
              >
                Start Quiz <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard for challenge mode */}
      {mode === 'challenge' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="w-5 h-5 text-warning-500" />
            <h3 className="font-bold text-ink-900 dark:text-white">Leaderboard</h3>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  entry.name === 'Akash S.' ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800' : 'bg-ink-50 dark:bg-ink-800/50'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  entry.rank === 1 ? 'bg-warning-100 text-warning-700' :
                  entry.rank === 2 ? 'bg-ink-200 text-ink-600' :
                  entry.rank === 3 ? 'bg-accent-100 text-accent-700' :
                  'bg-ink-100 dark:bg-ink-700 text-ink-500'
                }`}>
                  {entry.rank}
                </span>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {entry.avatar}
                </div>
                <span className={`flex-1 text-sm font-semibold ${entry.name === 'Akash S.' ? 'text-brand-700 dark:text-brand-300' : 'text-ink-800 dark:text-ink-200'}`}>
                  {entry.name} {entry.name === 'Akash S.' && '(You)'}
                </span>
                <span className="text-sm font-bold text-warning-600 dark:text-warning-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> {entry.xp.toLocaleString()} XP
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
