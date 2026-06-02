import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { env } from '@/lib/env';

export class BedrockProvider {
  private client: BedrockRuntimeClient;
  private model = 'anthropic.claude-3-sonnet-20240229-v1:0';

  constructor() {
    this.client = new BedrockRuntimeClient({ region: env.AWS_REGION });
  }

  async generate(prompt: string): Promise<string> {
    try {
      const input = {
        modelId: this.model,
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-06-01',
          max_tokens: 500,
          system:
            'You are an expert social media content creator. Write engaging, authentic, platform-optimized content.',
          messages: [{ role: 'user', content: prompt }],
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      const body = JSON.parse(new TextDecoder().decode(response.body));

      return body.content?.[0]?.text ?? '';
    } catch (e) {
      console.error('Bedrock generation failed:', e);
      throw new Error(`Bedrock generation failed: ${(e as Error).message}`);
    }
  }
}
