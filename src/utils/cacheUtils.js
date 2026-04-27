/**
 * Generic localStorage cache with TTL support.
 * All news/video utilities share the same 24h TTL structure.
 */

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached data if still valid.
 * @param {string} cacheKey
 * @param {number} [ttl=DEFAULT_TTL]
 * @param {Storage} [storage=localStorage]
 * @returns {any|null} Cached data or null if missing/expired
 */
export const cacheGet = (
  cacheKey,
  ttl = DEFAULT_TTL,
  storage = localStorage
) => {
  try {
    const cached = storage.getItem(cacheKey);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl) {
      return data;
    }

    storage.removeItem(cacheKey);
    return null;
  } catch {
    storage.removeItem(cacheKey);
    return null;
  }
};

/**
 * Store data in cache with current timestamp.
 * Silently fails if storage is unavailable.
 * @param {string} cacheKey
 * @param {any} data
 * @param {Storage} [storage=localStorage]
 */
export const cacheSet = (cacheKey, data, storage = localStorage) => {
  try {
    storage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    // Silently fail — function still works without caching
  }
};

/**
 * Clear cached data.
 * @param {string} cacheKey
 * @param {Storage} [storage=localStorage]
 */
export const cacheClear = (cacheKey, storage = localStorage) => {
  try {
    storage.removeItem(cacheKey);
  } catch {
    // Silently fail
  }
};
