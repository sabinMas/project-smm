import { prisma } from '@/lib/db';
import type { PostStatus } from '@smm/shared';

export class PostService {
  async createPost(
    userId: string,
    postTypeId: string,
    originalContent: string,
    targetPlatforms: string[]
  ) {
    return prisma.post.create({
      data: {
        userId,
        postTypeId,
        originalContent,
        status: 'draft',
      },
      include: { adaptedContent: true },
    });
  }

  async getPost(postId: string) {
    return prisma.post.findUnique({
      where: { id: postId },
      include: { adaptedContent: true, publishAttempts: true, metrics: true },
    });
  }

  async getUserPosts(userId: string) {
    return prisma.post.findMany({
      where: { userId },
      include: { adaptedContent: true, metrics: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScheduledPosts(userId: string, from: Date, to: Date) {
    return prisma.post.findMany({
      where: {
        userId,
        scheduledAt: { gte: from, lte: to },
      },
      include: { adaptedContent: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updatePostStatus(postId: string, status: PostStatus) {
    return prisma.post.update({
      where: { id: postId },
      data: { status, updatedAt: new Date() },
    });
  }

  async schedulePost(postId: string, scheduledAt: Date) {
    return prisma.post.update({
      where: { id: postId },
      data: { status: 'scheduled', scheduledAt },
    });
  }

  async publishPost(postId: string) {
    return prisma.post.update({
      where: { id: postId },
      data: { status: 'published', publishedAt: new Date() },
    });
  }

  async deletePost(postId: string) {
    return prisma.post.delete({
      where: { id: postId },
    });
  }
}

export const postService = new PostService();
