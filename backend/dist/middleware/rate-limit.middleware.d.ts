/** 100 requests per 15 minutes – general API routes */
export declare const generalLimiter: import('express-rate-limit').RateLimitRequestHandler;
export declare const authLimiter: import('express-rate-limit').RateLimitRequestHandler;
/** 20 requests per hour – upload routes */
export declare const uploadLimiter: import('express-rate-limit').RateLimitRequestHandler;
//# sourceMappingURL=rate-limit.middleware.d.ts.map