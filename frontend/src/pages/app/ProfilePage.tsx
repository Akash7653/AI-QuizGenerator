import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User as UserIcon, Mail, Trophy, Flame, Target, Award,
  Camera, Edit3, Check, X, Zap, Star, Medal, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/common/Badge';
import { analyticsData } from '@/data/mockData';

const achievements = [
  { icon: Flame, title: 'On Fire', desc: '7-day streak', color: 'text-error-500', bg: 'bg-error-100 dark:bg-error-900/30', earned: true },
  { icon: Trophy, title: 'Quiz Master', desc: 'Completed 50 quizzes', color: 'text-warning-500', bg: 'bg-warning-100 dark:bg-warning-900/30', earned: true },
  { icon: Target, title: 'Sharp Shooter', desc: '90%+ accuracy', color: 'text-success-500', bg: 'bg-success-100 dark:bg-success-900/30', earned: true },
  { icon: Zap, title: 'Speed Demon', desc: 'Quiz under 5 min', color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-900/30', earned: true },
  { icon: Star, title: 'Perfect Score', desc: '100% on a quiz', color: 'text-accent-500', bg: 'bg-accent-100 dark:bg-accent-900/30', earned: true },
  { icon: Medal, title: 'Scholar', desc: 'Level 10 reached', color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-900/30', earned: false },
  { icon: TrendingUp, title: 'Improver', desc: 'Score improved 20%', color: 'text-success-500', bg: 'bg-success-100 dark:bg-success-900/30', earned: true },
  { icon: Award, title: 'Dedicated', desc: '30-day streak', color: 'text-error-500', bg: 'bg-error-100 dark:bg-error-900/30', earned: false },
];

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleSave = () => {
    updateUser({ name });
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Profile"
        subtitle="View and manage your account information"
        icon={<UserIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
      />

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-extrabold shadow-glow">
              {initials}
            </div>
            <button
              onClick={() => toast.info('Photo upload is not available in this demo')}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-ink-800 shadow-card flex items-center justify-center text-ink-600 dark:text-ink-300 hover:text-brand-600 transition-colors border border-ink-100 dark:border-ink-700"
              aria-label="Change photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-3">
                <input
                  className="input max-w-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Button size="sm" onClick={handleSave} leftIcon={<Check className="w-4 h-4" />}>
                    Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setEditing(false); setName(user?.name || ''); }} leftIcon={<X className="w-4 h-4" />}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-ink-900 dark:text-white">{user?.name}</h2>
                <p className="text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1.5 justify-center sm:justify-start mt-1">
                  <Mail className="w-4 h-4" /> {user?.email}
                </p>
                <div className="flex items-center gap-2 justify-center sm:justify-start mt-3">
                  <Badge variant="brand" icon={<Zap className="w-3 h-3" />}>Level {user?.level}</Badge>
                  <Badge variant="accent" icon={<Flame className="w-3 h-3" />}>{user?.streak} day streak</Badge>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 btn-outline px-4 py-2 text-sm"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Trophy} label="Quizzes Completed" value={user?.quizzesCompleted || 0} color="brand" delay={0} />
        <StatCard icon={Target} label="Average Score" value={`${user?.averageScore || 0}%`} color="success" delay={0.05} />
        <StatCard icon={Flame} label="Current Streak" value={`${user?.streak || 0}d`} color="error" delay={0.1} />
        <StatCard icon={Zap} label="Total XP" value={user?.xp || 0} color="warning" delay={0.15} />
      </div>

      {/* Achievements */}
      <div className="card p-6">
        <h3 className="font-bold text-ink-900 dark:text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl text-center border transition-all ${
                ach.earned
                  ? 'border-ink-200 dark:border-ink-700 hover:shadow-card'
                  : 'border-ink-100 dark:border-ink-800 opacity-40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${ach.bg}`}>
                <ach.icon className={`w-6 h-6 ${ach.color}`} />
              </div>
              <p className="text-sm font-bold text-ink-900 dark:text-white">{ach.title}</p>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{ach.desc}</p>
              {!ach.earned && <p className="text-xs text-ink-400 mt-1">Locked</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
