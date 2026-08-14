import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Sparkles, TrendingUp, Clock, Target, Award, BookOpen,
  ChevronRight, Lightbulb, BarChart3, History, Trash2, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchHistory, clearHistory, type HistoryRow } from '@/lib/supabase';
import { getTopicSuggestions } from '@/lib/quizEngine';
import type { QuizConfig, QuizQuestion } from '@/types';
import { generateQuiz } from '@/lib/quizEngine';
import { SkeletonLoader, StatSkeletonLoader, ChartSkeletonLoader } from '@/components/skeleton-loader';
import { containerVariants, itemVariants } from '@/components/page-transition';
import { useThemeMode } from '@/hooks/use-theme-mode';

interface Props {
  onNewQuiz: () => void;
  onStartQuiz: (config: QuizConfig, questions: QuizQuestion[]) => void;
}

interface Stats {
  total: number;
  average: number;
  best: number;
  totalTime: number;
  byTopic: { topic: string; avg: number; count: number }[];
  recent: HistoryRow[];
  trend: { label: string; score: number }[];
  weakTopic: string | null;
  recommended: { topic: string; difficulty: string } | null;
}

function computeStats(rows: HistoryRow[]): Stats {
  if (rows.length === 0) {
    return { total: 0, average: 0, best: 0, totalTime: 0, byTopic: [], recent: [], trend: [], weakTopic: null, recommended: null };
  }
  const total = rows.length;
  const percentages = rows.map((r) => Math.round((r.score / r.total_questions) * 100));
  const average = Math.round(percentages.reduce((a, b) => a + b, 0) / total);
  const best = Math.max(...percentages);
  const totalTime = rows.reduce((a, r) => a + r.time_taken, 0);

  const topicMap = new Map<string, { scores: number[]; count: number }>();
  rows.forEach((r) => {
    const pct = Math.round((r.score / r.total_questions) * 100);
    const e = topicMap.get(r.topic) ?? { scores: [], count: 0 };
    e.scores.push(pct);
    e.count += 1;
    topicMap.set(r.topic, e);
  });
  const byTopic = Array.from(topicMap.entries()).map(([topic, e]) => ({
    topic,
    avg: Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length),
    count: e.count,
  })).sort((a, b) => b.avg - a.avg);

  const trend = [...rows].reverse().slice(-6).map((r, i) => ({
    label: `Q${i + 1}`,
    score: Math.round((r.score / r.total_questions) * 100),
  }));

  // Weak topic: lowest average with at least 1 quiz
  const sortedAsc = [...byTopic].sort((a, b) => a.avg - b.avg);
  const weakTopic = sortedAsc.length > 0 && sortedAsc[0].avg < 70 ? sortedAsc[0].topic : null;

  let recommended: { topic: string; difficulty: string } | null = null;
  if (weakTopic) {
    const weakRow = rows.find((r) => r.topic === weakTopic);
    const prevDiff = weakRow?.difficulty ?? 'Medium';
    const diffOrder = ['Beginner', 'Easy', 'Medium', 'Hard'];
    const idx = diffOrder.indexOf(prevDiff);
    const newDiff = idx > 1 ? 'Beginner' : 'Easy';
    recommended = { topic: weakTopic, difficulty: newDiff };
  }

  return { total, average, best, totalTime, byTopic, recent: rows.slice(0, 5), trend, weakTopic, recommended };
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function Dashboard({ onNewQuiz, onStartQuiz }: Props) {
  const { theme } = useThemeMode();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log('[Dashboard] Mounting - fetching history...');
    fetchHistory()
      .then((data) => {
        if (!mounted) return;
        console.log('[Dashboard] Fetched data length:', data.length);
        console.log('[Dashboard] Fetched data:', data);
        // Always use the fetched data, even if empty (don't keep seed data)
        setRows(data);
      })
      .catch((error) => {
        console.error('[Dashboard] Error fetching history:', error);
        // On error, show empty state instead of demo data
        if (mounted) setRows([]);
      })
      .finally(() => {
        console.log('[Dashboard] Fetch completed, setting loading to false');
        mounted && setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => computeStats(rows), [rows]);

  const handleClear = async () => {
    try {
      await clearHistory();
      setRows([]);
    } catch { /* ignore */ }
  };

  const startRecommended = () => {
    if (!stats.recommended) return;
    const config: QuizConfig = {
      topic: stats.recommended.topic,
      sourceType: 'topic',
      numQuestions: 10,
      difficulty: stats.recommended.difficulty as any,
      questionType: 'Mixed',
      timeLimit: 10,
      adaptiveDifficulty: true,
      showExplanations: true,
      randomizeQuestions: true,
    };
    onStartQuiz(config, generateQuiz(config));
  };

  const startSuggestion = (topic: string) => {
    const config: QuizConfig = {
      topic,
      sourceType: 'topic',
      numQuestions: 10,
      difficulty: 'Medium',
      questionType: 'Mixed',
      timeLimit: 10,
      adaptiveDifficulty: false,
      showExplanations: true,
      randomizeQuestions: true,
    };
    onStartQuiz(config, generateQuiz(config));
  };

  const suggestions = getTopicSuggestions().slice(0, 6);

  if (loading) {
    return (
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero skeleton */}
        <div className={`h-40 rounded-3xl animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-slate-700 to-slate-800' : 'bg-gradient-to-r from-blue-200 to-purple-200'}`} />

        {/* Stats skeleton */}
        <StatSkeletonLoader />

        {/* Charts skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`lg:col-span-2 h-80 rounded-lg animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-slate-700 to-slate-800' : 'bg-gradient-to-r from-blue-200 to-purple-200'}`} />
          <div className={`h-80 rounded-lg animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-slate-700 to-slate-800' : 'bg-gradient-to-r from-blue-200 to-purple-200'}`} />
        </div>

        {/* Recent and recommended skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`h-64 rounded-lg animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-slate-700 to-slate-800' : 'bg-gradient-to-r from-blue-200 to-purple-200'}`} />
          <div className={`h-64 rounded-lg animate-pulse ${theme === 'dark' ? 'bg-gradient-to-r from-slate-700 to-slate-800' : 'bg-gradient-to-r from-blue-200 to-purple-200'}`} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-4 sm:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[24px] border shadow-[0_20px_60px_rgba(59,130,246,0.12)] backdrop-blur-xl p-4 sm:rounded-[30px] sm:p-8 ${
          theme === 'dark'
            ? 'border-blue-500/20 bg-gradient-to-br from-slate-900 via-blue-950/60 to-violet-950/50'
            : 'border-blue-200/60 bg-gradient-to-br from-white via-blue-50 to-violet-50'
        }`}
      >
        <motion.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`absolute top-0 right-0 h-80 w-80 rounded-full blur-3xl ${theme === 'dark' ? 'bg-cyan-500/15' : 'bg-cyan-400/20'}`}
            animate={{ y: [0, -35, 0], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl ${theme === 'dark' ? 'bg-violet-500/15' : 'bg-violet-400/20'}`}
            animate={{ y: [0, 35, 0], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-300/20'}`}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <motion.div
              className="flex items-center gap-2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-sm ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-700'}`}>
                Welcome back
              </span>
            </motion.div>

            <h1 className={`max-w-xl text-2xl font-black tracking-tight sm:text-5xl bg-clip-text text-transparent ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300'
                : 'bg-gradient-to-r from-blue-700 via-violet-700 to-pink-600'
            }`}>
              Ready to learn something new today?
            </h1>

            <p className={`max-w-lg text-sm leading-6 sm:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              Generate a quiz from any topic or upload a PDF and let QuizGen create questions instantly.
            </p>

            <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={onNewQuiz}
                  className="h-11 w-full rounded-xl text-sm font-bold shadow-[0_18px_45px_rgba(59,130,246,0.35)] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 transition-all duration-300 sm:h-12 sm:w-auto sm:text-base"
                >
                  <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Create New Quiz
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => startSuggestion('Machine Learning')}
                  className={`h-11 w-full rounded-xl border-2 text-sm font-semibold transition-all duration-300 sm:h-12 sm:w-auto sm:text-base ${
                    theme === 'dark'
                      ? 'border-slate-600 hover:bg-slate-700/60 hover:border-blue-500'
                      : 'border-slate-300 hover:bg-slate-100/60 hover:border-blue-400'
                  }`}
                >
                  <Zap className="mr-2 h-4 w-4" /> Quick Start: ML
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="hidden shrink-0 sm:block"
            animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={`relative flex h-32 w-32 items-center justify-center rounded-3xl border backdrop-blur ${
              theme === 'dark'
                ? 'border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                : 'border-blue-300/30 bg-gradient-to-br from-blue-200/40 to-purple-200/40'
            }`}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className={`absolute inset-0 rounded-3xl border-2 border-dashed ${theme === 'dark' ? 'border-blue-400/30' : 'border-blue-300/30'}`}
              />
              <BrainIcon />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Target} label="Quizzes Taken" value={stats.total} color="primary" delay={0.05} />
        <StatCard icon={Award} label="Average Score" value={`${stats.average}%`} color="success" delay={0.1} />
        <StatCard icon={TrendingUp} label="Best Score" value={`${stats.best}%`} color="warning" delay={0.15} />
        <StatCard icon={Clock} label="Total Time" value={fmtTime(stats.totalTime)} color="accent" delay={0.2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress chart */}
        <Card className={`lg:col-span-2 overflow-hidden border-0 shadow-[0_18px_50px_rgba(59,130,246,0.12)] ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-sky-950/70 to-indigo-950/80' : 'bg-gradient-to-br from-white via-blue-50 to-violet-50'}`}>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Learning Progress</CardTitle>
                <CardDescription>Your score trend over recent quizzes</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1">{stats.trend.length} quizzes</Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {stats.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={stats.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        {/* Average radial */}
        <Card className={`overflow-hidden border-0 shadow-[0_18px_50px_rgba(168,85,247,0.10)] ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-violet-950/70 to-fuchsia-950/60' : 'bg-gradient-to-br from-violet-50 via-white to-fuchsia-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Overall Accuracy</CardTitle>
            <CardDescription>Your average across all quizzes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            <div className="relative h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: 'avg', value: stats.average, fill: 'hsl(var(--chart-1))' }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold">{stats.average}%</span>
                <span className="text-xs text-muted-foreground">accuracy</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Progress value={stats.average} className="h-1.5 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weak topic / recommendation */}
      {stats.weakTopic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-warning/30 bg-gradient-to-br from-warning/10 to-background">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/20 text-warning">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-warning-foreground">{stats.weakTopic} is a weak area.</p>
                  <p className="text-sm text-muted-foreground">
                    Recommended: Practice {stats.weakTopic} — {stats.recommended?.difficulty} Level
                  </p>
                </div>
              </div>
              <Button onClick={startRecommended} className="shrink-0 rounded-xl">
                Start Recommended Quiz <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent quizzes */}
        <Card className={`overflow-hidden border-0 shadow-[0_20px_50px_rgba(59,130,246,0.12)] ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/60' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Recent Quizzes</CardTitle>
              {rows.length > 0 && (
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClear}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear history</TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              )}
            </div>
            <CardDescription>Your latest quiz attempts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent.length > 0 ? stats.recent.map((r, i) => {
              const pct = Math.round((r.score / r.total_questions) * 100);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 ${theme === 'dark' ? 'border-slate-700/80 bg-white/5 hover:border-blue-400/40 hover:bg-slate-800/70' : 'border-slate-200/80 bg-white/70 hover:border-blue-200 hover:bg-blue-50/60'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${pct >= 70 ? 'bg-success/15 text-success' : pct >= 50 ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'}`}>
                      {pct}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.topic}</p>
                      <p className="text-xs text-muted-foreground">{r.difficulty} · {r.question_type} · {fmtTime(r.time_taken)}</p>
                    </div>
                  </div>
                  <Badge variant={r.source_type === 'pdf' ? 'default' : 'secondary'} className="text-[10px] rounded-full">
                    {r.source_type === 'pdf' ? 'PDF' : r.source_type === 'text' ? 'Text' : r.source_type === 'url' ? 'URL' : 'Topic'}
                  </Badge>
                </motion.div>
              );
            }) : <EmptyState icon={History} text="No quizzes yet. Create your first quiz!" />}
          </CardContent>
        </Card>

        {/* Recommended topics */}
        <Card className={`overflow-hidden border-0 shadow-[0_18px_45px_rgba(168,85,247,0.12)] ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-violet-950/65 to-pink-950/60' : 'bg-gradient-to-br from-violet-50 via-white to-pink-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Recommended Topics</CardTitle>
            <CardDescription>Jump into a popular subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {suggestions.map((topic, i) => (
                <motion.button
                  key={topic}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  onClick={() => startSuggestion(topic)}
                  className={`group flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-all duration-300 hover:shadow-lg ${theme === 'dark' ? 'border-slate-700/80 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:border-violet-400/60' : 'border-slate-200/80 bg-gradient-to-br from-white/90 to-violet-50/80 hover:border-violet-200'}`}
                >
                  <BookOpen className={`h-4 w-4 transition-colors group-hover:text-primary ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                  <span className="text-sm font-medium leading-tight">{topic}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic performance */}
      {stats.byTopic.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Topic Performance</CardTitle>
                <CardDescription>Subject-wise success rate</CardDescription>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Focus areas tracked
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.byTopic.map((t, i) => (
              <motion.div
                key={t.topic}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border/60 bg-background/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{t.topic}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.avg >= 70 ? 'bg-green-500/10 text-green-600 dark:text-green-300' : t.avg >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300' : 'bg-red-500/10 text-red-600 dark:text-red-300'}`}>
                      {t.avg >= 70 ? 'Strong' : t.avg >= 50 ? 'Improving' : 'Needs work'}
                    </span>
                  </div>
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{t.avg}% · {t.count} quiz{t.count > 1 ? 'es' : ''}</span>
                </div>
                <Progress value={t.avg} className={`h-2 ${t.avg >= 70 ? '[&>div]:bg-green-500' : t.avg >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`} />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {rows.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <BookOpen className={`h-12 w-12 mx-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`} />
          </motion.div>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>No quizzes yet. Create your first quiz to get started!</p>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string | number; color: string; delay: number }) {
  const { theme } = useThemeMode();
  
  const colorMap: Record<string, { bg: string; bgLight: string; icon: string; iconLight: string; gradient: string }> = {
    primary: { 
      bg: 'from-blue-900/20 to-blue-800/20', 
      bgLight: 'from-blue-100/40 to-blue-50/40',
      icon: 'text-blue-400', 
      iconLight: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600' 
    },
    success: { 
      bg: 'from-green-900/20 to-green-800/20', 
      bgLight: 'from-green-100/40 to-green-50/40',
      icon: 'text-green-400', 
      iconLight: 'text-green-600',
      gradient: 'from-green-500 to-green-600' 
    },
    warning: { 
      bg: 'from-amber-900/20 to-amber-800/20', 
      bgLight: 'from-amber-100/40 to-amber-50/40',
      icon: 'text-amber-400', 
      iconLight: 'text-amber-600',
      gradient: 'from-amber-500 to-amber-600' 
    },
    accent: { 
      bg: 'from-purple-900/20 to-purple-800/20', 
      bgLight: 'from-purple-100/40 to-purple-50/40',
      icon: 'text-purple-400', 
      iconLight: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600' 
    },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={`overflow-hidden border shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(74,90,239,0.12)] ${
        theme === 'dark'
          ? `border-slate-700/50 bg-gradient-to-br ${colors.bg} backdrop-blur-xl hover:border-slate-600/60`
          : `border-slate-200/70 bg-gradient-to-br ${colors.bgLight} backdrop-blur-xl hover:border-slate-300/80`
      }`}>

        <CardContent className="flex items-center gap-2.5 p-3 sm:gap-4 sm:p-5">
          <motion.div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-md sm:h-12 sm:w-12 sm:rounded-2xl sm:shadow-lg`}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[10px] font-medium leading-none sm:text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
            <p className={`mt-1 text-lg font-extrabold tracking-tight whitespace-nowrap sm:text-2xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BrainIcon() {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Sparkles className="h-12 w-12 text-primary" />
    </motion.div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-muted-foreground">
      <BarChart3 className="h-8 w-8 opacity-40" />
      <p className="text-sm">Take quizzes to see your progress</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
