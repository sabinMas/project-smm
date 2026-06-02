import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export class ConnectionService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!!';
  }

  async getConnection(userId: string, platformId: string) {
    return await prisma.platformConnection.findFirst({
      where: { userId, platformId },
    });
  }

  async storeConnection(userId: string, platformId: string, tokenData: Record<string, unknown>) {
    const encryptedData = JSON.stringify(tokenData);
    return await prisma.platformConnection.create({
      data: {
        userId,
        platformId,
        platformUsername: tokenData.username as string || 'unknown',
        encryptedTokenData: encryptedData,
      },
    });
  }

  async updateConnection(connectionId: string, tokenData: Record<string, unknown>) {
    return await prisma.platformConnection.update({
      where: { id: connectionId },
      data: {
        encryptedTokenData: JSON.stringify(tokenData),
        lastRefreshedAt: new Date(),
      },
    });
  }

  async getUserConnections(userId: string) {
    return await prisma.platformConnection.findMany({
      where: { userId },
      orderBy: { connectedAt: 'desc' },
    });
  }

  async deleteConnection(connectionId: string) {
    return await prisma.platformConnection.delete({
      where: { id: connectionId },
    });
  }
}

export const connectionService = new ConnectionService();
