/// <reference path="./types/express.d.ts" />
import { config } from './config/env';
import { redis } from './config/redis';
import app from './app';

const PORT = Number(config.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Restaurant OS API running on port ${PORT} [${config.NODE_ENV}]`);
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);

  server.close(async (err) => {
    if (err) {
      console.error('❌ Error closing HTTP server:', err.message);
      process.exit(1);
    }

    try {
      await redis.quit();
      console.log('✅ Redis connection closed.');
    } catch (redisErr) {
      console.error('❌ Error closing Redis:', redisErr);
    }

    console.log('👋 Server shut down cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('🔥 Unhandled rejection:', reason);
  const message = reason instanceof Error ? reason.message : String(reason);
  const isRedisRetryError = message.includes('MaxRetriesPerRequestError');

  if (isRedisRetryError) {
    console.warn('⚠️  Redis is unavailable. API stays up; Redis-backed features may fail until reconnect.');
    return;
  }

  shutdown('UNHANDLED_REJECTION');
});
