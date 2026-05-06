import type { SignupInput, LoginInput, OtpInput, ResetPasswordInput, ForgotPasswordInput, RefreshTokenInput } from './auth.schema';
/**
 * Step 1 of signup: validate uniqueness, hash password, send OTP.
 * The Supabase user is NOT created until OTP is verified.
 */
export declare function signup(input: SignupInput): Promise<{
    message: string;
}>;
/** Step 2: verify OTP, create Supabase user, return token pair. */
export declare function verifyOtp(input: OtpInput): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
/** Login with email or username + password. */
export declare function login(input: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
/** Send a password-reset OTP (rate limited to 3 per hour per email). */
export declare function forgotPassword(input: ForgotPasswordInput): Promise<{
    message: string;
}>;
/** Verify OTP and set new password, then invalidate all sessions. */
export declare function resetPassword(input: ResetPasswordInput): Promise<{
    message: string;
}>;
/** Issue a new access token from a valid refresh token. */
export declare function refreshToken(input: RefreshTokenInput): Promise<{
    accessToken: string;
}>;
/** Revoke the user's refresh token (logout). */
export declare function logout(userId: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map