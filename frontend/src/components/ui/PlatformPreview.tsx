import type { AdaptedContent, PlatformId } from '@smm/shared';
import { clsx } from 'clsx';

const PLATFORM_COLORS: Record<PlatformId, string> = {
  x: 'border-white/30',
  linkedin: 'border-blue-500/40',
  facebook: 'border-blue-600/40',
  instagram: 'border-pink-500/40',
  threads: 'border-white/30',
  tiktok: 'border-rose-500/40',
  bluesky: 'border-sky-500/40',
};

const PLATFORM_NAMES: Record<PlatformId, string> = {
  x: 'X',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  threads: 'Threads',
  tiktok: 'TikTok',
  bluesky: 'Bluesky',
};

interface PlatformPreviewProps {
  platform: PlatformId;
  content: AdaptedContent;
}

export default function PlatformPreview({ platform, content }: PlatformPreviewProps) {
  const isOverLimit = content.characterCount > content.characterLimit;

  return (
    <div className={clsx('card border-l-4', PLATFORM_COLORS[platform])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/70">{PLATFORM_NAMES[platform]}</span>
        <span
          className={clsx(
            'text-xs',
            isOverLimit ? 'text-red-400' : 'text-white/40'
          )}
        >
          {content.characterCount}/{content.characterLimit}
        </span>
      </div>
      <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{content.text}</p>
      {content.hashtags && content.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {content.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-brand-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {content.warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {content.warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-400">
              ⚠️ {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
