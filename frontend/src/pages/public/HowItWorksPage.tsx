import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, FileText, Lightbulb, ShieldCheck, Sparkles, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Upload,
    title: 'Upload or enter content',
    description: 'Drop in a PDF, paste notes, enter a topic, or share a URL to start generating your quiz.',
  },
  {
    icon: Brain,
    title: 'AI reads the material',
    description: 'The app understands key concepts, themes, and difficulty patterns from your content.',
  },
  {
    icon: Sparkles,
    title: 'Questions are generated',
    description: 'QuizGen builds relevant question sets with multiple formats and controlled difficulty.',
  },
  {
    icon: BookOpen,
    title: 'Take the quiz',
    description: 'Answer questions in practice, exam, adaptive, or challenge mode with real-time tracking.',
  },
  {
    icon: ShieldCheck,
    title: 'Review and validate',
    description: 'Check explanations, review answers, and understand where to improve next.',
  },
  {
    icon: Lightbulb,
    title: 'Get personalized guidance',
    description: 'See weak topics, recommendations, and analytics to keep improving every day.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-ink-900 dark:bg-ink-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            How it works
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">Turn study content into smarter practice.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-600 dark:text-ink-400 sm:text-lg">
            Follow a simple learning loop: add material, generate a quiz, answer, review, and improve with AI-powered insights.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900"
            >
              <div className="absolute right-4 top-4 text-5xl font-black text-ink-200 dark:text-ink-800">
                {index + 1}
              </div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                <step.icon className="h-5 w-5" />
              </div>
              <h2 className="relative z-10 mb-2 text-lg font-bold">{step.title}</h2>
              <p className="relative z-10 text-sm leading-6 text-ink-600 dark:text-ink-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-100">Ready to begin?</p>
              <h3 className="mt-2 text-2xl font-bold">Create your next personalized quiz.</h3>
            </div>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
