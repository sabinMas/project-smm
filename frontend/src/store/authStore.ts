import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Auth endpoints sit at the backend root, not under /api
const AUTH_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : '';

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkSession: async () => {
    set({ loading: true });
    try {
      const { user } = await authFetch<{ user: AuthUser | null }>('/auth/me');
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { user } = await authFetch<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      set({ user });
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ error: null });
    try {
      const { user } = await authFetch<{ user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      set({ user });
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authFetch('/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
