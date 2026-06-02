import type {
  PlatformId,
  TokenData,
  AuthResult,
  PlatformContent,
  PublishResult,
  EngagementMetrics,
  ConnectionStatus,
} from '@smm/shared';
import axios from 'axios';

export abstract class BasePlatformConnector {
  abstract platformId: PlatformId;

  async refreshToken(_token: TokenData): Promise<TokenData> {
    throw new Error('Token refresh not implemented');
  }

  abstract publish(content: PlatformContent): Promise<PublishResult>;

  async getMetrics(_postId: string): Promise<EngagementMetrics> {
    return {
      likes: 0,
      shares: 0,
      comments: 0,
      impressions: 0,
      platform: this.platformId,
      collectedAt: new Date(),
    };
  }

  async validateConnection(): Promise<ConnectionStatus> {
    return {
      platformId: this.platformId,
      connected: true,
      lastChecked: new Date(),
    };
  }

  protected async makeRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      const res = await axios({
        url,
        method,
        data,
        headers: { 'Content-Type': 'application/json', ...headers },
        timeout: 10000,
      });
      return res.data as T;
    } catch (e) {
      console.error(`${this.platformId} request failed:`, e);
      throw new Error(`${this.platformId} API error: ${(e as Error).message}`);
    }
  }
}
