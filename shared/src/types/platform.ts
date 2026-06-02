export type PlatformId =
  | 'x'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'threads'
  | 'tiktok'
  | 'bluesky';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  platformId: PlatformId;
}

export interface AuthResult {
  success: boolean;
  token?: TokenData;
  error?: string;
}

export interface ConnectionStatus {
  platformId: PlatformId;
  connected: boolean;
  lastChecked: Date;
}

export type PlatformConnectionStatus = 'active' | 'expired' | 'disconnected' | 'error';

export interface PlatformConnection {
  id: string;
  userId: string;
  platformId: PlatformId;
  status: PlatformConnectionStatus;
  platformUsername: string;
  connectedAt: Date;
  lastRefreshedAt: Date;
}

export interface PlatformConnector {
  platformId: PlatformId;
  authenticate(credentials: OAuthCredentials): Promise<AuthResult>;
  refreshToken(token: TokenData): Promise<TokenData>;
  publish(content: PlatformContent): Promise<PublishResult>;
  getMetrics(postId: string): Promise<EngagementMetrics>;
  validateConnection(): Promise<ConnectionStatus>;
}

export interface OAuthCredentials {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}

export interface PlatformContent {
  text: string;
  hashtags?: string[];
  mediaUrls?: string[];
  embeddedLinks?: EmbeddedLink[];
}

export interface EmbeddedLink {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  publishedAt?: Date;
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
  platform: PlatformId;
  collectedAt: Date;
}
