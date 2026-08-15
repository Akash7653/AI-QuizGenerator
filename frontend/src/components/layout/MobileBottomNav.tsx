import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, History, User, LogIn, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const publicItems = [
  { to: '/', icon: Home, label: 'Home', isAnchor: false },
  { to: '/login', icon: LogIn, label: 'Login', isAnchor: false },
  { to: '/#features', icon: Sparkles, label: 'Features', isAnchor: true },
  { to: '/#modes', icon: BookOpen, label: 'Modes', isAnchor: true },
  { to: '/register', icon: User, label: 'Sign Up', isAnchor: false },
];

const authItems = [
  { to: '/dashboard', icon: Home, label: 'Home', isAnchor: false },
  { to: '/create-quiz', icon: PlusCircle, label: 'Create', isAnchor: false },
  { to: '/practice', icon: BookOpen, label: 'Practice', isAnchor: false },
  { to: '/history', icon: History, label: 'History', isAnchor: false },
  { to: '/profile', icon: User, label: 'Profile', isAnchor: false },
];

// Routes where bottom nav should NOT appear (full-screen focused experiences)
const hiddenRoutes = ['/login', '/register', '/forgot-password'];

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  // Don't render on auth form pages or quiz interface
  if (hiddenRoutes.some((r) => location.pathname.startsWith(r)) || location.pathname.match(/^\/quiz\/[^/]+$/)) {
    return null;
  }

  const items = user ? authItems : publicItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/30 dark:border-white/10 px-1 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {items.map((item) => {
          // For anchor links on the landing page, use Link with hash
          if (item.isAnchor) {
            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-colors text-ink-400 dark:text-ink-500"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          }

          const isActive = user
            ? location.pathname === item.to
            : location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive: navActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-colors ${
                  navActive || isActive ? 'text-brand-600 dark:text-brand-400' : 'text-ink-400 dark:text-ink-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
