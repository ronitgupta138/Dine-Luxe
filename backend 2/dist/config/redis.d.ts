declare class ResilientRedis {
    private readonly client;
    private readonly memory;
    private readonly memoryZSets;
    private connected;
    private hasLoggedConnect;
    private hasLoggedInitialError;
    private hasLoggedReconnect;
    constructor();
    get status(): string;
    on(event: string, listener: (...args: unknown[]) => void): void;
    private now;
    private getMemoryEntry;
    private setMemoryEntry;
    private getMemoryTtlSeconds;
    private getMemoryZSet;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode?: string, ttl?: number): Promise<'OK'>;
    setex(key: string, ttlSeconds: number, value: string): Promise<'OK'>;
    del(...keys: string[]): Promise<number>;
    exists(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    ttl(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ping(): Promise<string>;
    info(section?: string): Promise<string>;
    zadd(key: string, score: number, member: string): Promise<number>;
    zrem(key: string, ...members: string[]): Promise<number>;
    quit(): Promise<'OK'>;
    call(command: string, ...args: string[]): Promise<unknown>;
}
export declare const redis: ResilientRedis;
export {};
//# sourceMappingURL=redis.d.ts.map