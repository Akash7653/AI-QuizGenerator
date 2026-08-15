import { useState } from 'react';
import { useLocation, Outlet, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { Logo } from '@/components/common/Logo';
import {
  LayoutDashboard, PlusCircle, BookOpen, Target, Trophy,
  History, BarChart3, Lightbulb, User, Settings,
} from 'lucide-react';

const allNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/create-quiz', icon: PlusCircle, label: 'Create Quiz' },
  { to: '/practice', icon: BookOpen, label: 'Practice' },
  { to: '/exam', icon: Target, label: 'Exam' },
  { to: '/challenge', icon: Trophy, label: 'Challenge' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const fullScreenGenerate = location.pathname === '/create-quiz' && sessionStorage.getItem('quizgen_generating') === '1';

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {!fullScreenGenerate && <Sidebar collapsed={false} />}

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-ink-900 lg:hidden flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-ink-100 dark:border-ink-800">
                <Logo size="md" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {allNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-300 ${fullScreenGenerate ? 'lg:ml-0' : 'lg:ml-64'}`}>
        <TopNavbar onMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)] pb-20 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
