import { prisma } from '@/lib/db';
import type { PostType, FormattingPreferences, PlatformId } from '@smm/shared';

export class PostTypeService {
  private parsePreferences(json: string): FormattingPreferences {
    return JSON.parse(json);
  }

  private stringifyPreferences(prefs: FormattingPreferences): string {
    return JSON.stringify(prefs);
  }

  async getDefaultPostTypes(userId: string) {
    const pts = await prisma.postType.findMany({
      where: { userId, isDefault: true },
    });
    return pts.map((pt) => ({
      ...pt,
      targetPlatforms: pt.targetPlatforms as PlatformId[],
      formattingPreferences: this.parsePreferences(pt.formattingPreferencesJson),
    }));
  }

  async getUserPostTypes(userId: string) {
    const pts = await prisma.postType.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return pts.map((pt) => ({
      ...pt,
      targetPlatforms: pt.targetPlatforms as PlatformId[],
      formattingPreferences: this.parsePreferences(pt.formattingPreferencesJson),
    }));
  }

  async createPostType(
    userId: string,
    name: string,
    targetPlatforms: PlatformId[],
    toneDescriptor: string,
    formattingPreferences: FormattingPreferences
  ) {
    return prisma.postType.create({
      data: {
        userId,
        name,
        targetPlatforms,
        toneDescriptor,
        formattingPreferencesJson: this.stringifyPreferences(formattingPreferences),
      },
    });
  }

  async updatePostType(
    postTypeId: string,
    data: Partial<{
      name: string;
      targetPlatforms: PlatformId[];
      toneDescriptor: string;
      formattingPreferences: FormattingPreferences;
    }>
  ) {
    const updateData: any = { ...data };
    if (data.formattingPreferences) {
      updateData.formattingPreferencesJson = this.stringifyPreferences(data.formattingPreferences);
      delete updateData.formattingPreferences;
    }
    return prisma.postType.update({
      where: { id: postTypeId },
      data: updateData,
    });
  }

  async deletePostType(postTypeId: string) {
    return prisma.postType.delete({
      where: { id: postTypeId },
    });
  }
}

export const postTypeService = new PostTypeService();
