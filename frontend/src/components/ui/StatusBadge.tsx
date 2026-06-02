import clsx from 'clsx';
import type { PostStatus } from '@smm/shared';

const CONFIG: Record<PostStatus, { label: string; color: string; dot: string }> = {
  draft: { label: 'Draft', color: 'bg-white/10 text-white/60', dot: 'bg-white/40' },
  scheduled: { label: 'Scheduled', color: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-400' },
  publishing: { label: 'Publishing', color: 'bg-brand-500/20 text-brand-500', dot: 'bg-brand-500 animate-pulse' },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400', dot: 'bg-green-400' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-white/10 text-white/40', dot: 'bg-white/30' },
};

interface Props {
  status: PostStatus;
}

export default function StatusBadge({ status }: Props) {
  const c = CONFIG[status];
  return (
    <span className={clsx('badge', c.color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}
