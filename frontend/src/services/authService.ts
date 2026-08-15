import { api } from './api';
import type { User } from '@/types';

const AUTH_KEY = 'quizgen_auth';
const TOKEN_KEY = 'quizgen_token';

interface AuthSession {
  user: User;
  token: string;
}

interface BackendUser {
  id: number;
  username?: string;
  name?: string;
  email: string;
  profile_image?: string | null;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

const normalizeBackendUser = (user: BackendUser): User => {
  const displayName = user.username || user.name || user.email?.split('@')[0] || 'User';

  return {
    id: String(user.id),
    name: displayName,
    email: user.email,
    avatarUrl: user.profile_image || undefined,
    quizzesCompleted: 0,
    averageScore: 0,
    streak: 0,
    xp: 0,
    level: 1,
    joinedAt: user.created_at || new Date().toISOString(),
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
};

const saveSession = (user: BackendUser): AuthSession => {
  const normalized = normalizeBackendUser(user);
  const session: AuthSession = {
    user: normalized,
    token: 'session-auth',
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_KEY, session.token);
  return session;
};

const getRegisterErrorMessage = (error: unknown): string => {
  const axiosError = error as { response?: { data?: { detail?: unknown }; status?: number; code?: string; message?: string } };
  const detail = axiosError?.response?.data?.detail;

  if (axiosError?.response?.status === 422 && Array.isArray(detail)) {
    const first = detail[0] as { loc?: string[]; msg?: string } | undefined;
    const loc = first?.loc ?? [];
    const msg = first?.msg ?? '';

    if (loc.includes('username') || loc.includes('name') || loc.includes('full_name')) {
      return 'Please enter your full name.';
    }

    if (loc.includes('email')) {
      if (msg.toLowerCase().includes('valid') || msg.toLowerCase().includes('email')) {
        return 'Please enter a valid email address.';
      }
      return 'Please enter your email address.';
    }

    if (loc.includes('password')) {
      return 'Password must be 8+ characters and include uppercase, lowercase, and a number.';
    }
  }

  if (typeof detail === 'string') {
    const text = detail.toLowerCase();
    if (text.includes('already exists') || text.includes('email already')) {
      return 'An account with this email already exists. Please sign in or use a different email.';
    }
    if (text.includes('username is already taken') || text.includes('username') && text.includes('taken')) {
      return 'This username is already taken. Please choose another one.';
    }
    if (text.includes('name is required') || text.includes('username is required')) {
      return 'Please enter your full name.';
    }
    if (text.includes('password')) {
      return 'Password must be 8+ characters and include uppercase, lowercase, and a number.';
    }
  }

  if (!axiosError?.response || axiosError?.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please try again.';
  }

  return 'Unable to create your account. Please try again.';
};

const getLoginErrorMessage = (error: unknown): string => {
  const axiosError = error as { response?: { data?: { detail?: unknown }; status?: number; code?: string; message?: string } };
  const detail = axiosError?.response?.data?.detail;

  if (axiosError?.response?.status === 401) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  if (typeof detail === 'string') {
    const text = detail.toLowerCase();
    if (text.includes('incorrect') || text.includes('password') || text.includes('email')) {
      return 'Incorrect email or password. Please check your credentials and try again.';
    }
  }

  if (!axiosError?.response || axiosError?.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please try again.';
  }

  return 'Unable to sign in. Please try again.';
};

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    try {
      const res = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const session = saveSession(res.data as BackendUser);
      return session;
    } catch (error) {
      throw new Error(getLoginErrorMessage(error));
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthSession> {
    try {
      const res = await api.post('/auth/register', {
        username: name.trim(),
        email: email.trim(),
        password,
      });
      const session = saveSession(res.data as BackendUser);
      return session;
    } catch (error) {
      throw new Error(getRegisterErrorMessage(error));
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  getCurrentSession(): AuthSession | null {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  logout(): void {
    try {
      api.post('/auth/logout');
    } catch {
      // no-op: session cleanup is best-effort in dev environments
    }
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
