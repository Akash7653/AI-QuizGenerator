import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, BookOpen, CheckCircle2, ChevronDown, Clock3, FileText, Lightbulb, RotateCcw, Sparkles, Target, TrendingDown, XCircle, Zap, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { QuizResult, QuizConfig } from '@/types';

interface Props {
  result: QuizResult;
  onDashboard: () => void;
  onNewQuiz: () => void;
  onRetry: () => void;
  onRecommended: (config: QuizConfig) => void;
}

export function Results({ result, onDashboard, onNewQuiz, onRetry, onRecommended }: Props) {
  const [showAll, setShowAll] = useState(false);
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const wrongAnswers = result.answers.filter((answer) => !answer.isCorrect);
  const correctAnswers = result.answers.filter((answer) => answer.isCorrect);
  const performance = useMemo(() => {
    const topicMap = new Map<string, { correct: number; total: number }>();
    result.answers.forEach((answer) => {
      const current = topicMap.get(answer.topic) ?? { correct: 0, total: 0 };
      current.total += 1;
      if (answer.isCorrect) current.correct += 1;
      topicMap.set(answer.topic, current);
    });
    return Array.from(topicMap.entries()).map(([topic, value]) => ({ topic, value: Math.round((value.correct / value.total) * 100) }));
  }, [result.answers]);

  const weakTopic = performance.sort((a, b) => a.value - b.value)[0];
  const recommendation: QuizConfig = {
    topic: weakTopic?.topic ?? result.topic,
    sourceType: 'topic',
    numQuestions: result.totalQuestions,
    difficulty: 'Beginner',
    questionType: 'Mixed',
    timeLimit: 10,
    adaptiveDifficulty: true,
    showExplanations: true,
    randomizeQuestions: true,
  };

  const formatTime = (seconds: number): string => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const headline = percentage >= 90 ? 'Outstanding work!' : percentage >= 70 ? 'Nice work — keep going!' : percentage >= 50 ? 'Good start. You’re building momentum.' : 'Every attempt makes you stronger.';
  const visibleWrong = showAll ? wrongAnswers : wrongAnswers.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-none space-y-6 lg:min-h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onDashboard} className="-ml-3 text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Button>
        <Badge variant="secondary">Quiz complete</Badge>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-background p-6 text-center sm:p-10">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            {percentage >= 70 ? <Award className="h-10 w-10" /> : <Sparkles className="h-10 w-10" />}
          </motion.div>
          <p className="mt-5 text-sm font-semibold text-primary">{result.topic} · {result.difficulty}</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{headline}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Here’s a breakdown of your performance. Review the explanations below to turn mistakes into progress.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-8">
            <div><p className="text-5xl font-extrabold tracking-tight text-primary">{percentage}%</p><p className="mt-1 text-xs text-muted-foreground">accuracy</p></div>
            <div className="h-12 w-px bg-border" />
            <div><p className="text-3xl font-bold">{result.score}/{result.totalQuestions}</p><p className="mt-1 text-xs text-muted-foreground">correct answers</p></div>
            <div className="h-12 w-px bg-border" />
            <div><p className="text-3xl font-bold">{formatTime(result.timeTaken)}</p><p className="mt-1 text-xs text-muted-foreground">time taken</p></div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard icon={CheckCircle2} label="Correct" value={correctAnswers.length} tone="success" />
        <MetricCard icon={XCircle} label="Incorrect" value={wrongAnswers.length} tone="danger" />
        <MetricCard icon={Target} label="Accuracy" value={`${percentage}%`} tone="primary" />
        <MetricCard icon={Clock3} label="Time" value={formatTime(result.timeTaken)} tone="warning" />
      </div>

      {weakTopic && weakTopic.value < 70 && (
        <Card className="border-warning/30 bg-gradient-to-br from-warning/10 to-background">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning"><Lightbulb className="h-5 w-5" /></div><div><p className="font-semibold">{weakTopic.topic} is a weak area.</p><p className="mt-1 text-sm text-muted-foreground">Recommended: Practice {weakTopic.topic} — Beginner Level</p></div></div>
            <Button onClick={() => onRecommended(recommendation)} className="rounded-xl"><Zap className="mr-2 h-4 w-4" /> Start recommended quiz</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Topic performance</CardTitle></CardHeader><CardContent className="space-y-4">{performance.map((item) => <div key={item.topic} className="space-y-1.5"><div className="flex justify-between text-sm"><span className="font-medium">{item.topic}</span><span className="text-muted-foreground">{item.value}%</span></div><Progress value={item.value} className={`h-2 ${item.value >= 70 ? '[&>div]:bg-success' : '[&>div]:bg-warning'}`} /></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Performance breakdown</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Correct', value: correctAnswers.length, fill: '#22c55e' },
                  { name: 'Incorrect', value: wrongAnswers.length, fill: '#ef4444' },
                  { name: 'Skipped', value: result.answers.length - correctAnswers.length - wrongAnswers.length, fill: '#eab308' }
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
                <Cell fill="#eab308" />
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>

      {wrongAnswers.length > 0 && <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Review your answers</CardTitle><p className="mt-1 text-sm text-muted-foreground">Simple explanations for the questions you missed</p></div><Badge variant="outline">{wrongAnswers.length} to review</Badge></div></CardHeader><CardContent className="space-y-4">{visibleWrong.map((answer, index) => <WrongAnswer key={answer.questionId} answer={answer} index={index} />)}{wrongAnswers.length > 3 && <Button variant="ghost" className="w-full" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show less' : `Show ${wrongAnswers.length - 3} more`}<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} /></Button>}</CardContent></Card>}

      <div className="flex flex-col justify-center gap-3 sm:flex-row"><Button variant="outline" onClick={onDashboard} className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Button><Button variant="outline" onClick={onRetry} className="rounded-xl"><RotateCcw className="mr-2 h-4 w-4" /> Try again</Button><Button onClick={onNewQuiz} className="rounded-xl shadow-md shadow-primary/20"><Sparkles className="mr-2 h-4 w-4" /> Generate new quiz</Button></div>
    </div>
  );

}

function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof CheckCircle2; label: string; value: string | number; tone: 'success' | 'danger' | 'primary' | 'warning' }) {
  const styles = { success: 'bg-success/10 text-success', danger: 'bg-destructive/10 text-destructive', primary: 'bg-primary/10 text-primary', warning: 'bg-warning/10 text-warning' };
  return <Card><CardContent className="flex items-center gap-3 p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[tone]}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p></div></CardContent></Card>;
}

function DifficultyRow({ label, value }: { label: string; value: number }) {
  return <div className="space-y-1.5"><div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="text-muted-foreground">{value}%</span></div><Progress value={value} className="h-2" /></div>;
}

function WrongAnswer({ answer, index }: { answer: QuizResult['answers'][number]; index: number }) {
  return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-2xl border border-destructive/15 bg-destructive/[0.03] p-4"><p className="text-sm font-semibold leading-relaxed">{answer.question}</p><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div className="rounded-xl bg-destructive/10 p-3"><p className="text-xs font-semibold text-destructive">Your answer</p><p className="mt-1 font-medium">{answer.userAnswer}</p></div><div className="rounded-xl bg-success/10 p-3"><p className="text-xs font-semibold text-success">Correct answer</p><p className="mt-1 font-medium">{answer.correctAnswer}</p></div></div><div className="mt-3 flex items-start gap-2 rounded-xl bg-accent/50 p-3 text-sm"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p className="text-muted-foreground"><span className="font-semibold text-foreground">Explanation: </span>{answer.explanation}</p></div>{answer.source && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><FileText className="h-3.5 w-3.5" />{answer.source}</p>}</motion.div>;
}
