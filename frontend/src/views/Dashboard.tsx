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
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchHistory()
      .then((data) => {
        if (!mounted) return;
        // Always use the fetched data, even if empty (don't keep seed data)
        setRows(data);
      })
      .catch((error) => {
        console.error('Failed to fetch quiz history:', error);
        // On error, show empty state instead of demo data
        if (mounted) setRows([]);
      })
      .finally(() => mounted && setLoading(false));
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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-background p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Welcome back</span>
            </div>
            <h1 className="max-w-xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Ready to learn something new today?
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
              Generate a quiz from any topic or upload a PDF and let QuizGen create questions instantly.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" onClick={onNewQuiz} className="h-11 rounded-xl text-base shadow-lg shadow-primary/30">
                <Plus className="mr-2 h-5 w-5" /> Create New Quiz
              </Button>
              <Button size="lg" variant="outline" onClick={() => startSuggestion('Machine Learning')} className="h-11 rounded-xl text-base">
                <Zap className="mr-2 h-4 w-4" /> Quick Start: ML
              </Button>
            </div>
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary/30"
              />
              <BrainIcon />
            </div>
          </div>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Learning Progress</CardTitle>
                <CardDescription>Your score trend over recent quizzes</CardDescription>
              </div>
              <Badge variant="secondary">{stats.trend.length} quizzes</Badge>
            </div>
          </CardHeader>
          <CardContent>
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
        <Card>
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
        <Card>
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
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 transition-colors hover:bg-accent/40"
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
                  <Badge variant={r.source_type === 'pdf' ? 'default' : 'secondary'} className="text-[10px]">
                    {r.source_type === 'pdf' ? 'PDF' : r.source_type === 'text' ? 'Text' : r.source_type === 'url' ? 'URL' : 'Topic'}
                  </Badge>
                </motion.div>
              );
            }) : <EmptyState icon={History} text="No quizzes yet. Create your first quiz!" />}
          </CardContent>
        </Card>

        {/* Recommended topics */}
        <Card>
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
                  className="group flex flex-col items-start gap-1 rounded-xl border border-border/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="text-sm font-medium leading-tight">{topic}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic performance */}
      {stats.byTopic.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Topic Performance</CardTitle>
            <CardDescription>Accuracy breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.byTopic.map((t, i) => (
              <motion.div
                key={t.topic}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.topic}</span>
                  <span className="text-muted-foreground">{t.avg}% · {t.count} quiz{t.count > 1 ? 'es' : ''}</span>
                </div>
                <Progress value={t.avg} className={`h-2 ${t.avg >= 70 ? '[&>div]:bg-success' : t.avg >= 50 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {loading && rows.length === 0 && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Loading your history…</div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string | number; color: string; delay: number }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent text-accent-foreground',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-3 p-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-extrabold tracking-tight">{value}</p>
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
