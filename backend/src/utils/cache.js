const NodeCache = require('node-cache');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
    stdTTL: 300, // 5 minutes
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false // Better performance
});

// Cache keys
const CACHE_KEYS = {
    LENDER: 'lender',
    STATS: 'stats',
    DASHBOARD: 'dashboard'
};

/**
 * Get value from cache
 */
const get = (key) => {
    return cache.get(key);
};

/**
 * Set value in cache
 */
const set = (key, value, ttl = 300) => {
    return cache.set(key, value, ttl);
};

/**
 * Delete key from cache
 */
const del = (key) => {
    return cache.del(key);
};

/**
 * Clear all cache
 */
const flush = () => {
    return cache.flushAll();
};

/**
 * Cache middleware for Express routes
 * Usage: app.get('/api/resource', cacheMiddleware(60), controller)
 */
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = keyGenerator ? keyGenerator(req) : `route:${req.originalUrl}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // Set cache header to indicate hit
            res.set('X-Cache', 'HIT');
            return res.json(cachedResponse);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache the response
        res.json = (body) => {
            if (res.statusCode === 200) {
                cache.set(key, body, duration);
            }
            res.set('X-Cache', 'MISS');
            return originalJson(body);
        };

        next();
    };
};

/**
 * Invalidate cache keys matching a pattern
 */
const invalidatePattern = (pattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => cache.del(key));
    return matchingKeys.length;
};

module.exports = {
    cache,
    get,
    set,
    del,
    flush,
    cacheMiddleware,
    invalidatePattern,
    CACHE_KEYS
};
