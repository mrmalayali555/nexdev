import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Route handler for Vercel Blob
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({ message: 'Vercel Blob endpoint' });
}

export async function POST(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Vercel Blob token not configured (BLOB_READ_WRITE_TOKEN).' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || `upload-${Date.now()}`;

  try {
    const blob = await put(filename, request.body!, {
      access: 'public',
      token,
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Blob upload failed' },
      { status: 500 }
    );
  }
}
