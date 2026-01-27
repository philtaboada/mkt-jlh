'use server';

import { createClient } from '@/lib/supabase/server';
import type { MessageTemplate, CreateTemplateInput, UpdateTemplateInput } from '../types/template';
import type { Channel, WhatsAppConfig } from '../types/settings';

export async function getTemplatesByChannel(
  channelId: string,
  provider?: string
): Promise<MessageTemplate[]> {
  const supabase = await createClient();
  let query = supabase
    .from('mkt_message_templates')
    .select('*')
    .eq('channel_id', channelId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (provider) {
    query = query.eq('provider', provider);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  return (data || []) as MessageTemplate[];
}

export async function getTemplateById(id: string): Promise<MessageTemplate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_message_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching template:', error);
    throw error;
  }

  return data as MessageTemplate;
}

export async function getTemplateByName(
  channelId: string,
  name: string,
  provider: string
): Promise<MessageTemplate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_message_templates')
    .select('*')
    .eq('channel_id', channelId)
    .eq('name', name)
    .eq('provider', provider)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching template by name:', error);
    throw error;
  }

  return data as MessageTemplate;
}

export async function createTemplate(input: CreateTemplateInput): Promise<MessageTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_message_templates')
    .insert({
      channel_id: input.channel_id,
      provider: input.provider,
      name: input.name,
      language: input.language,
      category: input.category,
      status: input.status,
      components: input.components,
      provider_template_id: input.provider_template_id,
      provider_data: input.provider_data || {},
      last_synced_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }

  return data as MessageTemplate;
}

export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput
): Promise<MessageTemplate> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_message_templates')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating template:', error);
    throw error;
  }

  return data as MessageTemplate;
}

export async function upsertTemplate(input: CreateTemplateInput): Promise<MessageTemplate> {
  const existing = await getTemplateByName(input.channel_id, input.name, input.provider);

  if (existing) {
    return updateTemplate(existing.id, {
      status: input.status,
      components: input.components,
      provider_template_id: input.provider_template_id,
      provider_data: input.provider_data,
      last_synced_at: new Date().toISOString(),
    });
  }

  return createTemplate(input);
}

export async function deleteTemplate(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_message_templates').delete().eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

export async function syncTemplatesForChannel(channelId: string): Promise<{
  synced: number;
  errors: number;
}> {
  const { syncWhatsAppTemplates } = await import('@/lib/services/whatsapp/sync-templates');
  const { getChannelById } = await import('./channels.api');

  const channel = await getChannelById(channelId);

  if (!channel) {
    throw new Error('Channel not found');
  }

  if (channel.type !== 'whatsapp') {
    throw new Error('Channel is not a WhatsApp channel');
  }

  const config = channel.config as WhatsAppConfig;
  return syncWhatsAppTemplates(channel, config);
}

/**
 * Sincroniza templates para todos los canales activos de WhatsApp o uno específico
 */
export async function syncTemplates(params?: { channelId?: string }): Promise<{
  success: boolean;
  synced: number;
  errors: number;
  channels_processed: number;
  failed_channels?: Array<{ channel_id: string; channel_name: string; error: string }>;
  error?: string;
}> {
  try {
    const { getChannelsByType } = await import('./channels.api');
    const { syncWhatsAppTemplates } = await import('@/lib/services/whatsapp/sync-templates');

    let channels: Channel[];

    if (params?.channelId) {
      const allChannels = await getChannelsByType('whatsapp');
      channels = allChannels.filter((ch) => ch.id === params.channelId);
    } else {
      channels = await getChannelsByType('whatsapp');
    }

    const activeChannels = channels.filter((ch) => ch.status === 'active');

    if (activeChannels.length === 0) {
      return {
        success: false,
        synced: 0,
        errors: 0,
        channels_processed: 0,
        error: 'No active WhatsApp channels found',
      };
    }

    const results = await Promise.allSettled(
      activeChannels.map(async (channel) => {
        const config = channel.config as WhatsAppConfig;
        console.log(`🔄 Processing channel: ${channel.id} (${channel.name})`);
        return syncWhatsAppTemplates(channel, config);
      })
    );

    const synced = results
      .filter((r) => r.status === 'fulfilled')
      .reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.synced : 0), 0);

    const errors = results.filter((r) => r.status === 'rejected').length;

    const failedChannels = results
      .filter((r) => r.status === 'rejected')
      .map((r, idx) => ({
        channel_id: activeChannels[idx]?.id || '',
        channel_name: activeChannels[idx]?.name || '',
        error: r.status === 'rejected' ? r.reason?.message || 'Unknown error' : '',
      }));

    console.log('📊 Sync summary:', { synced, errors, channels_processed: activeChannels.length });

    return {
      success: true,
      synced,
      errors,
      channels_processed: activeChannels.length,
      ...(failedChannels.length > 0 && { failed_channels: failedChannels }),
    };
  } catch (error) {
    console.error('Error syncing templates:', error);
    return {
      success: false,
      synced: 0,
      errors: 0,
      channels_processed: 0,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
  }
}
