// import Redis from 'ioredis';
// import dotenv from 'dotenv';

// dotenv.config();

// // Redis connection configuration
// const redisConfig = {
//     host: process.env.REDIS_HOST || 'localhost',
//     port: process.env.REDIS_PORT || 6379,
//     password: process.env.REDIS_PASSWORD || undefined,
//     retryStrategy: (times) => {
//         const delay = Math.min(times * 50, 2000);
//         return delay;
//     },
//     maxRetriesPerRequest: 3
// };

// // Create Redis client
// const redis = new Redis(redisConfig);

// // Connection event handlers
// redis.on('connect', () => {
//     console.log('Redis connected successfully');
// });

// redis.on('error', (err) => {
//     console.error('Redis connection error:', err.message);
// });

// redis.on('ready', () => {
//     console.log(' Redis is ready to accept commands');
// });

// // friend balance caching
// export const cacheKeys = {
//     friendBalance: (userId, friendId) => {
//         // Normalize to ensure A-B and B-A use same cache key
//         const [user1, user2] = [userId, friendId].sort();
//         return `balance:${user1}:${user2}`;
//     }
// };

// export const cacheUtils = {
//     // Get cached balance
//     async getBalance(userId, friendId) {
//         try {
//             const key = cacheKeys.friendBalance(userId, friendId);
//             const cached = await redis.get(key);
//             if (cached) {
//                 console.log(` Cache HIT: ${key}`);
//                 return JSON.parse(cached);
//             }
//             console.log(` Cache MISS: ${key}`);
//             return null;
//         } catch (error) {
//             console.error('Redis get error:', error);
//             return null;
//         }
//     },

//     // Set balance cache with TTL (5 minutes)
//     async setBalance(userId, friendId, data, ttl = 300) {
//         try {
//             const key = cacheKeys.friendBalance(userId, friendId);
//             await redis.setex(key, ttl, JSON.stringify(data));
//             console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
//         } catch (error) {
//             console.error('Redis set error:', error);
//             // Fail silently - caching is not critical
//         }
//     },

//     // Invalidate balance cache (when balance updates)
//     async invalidateBalance(userId, friendId) {
//         try {
//             const key = cacheKeys.friendBalance(userId, friendId);
//             await redis.del(key);
//             console.log(`  Cache INVALIDATED: ${key}`);
//         } catch (error) {
//             console.error('Redis delete error:', error);
//         }
//     },

//     async clearAllBalances() {
//         try {
//             const keys = await redis.keys('balance:*');
//             if (keys.length > 0) {
//                 await redis.del(...keys);
//                 console.log(` Cleared ${keys.length} balance cache entries`);
//             }
//         } catch (error) {
//             console.error('Redis clear error:', error);
//         }
//     }
// };

// export default redis;



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
 * CACHE CONTRACT (IMPORTANT)
 * - Key is symmetric
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
