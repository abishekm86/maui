class LRUCache<K, V> {
  private cache: Map<K, V>
  private readonly max: number

  constructor({ max }: { max: number }) {
    this.cache = new Map()
    this.max = max
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined

    // Retrieve the value and reinsert it to mark it as most recently used
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    // If the cache exceeds the max size, delete the least recently used item
    if (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value
      oldestKey && this.cache.delete(oldestKey)
    }

    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }
}

interface CacheOptions {
  cacheLimit?: number
  enableCache?: boolean
}

export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  { cacheLimit = 10, enableCache = true }: CacheOptions = {},
): T {
  const cache = new LRUCache<string, ReturnType<T>>({ max: cacheLimit })

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Bypass cache if caching is disabled
    if (!enableCache) return fn(...args)

    // Generate a unique cache key based on arguments
    const cacheKey = JSON.stringify(args)

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as ReturnType<T>
    }

    const result = await fn(...args)
    cache.set(cacheKey, result)
    return result
  }) as T
}
