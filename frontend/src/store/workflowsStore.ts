import { create } from 'zustand';
import type { WorkflowLog, WorkflowResult } from '@smm/shared';
import { api } from '@/api/client';

interface WorkflowsState {
  workflows: WorkflowLog[];
  activeWorkflow: WorkflowResult | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  execute: (instruction: string, postTypeId?: string) => Promise<void>;
  getLog: (workflowId: string) => Promise<void>;
}

export const useWorkflowsStore = create<WorkflowsState>((set) => ({
  workflows: [],
  activeWorkflow: null,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const workflows = await api.get<WorkflowLog[]>('/workflows');
      set({ workflows, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  execute: async (instruction: string, postTypeId?: string) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<WorkflowResult>('/workflows/execute', {
        instruction,
        context: { postTypeId },
      });
      set({ activeWorkflow: result, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  getLog: async (workflowId: string) => {
    try {
      const result = await api.get<WorkflowResult>(`/workflows/${workflowId}`);
      set({ activeWorkflow: result });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
