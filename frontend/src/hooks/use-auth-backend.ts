import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';

const AUTH_STATE_EVENT = 'quizgen-auth-state-changed';

function notifyAuthStateChanged() {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile_image?: string;
  is_active: boolean;
  is_verified: boolean;
}

function parseApiError(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: any) => item?.msg)
      .filter((msg: unknown): msg is string => typeof msg === 'string' && msg.trim().length > 0);
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  return fallback;
}

export function useAuthBackend() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[Auth] checkAuth - checking session...');
      const profile = await authAPI.getProfile();
      console.log('[Auth] Profile fetched successfully:', profile);
      setUser(profile);
      setError(null);
    } catch (err: any) {
      const errMsg = parseApiError(err, 'Failed to fetch profile');
      // Only log network errors if backend is expected to be running
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED') {
        console.error('[Auth] checkAuth error:', errMsg);
      }
      setUser(null);
      // Don't set error state on network errors - just treat as not logged in
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED' && err.response?.status !== 'undefined') {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const onAuthStateChanged = () => {
      checkAuth();
    };

    window.addEventListener(AUTH_STATE_EVENT, onAuthStateChanged);
    return () => window.removeEventListener(AUTH_STATE_EVENT, onAuthStateChanged);
  }, [checkAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Auth] Attempting login...');
      const response = await authAPI.login(email, password);
      console.log('[Auth] Login response:', response);
      
      // Server sets session via HttpOnly cookie, no need to store tokens
      
      // Small delay to ensure session is established
      await delay(100);
      
      // Fetch user profile to verify session
      await checkAuth();

      // Keep success state visible briefly for UI completion animations
      await delay(450);
      notifyAuthStateChanged();
      return { success: true };
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      const message = parseApiError(err, 'Login failed. Please check your credentials.');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const signUp = useCallback(async (username: string, email: string, password: string, role: string = 'student') => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Auth] Attempting registration...');
      await authAPI.register({ username, email, password, role });

      // Auto-sign-in right after successful registration
      console.log('[Auth] Registration successful, signing in...');
      const loginResponse = await authAPI.login(email, password);
      console.log('[Auth] Auto sign-in response:', loginResponse);
      
      // Server sets session via HttpOnly cookie
      
      // Small delay to ensure session is established
      await delay(100);

      // Fetch user profile to verify session
      await checkAuth();

      // Keep success state visible briefly for UI completion animations
      await delay(450);
      notifyAuthStateChanged();
      return { success: true };
    } catch (err: any) {
      console.error('[Auth] Sign up error:', err);
      const message = parseApiError(err, 'Registration failed. Please try again.');
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const signOut = useCallback(async () => {
    try {
      await authAPI.logout();
      console.log('[Auth] Logout successful');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setError(null);
      notifyAuthStateChanged();
    }
  }, []);

  const updateProfile = useCallback(async (data: { username?: string; email?: string; profile_image?: string }) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
      return { success: true };
    } catch (err: any) {
      const message = parseApiError(err, 'Profile update failed.');
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const changeEmail = useCallback(async (newEmail: string) => {
    try {
      const updatedUser = await authAPI.changeEmail(newEmail);
      setUser(updatedUser);
      return { success: true };
    } catch (err: any) {
      const message = parseApiError(err, 'Email update failed.');
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changeEmail,
    refreshAuth: checkAuth,
  };
}
