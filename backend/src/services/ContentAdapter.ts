import type { AdaptedContent, PlatformId } from '@smm/shared';

const LIMITS: Record<PlatformId, number> = {
  x: 280,
  linkedin: 3000,
  instagram: 2200,
  threads: 500,
  bluesky: 300,
  facebook: 63206,
  tiktok: 2200,
};

export class ContentAdapter {
  adapt(text: string, platform: PlatformId): AdaptedContent {
    const limit = LIMITS[platform] ?? 1000;
    let adapted = text;
    const warnings: string[] = [];

    if (text.length > limit) {
      adapted = text.slice(0, limit - 3) + '...';
      warnings.push(`Content exceeds ${platform} limit, truncated`);
    } else if (text.length > limit * 0.9) {
      warnings.push(`Approaching ${platform} character limit`);
    }

    let hashtags: string[] | undefined;
    if (platform === 'instagram') {
      const hashtagPattern = /#[\w]+/g;
      hashtags = adapted.match(hashtagPattern)?.map((tag) => tag.slice(1)) ?? [];
      adapted = adapted.replace(hashtagPattern, '').trim();
    }

    return {
      platform,
      text: adapted,
      hashtags,
      characterCount: adapted.length,
      characterLimit: limit,
      isValid: adapted.length <= limit,
      warnings,
    };
  }
}

export const contentAdapter = new ContentAdapter();
