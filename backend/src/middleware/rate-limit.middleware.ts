import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';
import { error } from '../utils/response';

function makeStore(prefix: string) {
  return new RedisStore({
    // @ts-expect-error – ioredis and rate-limit-redis type mismatch on sendCommand
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix,
  });
}

function rateLimitResponse(_req: unknown, _res: unknown, _next: unknown, options: { message: string }) {
  return {
    ...error('RATE_LIMIT_EXCEEDED', options.message),
  };
}

/** 100 requests per 15 minutes – general API routes */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:general:'),
  message: rateLimitResponse(null, null, null, {
    message: 'Too many requests. Please try again in 15 minutes.',
  }),
});

/** 10 requests per 15 minutes – auth routes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:auth:'),
  message: rateLimitResponse(null, null, null, {
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  }),
});

/** 20 requests per hour – upload routes */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:upload:'),
  message: rateLimitResponse(null, null, null, {
    message: 'Upload limit reached. Please try again in an hour.',
  }),
});
