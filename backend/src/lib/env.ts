import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  CEREBRAS_API_KEY: z.string(),
  CEREBRAS_MODEL: z.string().default('cerebras/llama-3.3-70b'),
  VAPI_API_KEY: z.string().optional(),
  APIFY_API_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
