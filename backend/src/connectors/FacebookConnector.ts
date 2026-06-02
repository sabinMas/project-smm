import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class FacebookConnector extends BasePlatformConnector {
  platformId: PlatformId = 'facebook';
  private accessToken = '';
  private pageId = '';

  setCredentials(accessToken: string, pageId: string) {
    this.accessToken = accessToken;
    this.pageId = pageId;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.accessToken || !this.pageId) {
      return { success: false, error: 'Missing credentials' };
    }

    try {
      const res = await this.makeRequest<{ id: string }>(
        `https://graph.facebook.com/v19.0/${this.pageId}/feed`,
        'POST',
        { message: content.text, access_token: this.accessToken },
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
