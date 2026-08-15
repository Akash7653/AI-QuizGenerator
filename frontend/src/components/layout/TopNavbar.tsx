import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Bell, Sun, Moon, Menu, LogOut, User, Settings as SettingsIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/common/Logo';

interface TopNavbarProps {
  onMobileMenu: () => void;
}

export function TopNavbar({ onMobileMenu }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-white/30 dark:border-white/5 flex items-center justify-between px-4 sm:px-6">
      {/* Left: mobile menu + search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onMobileMenu}
            className="p-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="sm" />
        </div>
        <div className="relative hidden sm:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search quizzes, topics..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-ink-900 transition-colors text-ink-800 dark:text-ink-100 placeholder-ink-400"
          />
        </div>
      </div>

      {/* Right: theme toggle, notifications, profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="relative p-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-ink-700 dark:text-ink-200 max-w-[120px] truncate">
              {user?.name}
            </span>
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-56 card p-2 shadow-card-hover z-50"
            >
              <div className="px-3 py-2 border-b border-ink-100 dark:border-ink-800 mb-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-ink-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </button>
              <div className="border-t border-ink-100 dark:border-ink-800 mt-1 pt-1">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
