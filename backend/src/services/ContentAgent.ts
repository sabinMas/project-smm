import { CerebrasProvider } from '@/providers/CerebrasProvider';
import { BedrockProvider } from '@/providers/BedrockProvider';
import { contentAdapter } from './ContentAdapter';
import type { ContentPrompt, GeneratedContent, PlatformId } from '@smm/shared';

export class ContentAgent {
  private cerebras: CerebrasProvider;
  private bedrock: BedrockProvider;

  constructor() {
    this.cerebras = new CerebrasProvider();
    this.bedrock = new BedrockProvider();
  }

  async generate(prompt: ContentPrompt): Promise<GeneratedContent> {
    let text = '';
    let provider: 'cerebras' | 'bedrock' = 'cerebras';

    try {
      text = await this.cerebras.generate(this.buildPrompt(prompt));
    } catch (e) {
      console.warn('Cerebras failed, falling back to Bedrock:', e);
      provider = 'bedrock';
      text = await this.bedrock.generate(this.buildPrompt(prompt));
    }

    const drafts = prompt.targetPlatforms.map((platform) => ({
      platform,
      adaptedContent: contentAdapter.adapt(text, platform),
    }));

    return {
      drafts,
      modelUsed: provider === 'cerebras' ? 'cerebras/llama-3.3-70b' : 'claude-3-sonnet',
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
