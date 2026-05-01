import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { config } from '../../config/env';
import { generateOTP, storeOTP, verifyOTP, deleteOTP } from '../../utils/otp';
import type {
  SignupInput,
  LoginInput,
  OtpInput,
  ResetPasswordInput,
  ForgotPasswordInput,
  RefreshTokenInput,
} from './auth.schema';

// ─── Token helpers ──────────────────────────────────────────────────────────

function signAccessToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, config.SUPABASE_JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, config.SUPABASE_JWT_SECRET, { expiresIn: '7d' });
}

function refreshTokenKey(userId: string): string {
  return `refresh_token:${userId}`;
}

function forgotPasswordRateLimitKey(email: string): string {
  return `forgot_rl:${email}`;
}

// ─── Service methods ─────────────────────────────────────────────────────────

/**
 * Step 1 of signup: validate uniqueness, hash password, send OTP.
 * The Supabase user is NOT created until OTP is verified.
 */
export async function signup(input: SignupInput): Promise<{ message: string }> {
  // Check email uniqueness in Supabase
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', input.email)
    .maybeSingle();

  if (existing) {
    const err = new Error('Email is already registered') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  // Hash password and store pending registration in Redis
  const hashedPassword = await bcrypt.hash(input.password, config.BCRYPT_SALT_ROUNDS);

  const pendingData = JSON.stringify({
    email: input.email,
    phone: input.phone,
    hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  await redis.set(`pending_signup:${input.email}`, pendingData, 'EX', config.OTP_EXPIRY_SECONDS);

  // Generate and send OTP
  const otp = generateOTP();
  await storeOTP(input.email, otp, config.OTP_EXPIRY_SECONDS);

  // TODO: call email service to send OTP
  // await sendEmail(input.email, 'otp-verify', { otp, firstName: input.firstName });
  console.log(`[DEV] OTP for ${input.email}: ${otp}`);

  return { message: 'OTP sent to your email. Please verify to complete registration.' };
}

/** Step 2: verify OTP, create Supabase user, return token pair. */
export async function verifyOtp(input: OtpInput): Promise<{ accessToken: string; refreshToken: string }> {
  await verifyOTP(input.email, input.otp);

  const raw = await redis.get(`pending_signup:${input.email}`);
  if (!raw) {
    const err = new Error('Registration session expired. Please sign up again.') as Error & { status: number };
    err.status = 410;
    throw err;
  }

  const pending = JSON.parse(raw) as {
    email: string;
    phone: string;
    hashedPassword: string;
    firstName: string;
    lastName: string;
  };

  // Create the Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: pending.email,
    email_confirm: true,
    user_metadata: {
      first_name: pending.firstName,
      last_name: pending.lastName,
      phone: pending.phone,
    },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? 'Failed to create user account');
  }

  // Insert profile row
  await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    email: pending.email,
    phone: pending.phone,
    first_name: pending.firstName,
    last_name: pending.lastName,
    password_hash: pending.hashedPassword,
    role: 'customer',
  });

  // Cleanup Redis
  await deleteOTP(input.email);
  await redis.del(`pending_signup:${input.email}`);

  const tokenPayload = { sub: authData.user.id, email: pending.email, role: 'customer' };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await redis.set(refreshTokenKey(authData.user.id), refreshToken, 'EX', 7 * 24 * 60 * 60);

  return { accessToken, refreshToken };
}

/** Login with email or username + password. */
export async function login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string }> {
  const isEmail = input.emailOrUsername.includes('@');

  const query = supabaseAdmin
    .from('profiles')
    .select('id, email, role, password_hash, restaurant_id, branch_id');

  const { data: profile, error: profileError } = isEmail
    ? await query.eq('email', input.emailOrUsername).maybeSingle()
    : await query.eq('username', input.emailOrUsername).maybeSingle();

  if (profileError || !profile) {
    const err = new Error('Invalid credentials') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(input.password, profile.password_hash as string);
  if (!passwordMatch) {
    const err = new Error('Invalid credentials') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const tokenPayload: Record<string, unknown> = {
    sub: profile.id,
    email: profile.email,
    role: profile.role,
  };

  if (profile.restaurant_id) tokenPayload.restaurant_id = profile.restaurant_id;
  if (profile.branch_id) tokenPayload.branch_id = profile.branch_id;

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await redis.set(refreshTokenKey(profile.id as string), refreshToken, 'EX', 7 * 24 * 60 * 60);

  return { accessToken, refreshToken };
}

/** Send a password-reset OTP (rate limited to 3 per hour per email). */
export async function forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
  const rlKey = forgotPasswordRateLimitKey(input.email);
  const attempts = await redis.incr(rlKey);

  if (attempts === 1) {
    await redis.expire(rlKey, 60 * 60); // 1 hour window
  }

  if (attempts > 3) {
    const err = new Error('Too many password reset requests. Try again in an hour.') as Error & { status: number };
    err.status = 429;
    throw err;
  }

  // Silently succeed even if email doesn't exist (security best practice)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name')
    .eq('email', input.email)
    .maybeSingle();

  if (profile) {
    const otp = generateOTP();
    await storeOTP(input.email, otp, config.OTP_EXPIRY_SECONDS);
    // TODO: await sendEmail(input.email, 'otp-verify', { otp })
    console.log(`[DEV] Password reset OTP for ${input.email}: ${otp}`);
  }

  return { message: 'If that email exists, a reset OTP has been sent.' };
}

/** Verify OTP and set new password, then invalidate all sessions. */
export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  await verifyOTP(input.email, input.otp);

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', input.email)
    .maybeSingle();

  if (!profile) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, config.BCRYPT_SALT_ROUNDS);

  await supabaseAdmin
    .from('profiles')
    .update({ password_hash: hashedPassword })
    .eq('id', profile.id);

  // Invalidate all sessions
  await supabaseAdmin.auth.admin.signOut(profile.id as string, 'global');
  await redis.del(refreshTokenKey(profile.id as string));
  await deleteOTP(input.email);

  return { message: 'Password reset successfully. Please log in again.' };
}

/** Issue a new access token from a valid refresh token. */
export async function refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string }> {
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(input.refreshToken, config.SUPABASE_JWT_SECRET) as jwt.JwtPayload;
  } catch {
    const err = new Error('Invalid or expired refresh token') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const userId = decoded.sub as string;
  const stored = await redis.get(refreshTokenKey(userId));

  if (!stored || stored !== input.refreshToken) {
    const err = new Error('Refresh token has been revoked') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken({
    sub: userId,
    email: decoded.email,
    role: decoded.role,
    restaurant_id: decoded.restaurant_id,
    branch_id: decoded.branch_id,
  });

  return { accessToken };
}

/** Revoke the user's refresh token (logout). */
export async function logout(userId: string): Promise<void> {
  await redis.del(refreshTokenKey(userId));
}
