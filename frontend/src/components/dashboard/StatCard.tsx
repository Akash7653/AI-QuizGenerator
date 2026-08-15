import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'brand' | 'success' | 'warning' | 'accent' | 'error';
  delay?: number;
}

const colorMap = {
  brand: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
  success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
  warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
  accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400',
  error: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
};

export function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'brand', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendUp ? 'text-success-600' : 'text-error-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-ink-900 dark:text-white">{value}</p>
      <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{label}</p>
    </motion.div>
  );
}
