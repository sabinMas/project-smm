import type { PlatformId } from './platform';

export type HashtagStyle = 'aggressive' | 'moderate' | 'minimal';
export type LinkPlacement = 'inline' | 'end';
export type MentionStyle = 'formal' | 'casual';
export type HashtagStrategy = 'inline' | 'separated' | 'none';
export type LinkFormat = 'raw' | 'embedded-card' | 'preview';

export interface FormattingPreferences {
  useEmojis: boolean;
  hashtagStyle: HashtagStyle;
  linkPlacement: LinkPlacement;
  mentionStyle: MentionStyle;
}

export interface PostType {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  targetPlatforms: PlatformId[];
  toneDescriptor: string;
  formattingPreferences: FormattingPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface DraftContent {
  originalText: string;
  postTypeId: string;
  mediaUrls?: string[];
  voiceTranscription?: string;
}

export interface AdaptedContent {
  platform: PlatformId;
  text: string;
  hashtags?: string[];
  mediaRequirements?: MediaRequirement[];
  characterCount: number;
  characterLimit: number;
  isValid: boolean;
  warnings: string[];
}

export interface MediaRequirement {
  type: 'image' | 'video';
  minWidth?: number;
  minHeight?: number;
  maxFileSizeMb?: number;
  allowedFormats: string[];
}

export interface PlatformConstraints {
  characterLimit: number;
  mediaFormats: string[];
  hashtagStrategy: HashtagStrategy;
  linkFormat: LinkFormat;
}

export interface ContentPrompt {
  userInput: string;
  postType: PostType;
  targetPlatforms: PlatformId[];
  voiceInput?: VoiceTranscription;
  trendContext?: TrendData;
}

export interface VoiceTranscription {
  text: string;
  confidence: number;
  language: string;
}

export interface TrendData {
  topics: TrendTopic[];
  hashtags: string[];
  collectedAt: Date;
}

export interface TrendTopic {
  name: string;
  volume: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface GeneratedContent {
  drafts: PlatformDraft[];
  modelUsed: string;
  providerId: 'bedrock' | 'cerebras';
}

export interface PlatformDraft {
  platform: PlatformId;
  adaptedContent: AdaptedContent;
}

export interface ContentSuggestion {
  text: string;
  rationale: string;
  suggestedPostTypeId: string;
}
