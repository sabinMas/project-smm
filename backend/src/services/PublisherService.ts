import { prisma } from '@/lib/db';
import { connectionService } from './ConnectionService';
import { XConnector } from '@/connectors/XConnector';
import { LinkedInConnector } from '@/connectors/LinkedInConnector';
import { FacebookConnector } from '@/connectors/FacebookConnector';
import { InstagramConnector } from '@/connectors/InstagramConnector';
import { ThreadsConnector } from '@/connectors/ThreadsConnector';
import { TikTokConnector } from '@/connectors/TikTokConnector';
import { BlueskyConnector } from '@/connectors/BlueskyConnector';
import type { PlatformId, PlatformContent } from '@smm/shared';

const MAX_RETRIES = 3;

export class PublisherService {
  async publishPost(postId: string): Promise<{ success: boolean; results: Record<string, boolean> }> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { adaptedContent: true, postType: true },
    });

    if (!post) throw new Error(`Post ${postId} not found`);

    await prisma.post.update({ where: { id: postId }, data: { status: 'publishing' } });

    const results: Record<string, boolean> = {};
    const platforms = post.postType.targetPlatforms as PlatformId[];

    for (const platform of platforms) {
      const adapted = post.adaptedContent.find((ac) => ac.platformId === platform);
      const content: PlatformContent = {
        text: adapted?.adaptedText ?? post.originalContent,
        hashtags: adapted?.hashtags ?? [],
      };

      let attempt = 0;
      let success = false;

      while (attempt < MAX_RETRIES && !success) {
        attempt++;
        try {
          const connector = await this.getConnector(post.userId, platform);
          if (!connector) {
            await this.logAttempt(postId, platform, attempt, false, 'Platform not connected');
            break;
          }

          const result = await connector.publish(content);
          success = result.success;

          await this.logAttempt(postId, platform, attempt, success, result.error);

          if (success && result.platformPostId) {
            await prisma.post.update({
              where: { id: postId },
              data: {
                platformPostIds: {
                  ...(post as any).platformPostIds,
                  [platform]: result.platformPostId,
                },
              },
            });
          }
        } catch (e) {
          await this.logAttempt(postId, platform, attempt, false, (e as Error).message);
          if (attempt < MAX_RETRIES) await this.sleep(1000 * 2 ** attempt);
        }
      }

      results[platform] = success;
    }

    const allSucceeded = Object.values(results).every(Boolean);
    const anySucceeded = Object.values(results).some(Boolean);

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: allSucceeded ? 'published' : anySucceeded ? 'published' : 'failed',
        publishedAt: anySucceeded ? new Date() : undefined,
      },
    });

    return { success: allSucceeded, results };
  }

  private async logAttempt(
    postId: string,
    platformId: string,
    attemptNumber: number,
    success: boolean,
    error?: string
  ) {
    await prisma.publishAttempt.create({
      data: { postId, platformId, attemptNumber, status: success ? 'success' : 'failed', error },
    });
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  private async getConnector(userId: string, platform: PlatformId) {
    const conn = await connectionService.getConnection(userId, platform);
    if (!conn || conn.status !== 'active') return null;

    const tokenData = JSON.parse(conn.encryptedTokenData);

    switch (platform) {
      case 'x': {
        const c = new XConnector();
        c.setBearerToken(tokenData.accessToken);
        return c;
      }
      case 'linkedin': {
        const c = new LinkedInConnector();
        c.setAccessToken(tokenData.accessToken);
        return c;
      }
      case 'facebook': {
        const c = new FacebookConnector();
        c.setCredentials(tokenData.accessToken, tokenData.pageId);
        return c;
      }
      case 'instagram': {
        const c = new InstagramConnector();
        c.setCredentials(tokenData.accessToken, tokenData.businessAccountId);
        return c;
      }
      case 'threads': {
        const c = new ThreadsConnector();
        c.setCredentials(tokenData.accessToken, tokenData.userId);
        return c;
      }
      case 'tiktok': {
        const c = new TikTokConnector();
        c.setAccessToken(tokenData.accessToken);
        return c;
      }
      case 'bluesky': {
        const c = new BlueskyConnector();
        c.setCredentials(tokenData.accessToken, tokenData.did);
        return c;
      }
    }
  }

  // Poll loop for when SQS is not configured
  startPollLoop(intervalMs = 30000) {
    console.log('📬 Publisher poll loop started (every 30s)');
    setInterval(async () => {
      const { schedulerService } = await import('./SchedulerService');
      const dueIds = await schedulerService.getDuePostIds();
      for (const id of dueIds) {
        console.log(`Publishing scheduled post ${id}`);
        await this.publishPost(id).catch((e) => console.error(`Publish failed for ${id}:`, e));
      }
    }, intervalMs);
  }
}

export const publisherService = new PublisherService();
