const store = new Map<string, { data: unknown; expireAt: number }>();

const DEFAULT_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms

/* Get value if not expired */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expireAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

/* Set value with TTL */
export function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL): void {
  store.set(key, {
    data: value,
    expireAt: Date.now() + ttlMs,
  });
}

/* Remove key */
export function delCache(key: string): void {
  store.delete(key);
}

/* Cache-or-fetch */
export async function cacheFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs = DEFAULT_TTL
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) {
    console.log("CACHE HIT →", key);
    return cached;
  }

  console.log("CACHE MISS →", key);
  const fresh = await fetchFn();
  setCache(key, fresh, ttlMs);
  return fresh;
}

/* Predefined keys */
export const CacheKeys = {
  trending: "movies:trending",
  homeTrailers: "movies:home-trailers",
};
