import { create } from 'zustand';
import type { ScheduledPost, PostStatus } from '@smm/shared';
import { mockPosts } from '@/api/mocks';

interface PostsState {
  posts: ScheduledPost[];
  loading: boolean;
  fetch: () => Promise<void>;
  addPost: (post: ScheduledPost) => void;
  updateStatus: (id: string, status: PostStatus) => void;
  deletePost: (id: string) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, 400));
    set({ posts: mockPosts, loading: false });
  },

  addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),

  updateStatus: (id, status) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date() } : p
      ),
    })),

  deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
}));
