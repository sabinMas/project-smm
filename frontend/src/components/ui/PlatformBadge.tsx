import clsx from 'clsx';
import type { PlatformId } from '@smm/shared';

const META: Record<PlatformId, { label: string; color: string; icon: string }> = {
  x: { label: 'X', color: 'bg-white/10 text-white', icon: '𝕏' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-600/20 text-blue-400', icon: 'in' },
  facebook: { label: 'Facebook', color: 'bg-blue-500/20 text-blue-300', icon: 'f' },
  instagram: { label: 'Instagram', color: 'bg-pink-500/20 text-pink-400', icon: '◈' },
  threads: { label: 'Threads', color: 'bg-white/10 text-white/80', icon: '@' },
  tiktok: { label: 'TikTok', color: 'bg-teal-500/20 text-teal-400', icon: '♪' },
  bluesky: { label: 'Bluesky', color: 'bg-sky-500/20 text-sky-400', icon: '☁' },
};

interface Props {
  platform: PlatformId;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function PlatformBadge({ platform, size = 'md', showLabel = true }: Props) {
  const m = META[platform];
  return (
    <span
      className={clsx(
        'badge font-mono',
        m.color,
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
      )}
    >
      <span>{m.icon}</span>
      {showLabel && <span>{m.label}</span>}
    </span>
  );
}

export { META as PLATFORM_META };
