import crypto from 'crypto';
import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_RATE_LIMIT_ENTRIES = 1000;

/**
 * Extracts client IP for rate limiting.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * In-memory sliding-window rate limiter with bounded map cleanup.
 * Returns a 429 NextResponse if exceeded, or null if allowed.
 */
export function checkRateLimit(
  req: Request,
  bucket: string,
  maxRequests = 60,
  windowMs = 60_000
): NextResponse | null {
  const now = Date.now();

  if (rateLimitStore.size > MAX_RATE_LIMIT_ENTRIES) {
    for (const [k, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(k);
      }
    }
  }

  const ip = getClientIp(req);
  const key = `${bucket}:${ip}`;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 }
    );
  }

  existing.count += 1;
  return null;
}

/**
 * Timing-safe string comparison to prevent timing attacks on secret tokens.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export const SESSION_COOKIE_NAME = 'nexdev_session';

/**
 * Signs a session token using HMAC-SHA256 with API_AUTH_SECRET.
 */
export function createSessionToken(secret: string): string {
  const issuedAt = Date.now().toString();
  const sig = crypto.createHmac('sha256', secret).update(issuedAt).digest('hex');
  return `${issuedAt}.${sig}`;
}

/**
 * Verifies an HMAC-SHA256 session cookie token (valid for 30 days).
 */
export function verifySessionToken(token: string, secret: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [issuedAt, sig] = parts;
  const ts = Number(issuedAt);
  if (!Number.isFinite(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) {
    return false;
  }
  const expectedSig = crypto.createHmac('sha256', secret).update(issuedAt).digest('hex');
  return safeEqual(sig, expectedSig);
}

function getCookieValue(cookieHeader: string | null, name: string): string {
  if (!cookieHeader) return '';
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

/**
 * Verifies API authentication and same-origin policy.
 * - When API_AUTH_SECRET is configured, accepts a matching Bearer token, x-api-key header,
 *   or valid HMAC-signed HttpOnly session cookie.
 * - When API_AUTH_SECRET is NOT configured (personal/hobby deployment without passphrase lock),
 *   allows same-origin app requests seamlessly while blocking cross-origin requests.
 */
export function requireApiAuth(req: Request): NextResponse | null {
  const expectedSecret = process.env.API_AUTH_SECRET;
  const authHeader = req.headers.get('authorization');
  const apiKeyHeader = req.headers.get('x-api-key');

  if (expectedSecret) {
    const bearerOrKey = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : apiKeyHeader?.trim() || '';

    if (bearerOrKey && safeEqual(bearerOrKey, expectedSecret)) {
      return null;
    }

    const sessionCookie = getCookieValue(req.headers.get('cookie'), SESSION_COOKIE_NAME);
    if (sessionCookie && verifySessionToken(sessionCookie, expectedSecret)) {
      return null;
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // No passphrase secret configured: enforce same-origin on browser requests when Origin is present
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid Origin header' }, { status: 403 });
    }
  }

  return null;
}
