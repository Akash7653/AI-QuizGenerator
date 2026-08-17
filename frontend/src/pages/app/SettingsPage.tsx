import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, User as UserIcon, Sliders, Bell,
  Palette, Check, Mail, Lock, Sun, Moon, Monitor,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import type { Difficulty, QuestionType } from '@/types';

const sections = [
  { id: 'account', label: 'Account', icon: UserIcon },
  { id: 'preferences', label: 'Quiz Preferences', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'adaptive'];
const questionTypes: QuestionType[] = ['mcq', 'truefalse', 'shortanswer', 'mixed'];
const themes = [
  { id: 'light' as const, label: 'Light', icon: Sun },
  { id: 'dark' as const, label: 'Dark', icon: Moon },
  { id: 'system' as const, label: 'System', icon: Monitor },
];

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [prefs, setPrefs] = useState(user?.preferences || {
    defaultDifficulty: 'medium' as Difficulty,
    defaultQuestionCount: 10,
    defaultQuestionType: 'mcq' as QuestionType,
    notifications: { quizReminders: true, performanceReports: true, recommendations: true },
  });

  const handleSaveAccount = () => {
    updateUser({ name, email });
    toast.success('Account settings saved');
  };

  const handleSavePrefs = () => {
    updateUser({ preferences: prefs });
    toast.success('Quiz preferences saved');
  };

  const handleSaveNotifs = (key: keyof typeof prefs.notifications) => {
    const updated = { ...prefs, notifications: { ...prefs.notifications, [key]: !prefs.notifications[key] } };
    setPrefs(updated);
    updateUser({ preferences: updated });
    toast.success('Notification preferences saved');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        icon={<SettingsIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Section nav */}
        <div className="card p-3 lg:sticky lg:top-20 h-fit">
          <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 ${
                  activeSection === s.id
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'account' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-6">
              <h3 className="font-bold text-ink-900 dark:text-white mb-5">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input type="password" className="input pl-10" defaultValue="••••••••" disabled />
                  </div>
                  <button
                    onClick={() => toast.info('Password change is not available in this demo')}
                    className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1.5 hover:underline"
                  >
                    Change password
                  </button>
                </div>
                <Button onClick={handleSaveAccount} leftIcon={<Check className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}

          {activeSection === 'preferences' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-6">
              <h3 className="font-bold text-ink-900 dark:text-white mb-5">Quiz Preferences</h3>
              <div className="space-y-5">
                <div>
                  <label className="label">Default Difficulty</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {difficulties.map((d) => (
                      <button
                        key={d}
                        onClick={() => setPrefs({ ...prefs, defaultDifficulty: d })}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border capitalize transition-all ${
                          prefs.defaultDifficulty === d
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                            : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-brand-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Default Question Count: <span className="text-brand-600 font-bold">{prefs.defaultQuestionCount}</span></label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="5"
                    value={prefs.defaultQuestionCount}
                    onChange={(e) => setPrefs({ ...prefs, defaultQuestionCount: parseInt(e.target.value) })}
                    className="w-full accent-brand-600"
                  />
                </div>
                <div>
                  <label className="label">Default Question Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {questionTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setPrefs({ ...prefs, defaultQuestionType: t })}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          prefs.defaultQuestionType === t
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                            : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-brand-300'
                        }`}
                      >
                        {t === 'mcq' ? 'MCQ' : t === 'truefalse' ? 'True/False' : t === 'shortanswer' ? 'Short Answer' : 'Mixed'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSavePrefs} leftIcon={<Check className="w-4 h-4" />}>
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-6">
              <h3 className="font-bold text-ink-900 dark:text-white mb-5">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { key: 'quizReminders' as const, label: 'Quiz Reminders', desc: 'Get reminded to practice daily' },
                  { key: 'performanceReports' as const, label: 'Performance Reports', desc: 'Weekly summary of your progress' },
                  { key: 'recommendations' as const, label: 'Recommendations', desc: 'AI-powered study suggestions' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{item.label}</p>
                      <p className="text-xs text-ink-500 dark:text-ink-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleSaveNotifs(item.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3 ${
                        prefs.notifications[item.key] ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: prefs.notifications[item.key] ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-4 sm:p-6">
              <h3 className="font-bold text-ink-900 dark:text-white mb-5">Appearance</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">Choose how QuizGen looks to you.</p>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); toast.success(`Theme set to ${t.label}`); }}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      theme === t.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                        : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'
                    }`}
                  >
                    <t.icon className={`w-6 h-6 mx-auto mb-2 ${theme === t.id ? 'text-brand-600 dark:text-brand-400' : 'text-ink-500'}`} />
                    <p className={`text-sm font-medium ${theme === t.id ? 'text-brand-700 dark:text-brand-300' : 'text-ink-600 dark:text-ink-400'}`}>
                      {t.label}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
