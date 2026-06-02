export type WorkflowStatus = 'running' | 'completed' | 'partial' | 'failed';
export type StepType = 'plan' | 'tool_use' | 'reflection';
export type StepStatus = 'success' | 'failed' | 'retried';

export interface WorkflowRequest {
  userId: string;
  instruction: string;
  context: WorkflowContext;
}

export interface WorkflowContext {
  postTypeId?: string;
  existingDraftId?: string;
  dateRange?: { from: string; to: string };
}

export interface WorkflowResult {
  workflowId: string;
  status: WorkflowStatus;
  steps: ExecutionStep[];
  summary: string;
  artifacts: WorkflowArtifact[];
}

export interface ExecutionStep {
  stepId: string;
  type: StepType;
  description: string;
  input: unknown;
  output: unknown;
  status: StepStatus;
  timestamp: Date;
  durationMs: number;
}

export interface WorkflowArtifact {
  type: 'post' | 'schedule' | 'analysis';
  id: string;
  summary: string;
}

export interface WorkflowLog {
  id: string;
  userId: string;
  instruction: string;
  status: WorkflowStatus;
  steps: ExecutionStep[];
  startedAt: Date;
  completedAt?: Date;
  summary?: string;
}
