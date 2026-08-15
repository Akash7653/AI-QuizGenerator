import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, FileText, StickyNote, Type, Link2, Upload, Sparkles,
  CheckCircle2, ArrowRight, TrendingUp, Target, Zap, Trophy, BarChart3,
  Lightbulb, Layers, ShieldCheck, RefreshCw, BookOpen, Brain, Award,
  Smartphone, Monitor, Clock, Star, Moon, Sun,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/context/ThemeContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const inputSources = [
  { icon: FileText, label: 'PDF', color: 'text-error-500 bg-error-100 dark:bg-error-900/30' },
  { icon: StickyNote, label: 'Notes', color: 'text-warning-500 bg-warning-100 dark:bg-warning-900/30' },
  { icon: Type, label: 'Text', color: 'text-brand-500 bg-brand-100 dark:bg-brand-900/30' },
  { icon: BookOpen, label: 'Article', color: 'text-success-500 bg-success-100 dark:bg-success-900/30' },
  { icon: Link2, label: 'URL / Topic', color: 'text-accent-500 bg-accent-100 dark:bg-accent-900/30' },
];

const howItWorks = [
  { icon: Upload, title: 'Upload or enter content', desc: 'Paste text, upload a PDF, enter a topic, or share a URL.' },
  { icon: Brain, title: 'AI understands the content', desc: 'Our AI reads and comprehends the key concepts and themes.' },
  { icon: Sparkles, title: 'AI generates questions', desc: 'Contextually relevant questions are created from your material.' },
  { icon: ShieldCheck, title: 'Validate and take the quiz', desc: 'Questions are checked for quality, then you take the quiz.' },
  { icon: BarChart3, title: 'Analyze your performance', desc: 'Get detailed insights into strengths and weak areas.' },
  { icon: Lightbulb, title: 'Receive recommendations', desc: 'Personalized suggestions to improve your knowledge.' },
];

const quizModes = [
  {
    icon: BookOpen, title: 'Practice Mode', desc: 'No timer pressure. Get instant feedback and explanations after each question.',
    color: 'from-brand-500 to-brand-700', bg: 'bg-brand-50 dark:bg-brand-900/20',
  },
  {
    icon: Target, title: 'Exam Mode', desc: 'Simulate real exam conditions with a countdown timer and no immediate answers.',
    color: 'from-accent-500 to-accent-700', bg: 'bg-accent-50 dark:bg-accent-900/20',
  },
  {
    icon: Zap, title: 'Adaptive Mode', desc: 'Questions dynamically adjust difficulty based on your real-time performance.',
    color: 'from-success-500 to-success-700', bg: 'bg-success-50 dark:bg-success-900/20',
  },
  {
    icon: Trophy, title: 'Challenge Mode', desc: 'Gamified experience with XP, streaks, achievements, and leaderboards.',
    color: 'from-warning-500 to-warning-700', bg: 'bg-warning-50 dark:bg-warning-900/20',
  },
];

