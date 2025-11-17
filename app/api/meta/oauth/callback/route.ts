import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    return new Response(challenge || '', { status: 200 });
  } else {
    console.log('❌ Verificación fallida');
    return new Response(JSON.stringify({ message: 'Verification failed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📩 Webhook recibido:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new Response('Error interno', { status: 500 });
  }

  return new Response('Webhook received', { status: 200 });
}
