"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./types/express.d.ts" />
const env_1 = require("./config/env");
const redis_1 = require("./config/redis");
const app_1 = __importDefault(require("./app"));
const PORT = Number(env_1.config.PORT) || 3000;
const server = app_1.default.listen(PORT, () => {
    console.log(`🚀 Restaurant OS API running on port ${PORT} [${env_1.config.NODE_ENV}]`);
});
// ─── Graceful shutdown ───────────────────────────────────────────────────────
async function shutdown(signal) {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);
    server.close(async (err) => {
        if (err) {
            console.error('❌ Error closing HTTP server:', err.message);
            process.exit(1);
        }
        try {
            await redis_1.redis.quit();
            console.log('✅ Redis connection closed.');
        }
        catch (redisErr) {
            console.error('❌ Error closing Redis:', redisErr);
        }
        console.log('👋 Server shut down cleanly.');
        process.exit(0);
    });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    console.error('🔥 Unhandled rejection:', reason);
    const message = reason instanceof Error ? reason.message : String(reason);
    const isRedisRetryError = message.includes('MaxRetriesPerRequestError');
    if (isRedisRetryError) {
        console.warn('⚠️  Redis is unavailable. API stays up; Redis-backed features may fail until reconnect.');
        return;
    }
    shutdown('UNHANDLED_REJECTION');
});
//# sourceMappingURL=server.js.map