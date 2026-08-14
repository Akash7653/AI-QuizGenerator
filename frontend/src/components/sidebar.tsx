import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, LayoutDashboard, PlusSquare, Settings, LogOut,
  BookOpen, BarChart3, Lightbulb, Menu, X, Home, User, PanelLeftClose,
  PanelLeftOpen, FileText, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/hooks/use-theme-mode';

interface SidebarProps {
  onDashboard: () => void;
  onCreate: () => void;
  onLogout: () => void;
  onDocuments?: () => void;
  onAnalytics?: () => void;
  onLearning?: () => void;
  onRecommendations?: () => void;
  onSettings?: () => void;
  currentView: string;
  userEmail?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ onDashboard, onCreate, onLogout, onDocuments, onAnalytics, onLearning, onRecommendations, onSettings, currentView, userEmail, isCollapsed: controlledCollapsed, onToggleCollapse }: SidebarProps) {
  const { theme } = useThemeMode();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const toggleCollapse = () => {
    const next = !isCollapsed;
    if (onToggleCollapse) onToggleCollapse(next);
    else setInternalCollapsed(next);
  };

  // Handle responsive sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = useMemo(() => [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      id: 'dashboard',
      color: 'from-blue-500 to-blue-600',
      onClick: onDashboard,
      description: 'Overview'
    },
    {
      icon: PlusSquare,
      label: 'Create Quiz',
      id: 'create',
      color: 'from-purple-500 to-purple-600',
      onClick: onCreate,
      description: 'Generate quiz'
    },
    {
      icon: FileText,
      label: 'Documents',
      id: 'documents',
      color: 'from-cyan-500 to-sky-600',
      onClick: onDocuments ?? onDashboard,
      description: 'Uploaded sources'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      id: 'analytics',
      color: 'from-emerald-500 to-green-600',
      onClick: onAnalytics ?? onDashboard,
      description: 'Performance stats'
    },
    {
      icon: BookOpen,
      label: 'Learning Path',
      id: 'learning',
      color: 'from-orange-500 to-amber-600',
      onClick: onLearning ?? onDashboard,
      description: 'Recommended study'
    },
    {
      icon: Sparkles,
      label: 'Recommendations',
      id: 'recommendations',
      color: 'from-pink-500 to-rose-600',
      onClick: onRecommendations ?? onDashboard,
      description: 'Smart suggestions'
    },
  ], [onAnalytics, onCreate, onDashboard, onDocuments, onLearning, onRecommendations]);

  const containerVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' as const }
    },
    exit: {
      x: -300,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' as const }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (custom: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: custom * 0.08, duration: 0.3 }
    }),
    hover: { x: 8, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-5 z-50 lg:hidden p-3 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ${isOpen ? 'hidden' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      <motion.nav
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-2 rounded-[26px] border border-white/10 bg-slate-900/80 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:hidden dark:bg-slate-950/90"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[10px] font-semibold transition-all duration-200',
                active
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              <span className="leading-none">{item.label === 'Create Quiz' ? 'Create' : item.label}</span>
            </motion.button>
          );
        })}
      </motion.nav>

      {!isMobile && (
        <div className="hidden lg:block" />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r backdrop-blur-xl transition-all duration-300',
              isCollapsed ? 'w-24' : 'w-80',
              theme === 'dark' ? 'border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'border-slate-200/50 bg-gradient-to-br from-white via-blue-50 to-slate-50'
            )}
          >
            {/* Background Animation Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className={`absolute top-0 left-0 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-blue-500/5' : 'bg-blue-400/10'}`}
                animate={{
                  y: [0, 30, 0],
                  x: [0, -30, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className={`absolute bottom-0 right-0 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-purple-500/5' : 'bg-purple-400/10'}`}
                animate={{
                  y: [0, -30, 0],
                  x: [0, 30, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Header */}
            <motion.div
              className={`relative pt-8 pb-6 px-6 border-b ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={cn('relative mb-4 flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/30 ring-1 ring-white/10"
                  whileHover={{ scale: 1.04, rotate: 4 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Brain className="h-5 w-5 text-white" />
                </motion.div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h2 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>QuizGen</h2>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>AI Quiz Generator</p>
                  </div>
                )}

                <motion.button
                  onClick={toggleCollapse}
                  className={cn(
                    'rounded-xl border border-white/10 bg-white/10 p-2 transition-colors',
                    theme === 'dark' ? 'text-slate-200 hover:bg-slate-700/60' : 'text-slate-700 hover:bg-slate-100',
                    isCollapsed ? 'absolute right-[-10px] top-1/2 -translate-y-1/2' : 'ml-auto'
                  )}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </motion.button>
              </div>

              {!isCollapsed && userEmail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {userEmail}
                </motion.div>
              )}
            </motion.div>

            {/* Navigation */}
            <nav className="relative flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-2">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      custom={idx}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      onClick={() => {
                        item.onClick();
                        if (isMobile) setIsOpen(false);
                      }}
                      className={cn(
                        'group relative w-full overflow-hidden rounded-2xl p-4 text-left transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-indigo-500/20'
                          : theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-700/50'
                            : 'text-slate-700 hover:bg-slate-100/80',
                        isCollapsed && 'px-3 py-3'
                      )}
                    >
                      {/* Animated Background */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-white/10"
                          layoutId="activeBackground"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}

                      <div className={cn('relative flex items-start gap-3', isCollapsed && 'justify-center')}>
                        <motion.div
                          className="mt-0.5"
                          animate={isActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon size={20} />
                        </motion.div>
                        {!isCollapsed && (
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item.label}</p>
                            <p className={cn(
                              'mt-1 text-xs opacity-75',
                              isActive ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                            )}>
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Animated Border */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-white/0"
                        animate={
                          isActive
                            ? { borderColor: 'rgba(255,255,255,0.2)' }
                            : { borderColor: 'rgba(255,255,255,0)' }
                        }
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <motion.div
              className={`relative border-t p-4 ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between gap-3">
                <motion.button
                  onClick={() => {
                    onSettings?.();
                    if (isMobile) setIsOpen(false);
                  }}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl border transition-all',
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700/80'
                      : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100'
                  )}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Open settings"
                >
                  <Settings size={18} />
                </motion.button>

                <motion.button
                  onClick={() => {
                    onLogout();
                    if (isMobile) setIsOpen(false);
                  }}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl border transition-all',
                    theme === 'dark'
                      ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                      : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  )}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 z-30 lg:hidden ${theme === 'dark' ? 'bg-black/30' : 'bg-white/20'}`}
          />
        )}
      </AnimatePresence>
    </>
  );
}
