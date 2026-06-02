import { BasePlatformConnector } from './BasePlatformConnector';
import type { PlatformContent, PublishResult, PlatformId } from '@smm/shared';

export class TikTokConnector extends BasePlatformConnector {
  platformId: PlatformId = 'tiktok';
  private accessToken = '';

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async publish(content: PlatformContent): Promise<PublishResult> {
    if (!this.accessToken) {
      return { success: false, error: 'No access token set' };
    }

    if (!content.mediaUrls || content.mediaUrls.length === 0) {
      return { success: false, error: 'TikTok videos require video content' };
    }

    try {
      const res = await this.makeRequest<{ data: { video_id: string } }>(
        'https://open.tiktokapis.com/v1/video/publish/',
        'POST',
        {
          video_url: content.mediaUrls[0],
          title: content.text.slice(0, 150),
          access_token: this.accessToken,
        },
        {}
      );

      return {
        success: true,
        platformPostId: res.data.video_id,
        publishedAt: new Date(),
      };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
