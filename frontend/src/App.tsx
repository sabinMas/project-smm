import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import ComposePage from '@/pages/ComposePage';
import CalendarPage from '@/pages/CalendarPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import PostTypesPage from '@/pages/PostTypesPage';
import WorkflowsPage from '@/pages/WorkflowsPage';
import { useRealTimeUpdates } from '@/hooks';
import { useAuthStore } from '@/store/authStore';

function AuthenticatedApp() {
  useRealTimeUpdates();

  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/compose" replace />} />
          <Route path="compose" element={<ComposePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="post-types" element={<PostTypesPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  );
}
