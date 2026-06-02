import app, { resolveDefaultUser } from './app';
import { env } from '@/lib/env';
import { connectRedis, disconnectRedis } from '@/lib/redis';
import { prisma } from '@/lib/db';
import { publisherService } from '@/services/PublisherService';

const PORT = env.PORT;

async function main() {
  try {
    await connectRedis();
    await resolveDefaultUser();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    // Poll every 30s for due scheduled posts (SQS fallback for local dev)
    publisherService.startPollLoop(30000);
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await disconnectRedis();
  await prisma.$disconnect();
  process.exit(0);
});

main();
