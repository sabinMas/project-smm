import { prisma } from '@/lib/db';
import type { PlatformId, PlatformConnectionStatus } from '@smm/shared';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32chars-long-minimum!!!';

export class ConnectionService {
  private encrypt(text: string): string {
    if (process.env.NODE_ENV === 'development') return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32)), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    if (process.env.NODE_ENV === 'development') return text;
    const [iv, encrypted] = text.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32)),
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async createConnection(
    userId: string,
    platformId: PlatformId,
    tokenData: string,
    platformUsername: string
  ) {
    return prisma.platformConnection.create({
      data: {
        userId,
        platformId,
        encryptedTokenData: this.encrypt(tokenData),
        platformUsername,
        status: 'active',
      },
    });
  }

  async getConnection(userId: string, platformId: PlatformId) {
    const conn = await prisma.platformConnection.findUnique({
      where: { userId_platformId: { userId, platformId } },
    });
    if (conn) {
      conn.encryptedTokenData = this.decrypt(conn.encryptedTokenData);
    }
    return conn;
  }

  async getUserConnections(userId: string) {
    const conns = await prisma.platformConnection.findMany({
      where: { userId },
    });
    return conns.map((c) => ({
      ...c,
      encryptedTokenData: this.decrypt(c.encryptedTokenData),
    }));
  }

  async updateConnectionStatus(connectionId: string, status: PlatformConnectionStatus) {
    return prisma.platformConnection.update({
      where: { id: connectionId },
      data: { status, lastRefreshedAt: new Date() },
    });
  }

  async deleteConnection(connectionId: string) {
    return prisma.platformConnection.delete({
      where: { id: connectionId },
    });
  }
}

export const connectionService = new ConnectionService();
