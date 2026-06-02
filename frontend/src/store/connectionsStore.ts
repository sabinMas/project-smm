import { create } from 'zustand';
import type { PlatformConnection, PlatformId } from '@smm/shared';
import { api } from '@/api/client';

interface ConnectionsState {
  connections: PlatformConnection[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  connect: (platformId: PlatformId) => Promise<void>;
  disconnect: (connectionId: string) => Promise<void>;
}

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  connections: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const connections = await api.get<PlatformConnection[]>('/connections');
      set({ connections, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  connect: async (platformId: PlatformId) => {
    try {
      const result = await api.post<{ authUrl: string }>('/auth/connect', { platformId });
      window.location.href = result.authUrl;
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  disconnect: async (connectionId: string) => {
    try {
      await api.delete(`/connections/${connectionId}`);
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== connectionId),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
