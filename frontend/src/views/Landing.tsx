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

const TOPICS = [
  'Physics', 'Machine Learning', 'Python', 'Java', 'SQL', 'Mathematics', 'Cloud Computing',
  'Data Structures', 'Cybersecurity', 'Generative AI', 'Prompt Engineering', 'React',
  'DevOps', 'Product Management', 'UX Design', 'Business Analytics'
];

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
        className="sticky top-0 z-40 border-b border-border/40 bg-background/75 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 sm:h-9 sm:w-9">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-base font-extrabold tracking-tight sm:text-lg">QuizGen</span>
              <span className="text-[9px] font-medium text-muted-foreground sm:text-[10px]">AI Quiz Generator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-9 rounded-full border-border/60 bg-background/80 px-2 sm:h-10 sm:px-3" />
            <Button onClick={onGetStarted} className="hidden rounded-xl shadow-md shadow-primary/20 sm:inline-flex">
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative px-3 pb-12 pt-4 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-border/60 bg-background/70 p-4 shadow-[0_24px_80px_rgba(59,130,246,0.10)] backdrop-blur-xl sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 -z-10"
          >
            <div className="absolute left-1/2 top-0 h-[320px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[500px] sm:w-[700px]" />
            <div className="absolute left-1/4 top-20 h-[180px] w-[220px] rounded-full bg-accent/40 blur-3xl sm:h-[300px] sm:w-[400px]" />
          </motion.div>

          <div className="flex flex-col gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex justify-center"
            >
              <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold sm:px-4 sm:text-sm">
                <Sparkles className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" /> AI-powered quiz generation
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
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
              className="mx-auto max-w-xl text-center text-sm text-muted-foreground sm:text-base md:text-lg"
            >
              Upload your study materials or search a topic. QuizGen generates MCQs, true/false, and short-answer questions — with explanations and progress tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button size="lg" onClick={onGetStarted} className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 text-sm font-bold shadow-xl shadow-primary/40 sm:h-12 sm:w-auto sm:text-base">
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Your First Quiz
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" onClick={onExplore} className="h-11 w-full rounded-xl border-2 px-6 text-sm font-semibold sm:h-12 sm:w-auto sm:text-base">
                  <BarChart3 className="mr-2 h-4 w-4" /> View Dashboard
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            >
              {TOPICS.map((t, i) => (
                <motion.button
                  key={t}
                  onClick={() => {}}
                  animate={{ y: [0, -6, 0], scale: [1, 1.01, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full border border-primary/15 bg-gradient-to-r from-primary/8 to-accent/8 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/40 sm:px-4 sm:text-xs"
                >
                  {t}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/40 bg-accent/20 overflow-x-auto">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:gap-4 px-3 py-6 sm:py-8 sm:grid-cols-4 sm:px-6 lg:px-8 min-w-max sm:min-w-full">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-base sm:text-xl font-extrabold">{s.value}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-3 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Four ways to create a quiz</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground px-2">Pick the source that fits your study flow. Every path ends with a polished, interactive quiz.</p>
        </motion.div>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <CardContent className="flex flex-col items-start gap-3 sm:gap-4 p-4 sm:p-6">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">{f.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-accent/20 py-12 sm:py-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">How it works</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground px-2">From source to quiz in four simple steps.</p>
          </motion.div>

          <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center gap-2 sm:gap-3 text-center"
              >
                <div className="relative">
                  <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-background shadow-lg shadow-primary/5">
                    <step.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${step.color}`} />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium px-1">{step.label}</p>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-7 hidden h-5 w-5 text-muted-foreground/40 lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz preview mock */}
      <section className="mx-auto max-w-4xl px-3 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden border-primary/20 shadow-2xl shadow-primary/10">
            <div className="h-1 sm:h-1.5 bg-primary" />
            <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <Badge variant="secondary" className="text-xs sm:text-sm">Machine Learning · Medium</Badge>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-muted-foreground"><Clock3 className="h-3 w-3 sm:h-4 sm:w-4" /> 08:42</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Question 3 of 10</p>
                <h3 className="mt-2 text-base sm:text-xl font-bold leading-relaxed">Which algorithm is best suited for classifying images into categories?</h3>
              </div>
              <div className="space-y-2">
                {['Linear Regression', 'Convolutional Neural Network', 'K-Means Clustering', 'Decision Tree'].map((opt, i) => (
                  <motion.div
                    key={opt}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border p-3 sm:p-4 text-sm ${i === 1 ? 'border-primary bg-primary/10' : 'border-border'}`}
                  >
                    <span className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-xs sm:text-sm font-semibold shrink-0 ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{opt}</span>
                    {i === 1 && <CheckCircle2 className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Personalized features */}
      <section className="mx-auto max-w-7xl px-3 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="mx-auto max-w-7xl px-3 pb-16 sm:pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-background p-6 text-center sm:p-10 md:p-14"
        >
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">Ready to test your knowledge?</h2>
            <p className="mx-auto mt-2 text-xs sm:mt-3 sm:text-sm max-w-lg text-muted-foreground px-1">Generate your first quiz in seconds. No sign-up required for the prototype.</p>
            <Button size="lg" onClick={onGetStarted} className="mt-4 sm:mt-6 h-11 sm:h-12 rounded-xl px-6 sm:px-8 text-sm sm:text-base shadow-xl shadow-primary/30">
              <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Start Learning Now
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-3 text-center text-[11px] sm:text-xs text-muted-foreground sm:px-6 lg:px-8">
          QuizGen — AI-powered quiz generation from topics and PDFs. Prototype uses realistic mock AI data.
        </div>
      </footer>
    </div>
  );
}
