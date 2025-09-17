import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RequestCount {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, RequestCount>()

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> => {
    const ip = getClientIP(request)
    const now = Date.now()
    // const windowStart = now - config.windowMs // Not currently used
    
    // Clean up old entries
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetTime < now) {
        requestCounts.delete(key)
      }
    }
    
    const requestCount = requestCounts.get(ip)
    
    if (!requestCount || requestCount.resetTime < now) {
      // First request in window or window expired
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: now + config.windowMs
      }
    }
    
    if (requestCount.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: requestCount.resetTime
      }
    }
    
    // Increment count
    requestCount.count++
    requestCounts.set(ip, requestCount)
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - requestCount.count,
      reset: requestCount.resetTime
    }
  }
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to a default IP if none found
  return request.ip || '127.0.0.1'
}

// Common rate limit configurations
export const rateLimitConfigs = {
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes
  moderate: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  lenient: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 1000 requests per 15 minutes
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
}
