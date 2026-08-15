import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  TrendingUp, Target, Award, Flame, ListChecks, BarChart3,
  Zap, Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { api } from '@/services/api';
import { loadResults } from '@/services/quizService';

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    accuracy: 0,
    questionsSolved: 0,
    studyStreak: 0,
    bestScore: 0,
  });
  const [performanceOverTime, setPerformanceOverTime] = useState<Array<{ date: string; score: number }>>([]);
  const [accuracyByTopic, setAccuracyByTopic] = useState<Array<{ topic: string; accuracy: number; attempted: number }>>([]);
  const [questionDistribution, setQuestionDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [difficultyPerformance, setDifficultyPerformance] = useState<Array<{ difficulty: string; accuracy: number }>>([]);
  const [answerBreakdown, setAnswerBreakdown] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        if (cancelled) return;
        const data = response.data || {};

        const topicPerformance = data.topic_performance && typeof data.topic_performance === 'object'
          ? Object.entries(data.topic_performance).map(([topic, value]: [string, any]) => ({
              topic,
              accuracy: Number(value?.accuracy ?? 0),
              attempted: Number(value?.total_questions ?? 0),
            }))
          : [];

        const difficultyPerformanceData = data.difficulty_performance && typeof data.difficulty_performance === 'object'
          ? Object.entries(data.difficulty_performance).map(([difficulty, value]: [string, any]) => ({
              difficulty,
              accuracy: Number(value?.accuracy ?? 0),
            }))
          : [];

        const localResults = loadResults();
        const localTotal = localResults.length;
        const localAverage = localTotal > 0 ? Math.round(localResults.reduce((sum, item) => sum + Number(item.score || 0), 0) / localTotal) : Number(data.average_score ?? 0);
        const localAccuracy = localTotal > 0 ? Math.round(localResults.reduce((sum, item) => sum + Number(item.accuracy || item.score || 0), 0) / localTotal) : Number(data.overall_accuracy ?? 0);

        setMetrics({
          totalQuizzes: Math.max(Number(data.total_quizzes_attempted ?? 0), localTotal),
          averageScore: localTotal > 0 ? localAverage : Number(data.average_score ?? 0),
          accuracy: localTotal > 0 ? localAccuracy : Number(data.overall_accuracy ?? 0),
          questionsSolved: localTotal > 0 ? localResults.reduce((sum, item) => sum + Number(item.total || 0), 0) : Number(data.total_questions_attempted ?? 0),
          studyStreak: 0,
          bestScore: Math.max(localTotal > 0 ? Math.max(...localResults.map((item) => Number(item.score || 0))) : 0, Number(data.average_score ?? 0)),
        });
        setPerformanceOverTime(
          localTotal > 0
            ? localResults.slice(0, 7).reverse().map((entry) => ({ date: new Date(entry.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: Number(entry.score || 0) }))
            : (Array.isArray(data.daily_progress) ? data.daily_progress.map((entry: any) => ({ date: entry.date || 'Today', score: Number(entry.average_score ?? entry.score ?? 0) })) : [])
        );
        setAccuracyByTopic(topicPerformance.length > 0 ? topicPerformance : localResults.length > 0 ? Object.entries(localResults.reduce((acc: Record<string, { topic: string; accuracy: number; attempted: number }>, result) => {
          const topic = result.topic || 'General';
          if (!acc[topic]) acc[topic] = { topic, accuracy: 0, attempted: 0 };
          acc[topic].accuracy += Number(result.score || 0);
          acc[topic].attempted += 1;
          return acc;
        }, {})).map(([topic, value]) => ({ topic, accuracy: Math.round(value.accuracy / Math.max(value.attempted, 1)), attempted: value.attempted })) : []);
        setDifficultyPerformance(difficultyPerformanceData.length > 0 ? difficultyPerformanceData : localResults.length > 0 ? Object.entries(localResults.reduce((acc: Record<string, number>, result) => {
          const difficulty = result.difficulty || 'medium';
          acc[difficulty] = (acc[difficulty] || 0) + Number(result.score || 0);
          return acc;
        }, {})).map(([difficulty, total]) => ({ difficulty, accuracy: Math.round(total / Math.max(localResults.filter((entry) => (entry.difficulty || 'medium') === difficulty).length, 1)) })) : []);
        setQuestionDistribution([
          { name: 'Correct', value: localTotal > 0 ? Math.round(localResults.reduce((sum, item) => sum + Number(item.correct || 0), 0) / Math.max(localResults.reduce((sum, item) => sum + Number(item.total || 0), 0), 1) * 100) : Number(data.overall_accuracy ?? 0), color: '#3b66f5' },
          { name: 'Remaining', value: localTotal > 0 ? Math.max(100 - Math.round(localResults.reduce((sum, item) => sum + Number(item.correct || 0), 0) / Math.max(localResults.reduce((sum, item) => sum + Number(item.total || 0), 0), 1) * 100), 0) : Math.max(100 - Number(data.overall_accuracy ?? 0), 0), color: '#e5e7eb' },
        ]);
        setAnswerBreakdown([
          { name: 'Correct', value: localTotal > 0 ? localResults.reduce((sum, item) => sum + Number(item.correct || 0), 0) : Math.max(Number(data.total_questions_attempted ?? 0) * (Number(data.overall_accuracy ?? 0) / 100), 0), color: '#1bb24a' },
          { name: 'Incorrect', value: localTotal > 0 ? localResults.reduce((sum, item) => sum + Number(item.wrong || 0), 0) : Math.max(Number(data.total_questions_attempted ?? 0) - Math.max(Number(data.total_questions_attempted ?? 0) * (Number(data.overall_accuracy ?? 0) / 100), 0), 0), color: '#f2741a' },
        ]);
      } catch {
        if (!cancelled) {
          setMetrics({ totalQuizzes: 0, averageScore: 0, accuracy: 0, questionsSolved: 0, studyStreak: 0, bestScore: 0 });
          setPerformanceOverTime([]);
          setAccuracyByTopic([]);
          setQuestionDistribution([]);
          setDifficultyPerformance([]);
          setAnswerBreakdown([]);
        }
      }
    };

    void loadAnalytics();
    const onResultsUpdate = () => {
      void loadAnalytics();
    };
    window.addEventListener('quiz-results-updated', onResultsUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('quiz-results-updated', onResultsUpdate);
    };
  }, []);

  const radarData = accuracyByTopic.map((t) => ({ topic: t.topic, accuracy: t.accuracy }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Analytics"
        subtitle="Track your performance and identify areas for improvement"
        icon={<BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <StatCard icon={ListChecks} label="Total Quizzes" value={metrics.totalQuizzes} color="brand" delay={0} />
        <StatCard icon={TrendingUp} label="Average Score" value={`${metrics.averageScore}%`} color="success" delay={0.05} />
        <StatCard icon={Target} label="Accuracy" value={`${metrics.accuracy}%`} color="accent" delay={0.1} />
        <StatCard icon={Zap} label="Questions Solved" value={metrics.questionsSolved} color="warning" delay={0.15} />
        <StatCard icon={Flame} label="Study Streak" value={`${metrics.studyStreak}d`} color="error" delay={0.2} />
        <StatCard icon={Trophy} label="Best Score" value={`${metrics.bestScore}%`} color="success" delay={0.25} />
      </div>

      {performanceOverTime.length === 0 && accuracyByTopic.length === 0 && questionDistribution.length === 0 ? (
        <div className="card p-6 text-sm text-ink-600 dark:text-ink-300">
          Analytics will appear after your first quiz attempt.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance over time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900 dark:text-white">Performance Over Time</h3>
            <span className="chip bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300">
              <TrendingUp className="w-3 h-3" /> Improving
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={performanceOverTime}>
              <defs>
                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b66f5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b66f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" className="dark:opacity-20" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="score" stroke="#3b66f5" strokeWidth={2.5} fill="url(#colorPerf)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Question distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="font-bold text-ink-900 dark:text-white mb-4">Question Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={questionDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                {questionDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {questionDistribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink-600 dark:text-ink-400">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-ink-900 dark:text-ink-100">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accuracy by topic - bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 lg:col-span-2"
        >
          <h3 className="font-bold text-ink-900 dark:text-white mb-4">Accuracy by Topic</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accuracyByTopic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" className="dark:opacity-20" vertical={false} />
              <XAxis dataKey="topic" tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,102,245,0.05)' }} />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {accuracyByTopic.map((entry, idx) => (
                  <Cell key={idx} fill={entry.accuracy >= 80 ? '#1bb24a' : entry.accuracy >= 60 ? '#f2741a' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty performance - radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="font-bold text-ink-900 dark:text-white mb-4">Difficulty Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={difficultyPerformance}>
              <PolarGrid stroke="#eef0f5" className="dark:opacity-20" />
              <PolarAngleAxis dataKey="difficulty" tick={{ fontSize: 12, fill: '#9aa4c0' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: '#9aa4c0' }} domain={[0, 100]} angle={90} />
              <Radar name="Accuracy" dataKey="accuracy" stroke="#3b66f5" fill="#3b66f5" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Answer breakdown pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6"
        >
          <h3 className="font-bold text-ink-900 dark:text-white mb-4">Answer Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={answerBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={3}
                label={({ value }: { value: number }) => value}
                labelLine={false}
              >
                {answerBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {answerBreakdown.map((d) => {
              const total = answerBreakdown.reduce((sum, e) => sum + e.value, 0);
              const pct = Math.round((d.value / total) * 100);
              return (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-600 dark:text-ink-400">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-semibold text-ink-900 dark:text-ink-100">{d.value} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Learning progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900 dark:text-white">Learning Progress</h3>
            <span className="chip bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
              <Award className="w-3 h-3" /> Level 8
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={performanceOverTime}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1bb24a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1bb24a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" className="dark:opacity-20" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="score" stroke="#1bb24a" strokeWidth={2.5} fill="url(#colorProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      )}
    </div>
  );
}
