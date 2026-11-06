type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as unknown as {
  cyberwatchRateLimits?: Map<string, RateLimitRecord>;
};

const records = globalRateLimit.cyberwatchRateLimits ?? new Map<string, RateLimitRecord>();

if (process.env.NODE_ENV !== "production") {
  globalRateLimit.cyberwatchRateLimits = records;
}

export function takeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = records.get(key);

  if (!existing || existing.resetAt <= now) {
    records.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  records.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
