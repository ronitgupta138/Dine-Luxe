import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../../config/supabase';
import { redis } from '../../config/redis';
import { config } from '../../config/env';
import { generateOTP, storeOTP, verifyOTP, deleteOTP } from '../../utils/otp';
import { sendEmail } from '../../email/send';
import type {
  SignupInput,
  LoginInput,
  OtpInput,
  ResetPasswordInput,
  ForgotPasswordInput,
  RefreshTokenInput,
} from './auth.schema';

// ─── Token helpers ────────────────────────────────────────────────────────────

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

// ─── Service methods ──────────────────────────────────────────────────────────

/**
 * Step 1 of signup: validate uniqueness, hash password, send OTP.
 * The Supabase user is NOT created until OTP is verified.
 */
export async function signup(input: SignupInput): Promise<{ message: string }> {
  // BUG FIX: normalise firstName/lastName from the flexible schema.
  // Clients may send `name` (e.g. "John Doe") OR firstName + lastName separately.
  let firstName: string;
  let lastName: string;

  if (input.firstName) {
    firstName = input.firstName;
    lastName = input.lastName ?? '';
  } else {
    // Split `name` field into first / last
    const parts = (input.name ?? '').trim().split(' ').filter(Boolean);
    firstName = parts[0] ?? '';
    lastName = parts.slice(1).join(' ');
  }

  // Check email uniqueness in Supabase
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', input.email)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Email lookup failed: ${existingError.message}`);
  }

  if (existing) {
    const err = new Error('Email is already registered') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  // Hash password and store pending registration in Redis
  const hashedPassword = await bcrypt.hash(input.password, config.BCRYPT_SALT_ROUNDS);

  const pendingData = JSON.stringify({
    email: input.email,
    phone: input.phone ?? null,
    hashedPassword,
    firstName,
    lastName,
  });

  await redis.set(`pending_signup:${input.email}`, pendingData, 'EX', config.OTP_EXPIRY_SECONDS);

  // Generate and send OTP
  const otp = generateOTP();
  await storeOTP(input.email, otp, config.OTP_EXPIRY_SECONDS);

  sendEmail({
    to: input.email,
    templateName: 'otp-verify',
    data: { name: firstName, otp, expiryMinutes: Math.floor(config.OTP_EXPIRY_SECONDS / 60) },
  });
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
    phone: string | null;
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

  let authUser = authData?.user ?? null;

  if (authError || !authUser) {
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      throw new Error(authError?.message ?? listError.message ?? 'Failed to create user account');
    }

    authUser = usersList?.users?.find((u) => u.email === pending.email) ?? null;
  }

  if (!authUser) {
    throw new Error(authError?.message ?? 'Failed to create user account');
  }

  // Insert profile row
  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', pending.email)
    .maybeSingle();

  if (existingUserError) {
    throw new Error(`User lookup failed: ${existingUserError.message}`);
  }

  if (!existingUser) {
    const now = new Date().toISOString();
    const { error: userInsertError } = await supabaseAdmin.from('users').insert({
      id: authUser.id,
      name: `${pending.firstName} ${pending.lastName}`.trim(),
      email: pending.email,
      phone: pending.phone,
      password_hash: pending.hashedPassword,
      role: 'customer',
      created_by_restaurant: false,
      is_active: true,
      force_password_change: false,
      created_at: now,
      updated_at: now,
    });

    if (userInsertError) {
      throw new Error(`User creation failed: ${userInsertError.message}`);
    }
  }

  // Cleanup Redis
  await deleteOTP(input.email);
  await redis.del(`pending_signup:${input.email}`);

  const tokenPayload = { sub: authUser.id, email: pending.email, role: 'customer' };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await redis.set(refreshTokenKey(authUser.id), refreshToken, 'EX', 7 * 24 * 60 * 60);

  return { accessToken, refreshToken };
}

/** Login with email or username + password. */
export async function login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string }> {
  // BUG FIX: schema now accepts both `email` and `emailOrUsername`.
  // Normalise to a single identifier here.
  const identifier = (input.email ?? input.emailOrUsername ?? '').trim();
  const isEmail = identifier.includes('@');

  const query = supabaseAdmin
    .from('users')
    // BUG FIX: added is_active to the select so we can reject disabled accounts
    // before issuing a token. Previously a disabled staff member could still log
    // in because is_active was never checked.
    .select('id, email, role, password_hash, restaurant_id, branch_id, is_active');

  const { data: profile, error: profileError } = isEmail
    ? await query.eq('email', identifier).maybeSingle()
    : await query.eq('username', identifier).maybeSingle();

  if (profileError || !profile) {
    const err = new Error('Invalid credentials') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  // BUG FIX: reject disabled accounts — is_active check was missing entirely
  if (!profile.is_active) {
    const err = new Error('Account is disabled. Please contact your manager.') as Error & { status: number };
    err.status = 403;
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

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .eq('email', input.email)
    .maybeSingle();

  if (profile) {
    const otp = generateOTP();
    await storeOTP(input.email, otp, config.OTP_EXPIRY_SECONDS);
    sendEmail({
      to: input.email,
      templateName: 'otp-verify',
      data: { name: (profile as any).name ?? 'User', otp, expiryMinutes: Math.floor(config.OTP_EXPIRY_SECONDS / 60) },
    });
    console.log(`[DEV] Password reset OTP for ${input.email}: ${otp}`);
  }

  return { message: 'If that email exists, a reset OTP has been sent.' };
}

/** Verify OTP and set new password, then invalidate all sessions. */
export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  await verifyOTP(input.email, input.otp);

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', input.email)
    .maybeSingle();

  if (!profile) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, config.BCRYPT_SALT_ROUNDS);

  const { error: passwordError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: hashedPassword })
    .eq('id', profile.id);

  if (passwordError) {
    throw new Error(`Password update failed: ${passwordError.message}`);
  }

  await supabaseAdmin.auth.admin.signOut(profile.id as string);
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
