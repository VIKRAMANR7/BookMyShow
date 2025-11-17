import { redis } from "../configs/redis.js";

const PREFIX = "bms:";
const DEFAULT_TTL = 6 * 60 * 60; // 6 hours

/* Safely parse Redis JSON. */
function parse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/* Build redis key with prefix. */
function key(k: string) {
  return `${PREFIX}${k}`;
}

/* Get cached value. */
export async function getCache<T>(k: string): Promise<T | null> {
  try {
    const raw = await redis.get<string | null>(key(k));
    return parse<T>(raw);
  } catch (err) {
    console.error("Redis GET failed:", err);
    return null;
  }
}

/* Set cache with TTL. */
export async function setCache<T>(k: string, value: T, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(key(k), JSON.stringify(value), { ex: ttl });
  } catch (err) {
    console.error("Redis SET failed:", err);
  }
}

/* Delete cache key. */
export async function delCache(k: string): Promise<void> {
  try {
    await redis.del(key(k));
  } catch (err) {
    console.error("Redis DEL failed:", err);
  }
}

/* Cache-or-fetch helper. */
export async function cacheFetch<T>(
  k: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  const cached = await getCache<T>(k);

  if (cached !== null) {
    console.log("CACHE HIT →", k);
    return cached;
  }

  console.log("CACHE MISS →", k);

  const fresh = await fetchFn();

  // non-blocking
  setCache(k, fresh, ttl).catch(() => {});

  return fresh;
}

/* Predefined keys */
export const CacheKeys = {
  homeTrailers: "trailers:home",
  trending: "movies:trending",
  tmdbMovie: (id: number) => `tmdb:movie:${id}`,
  tmdbCredits: (id: number) => `tmdb:credits:${id}`,
} as const;
