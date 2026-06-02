import {
  mockConnections,
  mockPostTypes,
  mockPosts,
  mockDashboardMetrics,
  mockWorkflowLogs,
  mockIntegrations,
} from './mocks';

const routes: Array<{
  method: string;
  pattern: RegExp;
  handler: (url: string, body?: unknown) => unknown;
}> = [
  { method: 'GET', pattern: /^\/api\/connections$/, handler: () => mockConnections },
  { method: 'GET', pattern: /^\/api\/post-types$/, handler: () => mockPostTypes },
  { method: 'GET', pattern: /^\/api\/posts$/, handler: () => mockPosts },
  { method: 'GET', pattern: /^\/api\/analytics\/dashboard$/, handler: () => mockDashboardMetrics },
  { method: 'GET', pattern: /^\/api\/workflows$/, handler: () => mockWorkflowLogs },
  { method: 'GET', pattern: /^\/api\/integrations$/, handler: () => mockIntegrations },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/connect$/,
    handler: () => ({ authUrl: '#mock-oauth' }),
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/connections\/.+$/,
    handler: () => ({ ok: true }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/post-types$/,
    handler: (_url, body) => ({
      ...(body as object),
      id: crypto.randomUUID(),
      userId: 'u1',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/post-types\/.+$/,
    handler: (_url, body) => ({ ...(body as object), updatedAt: new Date().toISOString() }),
  },
  { method: 'DELETE', pattern: /^\/api\/post-types\/.+$/, handler: () => ({ ok: true }) },
  {
    method: 'POST',
    pattern: /^\/api\/content\/generate$/,
    handler: (_url, body) => ({
      drafts: [],
      modelUsed: 'cerebras/llama-3.3-70b',
      providerId: 'cerebras',
      generatedText: `Here's a draft based on: "${(body as { prompt: string }).prompt}"\n\nLeveraging the power of AI to streamline content creation across every platform — smarter, faster, and more authentic.`,
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/posts$/,
    handler: (_url, body) => ({
      ...(body as object),
      id: crypto.randomUUID(),
      status: 'draft',
      retryCount: 0,
      maxRetries: 3,
      platformPostIds: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/posts\/.+\/publish$/,
    handler: () => ({ ok: true }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/posts\/.+\/schedule$/,
    handler: () => ({ ok: true }),
  },
];

export function installMockInterceptor() {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method ?? 'GET').toUpperCase();
    const match = routes.find((r) => r.method === method && r.pattern.test(url));
    if (match) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
      const body = init?.body ? JSON.parse(init.body as string) : undefined;
      const data = match.handler(url, body);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };
}
