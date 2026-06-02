import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import { userService } from '@/services/UserService';
import { postService } from '@/services/PostService';
import { connectionService } from '@/services/ConnectionService';
import { postTypeService } from '@/services/PostTypeService';
import { contentAgent } from '@/services/ContentAgent';
import type { PlatformId, ContentPrompt } from '@smm/shared';

const app = express();
expressWs(app);

app.use(express.json());

const userId = 'default-user-id';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/post-types', async (_req: Request, res: Response) => {
  const types = await postTypeService.getUserPostTypes(userId);
  res.json(types);
});

app.post('/api/post-types', async (req: Request, res: Response) => {
  const { name, targetPlatforms, toneDescriptor, formattingPreferences } = req.body;
  const pt = await postTypeService.createPostType(
    userId,
    name,
    targetPlatforms,
    toneDescriptor,
    formattingPreferences
  );
  res.json(pt);
});

app.patch('/api/post-types/:id', async (req: Request, res: Response) => {
  const pt = await postTypeService.updatePostType(req.params.id, req.body);
  res.json(pt);
});

app.delete('/api/post-types/:id', async (req: Request, res: Response) => {
  await postTypeService.deletePostType(req.params.id);
  res.json({ ok: true });
});

app.get('/api/posts', async (_req: Request, res: Response) => {
  const posts = await postService.getUserPosts(userId);
  res.json(posts);
});

app.post('/api/posts', async (req: Request, res: Response) => {
  const { postTypeId, originalContent, targetPlatforms } = req.body;
  const post = await postService.createPost(userId, postTypeId, originalContent, targetPlatforms);
  res.json(post);
});

app.post('/api/content/generate', async (req: Request, res: Response) => {
  const { userInput, postTypeId, targetPlatforms } = req.body;
  const postTypes = await postTypeService.getUserPostTypes(userId);
  const postType = postTypes.find((pt) => pt.id === postTypeId);

  if (!postType) {
    return res.status(404).json({ error: 'Post type not found' });
  }

  try {
    const prompt: ContentPrompt = {
      userInput,
      postType,
      targetPlatforms: targetPlatforms as PlatformId[],
    };

    const content = await contentAgent.generate(prompt);
    res.json(content);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/api/connections', async (_req: Request, res: Response) => {
  const conns = await connectionService.getUserConnections(userId);
  res.json(conns);
});

app.post('/api/auth/connect', async (req: Request, res: Response) => {
  const { platformId } = req.body;
  const oauthUrls: Record<string, string> = {
    x: 'https://twitter.com/i/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=tweet.write%20tweet.read',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/auth/callback&response_type=code&scope=w_member_social',
  };

  const url = oauthUrls[platformId as string] || 'http://localhost:3000/auth/callback';
  res.json({ authUrl: url });
});

app.delete('/api/connections/:id', async (req: Request, res: Response) => {
  await connectionService.deleteConnection(req.params.id);
  res.json({ ok: true });
});

app.get('/api/analytics', async (_req: Request, res: Response) => {
  res.json({
    aggregate: {
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalImpressions: 0,
      byPlatform: {},
    },
    engagementByDay: [],
    topPosts: [],
  });
});

app.get('/api/schedule', async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const posts = await postService.getScheduledPosts(
    userId,
    new Date(from as string),
    new Date(to as string)
  );
  res.json(posts);
});

app.post('/api/posts/:id/publish', async (req: Request, res: Response) => {
  await postService.publishPost(req.params.id);
  res.json({ ok: true });
});

app.ws('/ws', (ws) => {
  ws.on('message', (msg) => {
    ws.send(JSON.stringify({ type: 'pong', data: msg }));
  });
});

export default app;
