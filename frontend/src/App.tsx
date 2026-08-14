import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, LogOut, User } from 'lucide-react';
import type { View, QuizConfig, QuizQuestion, QuizResult } from '@/types';
import { generateQuiz } from '@/lib/quizEngine';
import { Dashboard } from '@/views/Dashboard';
import { Landing } from '@/views/Landing';
import { CreateQuiz } from '@/views/CreateQuiz';
import { QuizPlayer } from '@/views/QuizPlayer';
import { Results } from '@/views/Results';
import { AuthBackend } from '@/views/AuthBackend';
import { useAuthBackend } from '@/hooks/use-auth-backend';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function App() {
  const { user, loading, signOut } = useAuthBackend();
  const [view, setView] = useState<View>({ name: 'landing' });

  const goLanding = useCallback(() => setView({ name: 'landing' }), []);
  const goDashboard = useCallback(() => setView({ name: 'dashboard' }), []);
  const goCreate = useCallback(() => setView({ name: 'create' }), []);

  const startQuiz = useCallback((config: QuizConfig, questions: QuizQuestion[]) => {
    setView({ name: 'quiz', config, questions });
  }, []);

  const showResults = useCallback((result: QuizResult) => {
    setView({ name: 'results', result });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-mesh">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30"
        >
          <Brain className="h-7 w-7" />
        </motion.div>
      </div>
    );
  }

  // Not signed in: show landing or auth
  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={view.name === 'auth' ? 'auth' : 'landing'}
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.995 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {view.name === 'auth' ? (
            <AuthBackend onGoHome={goLanding} onAuthSuccess={goDashboard} user={user} />
          ) : (
            <Landing
              onGetStarted={() => setView({ name: 'auth' })}
              onExplore={() => setView({ name: 'auth' })}
              onSignIn={() => setView({ name: 'auth' })}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Signed in - always show dashboard by default unless user navigates elsewhere
  if (view.name === 'landing' || view.name === 'auth') {
    return <Dashboard onNewQuiz={goCreate} onStartQuiz={startQuiz} />;
  }

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={goDashboard} className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg font-extrabold tracking-tight">QuizGen</span>
              <span className="text-[10px] font-medium text-muted-foreground">AI Quiz Generator</span>
            </div>
          </button>
          <nav className="flex items-center gap-2">
            <button
              onClick={goDashboard}
              className={`rounded-lg px-2 py-2 text-xs sm:px-3 sm:text-sm font-medium transition-colors ${view.name === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dashboard
            </button>
            <button
              onClick={goCreate}
              className={`rounded-lg px-2 py-2 text-xs sm:px-3 sm:text-sm font-medium transition-colors ${view.name === 'create' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Create
            </button>

            <ThemeToggle className="h-9 rounded-full border-border/60 bg-background/80 px-3" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 p-0">
                  <User className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs sm:text-sm">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {view.name === 'dashboard' && <Dashboard onNewQuiz={goCreate} onStartQuiz={startQuiz} />}
            {view.name === 'create' && <CreateQuiz onGenerate={startQuiz} />}
            {view.name === 'quiz' && (
              <QuizPlayer
                config={view.config}
                questions={view.questions}
                onComplete={showResults}
                onExit={goDashboard}
              />
            )}
            {view.name === 'results' && (
              <Results
                result={view.result}
                onDashboard={goDashboard}
                onNewQuiz={goCreate}
                onRetry={() => {
                  const config = rebuildConfig(view.result);
                  startQuiz(config, generateQuiz(config));
                }}
                onRecommended={(config) => startQuiz(config, generateQuiz(config))}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/60 py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-[10px] sm:text-xs text-muted-foreground sm:px-6 lg:px-8">
          QuizGen — AI-powered quiz generation from topics and PDFs. Prototype uses realistic mock AI data.
        </div>
      </footer>
    </div>
  );
}

function rebuildConfig(result: QuizResult): QuizConfig {
  return {
    topic: result.topic,
    sourceType: result.sourceType,
    numQuestions: result.totalQuestions,
    difficulty: result.difficulty,
    questionType: result.questionType,
    timeLimit: 0,
    adaptiveDifficulty: false,
    showExplanations: true,
    randomizeQuestions: true,
    fileName: result.sourceType === 'pdf' ? result.topic : undefined,
  };
}

export default App;
