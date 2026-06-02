import { create } from 'zustand';
import type { ScheduledPost } from '@smm/shared';
import { api } from '@/api/client';

interface CalendarState {
  posts: ScheduledPost[];
  loading: boolean;
  error: string | null;
  selectedMonth: Date;
  fetch: (from: string, to: string) => Promise<void>;
  setMonth: (date: Date) => void;
  cancel: (scheduleId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  posts: [],
  loading: false,
  error: null,
  selectedMonth: new Date(),

  fetch: async (from: string, to: string) => {
    set({ loading: true, error: null });
    try {
      const posts = await api.get<ScheduledPost[]>(`/schedule?from=${from}&to=${to}`);
      set({ posts, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  setMonth: (date: Date) => set({ selectedMonth: date }),

  cancel: async (scheduleId: string) => {
    try {
      await api.delete(`/schedule/${scheduleId}`);
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === scheduleId ? { ...p, status: 'cancelled' as const } : p
        ),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
