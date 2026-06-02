import { useEffect, useState } from 'react';
import { useWorkflowsStore } from '@/store/workflowsStore';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { ExecutionStep, WorkflowStatus, StepType, StepStatus } from '@smm/shared';

const STATUS_STYLES: Record<WorkflowStatus, { label: string; color: string }> = {
  running: { label: 'Running', color: 'text-yellow-400' },
  completed: { label: 'Completed', color: 'text-green-400' },
  partial: { label: 'Partial', color: 'text-orange-400' },
  failed: { label: 'Failed', color: 'text-red-400' },
};

function StepItem({ step }: { step: ExecutionStep }) {
  const typeIcons: Record<StepType, string> = { plan: '📋', tool_use: '🔧', reflection: '🤔' };
  const statusColors: Record<StepStatus, string> = { success: 'text-green-400', failed: 'text-red-400', retried: 'text-yellow-400' };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-lg" aria-hidden="true">
        {typeIcons[step.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90">{step.description}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
          <span className={statusColors[step.status]}>{step.status}</span>
          <span>{step.durationMs}ms</span>
          <span>{format(new Date(step.timestamp), 'HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowsPage() {
  const { workflows, activeWorkflow, loading, error, fetch, execute, getLog } = useWorkflowsStore();
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      execute(instruction.trim());
      setInstruction('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Agent Workflows</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Execute new workflow */}
      <form onSubmit={handleExecute} className="card space-y-3">
        <label htmlFor="workflow-instruction" className="text-sm text-white/60">
          Run a workflow
        </label>
        <div className="flex gap-3">
          <input
            id="workflow-instruction"
            className="input flex-1"
            placeholder='e.g. "Create a week of posts about AI trends"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading || !instruction.trim()}>
            {loading ? 'Running...' : '⚡ Execute'}
          </button>
        </div>
      </form>

      {/* Active workflow detail */}
      {activeWorkflow && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Current Workflow</h2>
            <span className={clsx('text-xs font-medium', STATUS_STYLES[activeWorkflow.status]?.color)}>
              {STATUS_STYLES[activeWorkflow.status]?.label}
            </span>
          </div>
          {activeWorkflow.summary && (
            <p className="text-sm text-white/70">{activeWorkflow.summary}</p>
          )}
          <div className="space-y-0">
            {activeWorkflow.steps.map((step: ExecutionStep) => (
              <StepItem key={step.stepId} step={step} />
            ))}
          </div>
        </div>
      )}

      {/* Workflow history */}
      <h2 className="text-lg font-semibold">History</h2>
      {loading && !workflows.length ? (
        <div className="text-center text-white/40 py-8">Loading...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center text-white/40 py-8">No workflows yet</div>
      ) : (
        <div className="space-y-2">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              className="card w-full text-left hover:bg-surface-2 transition-colors"
              onClick={() => getLog(wf.id)}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm truncate mr-4">{wf.instruction}</p>
                <span className={clsx('text-xs flex-shrink-0', STATUS_STYLES[wf.status]?.color)}>
                  {STATUS_STYLES[wf.status]?.label}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                {format(new Date(wf.startedAt), 'MMM d, HH:mm')} • {wf.steps.length} steps
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
