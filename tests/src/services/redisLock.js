/**
 * Redis Distributed Locking Service
 * Implements atomic check-and-set mutual exclusion with safe Lua token release.
 */
class RedisLockService {
  constructor(redisClient = null) {
    this.client = redisClient;
    // In-memory fallback map for environments without an active Redis daemon
    this.localLocks = new Map();
  }

  /**
   * Acquire a distributed lock on a table slot.
   * Command pattern: SET lock:table:{tableId}:{slot} token NX EX {ttlSeconds}
   * @param {string|number} tableId 
   * @param {string} timeSlot 
   * @param {string} token - Unique UUID/random owner identifier
   * @param {number} ttlSeconds - Expiration time in seconds (default 10)
   * @returns {Promise<boolean>} - True if acquired, false if already locked
   */
  async acquireLock(tableId, timeSlot, token, ttlSeconds = 10) {
    const lockKey = `lock:table:${tableId}:${timeSlot}`;

    if (this.client && this.client.status === 'ready') {
      try {
        const result = await this.client.set(lockKey, token, 'NX', 'EX', ttlSeconds);
        return result === 'OK';
      } catch (err) {
        // Fall back to local lock if Redis network call fails
      }
    }

    // In-memory atomic fallback
    const now = Date.now();
    const existing = this.localLocks.get(lockKey);
    if (existing && existing.expiresAt > now) {
      return false; // Lock already held
    }

    this.localLocks.set(lockKey, {
      token,
      expiresAt: now + (ttlSeconds * 1000)
    });
    return true;
  }

  /**
   * Safely release lock using Lua evaluation to guarantee lock ownership.
   * Only deletes if the value in Redis exactly matches the acquiring token.
   * @param {string|number} tableId 
   * @param {string} timeSlot 
   * @param {string} token 
   * @returns {Promise<boolean>}
   */
  async releaseLock(tableId, timeSlot, token) {
    const lockKey = `lock:table:${tableId}:${timeSlot}`;

    if (this.client && this.client.status === 'ready') {
      try {
        const luaScript = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const res = await this.client.eval(luaScript, 1, lockKey, token);
        return res === 1;
      } catch (err) {
        // Fall back to local lock
      }
    }

    // In-memory atomic release
    const existing = this.localLocks.get(lockKey);
    if (existing && existing.token === token) {
      this.localLocks.delete(lockKey);
      return true;
    }
    return false;
  }
}

module.exports = RedisLockService;
