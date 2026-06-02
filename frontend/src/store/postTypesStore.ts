import { create } from 'zustand';
import type { PostType, FormattingPreferences, PlatformId } from '@smm/shared';
import { api } from '@/api/client';

export interface PostTypeFormData {
  name: string;
  targetPlatforms: PlatformId[];
  toneDescriptor: string;
  formattingPreferences: FormattingPreferences;
}

interface PostTypesState {
  postTypes: PostType[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (data: PostTypeFormData) => Promise<void>;
  update: (id: string, data: Partial<PostTypeFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const usePostTypesStore = create<PostTypesState>((set) => ({
  postTypes: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const postTypes = await api.get<PostType[]>('/post-types');
      set({ postTypes, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  create: async (data: PostTypeFormData) => {
    try {
      const created = await api.post<PostType>('/post-types', data);
      set((state) => ({ postTypes: [...state.postTypes, created] }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  update: async (id: string, data: Partial<PostTypeFormData>) => {
    try {
      const updated = await api.patch<PostType>(`/post-types/${id}`, data);
      set((state) => ({
        postTypes: state.postTypes.map((pt) => (pt.id === id ? updated : pt)),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  remove: async (id: string) => {
    try {
      await api.delete(`/post-types/${id}`);
      set((state) => ({ postTypes: state.postTypes.filter((pt) => pt.id !== id) }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
