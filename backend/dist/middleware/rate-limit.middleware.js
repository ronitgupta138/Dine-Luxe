"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = require("rate-limit-redis");
const redis_1 = require("../config/redis");
const response_1 = require("../utils/response");
function makeStore(prefix) {
    return new rate_limit_redis_1.RedisStore({
        // @ts-expect-error – ioredis and rate-limit-redis type mismatch on sendCommand
        sendCommand: (...args) => redis_1.redis.call(...args),
        prefix,
    });
}
function rateLimitResponse(_req, _res, _next, options) {
    return {
        ...(0, response_1.error)('RATE_LIMIT_EXCEEDED', options.message),
    };
}
/** Shared safe-store factory: if Redis is unavailable the limiter degrades gracefully */
function makeLimiter(options, prefix) {
    if (redis_1.redis.status !== 'ready') {
        return (0, express_rate_limit_1.default)({
            skipFailedRequests: false,
            ...options,
        });
    }
    return (0, express_rate_limit_1.default)({
        skipFailedRequests: false,
        store: makeStore(prefix),
        ...options,
    });
}
/** 100 requests per 15 minutes – general API routes */
exports.generalLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(null, null, null, {
        message: 'Too many requests. Please try again in 15 minutes.',
    }),
}, 'rl:general:');
/** 10 requests per 15 minutes – auth routes */
exports.authLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(null, null, null, {
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
    }),
}, 'rl:auth:');
/** 20 requests per hour – upload routes */
exports.uploadLimiter = makeLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse(null, null, null, {
        message: 'Upload limit reached. Please try again in an hour.',
    }),
}, 'rl:upload:');
//# sourceMappingURL=rate-limit.middleware.js.map