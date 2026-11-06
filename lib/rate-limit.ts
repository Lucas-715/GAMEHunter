const ipRequests = new Map<string, { count: number; timestamp: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // Reset if window has passed
  if (now - record.timestamp > WINDOW_MS) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // Check if exceeded
  if (record.count >= MAX_REQUESTS) {
    return true;
  }

  // Increment
  record.count += 1;
  return false;
}
