import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { analyticsAPI } from '@/lib/api';

interface AnalyticsProps {
  userName?: string;
}

export function Analytics({ userName }: AnalyticsProps) {
  const { theme } = useThemeMode();
  const [stats, setStats] = useState({
    overallAccuracy: 0,
    improvement: 0,
    streak: 0,
    topScore: 0,
    topicPerformance: [] as Array<{ topic: string; value: number }>,
  });

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      try {
        const data = await analyticsAPI.getDashboard();
        if (!mounted) return;

        const topicMap = data?.topic_performance && typeof data.topic_performance === 'object'
          ? Object.entries(data.topic_performance).map(([topic, value]: [string, any]) => ({
              topic,
              value: Number(value?.accuracy ?? value?.value ?? 0),
            }))
          : [];

        setStats({
          overallAccuracy: Number(data?.overall_accuracy ?? 0),
          improvement: Number(data?.average_score ?? data?.completion_rate ?? 0),
          streak: 0,
          topScore: Number(data?.overall_accuracy ?? 0),
          topicPerformance: topicMap.length ? topicMap : [
            { topic: 'General', value: 0 },
          ],
        });
      } catch (error) {
        console.error('[Analytics] Error loading analytics:', error);
      }
    };

    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className={`rounded-[30px] border p-6 shadow-[0_25px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl ${theme === 'dark' ? 'border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30' : 'border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50 to-teal-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>Performance</p>
        <h1 className={`mt-2 text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userName ? `${userName}'s Analytics` : 'Analytics Dashboard'}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Accuracy', value: `${Math.round(stats.overallAccuracy)}%`, icon: Target },
          { label: 'Improvement', value: `${stats.improvement > 0 ? '+' : ''}${Math.round(stats.improvement)}%`, icon: TrendingUp },
          { label: 'Streak', value: `${stats.streak} days`, icon: Sparkles },
          { label: 'Top Score', value: `${Math.round(stats.topScore)}%`, icon: Award },
        ].map((item) => (
          <Card key={item.label} className={`overflow-hidden ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/80' : 'border-slate-200/80 bg-white/80'}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</p>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-500" /> Topic Performance</CardTitle>
            <CardDescription>Subject-wise success rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topicPerformance.map((item) => (
              <div key={item.topic} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{item.topic}</span>
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Learning Momentum</CardTitle>
            <CardDescription>Weekly growth trend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[65, 72, 78, 81, 86, 90].map((value, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-14 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>W{index + 1}</div>
                <div className="flex-1">
                  <div className="h-2.5 rounded-full bg-slate-200/70 dark:bg-slate-800">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.6, delay: index * 0.08 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                  </div>
                </div>
                <div className={`w-12 text-right text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{value}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
