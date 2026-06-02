import { CerebrasProvider } from '@/providers/CerebrasProvider';
import { BedrockProvider } from '@/providers/BedrockProvider';
import { contentAdapter } from './ContentAdapter';
import { env } from '@/lib/env';
import type { ContentPrompt, GeneratedContent } from '@smm/shared';

export class ContentAgent {
  private cerebras: CerebrasProvider;
  private bedrock: BedrockProvider | null;

  constructor() {
    this.cerebras = new CerebrasProvider();
    // Only instantiate Bedrock if AWS credentials are present
    this.bedrock = env.AWS_ACCESS_KEY_ID ? new BedrockProvider() : null;
  }

  async generate(prompt: ContentPrompt): Promise<GeneratedContent> {
    let text = '';
    let provider: 'cerebras' | 'bedrock' = 'cerebras';

    try {
      text = await this.cerebras.generate(this.buildPrompt(prompt));
    } catch (e) {
      if (this.bedrock) {
        console.warn('Cerebras failed, falling back to Bedrock:', e);
        provider = 'bedrock';
        text = await this.bedrock.generate(this.buildPrompt(prompt));
      } else {
        throw new Error(`Content generation failed: ${(e as Error).message}`);
      }
    }

    const drafts = prompt.targetPlatforms.map((platform) => ({
      platform,
      adaptedContent: contentAdapter.adapt(text, platform),
    }));

    return {
      drafts,
      modelUsed: provider === 'cerebras' ? `cerebras/${env.CEREBRAS_MODEL}` : 'claude-3-sonnet',
      providerId: provider,
    };
  }

  private buildPrompt(prompt: ContentPrompt): string {
    let msg = `Create a ${prompt.postType.name} social media post.\n`;
    msg += `Tone: ${prompt.postType.toneDescriptor}\n`;
    msg += `Target platforms: ${prompt.targetPlatforms.join(', ')}\n`;
    msg += `User input: ${prompt.userInput}\n`;

    if (prompt.trendContext) {
      msg += `Trending topics: ${prompt.trendContext.topics.map((t) => t.name).join(', ')}\n`;
    }

    msg += '\nWrite the post now:';
    return msg;
  }
}

export const contentAgent = new ContentAgent();
