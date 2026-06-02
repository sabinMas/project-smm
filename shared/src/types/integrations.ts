import type { VoiceTranscription, TrendData } from './content';

export interface TrendQuery {
  keywords: string[];
  platforms?: string[];
  maxResults?: number;
}

export interface CompetitorContent {
  url: string;
  text: string;
  platform: string;
  engagementScore?: number;
  scrapedAt: Date;
}

export interface VapiIntegration {
  transcribeVoiceInput(audioStream: ReadableStream): Promise<VoiceTranscription>;
  isConfigured(): boolean;
}

export interface ApifyIntegration {
  researchTrends(query: TrendQuery): Promise<TrendData>;
  scrapeCompetitorContent(targets: string[]): Promise<CompetitorContent[]>;
  isConfigured(): boolean;
}

export type IntegrationId = 'vapi' | 'apify';

export interface IntegrationStatus {
  id: IntegrationId;
  name: string;
  configured: boolean;
  lastUsed?: Date;
  error?: string;
}
