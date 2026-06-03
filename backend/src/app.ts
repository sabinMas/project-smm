import express, { Request, Response, NextFunction } from 'express';
import expressWs from 'express-ws';
import { prisma } from '@/lib/db';
import { postService } from '@/services/PostService';
import { connectionService } from '@/services/ConnectionService';
import { postTypeService } from '@/services/PostTypeService';
import { contentAgent } from '@/services/ContentAgent';
import { schedulerService } from '@/services/SchedulerService';
import { publisherService } from '@/services/PublisherService';
import { analyticsService } from '@/services/AnalyticsService';
import { env } from '@/lib/env';
import { sessionMiddleware, passport, authRoutes, requireAuth, getUserId } from '@/auth';
import type { PlatformId, ContentPrompt } from '@smm/shared';

const app = express();
const wsInstance = expressWs(app);

// CORS
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins[0]) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Session + Passport
app.set('trust proxy', 1); // Railway/Vercel sit behind a reverse proxy
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Auth routes (public)
app.use(authRoutes);

// Health (public)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Bootstrap default post types for new users
async function ensureDefaultPostTypes(userId: string) {
  const existing = await prisma.postType.count({ where: { userId } });
  if (existing === 0) {
    await prisma.postType.createMany({
      data: [
        {
          userId,
          name: 'Business Forward',
          isDefault: true,
          targetPlatforms: ['linkedin', 'x'],
          toneDescriptor: 'Professional, thought-leadership, data-driven',
          formattingPreferencesJson: {
            useEmojis: false,
            hashtagStyle: 'minimal',
            linkPlacement: 'end',
            mentionStyle: 'formal',
          },
        },
        {
          userId,
          name: 'Personal',
          isDefault: true,
          targetPlatforms: ['x', 'instagram', 'bluesky', 'facebook', 'tiktok'],
          toneDescriptor: 'Casual, authentic, conversational',
          formattingPreferencesJson: {
            useEmojis: true,
            hashtagStyle: 'moderate',
            linkPlacement: 'inline',
            mentionStyle: 'casual',
          },
        },
      ],
    });
  }
}

// All /api/* routes require authentication
app.use('/api', requireAuth);

// Post Types
app.get('/api/post-types', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    await ensureDefaultPostTypes(userId);
    res.json(await postTypeService.getUserPostTypes(userId));
  } catch (e) { next(e); }
});

app.post('/api/post-types', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { name, targetPlatforms, toneDescriptor, formattingPreferences } = req.body;
    res.json(await postTypeService.createPostType(userId, name, targetPlatforms, toneDescriptor, formattingPreferences));
  } catch (e) { next(e); }
});

app.patch('/api/post-types/:id', async (req, res, next) => {
  try {
    res.json(await postTypeService.updatePostType(req.params.id, req.body));
  } catch (e) { next(e); }
});

app.delete('/api/post-types/:id', async (req, res, next) => {
  try {
    await postTypeService.deletePostType(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Posts
app.get('/api/posts', async (req, res, next) => {
  try {
    res.json(await postService.getUserPosts(getUserId(req)));
  } catch (e) { next(e); }
});

app.post('/api/posts', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { postTypeId, originalContent, targetPlatforms } = req.body;
    res.json(await postService.createPost(userId, postTypeId, originalContent, targetPlatforms));
  } catch (e) { next(e); }
});

app.delete('/api/posts/:id', async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Content Generation
app.post('/api/content/generate', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { userInput, postTypeId, targetPlatforms } = req.body;
    const postTypes = await postTypeService.getUserPostTypes(userId);
    const postType = postTypes.find((pt) => pt.id === postTypeId);
    if (!postType) return res.status(404).json({ error: 'Post type not found' });

    const prompt: ContentPrompt = {
      userInput,
      postType,
      targetPlatforms: targetPlatforms as PlatformId[],
    };
    res.json(await contentAgent.generate(prompt));
  } catch (e) { next(e); }
});

// Publish & Schedule
app.post('/api/posts/publish', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { originalContent, postTypeId, targetPlatforms } = req.body;
    const post = await postService.createPost(userId, postTypeId, originalContent, targetPlatforms);
    const result = await publisherService.publishPost(post.id);
    res.json(result);
  } catch (e) { next(e); }
});

app.post('/api/posts/:id/publish', async (req, res, next) => {
  try {
    res.json(await publisherService.publishPost(req.params.id));
  } catch (e) { next(e); }
});

app.post('/api/schedule', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { originalContent, postTypeId, targetPlatforms, scheduledAt } = req.body;
    const post = await postService.createPost(userId, postTypeId, originalContent, targetPlatforms);
    await schedulerService.schedulePost(post.id, new Date(scheduledAt));
    res.json({ postId: post.id, scheduledAt });
  } catch (e) { next(e); }
});

