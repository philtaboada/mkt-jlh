import type { Channel, WhatsAppConfig } from '@/features/chat/types/settings';
import type {
  MessageTemplate,
  TemplateComponent,
  CreateTemplateInput,
} from '@/features/chat/types/template';
import { upsertTemplate } from '@/features/chat/api/template.api';

interface WhatsAppTemplateResponse {
  data: Array<{
    name: string;
    language: string;
    status: string;
    category: string;
    components: Array<{
      type: string;
      format?: string;
      text?: string;
      example?: {
        header_text?: string[];
        body_text?: string[][];
      };
      buttons?: Array<{
        type: string;
        text: string;
        url?: string;
        phone_number?: string;
      }>;
    }>;
    id?: string;
  }>;
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export async function syncWhatsAppTemplates(
  channel: Channel,
  config: WhatsAppConfig
): Promise<{ synced: number; errors: number }> {
  const { access_token, business_account_id } = config;

  if (!access_token || !business_account_id) {
    throw new Error('WhatsApp credentials not configured');
  }

  const apiUrl = `https://graph.facebook.com/v22.0/${business_account_id}/message_templates`;
  let synced = 0;
  let errors = 0;
  let nextUrl: string | undefined = apiUrl;

  try {
    console.log(`🔄 Starting sync for channel ${channel.id}...`);
    console.log(`📡 API URL: ${apiUrl}`);
    
    while (nextUrl) {
      console.log(`📥 Fetching templates from: ${nextUrl}`);
      
      const response = await fetch(nextUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error fetching WhatsApp templates:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: nextUrl,
        });
        throw new Error(
          `Failed to fetch templates: ${errorData.error?.message || response.statusText}`
        );
      }

      const data: WhatsAppTemplateResponse = await response.json();
      console.log(`📦 Received ${data.data?.length || 0} templates from API`);

      if (!data.data || data.data.length === 0) {
        console.log('⚠️ No templates found in response');
        if (!data.paging?.next) {
          break; // No more pages
        }
      }

      for (const template of data.data || []) {
        try {
          const components: TemplateComponent[] = template.components.map((comp) => ({
            type: comp.type as TemplateComponent['type'],
            format: comp.format as TemplateComponent['format'],
            text: comp.text,
            example: comp.example,
            buttons: comp.buttons?.map((btn) => ({
              type: btn.type as 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER',
              text: btn.text,
              url: btn.url,
              phone_number: btn.phone_number,
            })),
          }));

          const templateInput: CreateTemplateInput = {
            channel_id: channel.id,
            provider: 'whatsapp',
            name: template.name,
            language: template.language,
            category: template.category as MessageTemplate['category'],
            status: template.status as MessageTemplate['status'],
            components,
            provider_template_id: template.id,
            provider_data: {
              synced_at: new Date().toISOString(),
            },
          };

          await upsertTemplate(templateInput);
          synced++;
          console.log(`✅ Synced template: ${template.name} (${template.status})`);
        } catch (error) {
          console.error(`❌ Error syncing template ${template.name}:`, error);
          errors++;
        }
      }

      nextUrl = data.paging?.next;
      if (nextUrl) {
        console.log(`➡️ Fetching next page...`);
      }
    }

    console.log(`✅ Sync completed: ${synced} templates synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error syncing WhatsApp templates:', error);
    throw error;
  }
}
