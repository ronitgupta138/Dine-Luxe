export declare const config: {
    PORT: string;
    NODE_ENV: "development" | "production" | "test";
    FRONTEND_URL: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_JWT_SECRET: string;
    REDIS_URL: string;
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
    BCRYPT_SALT_ROUNDS: number;
    OTP_EXPIRY_SECONDS: number;
    GEO_FENCE_RADIUS_METERS: number;
};
export type Config = typeof config;
//# sourceMappingURL=env.d.ts.map