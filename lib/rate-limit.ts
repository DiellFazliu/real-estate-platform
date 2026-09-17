const attempts = new Map<string, number[]>()

export function checkRateLimit(
  userId: string,
  maxAttempts: number = 3,
  windowMs: number = 24 * 60 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userAttempts = attempts.get(userId) || []

  // Filtro vetëm attempts brenda window
  const recentAttempts = userAttempts.filter((t) => now - t < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return { allowed: false, remaining: 0 }
  }

  recentAttempts.push(now)
  attempts.set(userId, recentAttempts)

  return {
    allowed: true,
    remaining: maxAttempts - recentAttempts.length,
  }
}