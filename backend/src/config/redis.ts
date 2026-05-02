import Redis from 'ioredis';
import { config } from './env';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // lazyConnect removed – ioredis must connect eagerly so RedisStore and
  // OTP/rate-limit calls are ready before the first request arrives.
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err.message);
  // Do not crash the process on transient Redis errors
});

redis.on('reconnecting', () => {
  console.warn('⚠️  Redis reconnecting...');
});
