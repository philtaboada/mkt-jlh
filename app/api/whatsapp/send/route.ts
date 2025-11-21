import { NextResponse } from 'next/server';
const TOKEN = process.env.WHATSAPP_TOKEN;
console.log('Using WhatsApp Token:', TOKEN);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('RAW request body:', body);

    const { to, type, text } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing 'to'" }, { status: 400 });
    }

    if (type === 'text' && (!text || !text.body)) {
      return NextResponse.json({ error: 'Missing text.body' }, { status: 400 });
    }

    // Construir payload EXACTO como lo envías
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type,
      text,
    };

    console.log('Sending WhatsApp message to:', to);
    console.log('Message body:', text?.body);

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log('WhatsApp Message Sent Response:', data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
