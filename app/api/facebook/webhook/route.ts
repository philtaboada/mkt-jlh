import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createLead } from '@/lib/api/leads';
import { mapFacebookLeadToLead, FacebookLeadData, Lead } from '@/types/lead';

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
    return new Response('Forbidden', { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Obtener el body como texto para validar la firma
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);
    console.log('📩 Webhook recibido:', JSON.stringify(body, null, 2));

    // Validar firma (opcional pero recomendado)
    const signature = req.headers.get('x-hub-signature-256');
    if (signature && process.env.META_APP_SECRET) {
      const isValid = verifySignature(signature, bodyText, process.env.META_APP_SECRET);
      if (!isValid) {
        console.log('❌ Firma inválida');
        return new Response('Invalid signature', { status: 403 });
      }
    }

    // Procesar cada entrada
    if (body.object === 'page' && body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'leadgen' && change.value?.leadgen_id) {
              const leadgenId = change.value.leadgen_id;
              console.log('🆕 Nuevo lead ID:', leadgenId);

              // Obtener los datos del lead (no esperamos para responder rápido a Facebook)
              fetchLeadData(leadgenId).catch((error) => {
                console.error('❌ Error procesando lead:', leadgenId, error);
              });
            }
          }
        }
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new Response('Error interno', { status: 500 });
  }
}

// Función para obtener datos del lead
async function fetchLeadData(leadgenId: string) {
  try {
    if (!process.env.META_PAGE_ACCESS_TOKEN) {
      throw new Error('META_PAGE_ACCESS_TOKEN no está configurado');
    }

    const url = `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de Facebook API: ${response.status} - ${errorText}`);
    }

    const leadData = await response.json();

    // Validar si hay error en la respuesta de Facebook
    if (leadData.error) {
      throw new Error(`Error de Facebook API: ${leadData.error.message}`);
    }

    console.log('📋 Datos del lead:', JSON.stringify(leadData, null, 2));

    // Mapear los datos del lead a FacebookLeadData
    const fieldData = leadData.field_data || [];
    const getFieldValue = (name: string) =>
      fieldData.find((f: { name: string; values?: string[] }) => f.name === name)?.values?.[0] || '';

    const fbLeadData: FacebookLeadData = {
      id: leadData.id,
      created_time: leadData.created_time,
      ad_id: leadData.ad_id,
      ad_name: leadData.ad_name,
      adset_id: leadData.adset_id,
      adset_name: leadData.adset_name,
      campaign_id: leadData.campaign_id,
      campaign_name: leadData.campaign_name,
      form_id: leadData.form_id,
      form_name: leadData.form_name,
      is_organic: leadData.is_organic || '',
      platform: leadData.platform || '',
      '¿cuenta_con_una_licitación_pública_o_privada_aprobada?': getFieldValue(
        '¿cuenta_con_una_licitación_pública_o_privada_aprobada?'
      ),
      '¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?': getFieldValue(
        '¿ganó_el_proyecto_o_servicio_como_empresa_o_consorcio?'
      ),
      '¿por_cuál_medio_prefiere_que_nos_comuniquemos_con_usted?': getFieldValue(
        '¿por_cuál_medio_prefiere_que_nos_comuniquemos_con_usted?'
      ),
      ruc: getFieldValue('ruc'),
      nombre_y_apellidos: getFieldValue('nombre_y_apellidos'),
      phone_number: getFieldValue('phone_number'),
      correo_electrónico: getFieldValue('correo_electrónico'),
      provincia: getFieldValue('provincia'),
      lead_status: leadData.lead_status || 'complete',
    };

    // Validar datos mínimos requeridos
    if (!fbLeadData.nombre_y_apellidos && !fbLeadData.correo_electrónico) {
      throw new Error('Lead sin datos mínimos requeridos (nombre o email)');
    }

    // Mapear a Lead usando la función existente
    const lead = mapFacebookLeadToLead(fbLeadData);

    // Guardar el lead en la base de datos
    // mapFacebookLeadToLead devuelve Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'assigned_user'>
    // createLead espera Omit<Lead, 'id' | 'created_at' | 'updated_at'>
    // assigned_user es un campo calculado de la BD, así que podemos pasar el lead directamente
    const createdLead = await createLead(lead as Omit<Lead, 'id' | 'created_at' | 'updated_at'>);
    console.log('✅ Lead guardado exitosamente:', createdLead.id);
    
    return leadData;
  } catch (error) {
    console.error('❌ Error obteniendo datos del lead:', error);
    throw error;
  }
}

// Función para verificar firma (seguridad)
function verifySignature(signature: string, body: string, appSecret: string): boolean {
  const expectedSignature =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
