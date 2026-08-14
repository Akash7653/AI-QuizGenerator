import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { useAuthBackend } from '@/hooks/use-auth-backend';
import { authAPI } from '@/lib/api';

interface SettingsProps {
  user: {
    id?: number;
    username?: string;
    email?: string;
    role?: string;
    is_verified?: boolean;
  } | null;
  onBack: () => void;
}

export function Settings({ user, onBack }: SettingsProps) {
  const { theme } = useThemeMode();
  const { updateProfile, changeEmail } = useAuthBackend();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [isPasswordSending, setIsPasswordSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileStats = useMemo(() => {
    return [
      { label: 'Role', value: user?.role ? user.role.toUpperCase() : 'STUDENT' },
      { label: 'Verification', value: user?.is_verified ? 'Verified' : 'Pending' },
      { label: 'Account', value: 'Active' },
    ];
  }, [user]);

  const handleProfileSave = async () => {
    setError(null);
    setFeedback(null);
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    setIsSaving(true);
    const result = await updateProfile({ username: username.trim() });
    setIsSaving(false);

    if (result.success) {
      setFeedback('Profile updated successfully.');
    } else {
      setError(result.error || 'Unable to update profile.');
    }
  };

  const handleEmailSave = async () => {
    setError(null);
    setFeedback(null);
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setIsEmailSaving(true);
    const result = await changeEmail(email.trim());
    setIsEmailSaving(false);

    if (result.success) {
      setFeedback('Email updated successfully. Please re-verify your new address.');
    } else {
      setError(result.error || 'Unable to update email.');
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setFeedback(null);
    if (!user?.email) {
      setError('No account email is available.');
      return;
    }

    setIsPasswordSending(true);
    try {
      const response = await authAPI.forgotPassword(user.email);
      setFeedback(response.message || 'Password reset instructions were sent.');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to send reset email.');
    } finally {
      setIsPasswordSending(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setFeedback(null);
    if (!password.trim() || password.length < 8) {
      setError('Use a valid new password with at least 8 characters.');
      return;
    }

    setIsPasswordSending(true);
    try {
      const token = window.prompt('Enter the password reset token you received by email:');
      if (!token || !token.trim()) {
        setIsPasswordSending(false);
        setError('Reset token is required to complete password reset.');
        return;
      }

      const response = await authAPI.resetPassword(token.trim(), password.trim());
      setFeedback(response.message || 'Password reset successfully.');
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to reset password.');
    } finally {
      setIsPasswordSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-[28px] border border-slate-200/60 bg-white/80 p-5 shadow-[0_20px_50px_rgba(59,130,246,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Account</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            {user?.is_verified ? 'Verified' : 'Not verified'}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className={theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/80'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-500" />
              Personal details
            </CardTitle>
            <CardDescription>Update your public profile and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleProfileSave} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save profile
              </Button>
              <Button variant="outline" onClick={handleEmailSave} disabled={isEmailSaving} className="w-full sm:w-auto">
                {isEmailSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Update email
              </Button>
            </div>

            {(feedback || error) && (
              <div className={`rounded-xl border px-3 py-2 text-sm ${feedback ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'}`}>
                {feedback || error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/80'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-violet-500" />
              Account status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/80'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-500" />
              Security
            </CardTitle>
            <CardDescription>Reset your password using the backend reset flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">New password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={handleForgotPassword} disabled={isPasswordSending} className="w-full sm:w-auto">
                {isPasswordSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Send reset link
              </Button>
              <Button onClick={handleResetPassword} disabled={isPasswordSending} className="w-full sm:w-auto">
                {isPasswordSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Reset password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={theme === 'dark' ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/80'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-emerald-500" />
              Quick notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>• The profile and email endpoints are connected to the backend session-based auth service.</p>
            <p>• Email changes are reset to unverified so the account can be re-confirmed.</p>
            <p>• Password reset uses the backend token flow and can be completed with a reset token from the email workflow.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
