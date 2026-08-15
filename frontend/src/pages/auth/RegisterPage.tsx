import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/common/Logo';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      e.name = 'Please enter your full name.';
    }

    if (!trimmedEmail) {
      e.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      e.email = 'Please enter a valid email address.';
    }

    if (!password) {
      e.password = 'Please enter a password.';
    } else if (password.length < 8 || password.length > 72) {
      e.password = 'Password must be between 8 and 72 characters.';
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = 'Password must include at least one uppercase letter, one lowercase letter, and one number.';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }

    if (!agree) {
      e.terms = 'Please accept the Terms of Service and Privacy Policy.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      await register(trimmedName, trimmedEmail, password);
      toast.success('Account created! Welcome to QuizGen.');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-ink-50 dark:bg-ink-950 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </div>
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-ink-500 dark:text-ink-400 mb-8">Start generating quizzes from your study material in minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  id="name"
                  className={`input pl-10 ${errors.name ? 'border-error-500' : ''}`}
                  placeholder="Akash Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && <p className="text-xs text-error-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  id="reg-email"
                  type="email"
                  className={`input pl-10 ${errors.email ? 'border-error-500' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-xs text-error-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              {(passwordFocused || password.length > 0) && (
                <p className="mb-1 text-[10px] font-medium text-success-600 dark:text-success-400">
                  Use 8+ characters with uppercase, lowercase, and a number.
                </p>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  id="reg-password"
                  type="password"
                  className={`input pl-10 ${errors.password ? 'border-error-500' : ''}`}
                  placeholder="At least 8 characters"
                  value={password}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="text-xs text-error-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label" htmlFor="confirm-password">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  id="confirm-password"
                  type="password"
                  className={`input pl-10 ${errors.confirmPassword ? 'border-error-500' : ''}`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-error-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-ink-600 dark:text-ink-400">
                I agree to the{' '}
                <span className="text-brand-600 dark:text-brand-400 font-medium">Terms of Service</span> and{' '}
                <span className="text-brand-600 dark:text-brand-400 font-medium">Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-error-500 -mt-2">{errors.terms}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-ink-900 via-brand-900 to-brand-700 p-12 flex-col justify-between overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-brand-400 blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent-500 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative z-10 flex justify-end">
          <Logo size="lg" />
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight text-balance">
            Smarter studying starts here.
          </h2>
          <div className="space-y-3 pt-2">
            {[
              'AI-generated questions from any content',
              'Four quiz modes: Practice, Exam, Adaptive, Challenge',
              'Detailed analytics and personalized recommendations',
              'Track your progress and improve over time',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-brand-100">
                <div className="w-5 h-5 rounded-full bg-success-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-success-300" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-sm text-brand-300">
          &copy; 2025 QuizGen. All rights reserved.
        </div>
      </div>
    </div>
  );
}
