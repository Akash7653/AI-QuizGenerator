import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PlusCircle, BookOpen, Target, Trophy,
  History, BarChart3, Lightbulb, User, Settings,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/create-quiz', icon: PlusCircle, label: 'Create Quiz' },
  { to: '/practice', icon: BookOpen, label: 'Practice' },
  { to: '/exam', icon: Target, label: 'Exam' },
  { to: '/challenge', icon: Trophy, label: 'Challenge' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
];

const bottomNavItems = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white dark:bg-ink-900 border-r border-ink-100 dark:border-ink-800 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-5'} border-b border-ink-100 dark:border-ink-800`}>
        {collapsed ? <Logo size="md" showText={false} /> : <Logo size="md" />}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-ink-100 dark:border-ink-800 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

    </aside>
  );
}
