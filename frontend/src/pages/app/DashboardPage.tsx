import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle, FileText, Type, Link2, StickyNote, TrendingUp,
  Target, ListChecks, Flame, Zap, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentQuizCard } from '@/components/dashboard/RecentQuizCard';
import { RecommendationCard, WeakTopicCard } from '@/components/dashboard/RecommendationCard';
import { api } from '@/services/api';
import { loadResults } from '@/services/quizService';
import { getGreeting } from '@/lib/utils';

const quickActions = [
  { icon: FileText, label: 'Upload PDF', desc: 'Generate from a document', to: '/create-quiz', color: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400' },
  { icon: StickyNote, label: 'Paste Text', desc: 'Paste your notes or content', to: '/create-quiz', color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400' },
  { icon: Type, label: 'Enter Topic', desc: 'Type a subject to generate', to: '/create-quiz', color: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' },
  { icon: Link2, label: 'Add URL', desc: 'Generate from an article URL', to: '/create-quiz', color: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [weakTopics, setWeakTopics] = useState<Array<{ topic: string; accuracy: number }>>([]);
  const [recommendations, setRecommendations] = useState<Array<{ id: string; title: string; description: string; topic: string; actionLabel: string }>>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Array<{ id: string; title: string; topic: string; difficulty: string; questions: Array<{ id: string }> }>>([]);
  const [stats, setStats] = useState({
    averageScore: user?.averageScore ?? 0,
    quizzesCompleted: user?.quizzesCompleted ?? 0,
    questionsAnswered: 0,
    accuracy: 0,
    streak: user?.streak ?? 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        const [analyticsResult, historyResult, recommendationsResult] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/quiz/history'),
          api.get('/recommendation/'),
        ]);

        if (cancelled) return;

        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : null;
        const history = historyResult.status === 'fulfilled' ? historyResult.value.data : [];
        const recs = recommendationsResult.status === 'fulfilled' ? recommendationsResult.value.data : [];
        const localResults = loadResults();

        const mappedLocalRecent = localResults.slice(0, 4).map((result, index) => ({
          id: String(result.id ?? `recent-${index}`),
          title: result.quizTitle || 'Quiz',
          topic: result.topic || 'General',
          difficulty: String(result.difficulty || 'medium').toLowerCase(),
          questions: Array.from({ length: result.total || 10 }, (_, qIndex) => ({ id: `q-${index}-${qIndex}` })),
          config: {
            numQuestions: Number(result.total || 10),
            difficulty: String(result.difficulty || 'medium').toLowerCase() as any,
            questionType: 'mcq' as const,
            timeLimit: 0,
            negativeMarking: false,
            explanationsEnabled: true,
            randomizeQuestions: false,
          },
          createdAt: result.date || new Date().toISOString(),
        }));

        const topics = analytics?.topic_performance && typeof analytics.topic_performance === 'object'
          ? Object.entries(analytics.topic_performance).map(([topic, value]: [string, any]) => ({
              topic,
              accuracy: Number(value?.accuracy ?? 0),
            }))
          : [];

        const mappedRecent = Array.isArray(history)
          ? history.slice(0, 4).map((item: any, index: number) => ({
              id: String(item.quiz_id ?? item.id ?? `recent-${index}`),
              title: item.topic || item.quiz_title || 'Quiz',
              topic: item.topic || 'General',
              difficulty: String(item.difficulty || 'medium').toLowerCase(),
              questions: Array.from({ length: item.total_questions || 10 }, (_, qIndex) => ({ id: `q-${index}-${qIndex}` })),
              config: {
                numQuestions: Number(item.total_questions || 10),
                difficulty: String(item.difficulty || 'medium').toLowerCase() as any,
                questionType: 'mcq' as const,
                timeLimit: Number(item.time_limit ?? 0),
                negativeMarking: false,
                explanationsEnabled: true,
                randomizeQuestions: false,
              },
              createdAt: item.created_at || new Date().toISOString(),
            }))
          : [];

        const mergedRecent = [...mappedRecent, ...mappedLocalRecent].filter((q, idx, arr) => arr.findIndex((item) => item.id === q.id) === idx).slice(0, 4);

        const mappedRecommendations = Array.isArray(recs)
          ? recs.slice(0, 3).map((rec: any, index: number) => ({
              id: String(rec.id ?? `recommendation-${index}`),
              title: rec.title || 'Recommended practice',
              description: rec.description || 'Continue improving your skills.',
              topic: rec.topic || rec.title || 'General',
              actionLabel: 'Start practice',
            }))
          : [];

        const totalQuizzes = Math.max(Number(analytics?.total_quizzes_attempted ?? 0), localResults.length);
        const averageScore = localResults.length > 0
          ? Math.round(localResults.reduce((sum, item) => sum + Number(item.score || 0), 0) / localResults.length)
          : Number(analytics?.average_score ?? user?.averageScore ?? 0);

        setWeakTopics(topics.filter((topic) => topic.accuracy < 75).slice(0, 4));
        setRecommendations(mappedRecommendations);
        setRecentQuizzes(mergedRecent);
        setStats({
          averageScore,
          quizzesCompleted: totalQuizzes,
          questionsAnswered: localResults.length > 0 ? localResults.reduce((sum, item) => sum + Number(item.total || 0), 0) : Number(analytics?.total_questions_attempted ?? 0),
          accuracy: localResults.length > 0 ? Math.round(localResults.reduce((sum, item) => sum + Number(item.accuracy || item.score || 0), 0) / localResults.length) : Number(analytics?.overall_accuracy ?? user?.averageScore ?? 0),
          streak: Number(user?.streak ?? 0),
        });
      } catch {
        if (!cancelled) {
          setWeakTopics([]);
          setRecommendations([]);
          setRecentQuizzes([]);
        }
      }
    };

    void fetchDashboardData();
    const onResultsUpdate = () => {
      void fetchDashboardData();
    };
    window.addEventListener('quiz-results-updated', onResultsUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('quiz-results-updated', onResultsUpdate);
    };
  }, [user?.id, user?.averageScore, user?.quizzesCompleted, user?.streak]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Greeting hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-6 sm:p-8 mb-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-accent-500 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium">{getGreeting()},</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {firstName} 👋
            </h1>
            <p className="text-brand-200 mt-1">Ready to test your knowledge?</p>
          </div>
          <Link to="/create-quiz" className="btn bg-white text-brand-700 hover:bg-brand-50 px-5 py-3 font-bold shadow-lg shrink-0">
            <PlusCircle className="w-5 h-5" /> Create New Quiz
          </Link>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => window.location.href = '/create-quiz'}
            className="card p-4 text-left hover:shadow-card-hover transition-all hover:-translate-y-0.5 group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="font-bold text-ink-900 dark:text-white text-sm">{action.label}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 hidden sm:block">{action.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Average Score" value={`${Math.round(stats.averageScore)}%`} trend="0%" color="brand" delay={0} />
        <StatCard icon={ListChecks} label="Quizzes Completed" value={stats.quizzesCompleted} color="success" delay={0.05} />
        <StatCard icon={Target} label="Questions Answered" value={stats.questionsAnswered} color="accent" delay={0.1} />
        <StatCard icon={Zap} label="Accuracy" value={`${Math.round(stats.accuracy)}%`} trend="0%" color="warning" delay={0.15} />
        <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} days`} color="error" delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Continue Learning</h2>
            <Link to="/history" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentQuizzes.length === 0 ? (
            <div className="card p-6 text-sm text-ink-600 dark:text-ink-300">
              No recent activity yet. Start your first quiz to see your learning history here.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recentQuizzes.slice(0, 4).map((quiz, i) => (
                <RecentQuizCard
                  key={quiz.id}
                  quiz={quiz as any}
                  score={undefined}
                  progress={30 + i * 15}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">Weak Topics</h2>
              <Link to="/analytics" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                Details
              </Link>
            </div>
            {weakTopics.length === 0 ? (
              <div className="card p-4 text-sm text-ink-600 dark:text-ink-300">No weak topics yet. Complete a few quizzes to unlock insights.</div>
            ) : (
              <div className="space-y-2">
                {weakTopics.map((topic, i) => (
                  <WeakTopicCard key={topic.topic} topic={topic.topic} accuracy={topic.accuracy} index={i} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">Recommended for You</h2>
              <Link to="/recommendations" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recommendations.length === 0 ? (
              <div className="card p-4 text-sm text-ink-600 dark:text-ink-300">No recommendations yet. Your personalized plan will appear after you start learning.</div>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <RecommendationCard key={rec.id} rec={rec as any} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
