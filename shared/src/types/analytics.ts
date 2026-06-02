import type { PlatformId, EngagementMetrics } from './platform';
import type { DateRange } from './scheduling';

export interface AggregateMetrics {
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalImpressions: number;
  byPlatform: Partial<Record<PlatformId, EngagementMetrics>>;
}

export interface PostMetrics {
  id: string;
  postId: string;
  platformId: PlatformId;
  platformPostId: string;
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
  collectedAt: Date;
}

export interface PlatformMetricBreakdown {
  platform: PlatformId;
  metrics: EngagementMetrics;
}

export interface DashboardMetrics {
  period: DateRange;
  aggregate: AggregateMetrics;
  topPosts: PostMetrics[];
  engagementByDay: DailyEngagement[];
}

export interface DailyEngagement {
  date: Date;
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
}
