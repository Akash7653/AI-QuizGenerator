import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { authService } from '@/services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch {
      toast.error('Could not send reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h1 className="text-xl font-bold text-ink-900 dark:text-white mb-2">Check your email</h1>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-6">
                We've sent a password reset link to <span className="font-medium text-ink-700 dark:text-ink-300">{email}</span>
              </p>
              <Link to="/login" className="btn-primary w-full py-2.5">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-ink-900 dark:text-white mb-2">Forgot your password?</h1>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label" htmlFor="fp-email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      id="fp-email"
                      type="email"
                      className="input pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-500 dark:text-ink-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
