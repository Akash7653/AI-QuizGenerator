import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lightbulb, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { recommendationAPI } from '@/lib/api';

interface RecommendationsProps {
  userName?: string;
}

export function Recommendations({ userName }: RecommendationsProps) {
  const { theme } = useThemeMode();
  const [cards, setCards] = useState<Array<{ title: string; text: string; accent: string }>>([]);

  useEffect(() => {
    let mounted = true;

    const fetchRecommendations = async () => {
      try {
        const data = await recommendationAPI.getRecommendations();
        if (!mounted) return;

        const mapped = (data || []).slice(0, 3).map((item: any, index: number) => ({
          title: item.title || 'Recommendation',
          text: item.description || 'Continue your learning streak with a focused review.',
          accent: index === 0 ? 'from-pink-500 to-rose-500' : index === 1 ? 'from-violet-500 to-purple-500' : 'from-cyan-500 to-blue-500',
        }));

        setCards(mapped.length ? mapped : [
          { title: 'Practice Weak Topic', text: 'Continue building confidence in your weakest subject with a focused quiz.', accent: 'from-pink-500 to-rose-500' },
          { title: 'Revision Reminder', text: 'A quick recap will sharpen recall and improve retention.', accent: 'from-violet-500 to-purple-500' },
          { title: 'Growth Tip', text: 'Your consistency is improving—keep the streak alive with a quick quiz.', accent: 'from-cyan-500 to-blue-500' },
        ]);
      } catch (error) {
        console.error('[Recommendations] Error loading recommendations:', error);
        setCards([
          { title: 'Practice Weak Topic', text: 'Continue building confidence in your weakest subject with a focused quiz.', accent: 'from-pink-500 to-rose-500' },
          { title: 'Revision Reminder', text: 'A quick recap will sharpen recall and improve retention.', accent: 'from-violet-500 to-purple-500' },
          { title: 'Growth Tip', text: 'Your consistency is improving—keep the streak alive with a quick quiz.', accent: 'from-cyan-500 to-blue-500' },
        ]);
      }
    };

    fetchRecommendations();
    return () => { mounted = false; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className={`rounded-[30px] border p-6 shadow-[0_25px_80px_rgba(236,72,153,0.12)] backdrop-blur-xl ${theme === 'dark' ? 'border-pink-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/30' : 'border-pink-200/60 bg-gradient-to-br from-white via-pink-50 to-rose-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}`}>Smart Guidance</p>
        <h1 className={`mt-2 text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userName ? `${userName}'s Recommendations` : 'Recommendations'}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div key={card.title} whileHover={{ y: -6 }} transition={{ duration: 0.2 }} className={`rounded-[28px] border p-5 ${theme === 'dark' ? 'border-slate-700/60 bg-slate-900/80' : 'border-slate-200/70 bg-white/80'}`}>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white`}>
              {index === 0 ? <Lightbulb className="h-5 w-5" /> : index === 1 ? <Bell className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </div>
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{card.title}</h3>
            <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{card.text}</p>
            <Button variant="ghost" className="mt-4 rounded-xl px-0 text-pink-500 hover:text-pink-600">Take action <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
