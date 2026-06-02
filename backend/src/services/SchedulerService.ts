import { SQSClient, SendMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export class SchedulerService {
  private sqs: SQSClient | null;
  private queueUrl: string;

  constructor() {
    this.queueUrl = process.env.SQS_QUEUE_URL || '';
    this.sqs = env.AWS_ACCESS_KEY_ID
      ? new SQSClient({ region: env.AWS_REGION })
      : null;
  }

  async schedulePost(postId: string, scheduledAt: Date): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'scheduled', scheduledAt },
    });

    if (this.sqs && this.queueUrl) {
      const delaySeconds = Math.max(
        0,
        Math.min(900, Math.floor((scheduledAt.getTime() - Date.now()) / 1000))
      );
      await this.sqs.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify({ postId, scheduledAt: scheduledAt.toISOString() }),
          DelaySeconds: delaySeconds,
        })
      );
    }
    // Without SQS: a poll loop in PublisherService handles it
  }

  async cancelPost(postId: string): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'cancelled' },
    });
  }

  async getDuePostIds(): Promise<string[]> {
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { lte: new Date() },
      },
      select: { id: true },
    });
    return posts.map((p) => p.id);
  }
}

export const schedulerService = new SchedulerService();
