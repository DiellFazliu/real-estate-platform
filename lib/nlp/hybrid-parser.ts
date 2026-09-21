import { quickParse } from './regex-parser'
import { parseWithGroq } from './groq-parser'
import type { ParsedQuery } from './types'

const cache = new Map<string, { result: ParsedQuery; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCached(key: string): ParsedQuery | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.result
}

function setCache(key: string, result: ParsedQuery): void {
  cache.set(key, { result, timestamp: Date.now() })
  if (cache.size > 1000) {
    const now = Date.now()
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) cache.delete(k)
    }
  }
}

export async function parseQuery(query: string): Promise<ParsedQuery> {
  const key = query.toLowerCase().trim()

  const cached = getCached(key)
  if (cached) {
    console.log('✅ [NLP] Cache hit:', key)
    return cached
  }

  const quick = quickParse(query)

  if (quick && hasEnoughFilters(quick)) {
    const result: ParsedQuery = { ...quick, confidence: 0.9 }
    setCache(key, result)
    console.log('⚡ [NLP] Regex parse:', key)
    return result
  }

  try {
    console.log('🤖 [NLP] Groq parse:', key)
    const result = await parseWithGroq(query)
    setCache(key, result)
    return result
  } catch (error) {
    console.error('❌ [NLP] Parse error:', error)
    const fallback: ParsedQuery = quick || {
      keywords: query.split(/\s+/).filter((w) => w.length > 3),
      confidence: 0.1,
    }
    return fallback
  }
}

function hasEnoughFilters(parsed: ParsedQuery): boolean {
  const filterCount = [
    parsed.bedrooms,
    parsed.bathrooms,
    parsed.minPrice,
    parsed.maxPrice,
    parsed.city,
    parsed.neighborhood,
    parsed.propertyType,
    parsed.listingType,
    parsed.features?.length,
  ].filter((f) => f !== undefined && f !== null && f !== 0).length

  return filterCount >= 1
}

export function clearCache(): void {
  cache.clear()
  console.log('🧹 [NLP] Cache cleared')
}

export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: 1000,
    ttlMinutes: CACHE_TTL / 60000,
  }
}