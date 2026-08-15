import { BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  to?: string;
}

const sizeMap = {
  sm: { icon: 'w-7 h-7', text: 'text-lg' },
  md: { icon: 'w-8 h-8', text: 'text-xl' },
  lg: { icon: 'w-10 h-10', text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, to = '/' }: LogoProps) {
  const s = sizeMap[size];
  const content = (
    <div className="flex items-center gap-2">
      <div className={`${s.icon} rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow shrink-0`}>
        <BrainCircuit className="w-1/2 h-1/2" />
      </div>
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight text-ink-900 dark:text-white`}>
          Quiz<span className="text-brand-600 dark:text-brand-400">Gen</span>
        </span>
      )}
    </div>
  );
  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}
