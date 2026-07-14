import { NextRequest, NextResponse } from 'next/server';
import { runBenjamin } from '@/lib/benjamin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ custom: string[] }> }
) {
  const { custom } = await params;
  const path = custom.join('/');

  if (path === 'health') {
    return NextResponse.json({ ok: true, status: 'healthy' });
  }

  if (path === 'state') {
    return NextResponse.json({
      profileName: 'Benjamin Butler Office',
      active: {
        'benjamin': ['meta/llama-4-maverick-17b-128e-instruct']
      },
      identity: {
        name: 'Benjamin',
        role: 'butler',
        lane: 'benjamin',
        model_id: 'meta/llama-4-maverick-17b-128e-instruct'
      },
      runtime: {
        name: 'Benjamin Agent Runtime',
        version: '1.0.0',
        vendor: 'Bureau Systems',
        status: 'idle',
        active_model: 'meta/llama-4-maverick-17b-128e-instruct'
      }
    });
  }

  if (path === 'registry') {
    return NextResponse.json({
      models: {
        'meta/llama-4-maverick-17b-128e-instruct': { name: 'NVIDIA Llama 4 Maverick (17B)' }
      }
    });
  }

  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ custom: string[] }> }
) {
  const { custom } = await params;
  const path = custom.join('/');

  if (path === 'v1/chat/completions') {
    try {
      const body = await request.json();
      const messages = body.messages || [];
      
      // The last message is the user prompt
      const userMessage = messages[messages.length - 1]?.content || '';
      
      // Convert history format from OpenAI to runBenjamin format
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role,
        content: m.content || ''
      }));

      const { response, engine, toolsUsed } = await runBenjamin(userMessage, history);

      return NextResponse.json({
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: body.model || 'benjamin',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response
            },
            finish_reason: 'stop'
          }
        ]
      });
    } catch (err) {
      console.error('Custom runtime completions error:', err);
      return NextResponse.json(
        { error: 'Internal Error', details: (err as Error).message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
