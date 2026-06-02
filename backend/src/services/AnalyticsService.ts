import { prisma } from '@/lib/db';
import { connectionService } from './ConnectionService';
import { XConnector } from '@/connectors/XConnector';
import { LinkedInConnector } from '@/connectors/LinkedInConnector';
import type { PlatformId, DashboardMetrics, EngagementMetrics } from '@smm/shared';

export class AnalyticsService {
  async collectMetrics(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { postType: true },
    });
    if (!post || post.status !== 'published') return;

    const platforms = post.postType.targetPlatforms as PlatformId[];
    for (const platform of platforms) {
      try {
        const conn = await connectionService.getConnection(post.userId, platform);
        if (!conn || conn.status !== 'active') continue;

        const platformPostId = (post as any).platformPostIds?.[platform];
        if (!platformPostId) continue;

        const metrics = await this.fetchPlatformMetrics(post.userId, platform, platformPostId);
        if (!metrics) continue;

        await prisma.postMetrics.upsert({
          where: { postId_platformId: { postId, platformId: platform } },
          update: {
            likes: metrics.likes,
            shares: metrics.shares,
            comments: metrics.comments,
            impressions: metrics.impressions,
            collectedAt: new Date(),
          },
          create: {
            postId,
            platformId: platform,
            platformPostId,
            likes: metrics.likes,
            shares: metrics.shares,
            comments: metrics.comments,
            impressions: metrics.impressions,
          },
        });
      } catch (e) {
        console.error(`Failed to collect metrics for ${platform}:`, e);
      }
    }
  }

  async getDashboardMetrics(userId: string, from: Date, to: Date): Promise<DashboardMetrics> {
    const metrics = await prisma.postMetrics.findMany({
      where: {
        post: { userId },
        collectedAt: { gte: from, lte: to },
      },
      include: { post: true },
      orderBy: { collectedAt: 'asc' },
    });

    const aggregate = {
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalImpressions: 0,
      byPlatform: {} as Record<string, EngagementMetrics>,
    };

    for (const m of metrics) {
      aggregate.totalLikes += m.likes;
      aggregate.totalShares += m.shares;
      aggregate.totalComments += m.comments;
      aggregate.totalImpressions += m.impressions;
      aggregate.byPlatform[m.platformId] = {
        likes: m.likes,
        shares: m.shares,
        comments: m.comments,
        impressions: m.impressions,
        platform: m.platformId as PlatformId,
        collectedAt: m.collectedAt,
      };
    }

    // Build daily engagement buckets
    const byDay = new Map<string, { date: Date; likes: number; shares: number; comments: number; impressions: number }>();
    for (const m of metrics) {
      const day = m.collectedAt.toISOString().slice(0, 10);
      const existing = byDay.get(day) ?? { date: new Date(day), likes: 0, shares: 0, comments: 0, impressions: 0 };
      existing.likes += m.likes;
      existing.shares += m.shares;
      existing.comments += m.comments;
      existing.impressions += m.impressions;
      byDay.set(day, existing);
    }

    return {
      period: { from, to },
      aggregate,
      topPosts: [],
      engagementByDay: [...byDay.values()],
    };
  }

  private async fetchPlatformMetrics(
    userId: string,
    platform: PlatformId,
    platformPostId: string
  ): Promise<EngagementMetrics | null> {
    const conn = await connectionService.getConnection(userId, platform);
    if (!conn) return null;
    const tokenData = JSON.parse(conn.encryptedTokenData);

    try {
      switch (platform) {
        case 'x': {
          const c = new XConnector();
          c.setBearerToken(tokenData.accessToken);
          return await c.getMetrics(platformPostId);
        }
        case 'linkedin': {
          const c = new LinkedInConnector();
          c.setAccessToken(tokenData.accessToken);
          return await c.getMetrics(platformPostId);
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
