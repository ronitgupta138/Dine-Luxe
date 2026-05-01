import crypto from 'crypto';
import { redis } from '../config/redis';

const OTP_ATTEMPT_LIMIT = 3;
const LOCKOUT_TTL_SECONDS = 15 * 60; // 15 minutes

function otpKey(email: string): string {
  return `otp:${email}`;
}

function attemptsKey(email: string): string {
  return `otp_attempts:${email}`;
}

function lockoutKey(email: string): string {
  return `otp_lockout:${email}`;
}

/** Generate a cryptographically random 6-digit OTP string. */
export function generateOTP(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Store an OTP in Redis with the given TTL (seconds). */
export async function storeOTP(
  email: string,
  otp: string,
  ttl: number,
): Promise<void> {
  await redis.set(otpKey(email), otp, 'EX', ttl);
  // Reset attempt counter whenever a fresh OTP is issued
  await redis.del(attemptsKey(email));
}

/**
 * Verify an OTP.
 * - Tracks failed attempts (max 3).
 * - Locks the email out for 15 min after 3 failures.
 * Returns `true` on success, throws on invalid/expired/locked.
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  // Check lockout first
  const locked = await redis.get(lockoutKey(email));
  if (locked) {
    throw new Error('OTP_LOCKED: Too many incorrect attempts. Try again in 15 minutes.');
  }

  const stored = await redis.get(otpKey(email));
  if (!stored) {
    throw new Error('OTP_EXPIRED: OTP has expired or does not exist.');
  }

  if (stored !== otp) {
    // Increment attempt counter
    const attempts = await redis.incr(attemptsKey(email));
    if (attempts >= OTP_ATTEMPT_LIMIT) {
      await redis.set(lockoutKey(email), '1', 'EX', LOCKOUT_TTL_SECONDS);
      await redis.del(otpKey(email));
      await redis.del(attemptsKey(email));
      throw new Error('OTP_LOCKED: Too many incorrect attempts. Try again in 15 minutes.');
    }
    throw new Error(`OTP_INVALID: Incorrect OTP. ${OTP_ATTEMPT_LIMIT - attempts} attempt(s) remaining.`);
  }

  return true;
}

/** Remove an OTP from Redis after successful use. */
export async function deleteOTP(email: string): Promise<void> {
  await redis.del(otpKey(email));
  await redis.del(attemptsKey(email));
  await redis.del(lockoutKey(email));
}
