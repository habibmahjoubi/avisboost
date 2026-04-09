/**
 * Simple in-memory rate limiter.
 * For production at scale, replace with Redis-based solution (e.g. Upstash).
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (now > value.resetAt) attempts.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check if a key has exceeded the rate limit.
 * @returns { success: true } if allowed, { success: false, retryAfterSeconds } if blocked.
 */
export function rateLimit(
  key: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number }
): { success: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= maxAttempts) {
    return {
      success: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { success: true };
}
