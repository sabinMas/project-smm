import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ComposePage from '@/pages/ComposePage';
import CalendarPage from '@/pages/CalendarPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import PostTypesPage from '@/pages/PostTypesPage';
import WorkflowsPage from '@/pages/WorkflowsPage';
import { useRealTimeUpdates } from '@/hooks';

export default function App() {
  useRealTimeUpdates();

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
