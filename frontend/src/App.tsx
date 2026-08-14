import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, LogOut, Settings as SettingsIcon } from 'lucide-react';
import type { View, QuizConfig, QuizQuestion, QuizResult } from '@/types';
import { generateQuiz } from '@/lib/quizEngine';
import { Dashboard } from '@/views/Dashboard';
import { Landing } from '@/views/Landing';
import { CreateQuiz } from '@/views/CreateQuiz';
import { LearningPath } from '@/views/LearningPath';
import { Recommendations } from '@/views/Recommendations';
import { QuizPlayer } from '@/views/QuizPlayer';
import { Results } from '@/views/Results';
import { AuthBackend } from '@/views/AuthBackend';
import { Settings as SettingsView } from '@/views/Settings';
import { useAuthBackend } from '@/hooks/use-auth-backend';
import { Sidebar } from '@/components/sidebar';
import { Chatbot } from '@/components/chatbot';
import { pageVariants } from '@/components/page-transition';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useThemeMode } from '@/hooks/use-theme-mode';

function App() {
  const { user, loading, signOut } = useAuthBackend();
  const { theme } = useThemeMode();
  const [view, setView] = useState<View>({ name: 'landing' });
  const [routeLoading, setRouteLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const changeView = useCallback((nextView: View) => {
    setRouteLoading(true);
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => setRouteLoading(false), 260);
  }, []);

  const goLanding = useCallback(() => changeView({ name: 'landing' }), [changeView]);
  const goDashboard = useCallback(() => changeView({ name: 'dashboard' }), [changeView]);
  const goCreate = useCallback(() => changeView({ name: 'create' }), [changeView]);
  const goLearning = useCallback(() => changeView({ name: 'learning' }), [changeView]);
  const goRecommendations = useCallback(() => changeView({ name: 'recommendations' }), [changeView]);
  const goSettings = useCallback(() => changeView({ name: 'settings' }), [changeView]);

  const startQuiz = useCallback((config: QuizConfig, questions: QuizQuestion[]) => {
    changeView({ name: 'quiz', config, questions });
  }, [changeView]);

  const showResults = useCallback((result: QuizResult) => {
    changeView({ name: 'results', result });
  }, [changeView]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view.name]);

  useEffect(() => {
    if (user && (view.name === 'landing' || view.name === 'auth')) {
      setView({ name: 'dashboard' });
    }
  }, [user, view.name]);

  const handleLogout = useCallback(() => {
    signOut();
    goLanding();
  }, [signOut, goLanding]);

  const isFullScreenView = view.name === 'quiz' || view.name === 'results';
  const isChatbotVisible = user && view.name !== 'quiz' && view.name !== 'results' && view.name !== 'create';

  const goAuth = useCallback(() => {
    setRouteLoading(true);
    window.setTimeout(() => {
      setView({ name: 'auth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setRouteLoading(false), 220);
    }, 160);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl shadow-purple-500/30"
            animate={{ boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="h-8 w-8" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-center ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
          >
            <p className="text-lg font-semibold">Loading QuizGen</p>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Preparing your learning journey...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Not signed in: show landing or auth
  if (!user) {
    return (
      <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-white via-blue-50 to-white'}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/15'}`}
            animate={{
              y: [0, 50, 0],
              x: [0, -50, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-400/15'}`}
            animate={{
              y: [0, -50, 0],
              x: [0, 50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute top-1/2 right-0 w-72 h-72 rounded-full blur-3xl ${theme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-400/10'}`}
            animate={{
              y: [0, 30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view.name === 'auth' ? 'auth' : 'landing'}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-0"
          >
            {view.name === 'auth' ? (
              <AuthBackend onGoHome={goLanding} onAuthSuccess={goDashboard} user={user} />
            ) : (
              <Landing
                onGetStarted={goAuth}
                onExplore={goAuth}
                onSignIn={goAuth}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {routeLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                className="flex flex-col items-center gap-4 rounded-[28px] border border-white/20 bg-white/60 px-6 py-5 shadow-[0_30px_70px_rgba(59,130,246,0.18)] dark:bg-slate-900/70"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/30"
                >
                  <Brain className="h-6 w-6" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Opening your workspace</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">Preparing the next step…</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Signed in - render main app layout with sidebar
  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-white via-blue-50 to-slate-50'}`}>
      {!isFullScreenView && (
        <Sidebar
          onDashboard={goDashboard}
          onCreate={goCreate}
          onLogout={handleLogout}
          onLearning={goLearning}
          onRecommendations={goRecommendations}
          onSettings={goSettings}
          currentView={view.name}
          userEmail={user.email}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
      )}

      <main
        className="flex-1 pb-24 transition-all duration-300 lg:pb-0"
        style={isFullScreenView ? undefined : { marginLeft: isMobile ? 0 : sidebarCollapsed ? 96 : 320 }}
      >
        {!isFullScreenView && (
          <div className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme === 'dark' ? 'border-slate-700/50 bg-slate-900/80' : 'border-slate-200/50 bg-white/80'}`}>
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <motion.button
                onClick={goDashboard}
                className="flex items-center gap-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start leading-none hidden sm:flex">
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>QuizGen</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>AI Quiz Generator</span>
                </div>
              </motion.button>

              <div className="flex items-center gap-2">
                {isMobile && (
                  <>
                    <button
                      type="button"
                      onClick={goSettings}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50 text-slate-200' : 'border-slate-300 bg-white/50 text-slate-700'}`}
                      aria-label="Open settings"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                      aria-label="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </>
                )}
                <ThemeToggle className={`h-9 rounded-full px-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-white/50'}`} />
              </div>
            </div>
          </div>
        )}

        <div className={isFullScreenView ? 'w-full' : 'px-4 py-6 sm:px-6 lg:px-8'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={view.name}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {view.name === 'dashboard' && <Dashboard onNewQuiz={goCreate} onStartQuiz={startQuiz} />}
              {view.name === 'learning' && <LearningPath userName={user?.username} />}
              {view.name === 'recommendations' && <Recommendations userName={user?.username} />}
              {view.name === 'settings' && <SettingsView user={user} onBack={goDashboard} />}
              {view.name === 'create' && <CreateQuiz userName={user?.username} onGenerate={startQuiz} />}
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
        </div>

        {!isFullScreenView && (
          <footer className={`border-t py-6 text-center text-xs mt-8 ${theme === 'dark' ? 'border-slate-700/50 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              QuizGen — AI-powered quiz generation from topics and PDFs
            </motion.div>
          </footer>
        )}
      </main>

      {/* Chatbot Widget */}
      {isChatbotVisible && <Chatbot />}
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
