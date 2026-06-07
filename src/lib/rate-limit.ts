const requestCounts = new Map<string, { count: number; time: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60000
) {
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now - entry.time > windowMs) {
    requestCounts.set(key, { count: 1, time: now });
    return;
  }

  if (entry.count >= limit) {
    throw new Error("Rate limit exceeded");
  }

  entry.count++;
}