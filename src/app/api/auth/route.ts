import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  createSessionToken,
  requireApiAuth,
  safeEqual,
  SESSION_COOKIE_NAME,
} from '@/lib/apiAuth';

export async function GET(req: Request) {
  const authEnabled = Boolean(process.env.API_AUTH_SECRET);
  if (!authEnabled) {
    return NextResponse.json({ authenticated: true, authEnabled: false }, { status: 200 });
  }
  const authError = requireApiAuth(req);
  if (authError) {
    return NextResponse.json({ authenticated: false, authEnabled: true }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, authEnabled: true }, { status: 200 });
}

export async function POST(req: Request) {
  const rateError = checkRateLimit(req, 'auth', 10, 60_000);
  if (rateError) return rateError;

  const secret = process.env.API_AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'API_AUTH_SECRET is not configured on the server.' },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => null)) as { secret?: string } | null;
  const provided = typeof body?.secret === 'string' ? body.secret.trim() : '';

  if (!provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = createSessionToken(secret);
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
