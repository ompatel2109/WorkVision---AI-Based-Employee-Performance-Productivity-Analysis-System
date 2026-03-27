import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminReports from "./pages/AdminReports";
import WorkEntry from "./pages/WorkEntry";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";
import RequestResetPassword from "./pages/RequestResetPassword";
import ResetPassword from "./pages/ResetPassword";
import ManagerLayout from "./components/layout/ManagerLayout";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerTeamView from "./pages/manager/ManagerTeamView";
import ManagerReports from "./pages/manager/ManagerReports";
import ManagerEmployeeDetail from "./pages/manager/ManagerEmployeeDetail";
import ManagerComparison from "./pages/manager/ManagerComparison";
import ManagerSettings from "./pages/manager/ManagerSettings";
import ManagerTasks from "./pages/manager/ManagerTasks";
import ManagerLeaderboard from "./pages/manager/ManagerLeaderboard";
import EmployeeLayout from "./components/layout/EmployeeLayout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeWorkLog from "./pages/employee/EmployeeWorkLog";
import EmployeeTasks from "./pages/employee/EmployeeTasks";
import EmployeeHistory from "./pages/employee/EmployeeHistory";
import EmployeeFeedback from "./pages/employee/EmployeeFeedback";
import EmployeeSettings from "./pages/employee/EmployeeSettings";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDepartments from "./pages/AdminDepartments";
import AdminAI from "./pages/AdminAI";
import AdminLogs from "./pages/AdminLogs";
import AdminSettings from "./pages/AdminSettings";
import AdminTeamView from "./pages/AdminTeamView";
import AdminEmployeeDetail from "./pages/AdminEmployeeDetail";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'employee' | 'manager' }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

import AboutUs from "./pages/AboutUs";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<RequestResetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Employee Routes */}
      {/* Employee Routes - Redirect /dashboard to /employee */}
      <Route path="/dashboard" element={<Navigate to="/employee" replace />} />
      <Route
        path="/work-entry"
        element={
          <ProtectedRoute requiredRole="employee">
            <WorkEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute requiredRole="employee">
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="team" element={<ManagerTeamView />} />
        <Route path="comparison" element={<ManagerComparison />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="settings" element={<ManagerSettings />} />
        <Route path="employee/:id" element={<ManagerEmployeeDetail />} />
        <Route path="tasks" element={<ManagerTasks />} />
        <Route path="leaderboard" element={<ManagerLeaderboard />} />
      </Route>

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="work-log" element={<EmployeeWorkLog />} />
        <Route path="tasks" element={<EmployeeTasks />} />
        <Route path="history" element={<EmployeeHistory />} />
        <Route path="feedback" element={<EmployeeFeedback />} />
        <Route path="settings" element={<EmployeeSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminEmployees />} />
        <Route path="team" element={<AdminTeamView />} />
        <Route path="employee/:id" element={<AdminEmployeeDetail />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="ai" element={<AdminAI />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
