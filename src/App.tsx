import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";
import AIChat from "./pages/AIChat";
import Settings from "./pages/Settings";
import MoneyMoment from "./pages/MoneyMoment";
import MoneyDiary from "./pages/MoneyDiary";
import MoneyWins from "./pages/MoneyWins";
import Achievements from "./pages/Achievements";
import Verify from "./pages/Verify";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || profileLoading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

function OnboardingRoute() {
  const { user, loading } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (loading || isLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/" replace />;

  return <Onboarding />;
}

const wrap = (el: React.ReactNode) => <ErrorBoundary>{el}</ErrorBoundary>;

function AppShell() {
  useNetworkStatus();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={wrap(<Auth />)} />
        <Route path="/verify/:kind/:code" element={wrap(<Verify />)} />
        <Route path="/privacy" element={wrap(<Privacy />)} />
        <Route path="/terms" element={wrap(<Terms />)} />
        <Route path="/help" element={wrap(<Help />)} />
        <Route path="/onboarding" element={wrap(<OnboardingRoute />)} />
        <Route path="/" element={wrap(<ProtectedRoute><Dashboard /></ProtectedRoute>)} />
        <Route path="/budget" element={wrap(<ProtectedRoute><Budget /></ProtectedRoute>)} />
        <Route path="/goals" element={wrap(<ProtectedRoute><Goals /></ProtectedRoute>)} />
        <Route path="/goals/:id" element={wrap(<ProtectedRoute><GoalDetail /></ProtectedRoute>)} />
        <Route path="/learn" element={wrap(<ProtectedRoute><Learn /></ProtectedRoute>)} />
        <Route path="/learn/:id" element={wrap(<ProtectedRoute><Lesson /></ProtectedRoute>)} />
        <Route path="/learn/moment/:id" element={wrap(<ProtectedRoute><MoneyMoment /></ProtectedRoute>)} />
        <Route path="/diary" element={wrap(<ProtectedRoute><MoneyDiary /></ProtectedRoute>)} />
        <Route path="/wins" element={wrap(<ProtectedRoute><MoneyWins /></ProtectedRoute>)} />
        <Route path="/ai" element={wrap(<ProtectedRoute><AIChat /></ProtectedRoute>)} />
        <Route path="/settings" element={wrap(<ProtectedRoute><Settings /></ProtectedRoute>)} />
        <Route path="/achievements" element={wrap(<ProtectedRoute><Achievements /></ProtectedRoute>)} />
        <Route path="*" element={wrap(<NotFound />)} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppShell />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
