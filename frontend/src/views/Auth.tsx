import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, Loader2, ArrowRight, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = mode === 'signin'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute left-1/2 top-1/4 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="absolute right-1/4 bottom-1/4 h-[300px] w-[400px] rounded-full bg-accent/40 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30"
          >
            <Brain className="h-7 w-7" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">QuizGen</h1>
            <p className="text-sm text-muted-foreground">AI-powered quiz generation</p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/60 shadow-2xl shadow-primary/10">
          <div className="h-1.5 bg-primary" />
          <CardContent className="p-6 sm:p-8">
            {/* Mode toggle */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              <button
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LogIn className="h-4 w-4" /> Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <UserPlus className="h-4 w-4" /> Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signin' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signin' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === 'signin'
                    ? 'Sign in to access your quizzes and progress.'
                    : 'Start generating quizzes and tracking your learning.'}
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 rounded-xl pl-10"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="h-11 rounded-xl pl-10"
                        required
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/30"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : mode === 'signin' ? (
                      <LogIn className="mr-2 h-5 w-5" />
                    ) : (
                      <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <p className="mt-5 text-center text-xs text-muted-foreground">
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                    className="font-semibold text-primary hover:underline"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
