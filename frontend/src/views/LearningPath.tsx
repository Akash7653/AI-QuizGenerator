import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ArrowRight, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { recommendationAPI } from '@/lib/api';

interface LearningPathProps {
  userName?: string;
}

export function LearningPath({ userName }: LearningPathProps) {
  const { theme } = useThemeMode();
  const [steps, setSteps] = useState<Array<{ title: string; detail: string; status: 'done' | 'active' | 'upcoming' }>>([]);

  useEffect(() => {
    let mounted = true;

    const fetchLearningPath = async () => {
      try {
        const data = await recommendationAPI.getLearningPath();
        if (!mounted) return;

        const path = (data?.recommended_topics || []).slice(0, 3).map((item: any, index: number) => ({
          title: item.topic || item.title || `Topic ${index + 1}`,
          detail: item.reason || item.description || 'Recommended learning priority',
          status: index === 0 ? 'active' : 'upcoming',
        }));

        setSteps(path.length ? path : [
          { title: 'Core Concepts', detail: 'Review priority topics and revise weak areas', status: 'done' },
          { title: 'Practice Sets', detail: 'Attempt timed quizzes to validate progress', status: 'active' },
          { title: 'Applied Problems', detail: 'Solve real scenarios and reinforce learning', status: 'upcoming' },
        ]);
      } catch (error) {
        console.error('[LearningPath] Error loading learning path:', error);
        setSteps([
          { title: 'Core Concepts', detail: 'Review priority topics and revise weak areas', status: 'done' },
          { title: 'Practice Sets', detail: 'Attempt timed quizzes to validate progress', status: 'active' },
          { title: 'Applied Problems', detail: 'Solve real scenarios and reinforce learning', status: 'upcoming' },
        ]);
      }
    };

    fetchLearningPath();
    return () => { mounted = false; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className={`rounded-[30px] border p-6 shadow-[0_25px_80px_rgba(251,146,60,0.12)] backdrop-blur-xl ${theme === 'dark' ? 'border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30' : 'border-orange-200/60 bg-gradient-to-br from-white via-orange-50 to-amber-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>Career Growth</p>
        <h1 className={`mt-2 text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userName ? `${userName}'s Learning Path` : 'Learning Path'}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /> Current Focus</CardTitle>
            <CardDescription>Suggested roadmap for your next milestone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step.status === 'done' ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white' : step.status === 'active' ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {step.status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && <div className="mt-2 h-12 w-px bg-slate-300 dark:bg-slate-700" />}
                </div>

                <div className="flex-1 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-900/40">
                  <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange-500" /> Recommended Modules</CardTitle>
            <CardDescription>Curated learning resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Data Structures', 'Algorithms', 'Revision Notes', 'Mock Interviews'].map((item) => (
              <motion.div whileHover={{ x: 4 }} key={item} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{item}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </motion.div>
            ))}

            <Button className="mt-2 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">Continue Path</Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
