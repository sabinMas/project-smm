import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class InstagramConnector extends BasePlatformConnector {
  platformId: PlatformId = 'instagram';
  private accessToken = '';
  private businessAccountId = '';

  setCredentials(accessToken: string, businessAccountId: string) {
    this.accessToken = accessToken;
    this.businessAccountId = businessAccountId;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.accessToken || !this.businessAccountId) {
      return { success: false, error: 'Missing credentials' };
    }

    try {
      let caption = content.text;
      if (content.hashtags && content.hashtags.length > 0) {
        caption += '\n\n' + content.hashtags.map((tag) => `#${tag}`).join(' ');
      }

      const res = await this.makeRequest<{ id: string }>(
        `https://graph.instagram.com/v19.0/${this.businessAccountId}/media`,
        'POST',
        {
          image_url: content.mediaUrls?.[0],
          caption,
          access_token: this.accessToken,
        },
        {}
      );

      return {
        success: true,
        platformPostId: res.id,
        publishedAt: new Date(),
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
