import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncSession = () => {
      const session = authService.getCurrentSession();
      setUser(session ? session.user : null);
    };

    syncSession();
    window.addEventListener('quiz-results-updated', syncSession);
    setLoading(false);

    return () => {
      window.removeEventListener('quiz-results-updated', syncSession);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const session = await authService.login(email, password);
    setUser(session.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const session = await authService.register(name, email, password);
    setUser(session.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const session = authService.getCurrentSession();
      if (session) {
        localStorage.setItem(
          'quizgen_auth',
          JSON.stringify({ ...session, user: updated }),
        );
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
