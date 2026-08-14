import { Moon, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeMode } from '@/hooks/use-theme-mode';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeMode();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggleTheme}
      className={`${className} transition-all duration-300 ${
        theme === 'dark'
          ? 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/70 text-slate-200'
          : 'border-slate-400 bg-white/60 hover:bg-white/80 text-slate-800'
      }`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="ml-2 text-xs font-semibold tracking-wide">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </Button>
  );
}
