import app from './app';
import { env } from '@/lib/env';
import { connectRedis, disconnectRedis } from '@/lib/redis';
import { prisma } from '@/lib/db';

const PORT = env.PORT;

async function main() {
  try {
    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connected');

    console.log('Starting server...');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
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
