const Redis = require('ioredis');

/**
 * Redis Cache Service
 * Handles all Redis caching operations with fallback to database
 */
class RedisCacheService {
    constructor() {
        this.client = null;
        this.enabled = process.env.REDIS_ENABLED !== 'false';
        this._initializeClient();
    }

    /**
     * Initialize Redis client
     */
    _initializeClient() {
        if (!this.enabled) {
            console.log('Redis caching is disabled');
            return;
        }

        try {
            const config = {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
                db: parseInt(process.env.REDIS_DB || '0', 10),
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: true,
            };

            this.client = new Redis(config);

            this.client.on('connect', () => {
                console.log('Redis client connected');
            });

            this.client.on('ready', () => {
                console.log('Redis client ready');
            });

            this.client.on('error', (error) => {
                console.error('Redis client error:', error.message);
                // Don't throw, allow fallback to database
            });

            this.client.on('close', () => {
                console.log('Redis client connection closed');
            });

            // Connect to Redis
            this.client.connect().catch((error) => {
                console.error('Failed to connect to Redis:', error.message);
                this.enabled = false;
            });
        } catch (error) {
            console.error('Failed to initialize Redis client:', error.message);
            this.enabled = false;
        }
    }

    /**
     * Check if Redis is available
     */
    async isAvailable() {
        if (!this.enabled || !this.client) {
            return false;
        }
        try {
            const status = await this.client.ping();
            return status === 'PONG';
        } catch (error) {
            return false;
        }
    }

    /**
     * Get value from cache
     */
    async get(key) {
        if (!this.enabled || !this.client) {
            return null;
        }

        try {
            const value = await this.client.get(key);
            if (value === null) {
                return null;
            }
            return JSON.parse(value);
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error.message);
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     */
    async set(key, value, ttlSeconds = null) {
        if (!this.enabled || !this.client) {
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, serialized);
            } else {
                await this.client.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete a specific key
     */
    async del(key) {
        if (!this.enabled || !this.client) {
            return false;
        }

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Delete keys matching a pattern
     */
    async delPattern(pattern) {
        if (!this.enabled || !this.client) {
            return false;
        }

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            const deleted = await this.client.del(...keys);
            return deleted;
        } catch (error) {
            console.error(`Cache delete pattern error for ${pattern}:`, error.message);
            return 0;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key) {
        if (!this.enabled || !this.client) {
            return false;
        }

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Cache exists error for key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Get multiple keys
     */
    async mget(keys) {
        if (!this.enabled || !this.client || keys.length === 0) {
            return keys.map(() => null);
        }

        try {
            const values = await this.client.mget(...keys);
            return values.map(value => {
                if (value === null) {
                    return null;
                }
                try {
                    return JSON.parse(value);
                } catch (error) {
                    return null;
                }
            });
        } catch (error) {
            console.error(`Cache mget error:`, error.message);
            return keys.map(() => null);
        }
    }

    /**
     * Set multiple keys
     */
    async mset(keyValuePairs, ttlSeconds = null) {
        if (!this.enabled || !this.client || keyValuePairs.length === 0) {
            return false;
        }

        try {
            const pipeline = this.client.pipeline();
            for (const [key, value] of keyValuePairs) {
                const serialized = JSON.stringify(value);
                if (ttlSeconds) {
                    pipeline.setex(key, ttlSeconds, serialized);
                } else {
                    pipeline.set(key, serialized);
                }
            }
            await pipeline.exec();
            return true;
        } catch (error) {
            console.error(`Cache mset error:`, error.message);
            return false;
        }
    }

    /**
     * Get or set pattern - get from cache or fetch and cache
     */
    async getOrSet(key, fetchFn, ttlSeconds = null) {
        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch from source
        const value = await fetchFn();

        // Cache the result
        if (value !== null && value !== undefined) {
            await this.set(key, value, ttlSeconds);
        }

        return value;
    }

    /**
     * Invalidate pattern
     */
    async invalidatePattern(pattern) {
        return await this.delPattern(pattern);
    }

    /**
     * Close Redis connection
     */
    async close() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
}

module.exports = new RedisCacheService();
