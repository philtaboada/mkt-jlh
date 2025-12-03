import { NextRequest, NextResponse } from 'next/server';
import { encryptApiKey } from '@/lib/utils/encryption';

/**
 * POST - Encripta una API key
 * Esta ruta se usa desde el cliente porque crypto de Node.js no está disponible en el navegador
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const encrypted = encryptApiKey(apiKey);

    return NextResponse.json({ encrypted });
  } catch (error) {
    console.error('Error encrypting API key:', error);
    return NextResponse.json(
      { error: 'Failed to encrypt API key' },
      { status: 500 }
    );
  }
}
