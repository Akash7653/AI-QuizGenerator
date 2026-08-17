import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/authService';
import { api } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('quizgen_token');
      if (!token) {
        setUser(null);
        return;
      }

      // Validate token with backend and get current user
      const response = await api.get('/auth/profile');
      const backendUser = response.data;

      // Update user in state and localStorage
      const normalizedUser: User = {
        id: String(backendUser.id),
        name: backendUser.username || backendUser.name || backendUser.email?.split('@')[0] || 'User',
        email: backendUser.email,
        avatarUrl: backendUser.profile_image || undefined,
        quizzesCompleted: 0,
        averageScore: 0,
        streak: 0,
        xp: 0,
        level: 1,
        joinedAt: backendUser.created_at || new Date().toISOString(),
        preferences: {
          defaultDifficulty: 'medium',
          defaultQuestionCount: 10,
          defaultQuestionType: 'mcq',
          notifications: {
            quizReminders: true,
            performanceReports: true,
            recommendations: true,
          },
        },
      };

      setUser(normalizedUser);

      // Update localStorage session
      const session = authService.getCurrentSession();
      if (session) {
        localStorage.setItem(
          'quizgen_auth',
          JSON.stringify({ ...session, user: normalizedUser }),
        );
      }
    } catch (error) {
      console.error('Failed to validate token:', error);
      // Token is invalid, clear auth state
      authService.logout();
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const session = authService.getCurrentSession();
      const token = localStorage.getItem('quizgen_token');

      if (session && token) {
        // Validate token with backend before setting user
        await refreshUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();

    const syncSession = () => {
      const session = authService.getCurrentSession();
      setUser(session ? session.user : null);
    };

    window.addEventListener('quiz-results-updated', syncSession);

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
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
