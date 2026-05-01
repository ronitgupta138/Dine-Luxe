import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be a valid email'),

  // Auth / Security
  BCRYPT_SALT_ROUNDS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(10).max(14)),
  OTP_EXPIRY_SECONDS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(60)),
  GEO_FENCE_RADIUS_METERS: z
    .string()
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
