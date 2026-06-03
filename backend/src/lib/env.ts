import { z } from 'zod';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root (works whether running from backend/ or root)
dotenv.config({ path: resolve(process.cwd(), '../.env') });
dotenv.config(); // fallback: local .env in cwd

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  // Comma-separated list of allowed CORS origins (the deployed frontend URL).
  // Defaults to the local Vite dev server.
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Public URL of this backend, used to build OAuth callback URLs.
  PUBLIC_BACKEND_URL: z.string().url().default('http://localhost:3000'),
  // AWS is optional — Bedrock is fallback only; Cerebras is primary
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  // Cerebras — required for content generation
  CEREBRAS_API_KEY: z.string(),
  CEREBRAS_MODEL: z.string().default('llama-3.3-70b'),
  // Platform OAuth credentials — all optional; only needed for live posting
  X_CLIENT_ID: z.string().optional(),
  X_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  INSTAGRAM_APP_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  BLUESKY_HANDLE: z.string().optional(),
  BLUESKY_APP_PASSWORD: z.string().optional(),
  // External integrations — optional
  VAPI_API_KEY: z.string().optional(),
  APIFY_API_TOKEN: z.string().optional(),
  // Token storage encryption
  ENCRYPTION_KEY: z.string().min(32).optional(),
  // Session secret for express-session (use a random 32+ char string in prod)
  SESSION_SECRET: z.string().min(16).default('dev-session-secret-change-me!!'),
  // Google OAuth — optional; enables "Sign in with Google"
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  // GitHub OAuth — optional; enables "Sign in with GitHub"
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
