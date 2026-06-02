import type { PlatformId } from './platform';
import type { AdaptedContent } from './content';

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';

export interface ScheduledPost {
  id: string;
  userId: string;
  postTypeId: string;
  originalContent: string;
  adaptedContent: Partial<Record<PlatformId, AdaptedContent>>;
  targetPlatforms: PlatformId[];
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  platformPostIds: Partial<Record<PlatformId, string>>;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleResult {
  scheduleId: string;
  scheduledAt: Date;
  targetPlatforms: PlatformId[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PublishAttempt {
  id: string;
  postId: string;
  platformId: PlatformId;
  status: 'success' | 'failed';
  attemptNumber: number;
  error?: string;
  timestamp: Date;
}
