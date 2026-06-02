import { create } from 'zustand';
import type { DashboardMetrics, PlatformMetricBreakdown } from '@smm/shared';
import { api } from '@/api/client';

interface AnalyticsState {
  dashboard: DashboardMetrics | null;
  postBreakdown: PlatformMetricBreakdown[] | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: (from: string, to: string) => Promise<void>;
  fetchPostBreakdown: (postId: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dashboard: null,
  postBreakdown: null,
  loading: false,
  error: null,

  fetchDashboard: async (from: string, to: string) => {
    set({ loading: true, error: null });
    try {
      const dashboard = await api.get<DashboardMetrics>(`/analytics?from=${from}&to=${to}`);
      set({ dashboard, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchPostBreakdown: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const breakdown = await api.get<PlatformMetricBreakdown[]>(`/analytics/posts/${postId}`);
      set({ postBreakdown: breakdown, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
