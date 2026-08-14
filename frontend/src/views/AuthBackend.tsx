import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Circle, Home, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthBackend } from '@/hooks/use-auth-backend';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AuthBackendProps {
  onGoHome?: () => void;
  onAuthSuccess?: () => void;
  user?: any;
}

export function AuthBackend({ onGoHome, onAuthSuccess, user }: AuthBackendProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [errorPulseKey, setErrorPulseKey] = useState(0);
  
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState<'signin' | 'signup' | null>(null);
  
  const { signIn, signUp, loading, error } = useAuthBackend();
  const { toast } = useToast();

  // Navigate to dashboard once user state is updated from server
  useEffect(() => {
    if (successMode && user) {
      // User has successfully authenticated and profile is loaded
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }, 500);
    }
  }, [successMode, user, onAuthSuccess]);

  const isPasswordStrong = (password: string) => {
    // Mirror backend policy to prevent avoidable 422 errors.
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,100}$/.test(password);
  };

  const passwordChecks = {
    length: signUpData.password.length >= 8,
    upper: /[A-Z]/.test(signUpData.password),
    lower: /[a-z]/.test(signUpData.password),
    number: /\d/.test(signUpData.password),
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = signInData.email.trim();
    const password = signInData.password;

    if (!email || !password) {
      setErrorPulseKey((prev) => prev + 1);
      setFormError('Oops 😅 Please enter both email and password.');
      return;
    }

    const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailPattern.test(email)) {
      setErrorPulseKey((prev) => prev + 1);
      setFormError('Oops 😅 Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setFormError(null);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      setSuccessMode('signin');
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      // useEffect will handle navigation once user state is updated
    } else {
      setSuccessMode(null);
      setErrorPulseKey((prev) => prev + 1);
      setFormError(typeof result.error === 'string' ? result.error : 'Authentication failed. Please try again.');
      toast({
        title: 'Sign in failed',
        description: typeof result.error === 'string' ? result.error : 'Authentication failed. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = signUpData.name.trim();
    const email = signUpData.email.trim();
    setFormError(null);

    if (!name || !email || !signUpData.password || !signUpData.confirmPassword) {
      setErrorPulseKey((prev) => prev + 1);
      setFormError('Oops 😅 Please fill in all required fields.');
      return;
    }

    const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailPattern.test(email)) {
      setErrorPulseKey((prev) => prev + 1);
      setFormError('Oops 😅 Please enter a valid email address.');
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorPulseKey((prev) => prev + 1);
      setFormError('Passwords do not match. Please make sure your passwords match.');
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (!isPasswordStrong(signUpData.password)) {
      setErrorPulseKey((prev) => prev + 1);
      const message = 'Password must be 8+ characters and include uppercase, lowercase, and a number.';
      setFormError(message);
      toast({
        title: 'Weak password',
        description: message,
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    const result = await signUp(name, email, signUpData.password, signUpData.role);
    
    if (result.success) {
      setSuccessMode('signup');
      toast({
        title: 'Account created!',
        description: 'Welcome! You are now signed in.',
      });
      // useEffect will handle navigation once user state is updated
    } else {
      setSuccessMode(null);
      setErrorPulseKey((prev) => prev + 1);
      setFormError(typeof result.error === 'string' ? result.error : 'Registration failed. Please try again.');
      toast({
        title: 'Sign up failed',
        description: typeof result.error === 'string' ? result.error : 'Registration failed. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <div className="pointer-events-none absolute -top-40 -left-16 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
      {['✨', '🚀', '🎯', '📘', '🧠', '🌟'].map((emoji, idx) => (
        <motion.span
          key={`auth-emoji-${emoji}-${idx}`}
          className="pointer-events-none absolute text-lg opacity-60"
          style={{ left: `${12 + idx * 14}%`, top: `${12 + (idx % 3) * 22}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 3 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Success/Error Message - Bottom Right Corner */}
      <AnimatePresence>
        {(formError || successMode) && (
          <motion.div
            key={formError ? 'error' : 'success'}
            initial={{ opacity: 0, x: 100, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 100 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className={`rounded-xl border shadow-2xl backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-4 ${
              formError 
                ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
            }`}>
              <div className="flex items-center gap-2">
                {formError ? (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4, repeat: 3 }}
                  >
                    <XCircle className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.4, repeat: 2 }}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                )}
                <span className="text-xs sm:text-sm font-medium">
                  {formError || (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {successMode === 'signin' ? 'Signed in! Redirecting to your dashboard...' : 'Account created! Redirecting to your dashboard...'}
                    </motion.span>
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 grid w-full max-w-4xl gap-5 lg:grid-cols-[1fr_0.95fr]"
      >
        <div className="absolute -top-2 right-0 z-20 flex items-center gap-2">
          <ThemeToggle className="h-10 rounded-xl border-border/60 bg-card/90 px-3 text-foreground backdrop-blur" />
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-card/90 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card"
            >
              <Home className="h-4 w-4" /> Home
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="hidden rounded-3xl border border-border/60 bg-card/80 p-6 sm:p-8 shadow-2xl shadow-sky-900/10 backdrop-blur-xl lg:block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl sm:text-2xl font-bold tracking-tight">QuizGen</p>
              <p className="text-xs sm:text-sm text-muted-foreground">AI Quiz Generator Platform</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Study Smarter.
              <span className="block bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                Quiz Faster.
              </span>
            </h2>
            <p className="max-w-md text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Turn notes, PDFs, and topics into adaptive quizzes with instant scoring and explanations.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 grid gap-3">
            {[
              'AI-powered question generation',
              'Role-aware learning tracks',
              'Instant progress insights',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-2 sm:p-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/85 shadow-2xl shadow-sky-900/10 backdrop-blur-xl">
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500" />
          <CardHeader className="pb-3 px-4 sm:px-6 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }}
              className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-xl shadow-sky-500/30"
            >
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
            </motion.div>
            <CardTitle className="font-display mt-3 text-xl sm:text-2xl font-bold tracking-tight">Welcome</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Sign in or create an account to start generating AI quizzes 🚀</CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                if (value === 'signin' || value === 'signup') {
                  setActiveTab(value);
                  setFormError(null);
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/60 bg-background/60 p-1">
                <TabsTrigger value="signin" className="rounded-lg text-xs sm:text-sm text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-xs sm:text-sm text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} noValidate className="space-y-3.5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="h-10 rounded-xl border-border/70 bg-background/80 focus-visible:ring-primary/40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-xs uppercase tracking-wide text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="•••••••••"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="h-10 rounded-xl border-border/70 bg-background/80 pr-12 focus-visible:ring-primary/40"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:translate-y-[-1px] hover:shadow-xl hover:shadow-sky-500/35"
                    disabled={isLoading || loading}
                  >
                    {successMode === 'signin' ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Signed in!
                      </>
                    ) : isLoading || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} noValidate className="space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="signup-name" className="text-xs uppercase tracking-wide text-muted-foreground">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        className="h-10 rounded-xl border-border/70 bg-background/80 focus-visible:ring-primary/40"
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="signup-email" className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className="h-10 rounded-xl border-border/70 bg-background/80 focus-visible:ring-primary/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-xs uppercase tracking-wide text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="•••••••••"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        minLength={8}
                        className="h-10 rounded-xl border-border/70 bg-background/80 pr-12 focus-visible:ring-primary/40"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Password requirements</p>
                      <div className="grid gap-1 text-xs">
                        {[
                          { label: 'At least 8 characters', ok: passwordChecks.length },
                          { label: 'One uppercase letter', ok: passwordChecks.upper },
                          { label: 'One lowercase letter', ok: passwordChecks.lower },
                          { label: 'One number', ok: passwordChecks.number },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2">
                            {rule.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                            <span className={rule.ok ? 'text-foreground' : 'text-muted-foreground'}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-xs uppercase tracking-wide text-muted-foreground">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="•••••••••"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        className="h-10 rounded-xl border-border/70 bg-background/80 focus-visible:ring-primary/40"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-role" className="text-xs uppercase tracking-wide text-muted-foreground">Role</Label>
                      <select
                        id="signup-role"
                        value={signUpData.role}
                        onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })}
                        className="h-10 w-full rounded-xl border border-border/70 bg-background/80 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:translate-y-[-1px] hover:shadow-xl hover:shadow-emerald-500/35"
                    disabled={isLoading || loading}
                  >
                    {successMode ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Signed in!
                      </>
                    ) : isLoading || loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
