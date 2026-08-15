import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { api } from '@/services/api';
import { loadResults } from '@/services/quizService';

export function RecommendationsPage() {
  const [weakTopics, setWeakTopics] = useState<Array<{ topic: string; accuracy: number; attempted: number }>>([]);
  const [recommendations, setRecommendations] = useState<Array<{ id: string; title: string; description: string; topic: string; actionLabel: string }>>([]);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      try {
        const [analyticsResult, recommendationResult] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/recommendation/'),
        ]);

        if (cancelled) return;

        const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : null;
        const recs = recommendationResult.status === 'fulfilled' ? recommendationResult.value.data : [];
        const localResults = loadResults();

        const topicPerformance = analytics?.topic_performance && typeof analytics.topic_performance === 'object'
          ? Object.entries(analytics.topic_performance).map(([topic, value]: [string, any]) => ({
              topic,
              accuracy: Number(value?.accuracy ?? 0),
              attempted: Number(value?.total_questions ?? 0),
            }))
          : [];

        const localTopicPerformance = localResults.reduce<Record<string, { topic: string; accuracy: number; attempted: number }>>((acc, result) => {
          const key = result.topic || 'General';
          const score = Number(result.score || 0);
          const current = acc[key] ?? { topic: key, accuracy: 0, attempted: 0 };
          current.attempted += 1;
          current.accuracy = ((current.accuracy * (current.attempted - 1)) + score) / current.attempted;
          acc[key] = current;
          return acc;
        }, {});

        const mergedTopics = [...Object.values(localTopicPerformance), ...topicPerformance].filter((item, index, arr) =>
          arr.findIndex((candidate) => candidate.topic === item.topic) === index,
        );

        const weak = mergedTopics.length
          ? mergedTopics.map((item) => ({
              topic: item.topic,
              accuracy: Math.round(item.accuracy),
              attempted: item.attempted,
            })).filter((item) => item.accuracy < 75).slice(0, 6)
          : [];

        const localRecommendations = localResults.length > 0
          ? Object.entries(
              localResults.reduce<Record<string, number>>((acc, result) => {
                acc[result.topic || 'General'] = (acc[result.topic || 'General'] ?? 0) + Number(result.score || 0);
                return acc;
              }, {}),
            )
              .map(([topic, totalScore]) => ({
                id: `local-rec-${topic}`,
                title: `Practice ${topic}`,
                description: `Your recent quiz performance in ${topic} is trending below target. Try another focused round to improve consistency.`,
                topic,
                actionLabel: 'Start practice',
              }))
              .slice(0, 3)
          : [];

        setWeakTopics(weak);
        setRecommendations(Array.isArray(recs) && recs.length > 0
          ? recs.slice(0, 6).map((rec: any, index: number) => ({
              id: String(rec.id ?? `rec-${index}`),
              title: rec.title || 'Recommended practice',
              description: rec.description || 'Continue improving your skills.',
              topic: rec.topic || rec.title || 'General',
              actionLabel: 'Start practice',
            }))
          : localRecommendations);
      } catch {
        if (!cancelled) {
          const localResults = loadResults();
          const localTopicPerformance = localResults.reduce<Record<string, { topic: string; accuracy: number; attempted: number }>>((acc, result) => {
            const key = result.topic || 'General';
            const score = Number(result.score || 0);
            const current = acc[key] ?? { topic: key, accuracy: 0, attempted: 0 };
            current.attempted += 1;
            current.accuracy = ((current.accuracy * (current.attempted - 1)) + score) / current.attempted;
            acc[key] = current;
            return acc;
          }, {});

          setWeakTopics(Object.values(localTopicPerformance)
            .map((item) => ({ topic: item.topic, accuracy: Math.round(item.accuracy), attempted: item.attempted }))
            .filter((item) => item.accuracy < 75)
            .slice(0, 6));

          setRecommendations(localResults.length > 0
            ? Object.entries(localResults.reduce<Record<string, number>>((acc, result) => {
                acc[result.topic || 'General'] = (acc[result.topic || 'General'] ?? 0) + Number(result.score || 0);
                return acc;
              }, {}))
              .map(([topic, totalScore]) => ({
                id: `local-rec-${topic}`,
                title: `Practice ${topic}`,
                description: `Your recent quiz performance in ${topic} is trending below target. Try another focused round to improve consistency.`,
                topic,
                actionLabel: 'Start practice',
              }))
              .slice(0, 3)
            : []);
        }
      }
    };

    void loadRecommendations();
    const onResultsUpdate = () => {
      void loadRecommendations();
    };
    window.addEventListener('quiz-results-updated', onResultsUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('quiz-results-updated', onResultsUpdate);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Your Personalized Learning Plan"
        subtitle="AI-powered recommendations based on your performance"
        icon={<Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
      />

      {/* AI insight banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-400 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI Insight</h3>
            <p className="text-sm text-brand-200 mt-1 max-w-2xl">
              Based on your recent performance, we recommend focusing on <span className="font-semibold text-white">Graphs</span> and
              {' '}<span className="font-semibold text-white">DBMS Normalization</span>. Your accuracy in these topics is below 70%.
              Try practicing with adaptive difficulty to build confidence gradually.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Weak topics summary */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning-500" />
          <h3 className="font-bold text-ink-900 dark:text-white">Topics That Need Attention</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {weakTopics.map((topic, i) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-ink-200 dark:border-ink-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-ink-900 dark:text-white text-sm">{topic.topic}</span>
                <span className={`text-sm font-bold ${topic.accuracy < 60 ? 'text-error-600' : 'text-warning-600'}`}>
                  {topic.accuracy}%
                </span>
              </div>
              <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${topic.accuracy < 60 ? 'bg-error-500' : 'bg-warning-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.accuracy}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
              </div>
              <p className="text-xs text-ink-500 mt-2">{topic.attempted} questions attempted</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <h2 className="text-lg font-bold text-ink-900 dark:text-white mb-4">Recommended Actions</h2>
      {recommendations.length === 0 ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-ink-300">
          Your personalized recommendations will appear here after you complete your first quiz.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={rec.id} rec={rec as any} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
