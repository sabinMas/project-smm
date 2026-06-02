import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class LinkedInConnector extends BasePlatformConnector {
  platformId: PlatformId = 'linkedin';
  private accessToken = '';

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.accessToken) {
      return { success: false, error: 'No access token set' };
    }

    if (content.text.length > 3000) {
      return { success: false, error: 'LinkedIn has a 3000 character limit' };
    }

    try {
      const res = await this.makeRequest<{ id: string }>(
        'https://api.linkedin.com/v2/ugcPosts',
        'POST',
        {
          author: `urn:li:person:${this.accessToken}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.PublishContent': {
              shareCommentary: { text: content.text },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        },
        { Authorization: `Bearer ${this.accessToken}` }
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
