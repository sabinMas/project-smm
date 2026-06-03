import app from './app';
import { env } from '@/lib/env';
import { connectRedis, disconnectRedis } from '@/lib/redis';
import { prisma } from '@/lib/db';
import { publisherService } from '@/services/PublisherService';

const PORT = env.PORT;

async function main() {
  // Redis is optional — don't let a missing/unreachable cache crash the server
  try {
    await connectRedis();
  } catch (e) {
    console.warn('⚠️  Redis unavailable, continuing without cache:', (e as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

  // Poll every 30s for due scheduled posts (SQS fallback for local dev)
  publisherService.startPollLoop(30000);
}

async function shutdown(signal: string) {
  console.log(`\n🛑 ${signal} received, shutting down...`);
  await disconnectRedis().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

main().catch((e) => {
  console.error('Failed to start server:', e);
  process.exit(1);
});
