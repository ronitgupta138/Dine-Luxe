"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
class ResilientRedis {
    constructor() {
        this.memory = new Map();
        this.memoryZSets = new Map();
        this.connected = false;
        this.hasLoggedConnect = false;
        this.hasLoggedInitialError = false;
        this.hasLoggedReconnect = false;
        this.client = new ioredis_1.default(env_1.config.REDIS_URL, {
            // Keep requests queued while Redis reconnects instead of rejecting and
            // crashing the API process in local/dev when Redis is temporarily down.
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            // lazyConnect removed – ioredis must connect eagerly so RedisStore and
            // OTP/rate-limit calls are ready before the first request arrives.
        });
        this.client.on('connect', () => {
            this.connected = true;
            this.hasLoggedReconnect = false;
            if (!this.hasLoggedConnect) {
                console.log('✅ Redis connected');
                this.hasLoggedConnect = true;
            }
        });
        this.client.on('error', (err) => {
            this.connected = false;
            if (!this.hasLoggedInitialError) {
                console.error('❌ Redis error:', err.message);
                this.hasLoggedInitialError = true;
            }
            // Do not crash the process on transient Redis errors
        });
        this.client.on('reconnecting', () => {
            this.connected = false;
            if (!this.hasLoggedReconnect) {
                console.warn('⚠️  Redis reconnecting...');
                this.hasLoggedReconnect = true;
            }
        });
    }
    get status() {
        return this.connected ? this.client.status : 'offline';
    }
    on(event, listener) {
        this.client.on(event, listener);
    }
    now() {
        return Date.now();
    }
    getMemoryEntry(key) {
        const entry = this.memory.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && entry.expiresAt <= this.now()) {
            this.memory.delete(key);
            return null;
        }
        return entry.value;
    }
    setMemoryEntry(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds ? this.now() + ttlSeconds * 1000 : undefined;
        this.memory.set(key, { value, expiresAt });
        return 'OK';
    }
    getMemoryTtlSeconds(key) {
        const entry = this.memory.get(key);
        if (!entry)
            return -2;
        if (!entry.expiresAt)
            return -1;
        const remaining = Math.ceil((entry.expiresAt - this.now()) / 1000);
        if (remaining <= 0) {
            this.memory.delete(key);
            return -2;
        }
        return remaining;
    }
    getMemoryZSet(key) {
        const existing = this.memoryZSets.get(key);
        if (existing)
            return existing;
        const created = new Map();
        this.memoryZSets.set(key, created);
        return created;
    }
    async get(key) {
        if (this.connected)
            return this.client.get(key);
        return this.getMemoryEntry(key);
    }
    async set(key, value, mode, ttl) {
        if (this.connected) {
            return this.client.set(key, value, mode, ttl);
        }
        const ttlSeconds = mode === 'EX' && typeof ttl === 'number' ? ttl : undefined;
        return this.setMemoryEntry(key, value, ttlSeconds);
    }
    async setex(key, ttlSeconds, value) {
        return this.set(key, value, 'EX', ttlSeconds);
    }
    async del(...keys) {
        if (this.connected)
            return this.client.del(...keys);
        let deleted = 0;
        for (const key of keys) {
            deleted += this.memory.delete(key) ? 1 : 0;
        }
        return deleted;
    }
    async exists(key) {
        if (this.connected)
            return this.client.exists(key);
        return this.getMemoryEntry(key) === null ? 0 : 1;
    }
    async incr(key) {
        if (this.connected)
            return this.client.incr(key);
        const current = Number(await this.get(key) ?? '0');
        const next = Number.isFinite(current) ? current + 1 : 1;
        this.setMemoryEntry(key, String(next));
        return next;
    }
    async ttl(key) {
        if (this.connected)
            return this.client.ttl(key);
        return this.getMemoryTtlSeconds(key);
    }
    async expire(key, seconds) {
        if (this.connected)
            return this.client.expire(key, seconds);
        const entry = this.memory.get(key);
        if (!entry)
            return 0;
        entry.expiresAt = this.now() + seconds * 1000;
        this.memory.set(key, entry);
        return 1;
    }
    async ping() {
        if (this.connected)
            return this.client.ping();
        return 'PONG';
    }
    async info(section) {
        if (this.connected)
            return this.client.info(section);
        return [
            '# Stats',
            'keyspace_hits:0',
            'keyspace_misses:0',
            `redis_mode:offline${section ? `:${section}` : ''}`,
        ].join('\r\n');
    }
    async zadd(key, score, member) {
        if (this.connected)
            return this.client.zadd(key, score, member);
        const zset = this.getMemoryZSet(key);
        const isNew = zset.has(member) ? 0 : 1;
        zset.set(member, score);
        return isNew;
    }
    async zrem(key, ...members) {
        if (this.connected)
            return this.client.zrem(key, ...members);
        const zset = this.memoryZSets.get(key);
        if (!zset)
            return 0;
        let removed = 0;
        for (const member of members) {
            removed += zset.delete(member) ? 1 : 0;
        }
        return removed;
    }
    async quit() {
        if (this.connected)
            return this.client.quit();
        return 'OK';
    }
    // rate-limit-redis uses sendCommand/call on the store side. When Redis is
    // offline the limiter is skipped, so this is only a safety net.
    async call(command, ...args) {
        if (this.connected) {
            return this.client.call(command, ...args);
        }
        const normalized = command.toLowerCase();
        if (normalized === 'get')
            return this.get(args[0]);
        if (normalized === 'set')
            return this.set(args[0], args[1], args[2], Number(args[3]));
        if (normalized === 'del')
            return this.del(...args);
        if (normalized === 'incr')
            return this.incr(args[0]);
        if (normalized === 'expire')
            return this.expire(args[0], Number(args[1]));
        throw new Error(`Redis command not available in offline mode: ${command}`);
    }
}
exports.redis = new ResilientRedis();
//# sourceMappingURL=redis.js.map