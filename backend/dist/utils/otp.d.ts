/** Generate a cryptographically random 6-digit OTP string. */
export declare function generateOTP(): string;
/** Store an OTP in Redis with the given TTL (seconds). */
export declare function storeOTP(email: string, otp: string, ttl: number): Promise<void>;
/**
 * Verify an OTP.
 * - Tracks failed attempts (max 3).
 * - Locks the email out for 15 min after 3 failures.
 * Returns `true` on success, throws on invalid/expired/locked.
 */
export declare function verifyOTP(email: string, otp: string): Promise<boolean>;
/** Remove an OTP from Redis after successful use. */
export declare function deleteOTP(email: string): Promise<void>;
//# sourceMappingURL=otp.d.ts.map