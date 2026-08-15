import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlobalLayout } from '@/components/layout/GlobalLayout';
import { LoadingState } from '@/components/common/States';

// Public pages - lazy loaded
const LandingPage = lazy(() => import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));

// App pages - lazy loaded
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CreateQuizPage = lazy(() => import('@/pages/app/CreateQuizPage').then((m) => ({ default: m.CreateQuizPage })));
const QuizInterfacePage = lazy(() => import('@/pages/app/QuizInterfacePage').then((m) => ({ default: m.QuizInterfacePage })));
const QuizResultsPage = lazy(() => import('@/pages/app/QuizResultsPage').then((m) => ({ default: m.QuizResultsPage })));
const QuizReviewPage = lazy(() => import('@/pages/app/QuizReviewPage').then((m) => ({ default: m.QuizReviewPage })));
const HistoryPage = lazy(() => import('@/pages/app/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const AnalyticsPage = lazy(() => import('@/pages/app/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const RecommendationsPage = lazy(() => import('@/pages/app/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage })));
const ProfilePage = lazy(() => import('@/pages/app/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const QuizModePage = lazy(() => import('@/pages/app/QuizModePage').then((m) => ({ default: m.QuizModePage })));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingState />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GlobalLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />

            {/* Protected app routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
              <Route path="/create-quiz" element={<Suspense fallback={<PageLoader />}><CreateQuizPage /></Suspense>} />
              <Route path="/quiz/:id" element={<Suspense fallback={<PageLoader />}><QuizInterfacePage /></Suspense>} />
              <Route path="/quiz/:id/results" element={<Suspense fallback={<PageLoader />}><QuizResultsPage /></Suspense>} />
              <Route path="/quiz/:id/review" element={<Suspense fallback={<PageLoader />}><QuizReviewPage /></Suspense>} />
              <Route path="/practice" element={<Suspense fallback={<PageLoader />}><QuizModePage mode="practice" /></Suspense>} />
              <Route path="/exam" element={<Suspense fallback={<PageLoader />}><QuizModePage mode="exam" /></Suspense>} />
              <Route path="/adaptive" element={<Suspense fallback={<PageLoader />}><QuizModePage mode="adaptive" /></Suspense>} />
              <Route path="/challenge" element={<Suspense fallback={<PageLoader />}><QuizModePage mode="challenge" /></Suspense>} />
              <Route path="/history" element={<Suspense fallback={<PageLoader />}><HistoryPage /></Suspense>} />
              <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
              <Route path="/recommendations" element={<Suspense fallback={<PageLoader />}><RecommendationsPage /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
