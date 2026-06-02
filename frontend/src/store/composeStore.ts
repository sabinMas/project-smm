import { create } from 'zustand';
import type { PlatformId, GeneratedContent, AdaptedContent } from '@smm/shared';
import { api } from '@/api/client';

interface ComposeState {
  text: string;
  selectedPostTypeId: string | null;
  targetPlatforms: PlatformId[];
  generatedContent: GeneratedContent | null;
  generating: boolean;
  publishing: boolean;
  scheduling: boolean;
  error: string | null;

  setText: (text: string) => void;
  setPostType: (id: string, platforms: PlatformId[]) => void;
  generate: () => Promise<void>;
  publish: () => Promise<void>;
  schedule: (scheduledAt: string) => Promise<void>;
  reset: () => void;
}

export const useComposeStore = create<ComposeState>((set, get) => ({
  text: '',
  selectedPostTypeId: null,
  targetPlatforms: [],
  generatedContent: null,
  generating: false,
  publishing: false,
  scheduling: false,
  error: null,

  setText: (text: string) => set({ text }),

  setPostType: (id: string, platforms: PlatformId[]) =>
    set({ selectedPostTypeId: id, targetPlatforms: platforms }),

  generate: async () => {
    const { text, selectedPostTypeId, targetPlatforms } = get();
    if (!text || !selectedPostTypeId) return;

    set({ generating: true, error: null });
    try {
      const content = await api.post<GeneratedContent>('/content/generate', {
        userInput: text,
        postTypeId: selectedPostTypeId,
        targetPlatforms,
      });
      set({ generatedContent: content, generating: false });
    } catch (e) {
      set({ error: (e as Error).message, generating: false });
    }
  },

  publish: async () => {
    const { text, selectedPostTypeId, targetPlatforms, generatedContent } = get();
    set({ publishing: true, error: null });
    try {
      await api.post('/posts/publish', {
        originalContent: text,
        postTypeId: selectedPostTypeId,
        targetPlatforms,
        adaptedContent: generatedContent?.drafts,
      });
      set({ publishing: false });
      get().reset();
    } catch (e) {
      set({ error: (e as Error).message, publishing: false });
    }
  },

  schedule: async (scheduledAt: string) => {
    const { text, selectedPostTypeId, targetPlatforms, generatedContent } = get();
    set({ scheduling: true, error: null });
    try {
      await api.post('/schedule', {
        originalContent: text,
        postTypeId: selectedPostTypeId,
        targetPlatforms,
        adaptedContent: generatedContent?.drafts,
        scheduledAt,
      });
      set({ scheduling: false });
      get().reset();
    } catch (e) {
      set({ error: (e as Error).message, scheduling: false });
    }
  },

  reset: () =>
    set({
      text: '',
      selectedPostTypeId: null,
      targetPlatforms: [],
      generatedContent: null,
      generating: false,
      error: null,
    }),
}));
