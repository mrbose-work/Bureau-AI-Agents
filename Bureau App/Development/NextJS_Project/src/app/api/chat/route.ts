import { NextRequest, NextResponse } from 'next/server';
import { runBenjamin } from '@/lib/benjamin';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    const { response, engine, toolsUsed } = await runBenjamin(message, history);

    return NextResponse.json({
      response,
      agent: 'Benjamin',
      engine,
      toolsUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Benjamin API error:', err);
    return NextResponse.json(
      { error: 'Benjamin encountered an error', details: (err as Error).message },
      { status: 500 }
    );
  }
}
