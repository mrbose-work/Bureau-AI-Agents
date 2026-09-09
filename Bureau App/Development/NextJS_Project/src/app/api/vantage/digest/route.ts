import { NextResponse } from 'next/server';
import { buildMorningDigest } from '@/lib/vantageIndia/digest';

export async function GET() {
  try {
    const digest = await buildMorningDigest();
    return NextResponse.json(digest);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
