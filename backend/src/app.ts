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
import type { PlatformId, ContentPrompt } from '@smm/shared';

const app = express();
const wsInstance = expressWs(app);

app.use(express.json());
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Resolve the seeded user ID at startup
let DEFAULT_USER_ID = '';
export async function resolveDefaultUser() {
  const user = await prisma.user.findUnique({ where: { email: 'masonsabin@gmail.com' } });
  if (!user) throw new Error('Default user not found — run: npm run seed');
  DEFAULT_USER_ID = user.id;
  console.log(`✅ Default user: ${user.email} (${user.id})`);
}

const uid = () => DEFAULT_USER_ID;

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', userId: uid() }));

// ── Post Types ───────────────────────────────────────────────────────────────
app.get('/api/post-types', async (_req, res, next) => {
  try {
    res.json(await postTypeService.getUserPostTypes(uid()));
  } catch (e) { next(e); }
});

app.post('/api/post-types', async (req, res, next) => {
  try {
    const { name, targetPlatforms, toneDescriptor, formattingPreferences } = req.body;
    res.json(await postTypeService.createPostType(uid(), name, targetPlatforms, toneDescriptor, formattingPreferences));
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

// ── Posts ────────────────────────────────────────────────────────────────────
app.get('/api/posts', async (_req, res, next) => {
  try {
    res.json(await postService.getUserPosts(uid()));
  } catch (e) { next(e); }
});

app.post('/api/posts', async (req, res, next) => {
  try {
    const { postTypeId, originalContent, targetPlatforms } = req.body;
    res.json(await postService.createPost(uid(), postTypeId, originalContent, targetPlatforms));
  } catch (e) { next(e); }
});

app.delete('/api/posts/:id', async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── Content Generation ───────────────────────────────────────────────────────
app.post('/api/content/generate', async (req, res, next) => {
  try {
    const { userInput, postTypeId, targetPlatforms } = req.body;
    const postTypes = await postTypeService.getUserPostTypes(uid());
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

// ── Publish & Schedule ───────────────────────────────────────────────────────
app.post('/api/posts/publish', async (req, res, next) => {
  try {
    const { originalContent, postTypeId, targetPlatforms } = req.body;
    const post = await postService.createPost(uid(), postTypeId, originalContent, targetPlatforms);
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
    const { originalContent, postTypeId, targetPlatforms, scheduledAt } = req.body;
    const post = await postService.createPost(uid(), postTypeId, originalContent, targetPlatforms);
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
    const { from, to } = req.query;
    const posts = await postService.getScheduledPosts(
      uid(),
      new Date(from as string),
      new Date(to as string)
    );
    res.json(posts);
  } catch (e) { next(e); }
});

// ── Connections ──────────────────────────────────────────────────────────────
app.get('/api/connections', async (_req, res, next) => {
  try {
    const conns = await connectionService.getUserConnections(uid());
    // Strip encrypted token data before sending to client
    res.json(conns.map(({ encryptedTokenData: _, ...rest }) => rest));
  } catch (e) { next(e); }
});

app.post('/api/auth/connect', async (req, res, next) => {
  try {
    const { platformId } = req.body as { platformId: PlatformId };
    const callbackBase = 'http://localhost:3000/auth/callback';
    const urls: Partial<Record<PlatformId, string>> = {
      x: `https://twitter.com/i/oauth2/authorize?client_id=${env.X_CLIENT_ID}&redirect_uri=${callbackBase}/x&response_type=code&scope=tweet.write+tweet.read+users.read&code_challenge=challenge&code_challenge_method=plain`,
      linkedin: `https://www.linkedin.com/oauth/v2/authorization?client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${callbackBase}/linkedin&response_type=code&scope=w_member_social+r_liteprofile`,
      facebook: `https://www.facebook.com/v19.0/dialog/oauth?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${callbackBase}/facebook&scope=pages_manage_posts`,
      instagram: `https://api.instagram.com/oauth/authorize?client_id=${env.INSTAGRAM_APP_ID}&redirect_uri=${callbackBase}/instagram&scope=instagram_basic+instagram_content_publish&response_type=code`,
      tiktok: `https://www.tiktok.com/v2/auth/authorize?client_key=${env.TIKTOK_CLIENT_KEY}&redirect_uri=${callbackBase}/tiktok&response_type=code&scope=video.publish`,
      bluesky: '#bluesky-app-password',
    };
    res.json({ authUrl: urls[platformId] ?? '#not-configured' });
  } catch (e) { next(e); }
});

app.delete('/api/connections/:id', async (req, res, next) => {
  try {
    await connectionService.deleteConnection(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── Analytics ────────────────────────────────────────────────────────────────
app.get('/api/analytics', async (req, res, next) => {
  try {
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
    res.json(await analyticsService.getDashboardMetrics(uid(), from, to));
  } catch (e) { next(e); }
});

app.post('/api/analytics/collect/:postId', async (req, res, next) => {
  try {
    await analyticsService.collectMetrics(req.params.postId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ── Workflows ────────────────────────────────────────────────────────────────
app.get('/api/workflows', async (_req, res, next) => {
  try {
    const logs = await prisma.workflowLog.findMany({
      where: { userId: uid() },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    res.json(logs.map((l) => ({ ...l, steps: l.stepsJson })));
  } catch (e) { next(e); }
});

// ── WebSocket (real-time updates) ────────────────────────────────────────────
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

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

export default app;
