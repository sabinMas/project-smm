import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class ThreadsConnector extends BasePlatformConnector {
  platformId: PlatformId = 'threads';
  private accessToken = '';
  private userId = '';

  setCredentials(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.accessToken || !this.userId) {
      return { success: false, error: 'Missing credentials' };
    }

    if (content.text.length > 500) {
      return { success: false, error: 'Threads has a 500 character limit' };
    }

    try {
      const res = await this.makeRequest<{ id: string }>(
        `https://graph.threads.com/v19.0/${this.userId}/threads`,
        'POST',
        { text: content.text, access_token: this.accessToken },
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
