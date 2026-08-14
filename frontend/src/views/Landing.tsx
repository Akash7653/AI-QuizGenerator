import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Brain, Search, FileText, Sparkles, Zap, Target, TrendingUp,
  Lightbulb, BookOpen, Clock3, ArrowRight, CheckCircle2, BarChart3,
  ShieldCheck, Wand2, Layers, Type, Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Props {
  onGetStarted: () => void;
  onExplore: () => void;
  onSignIn: () => void;
}

const FEATURES = [
  { icon: Search, title: 'Topic Search', desc: 'Type any subject — from Physics to Machine Learning — and get a tailored quiz instantly.' },
  { icon: FileText, title: 'PDF Upload', desc: 'Drop in your notes or textbook. We extract the text and quiz you only on what’s inside.' },
  { icon: Type, title: 'Paste Text', desc: 'Have an article or study notes? Paste them in and generate questions in seconds.' },
  { icon: Link2, title: 'Article URL', desc: 'Share a link and we’ll turn the content into a structured quiz.' },
];

const FLOW = [
  { icon: Search, label: 'Enter topic or upload PDF', color: 'text-primary' },
  { icon: Wand2, label: 'AI generates questions', color: 'text-accent-foreground' },
  { icon: CheckCircle2, label: 'Validate & review', color: 'text-success' },
  { icon: Target, label: 'Take the quiz', color: 'text-warning' },
];

const STATS = [
  { icon: Zap, value: 'Instant', label: 'Quiz generation' },
  { icon: Layers, value: '4 Sources', label: 'Topic, PDF, text, URL' },
  { icon: BarChart3, value: 'Smart', label: 'Progress tracking' },
  { icon: Lightbulb, value: 'AI', label: 'Explanations' },
];

const TOPICS = ['Physics', 'Machine Learning', 'Python', 'Java', 'SQL', 'Mathematics', 'Cloud Computing', 'Data Structures'];

export function Landing({ onGetStarted, onExplore }: Props) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);

  return (
    <div className="overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg font-extrabold tracking-tight">QuizGen</span>
              <span className="text-[10px] font-medium text-muted-foreground">AI Quiz Generator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-10 rounded-full border-border/60 bg-background/80 px-3" />
            <Button onClick={onGetStarted} className="rounded-xl shadow-md shadow-primary/20">
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute left-1/4 top-40 h-[300px] w-[400px] rounded-full bg-accent/40 blur-3xl" />
          </motion.div>
          {['✨', '📚', '🧠', '🚀', '🎯', '🌟'].map((emoji, idx) => (
            <motion.span
              key={`landing-emoji-${emoji}-${idx}`}
              className="pointer-events-none absolute text-lg opacity-55"
              style={{ left: `${10 + idx * 14}%`, top: `${16 + (idx % 3) * 18}%` }}
              animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3 + idx * 0.35, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emoji}
            </motion.span>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered quiz generation
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Turn any topic or PDF into a{' '}
            <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              personalized quiz
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Upload your study materials or search a topic. QuizGen generates MCQs, true/false, and short-answer questions — with explanations and progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" onClick={onGetStarted} className="h-12 rounded-xl px-8 text-base shadow-xl shadow-primary/30">
              <Sparkles className="mr-2 h-5 w-5" /> Generate Your First Quiz
            </Button>
            <Button size="lg" variant="outline" onClick={onExplore} className="h-12 rounded-xl px-8 text-base">
              <BarChart3 className="mr-2 h-5 w-5" /> View Dashboard
            </Button>
          </motion.div>

          {/* Floating topic pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
          >
            {TOPICS.map((t, i) => (
              <motion.span
                key={t}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm"
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/40 bg-accent/20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <s.icon className="h-6 w-6 text-primary" />
              <span className="text-xl font-extrabold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Four ways to create a quiz</h2>
          <p className="mt-3 text-muted-foreground">Pick the source that fits your study flow. Every path ends with a polished, interactive quiz.</p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <Card className="h-full overflow-hidden border-border/60 transition-shadow hover:shadow-xl hover:shadow-primary/5">
                <CardContent className="flex flex-col items-start gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-accent/20 py-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From source to quiz in four simple steps.</p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center gap-3 text-center"
              >
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-lg shadow-primary/5">
                    <step.icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm font-medium">{step.label}</p>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-8 hidden h-5 w-5 text-muted-foreground/40 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz preview mock */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden border-primary/20 shadow-2xl shadow-primary/10">
            <div className="h-1.5 bg-primary" />
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Machine Learning · Medium</Badge>
                <span className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground"><Clock3 className="h-4 w-4" /> 08:42</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Question 3 of 10</p>
                <h3 className="mt-2 text-xl font-bold leading-relaxed">Which algorithm is best suited for classifying images into categories?</h3>
              </div>
              <div className="space-y-2.5">
                {['Linear Regression', 'Convolutional Neural Network', 'K-Means Clustering', 'Decision Tree'].map((opt, i) => (
                  <motion.div
                    key={opt}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`flex items-center gap-3 rounded-xl border p-4 ${i === 1 ? 'border-primary bg-primary/10' : 'border-border'}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                    {i === 1 && <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Personalized features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { icon: TrendingUp, title: 'Learning Progress', desc: 'Animated charts track your score trend, accuracy, and time spent across every quiz.' },
            { icon: Lightbulb, title: 'Weak Topic Detection', desc: 'QuizGen spots where you struggle and recommends a beginner-level practice quiz.' },
            { icon: ShieldCheck, title: 'AI Explanations', desc: 'Every wrong answer comes with a simple explanation and source reference from your PDF.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-background p-8 text-center sm:p-14"
        >
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <BookOpen className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to test your knowledge?</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Generate your first quiz in seconds. No sign-up required for the prototype.</p>
            <Button size="lg" onClick={onGetStarted} className="mt-6 h-12 rounded-xl px-8 text-base shadow-xl shadow-primary/30">
              <Sparkles className="mr-2 h-5 w-5" /> Start Learning Now
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          QuizGen — AI-powered quiz generation from topics and PDFs. Prototype uses realistic mock AI data.
        </div>
      </footer>
    </div>
  );
}