app.delete('/api/schedule/:id', async (req, res, next) => {
  try {
    await schedulerService.cancelPost(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.get('/api/schedule', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { from, to } = req.query;
    const posts = await postService.getScheduledPosts(
      userId,
      new Date(from as string),
      new Date(to as string)
    );
    res.json(posts);
  } catch (e) { next(e); }
});

// Connections
app.get('/api/connections', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const conns = await connectionService.getUserConnections(userId);
    res.json(conns.map(({ encryptedTokenData: _, ...rest }) => rest));
  } catch (e) { next(e); }
});

app.post('/api/auth/connect', async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const userId = (req.user as { id: string }).id;
    const { platformId } = req.body as { platformId: PlatformId };
    const callbackBase = `${env.PUBLIC_BACKEND_URL}/auth/callback`;
    const urls: Partial<Record<PlatformId, string>> = {
      x: `https://twitter.com/i/oauth2/authorize?client_id=${env.X_CLIENT_ID}&redirect_uri=${callbackBase}/x&response_type=code&scope=tweet.write+tweet.read+users.read+offline.access&code_challenge=challenge&code_challenge_method=plain&state=${userId}`,
      linkedin: `https://www.linkedin.com/oauth/v2/authorization?client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${callbackBase}/linkedin&response_type=code&scope=w_member_social+r_liteprofile&state=${userId}`,
      facebook: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${callbackBase}/facebook&scope=pages_manage_posts&state=${userId}`,
      instagram: `https://api.instagram.com/oauth/authorize?client_id=${env.INSTAGRAM_APP_ID}&redirect_uri=${callbackBase}/instagram&scope=instagram_basic+instagram_content_publish&response_type=code&state=${userId}`,
      tiktok: `https://www.tiktok.com/v2/auth/authorize?client_key=${env.TIKTOK_CLIENT_KEY}&redirect_uri=${callbackBase}/tiktok&response_type=code&scope=video.publish&state=${userId}`,
    };
    res.json({ authUrl: urls[platformId] ?? '#not-configured' });
  } catch (e) { next(e); }
});

// OAuth Callback - exchange code for token and store connection
app.get('/auth/callback/x', async (req, res) => {
  const frontendUrl = env.CORS_ORIGIN.split(',')[0].trim();
  try {
    const { code, state, error, error_description } = req.query;
    
    // X OAuth error
    if (error) {
      console.error('X OAuth error:', error, error_description);
      return res.redirect(`${frontendUrl}/connections?error=${error}`);
    }

    const userId = state as string;

    if (!code || !userId) {
      return res.redirect(`${frontendUrl}/connections?error=auth_failed`);
    }

    const callbackUrl = `${env.PUBLIC_BACKEND_URL}/auth/callback/x`;

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
        code_verifier: 'challenge',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('X token exchange failed:', errBody);
      return res.redirect(`${frontendUrl}/connections?error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json() as { access_token: string; refresh_token?: string; expires_in: number };

    // Get the user's X profile to store their username
    const profileRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json() as { data?: { username: string; id: string } };

    // Store the connection
    await connectionService.storeConnection(userId, 'x', {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || '',
      expiresIn: tokenData.expires_in,
      username: profile.data?.username || 'unknown',
      platformUserId: profile.data?.id || '',
    });

    res.redirect(`${frontendUrl}/connections?connected=x`);
  } catch (e) {
    console.error('X OAuth callback error:', e);
    res.redirect(`${frontendUrl}/connections?error=callback_failed`);
  }
});

app.delete('/api/connections/:id', async (req, res, next) => {
  try {
    await connectionService.deleteConnection(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Analytics
app.get('/api/analytics', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
    res.json(await analyticsService.getDashboardMetrics(userId, from, to));
  } catch (e) { next(e); }
});

app.post('/api/analytics/collect/:postId', async (req, res, next) => {
  try {
    await analyticsService.collectMetrics(req.params.postId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Workflows
app.get('/api/workflows', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const logs = await prisma.workflowLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    res.json(logs.map((l) => ({ ...l, steps: l.stepsJson })));
  } catch (e) { next(e); }
});

// WebSocket (real-time updates)
const wsClients = new Set<any>();

(app as any).ws('/ws', (ws: any) => {
  wsClients.add(ws);
  ws.on('close', () => wsClients.delete(ws));
  ws.on('message', () => ws.send(JSON.stringify({ type: 'pong' })));
});

export function broadcast(event: string, data: unknown) {
  const msg = JSON.stringify({ type: event, data });
  for (const client of wsClients) {
    try { client.send(msg); } catch {}
  }
}

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

export default app;
