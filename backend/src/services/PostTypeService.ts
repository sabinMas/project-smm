import { prisma } from '@/lib/db';
import type { FormattingPreferences, PlatformId } from '@smm/shared';

export class PostTypeService {
  // Prisma Json fields come back already parsed — no JSON.parse needed
  private toPrefs(val: unknown): FormattingPreferences {
    return val as FormattingPreferences;
  }

  private toJson(prefs: FormattingPreferences) {
    return prefs as unknown as import('@prisma/client').Prisma.JsonObject;
  }

  async getUserPostTypes(userId: string) {
    const pts = await prisma.postType.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return pts.map((pt) => ({
      ...pt,
      targetPlatforms: pt.targetPlatforms as PlatformId[],
      formattingPreferences: this.toPrefs(pt.formattingPreferencesJson),
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
      data: { userId, name, targetPlatforms, toneDescriptor, formattingPreferencesJson: this.toJson(formattingPreferences) },
    });
  }

  async updatePostType(
    postTypeId: string,
    data: Partial<{ name: string; targetPlatforms: PlatformId[]; toneDescriptor: string; formattingPreferences: FormattingPreferences }>
  ) {
    const { formattingPreferences, ...rest } = data;
    return prisma.postType.update({
      where: { id: postTypeId },
      data: {
        ...rest,
        ...(formattingPreferences ? { formattingPreferencesJson: this.toJson(formattingPreferences) } : {}),
      },
    });
  }

  async deletePostType(postTypeId: string) {
    return prisma.postType.delete({ where: { id: postTypeId } });
  }
}

export const postTypeService = new PostTypeService();