const features = [
  { icon: Sparkles, title: 'AI Question Generation', desc: 'Generate questions from any study material in seconds.' },
  { icon: Layers, title: 'Multiple Question Types', desc: 'MCQs, True/False, Short Answer, and Mixed formats.' },
  { icon: TrendingUp, title: 'Difficulty Control', desc: 'Choose Easy, Medium, Hard, or Adaptive difficulty.' },
  { icon: BookOpen, title: 'Source-Based Questions', desc: 'Every question references its source for context.' },
  { icon: RefreshCw, title: 'Duplicate Detection', desc: 'AI avoids repeating questions across quizzes.' },
  { icon: ShieldCheck, title: 'Answer Validation', desc: 'Built-in validation ensures question quality.' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track accuracy, progress, and topic mastery over time.' },
  { icon: Lightbulb, title: 'Personalized Recommendations', desc: 'AI suggests what to study next based on your performance.' },
  { icon: Monitor, title: 'Learning Dashboard', desc: 'A centralized view of all your quizzes and progress.' },
];

const perfData = [
  { date: 'Week 1', score: 55 }, { date: 'Week 2', score: 62 },
  { date: 'Week 3', score: 58 }, { date: 'Week 4', score: 70 },
  { date: 'Week 5', score: 75 }, { date: 'Week 6', score: 82 },
];

const topicData = [
  { topic: 'DSA', accuracy: 89 }, { topic: 'DBMS', accuracy: 67 },
  { topic: 'Graphs', accuracy: 54 }, { topic: 'OS', accuracy: 92 },
  { topic: 'Networks', accuracy: 88 }, { topic: 'Java', accuracy: 78 },
];

const distData = [
  { name: 'MCQ', value: 62, color: '#3b66f5' },
  { name: 'True/False', value: 18, color: '#f2741a' },
  { name: 'Short Answer', value: 20, color: '#1bb24a' },
];

export function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 overflow-x-hidden pb-16 lg:pb-0">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/30 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">How it works</a>
            <a href="#modes" className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Quiz Modes</a>
            <a href="#features" className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
            <a href="#analytics" className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
              className="btn-ghost w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0 flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login" className="btn-ghost px-2.5 py-2 text-xs sm:px-3 sm:py-2 sm:text-sm">Login</Link>
            <Link to="/register" className="btn-primary px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm whitespace-nowrap">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-14 pb-18 sm:pt-28 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-200/40 dark:bg-brand-900/20 blur-3xl" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-200/30 dark:bg-accent-900/15 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="inline-flex items-center gap-2 chip bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 mb-5 sm:mb-6 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Quiz Generation
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-900 dark:text-white leading-[1.05] text-balance">
              Turn your study material into <span className="text-brand-600 dark:text-brand-400">intelligent quizzes</span>.
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-600 dark:text-ink-400 max-w-xl">
              Upload PDFs, paste notes, or enter a topic — our AI generates personalized quizzes with multiple question types, adaptive difficulty, and detailed performance analytics.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link to="/register" className="btn-primary px-5 py-3 text-sm sm:text-base w-full sm:w-auto justify-center">
                Start for Free <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <a href="#how" className="btn-outline px-5 py-3 text-sm sm:text-base w-full sm:w-auto justify-center">
                See How It Works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success-500" /> Free forever plan</span>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="card p-6 shadow-card-hover rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-900 dark:text-white">AI Quiz Preview</p>
                    <p className="text-xs text-ink-500">Data Structures & Algorithms</p>
                  </div>
                </div>
                <span className="chip bg-warning-100 dark:bg-warning-900/40 text-warning-700 dark:text-warning-300">Medium</span>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Which data structure uses LIFO ordering?</p>
                {['Queue', 'Stack', 'Linked List', 'Binary Tree'].map((opt, i) => (
                  <div
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      i === 1
                        ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
                        : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 1 ? 'bg-success-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-sm text-ink-700 dark:text-ink-200">{opt}</span>
                    {i === 1 && <CheckCircle2 className="w-4 h-4 text-success-500 ml-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
                <span>Question 1 of 10</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 14:32</span>
              </div>
            </div>
            {/* Floating accent card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 card p-4 shadow-glow hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-xs text-ink-500">Accuracy improved</p>
                  <p className="text-lg font-bold text-success-600 dark:text-success-400">+27%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Input Sources */}
      <section className="py-12 border-y border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-ink-500 dark:text-ink-400 mb-6 uppercase tracking-wider">Supported Input Sources</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {inputSources.map((src) => (
              <div key={src.label} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${src.color}`}>
                  <src.icon className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{src.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white text-balance">How It Works</h2>
            <p className="mt-4 text-lg text-ink-600 dark:text-ink-400">From study material to personalized quiz in six simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 relative group hover:shadow-card-hover transition-shadow"
              >
                <div className="absolute top-4 right-4 text-5xl font-extrabold text-ink-100 dark:text-ink-800/50 select-none">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <step.icon className="w-6 h-6 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-ink-600 dark:text-ink-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Modes */}
      <section id="modes" className="py-20 sm:py-28 bg-ink-50/50 dark:bg-ink-900/30 border-y border-ink-100 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white text-balance">Four Quiz Modes for Every Goal</h2>
            <p className="mt-4 text-lg text-ink-600 dark:text-ink-400">Whether you're practicing casually or simulating an exam, there's a mode for you.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quizModes.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-6 ${mode.bg} border-transparent hover:shadow-card-hover transition-all hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <mode.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-2">{mode.title}</h3>
                <p className="text-sm text-ink-600 dark:text-ink-400">{mode.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white text-balance">Everything you need to learn smarter</h2>
            <p className="mt-4 text-lg text-ink-600 dark:text-ink-400">A complete toolkit for AI-powered quiz generation and performance tracking.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="card p-6 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                    <feat.icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink-900 dark:text-white mb-1">{feat.title}</h3>
                    <p className="text-sm text-ink-600 dark:text-ink-400">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="analytics" className="py-20 sm:py-28 bg-ink-50/50 dark:bg-ink-900/30 border-y border-ink-100 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white text-balance">Analytics that actually help</h2>
            <p className="mt-4 text-lg text-ink-600 dark:text-ink-400">Visualize your progress, identify weak topics, and track improvement over time.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-ink-900 dark:text-white">Performance Over Time</h3>
                <span className="chip bg-success-100 dark:bg-success-900/40 text-success-700 dark:text-success-300">
                  <TrendingUp className="w-3 h-3" /> +27%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b66f5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b66f5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke="#3b66f5" strokeWidth={2} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-ink-900 dark:text-white mb-4">Question Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={distData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {distData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {distData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-600 dark:text-ink-400">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-ink-900 dark:text-ink-100">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6 lg:col-span-3">
              <h3 className="font-bold text-ink-900 dark:text-white mb-4">Accuracy by Topic</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topicData}>
                  <XAxis dataKey="topic" tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9aa4c0' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} cursor={{ fill: 'rgba(59,102,245,0.05)' }} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {topicData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.accuracy >= 80 ? '#1bb24a' : entry.accuracy >= 60 ? '#f2741a' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent-500 blur-3xl" />
            </div>
            <div className="relative z-10">
              <Star className="w-10 h-10 text-brand-300 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">Ready to test what you know?</h2>
              <p className="mt-4 text-lg text-brand-200 max-w-xl mx-auto">
                Create your first AI-powered quiz in under a minute. No credit card, no setup — just better studying.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center w-full">
                <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-sm sm:text-base font-bold shadow-lg active:scale-[0.98] w-full sm:w-auto justify-center">
                  Create Your First Quiz <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <a href="#features" className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20 px-6 py-3 text-sm sm:text-base w-full sm:w-auto justify-center">
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 dark:border-ink-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-ink-500 dark:text-ink-400">&copy; 2025 QuizGen — AI Quiz Generator. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1"><Smartphone className="w-4 h-4" /> Mobile</span>
              <span className="flex items-center gap-1"><Monitor className="w-4 h-4" /> Desktop</span>
              <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Dark Mode</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
