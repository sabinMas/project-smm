import { prisma } from '@/lib/db';
import type { PlatformId, PlatformContent, AdaptedContent } from '@smm/shared';

export class ContentAdapter {
  async adaptContentForPlatforms(
    postId: string,
    originalContent: string,
    platforms: PlatformId[]
  ): Promise<AdaptedContent[]> {
    const adapted: AdaptedContent[] = [];

    for (const platform of platforms) {
      const { characterLimit, hashtagStyle } = this.getPlatformRules(platform);
      const text = this.truncateForPlatform(originalContent, characterLimit);
      const hashtags = hashtagStyle === 'none' ? [] : this.extractHashtags(text);

      await prisma.adaptedContent.create({
        data: {
          postId,
          platformId: platform,
          adaptedText: text,
          hashtags: hashtags ?? [],
          characterCount: text.length,
          characterLimit,
          isValid: text.length <= characterLimit,
          warnings: [],
        },
      });

      adapted.push({
        platform,
        text,
        hashtags: hashtags ?? [],
        characterCount: text.length,
        characterLimit,
        isValid: text.length <= characterLimit,
        warnings: [],
      });
    }

    return adapted;
  }

  private getPlatformRules(platform: PlatformId) {
    const rules: Record<PlatformId, { characterLimit: number; hashtagStyle: string }> = {
      x: { characterLimit: 280, hashtagStyle: 'moderate' },
      linkedin: { characterLimit: 3000, hashtagStyle: 'minimal' },
      facebook: { characterLimit: 2000, hashtagStyle: 'minimal' },
      instagram: { characterLimit: 2200, hashtagStyle: 'heavy' },
      threads: { characterLimit: 500, hashtagStyle: 'moderate' },
      tiktok: { characterLimit: 2200, hashtagStyle: 'heavy' },
      bluesky: { characterLimit: 300, hashtagStyle: 'moderate' },
    };
    return rules[platform];
  }

  private truncateForPlatform(text: string, limit: number): string {
    return text.length > limit ? text.slice(0, limit - 3) + '...' : text;
  }

  adapt(text: string, platform: PlatformId): AdaptedContent {
    const { characterLimit } = this.getPlatformRules(platform);
    const truncated = this.truncateForPlatform(text, characterLimit);
    const hashtags = this.extractHashtags(truncated);
    return { platform, text: truncated, hashtags, characterCount: truncated.length, characterLimit, isValid: truncated.length <= characterLimit, warnings: [] };
  }

  private extractHashtags(text: string): string[] {
    const matches = text.match(/#\w+/g);
    return matches ?? [];
  }
}

export const contentAdapter = new ContentAdapter();
