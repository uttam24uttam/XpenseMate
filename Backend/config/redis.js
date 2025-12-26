import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: times => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('ready', () => console.log('Redis ready'));
redis.on('error', err => console.error('Redis error:', err.message));

/**
 * - Value is raw numeric balance ONLY
 * - balance > 0  → user2 owes user1
 * - balance < 0  → user1 owes user2
 */

export const cacheKeys = {
    friendBalance: (userA, userB) => {
        const [u1, u2] = [userA, userB].sort();
        return `balance:${u1}:${u2}`;
    }
};

export const cacheUtils = {
    async getRawBalance(userA, userB) {
        const key = cacheKeys.friendBalance(userA, userB);
        const cached = await redis.get(key);
        if (cached) {
            console.log(`Cache HIT: ${key}`);
            return Number(cached);
        }
        console.log(`Cache MISS: ${key}`);
        return null;
    },

    async setRawBalance(userA, userB, balance, ttl = 300) {
        const key = cacheKeys.friendBalance(userA, userB);
        await redis.set(key, String(balance), 'EX', ttl);
        console.log(`Cache SET: ${key} = ${balance}`);
    },

    async invalidateBalance(userA, userB) {
        const key = cacheKeys.friendBalance(userA, userB);
        await redis.del(key);
        console.log(`Cache INVALIDATED: ${key}`);
    },

    async clearAllBalances() {
        const keys = await redis.keys('balance:*');
        if (keys.length) {
            await redis.del(...keys);
            console.log(`Cleared ${keys.length} balance cache entries`);
        }
    }
};

export default redis;
