import axios from 'axios';
import { env } from '@/lib/env';

export interface GenerationResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

export class CerebrasProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string = env.CEREBRAS_API_KEY, model: string = env.CEREBRAS_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    try {
      const res = await axios.post<GenerationResponse>(
        'https://api.cerebras.ai/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert social media content creator. Write engaging, authentic, platform-optimized content.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } }
      );

      return res.data.choices[0]?.message.content ?? '';
    } catch (e) {
      console.error('Cerebras generation failed:', e);
      throw new Error(`Cerebras generation failed: ${(e as Error).message}`);
    }
  }
}
