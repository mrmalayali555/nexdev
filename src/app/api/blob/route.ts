import path from 'path';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit } from '@/lib/apiAuth';

// Dynamic route handler for Vercel Blob uploads
export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
]);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export async function GET(request: Request) {
  const authError = requireApiAuth(request);
  if (authError) return authError;
  return NextResponse.json({ message: 'Vercel Blob endpoint' });
}

export async function POST(request: Request) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const rateError = checkRateLimit(request, 'blob', 20, 60_000);
  if (rateError) return rateError;

  const hasBlobAuth = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
  if (!hasBlobAuth) {
    return NextResponse.json(
      { error: 'Vercel Blob storage is not configured.' },
      { status: 503 }
    );
  }

  const contentType = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: 'Unsupported file content-type.' },
      { status: 415 }
    );
  }

  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds 5 MB upload limit.' },
      { status: 413 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawFilename = searchParams.get('filename') || `upload-${Date.now()}`;
  const baseName = path.basename(rawFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeFilename = baseName || `upload-${Date.now()}`;

  try {
    if (!request.body) {
      return NextResponse.json({ error: 'Empty request body.' }, { status: 400 });
    }

    // Stream and enforce exact byte limit regardless of Content-Length header
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > MAX_UPLOAD_BYTES) {
          await reader.cancel().catch(() => {});
          return NextResponse.json(
            { error: 'File exceeds 5 MB upload limit.' },
            { status: 413 }
          );
        }
        chunks.push(value);
      }
    }

    const buffer = Buffer.concat(chunks);
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await put(safeFilename, buffer, {
      access: 'public',
      ...(token ? { token } : {}),
      contentType,
    });

    return NextResponse.json(blob);
  } catch (error: unknown) {
    console.error('API /api/blob error:', error);
    return NextResponse.json(
      { error: 'Blob upload failed' },
      { status: 500 }
    );
  }
}
