"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.storeOTP = storeOTP;
exports.verifyOTP = verifyOTP;
exports.deleteOTP = deleteOTP;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../config/redis");
const OTP_ATTEMPT_LIMIT = 3;
const LOCKOUT_TTL_SECONDS = 15 * 60; // 15 minutes
function otpKey(email) {
    return `otp:${email}`;
}
function attemptsKey(email) {
    return `otp_attempts:${email}`;
}
function lockoutKey(email) {
    return `otp_lockout:${email}`;
}
/** Generate a cryptographically random 6-digit OTP string. */
function generateOTP() {
    return String(crypto_1.default.randomInt(0, 1000000)).padStart(6, '0');
}
/** Store an OTP in Redis with the given TTL (seconds). */
async function storeOTP(email, otp, ttl) {
    await redis_1.redis.set(otpKey(email), otp, 'EX', ttl);
    // Reset attempt counter whenever a fresh OTP is issued
    await redis_1.redis.del(attemptsKey(email));
}
/**
 * Verify an OTP.
 * - Tracks failed attempts (max 3).
 * - Locks the email out for 15 min after 3 failures.
 * Returns `true` on success, throws on invalid/expired/locked.
 */
async function verifyOTP(email, otp) {
    // Check lockout first
    const locked = await redis_1.redis.get(lockoutKey(email));
    if (locked) {
        throw new Error('OTP_LOCKED: Too many incorrect attempts. Try again in 15 minutes.');
    }
    const stored = await redis_1.redis.get(otpKey(email));
    if (!stored) {
        throw new Error('OTP_EXPIRED: OTP has expired or does not exist.');
    }
    if (stored !== otp) {
        // Increment attempt counter
        const attempts = await redis_1.redis.incr(attemptsKey(email));
        if (attempts >= OTP_ATTEMPT_LIMIT) {
            await redis_1.redis.set(lockoutKey(email), '1', 'EX', LOCKOUT_TTL_SECONDS);
            await redis_1.redis.del(otpKey(email));
            await redis_1.redis.del(attemptsKey(email));
            throw new Error('OTP_LOCKED: Too many incorrect attempts. Try again in 15 minutes.');
        }
        throw new Error(`OTP_INVALID: Incorrect OTP. ${OTP_ATTEMPT_LIMIT - attempts} attempt(s) remaining.`);
    }
    return true;
}
/** Remove an OTP from Redis after successful use. */
async function deleteOTP(email) {
    await redis_1.redis.del(otpKey(email));
    await redis_1.redis.del(attemptsKey(email));
    await redis_1.redis.del(lockoutKey(email));
}
//# sourceMappingURL=otp.js.map