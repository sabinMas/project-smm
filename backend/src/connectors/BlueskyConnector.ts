import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class BlueskyConnector extends BasePlatformConnector {
  platformId: PlatformId = 'bluesky';
  private accessToken = '';
  private did = '';

  setCredentials(accessToken: string, did: string) {
    this.accessToken = accessToken;
    this.did = did;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.accessToken || !this.did) {
      return { success: false, error: 'Missing credentials' };
    }

    if (content.text.length > 300) {
      return { success: false, error: 'Bluesky has a 300 character limit' };
    }

    try {
      const res = await this.makeRequest<{ uri: string; cid: string }>(
        'https://bsky.social/xrpc/com.atproto.repo.createRecord',
        'POST',
        {
          repo: this.did,
          collection: 'app.bsky.feed.post',
          record: {
            text: content.text,
            createdAt: new Date().toISOString(),
          },
        },
        { Authorization: `Bearer ${this.accessToken}` }
      );

      return {
        success: true,
        platformPostId: res.uri,
        publishedAt: new Date(),
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
