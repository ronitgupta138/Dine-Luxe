import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Frontend
  FRONTEND_URL: z.string().default('https://frontend-ten-phi-hzgzlmvvm9.vercel.app'),

  // Supabase
  SUPABASE_URL: z.string().default('https://placeholder.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder-service-key'),
  SUPABASE_JWT_SECRET: z.string().default('placeholder-jwt-secret-at-least-32-chars-long!'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Email
  RESEND_API_KEY: z.string().default('placeholder-resend-key'),
  EMAIL_FROM: z.string().default('noreply@dineluxe.com'),

  // Auth / Security
  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().min(10).max(14)),
  OTP_EXPIRY_SECONDS: z
    .string()
    .default('300')
    .transform(Number)
    .pipe(z.number().int().min(60)),
  GEO_FENCE_RADIUS_METERS: z
    .string()
    .default('500')
    .transform(Number)
    .pipe(z.number().positive()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(`\n❌ Invalid environment variables:\n${issues}\n`);
}

export const config = parsed.data;
export type Config = typeof config;
