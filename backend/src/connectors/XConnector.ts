import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class XConnector extends BasePlatformConnector {
  platformId: PlatformId = 'x';
  private bearerToken = '';

  setBearerToken(token: string) {
    this.bearerToken = token;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.bearerToken) {
      return { success: false, error: 'No bearer token set' };
    }

    if (content.text.length > 280) {
      return { success: false, error: 'X has a 280 character limit' };
    }

    try {
      const res = await this.makeRequest<{ data: { id: string } }>(
        'https://api.twitter.com/2/tweets',
        'POST',
        { text: content.text },
        { Authorization: `Bearer ${this.bearerToken}` }
      );

      return {
        success: true,
        platformPostId: res.data.id,
        publishedAt: new Date(),
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
