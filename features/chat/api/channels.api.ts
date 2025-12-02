'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Channel,
  CreateChannelInput,
  UpdateChannelInput,
  WebsiteWidgetConfig,
} from '../types/settings';
import { generateUUID } from '@/lib/utils/uuidTRandom';

// Get all channels
export async function getChannels(): Promise<Channel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_channels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }

  return data || [];
}

// Get channel by ID
export async function getChannelById(id: string): Promise<Channel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mkt_channels').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// Get channels by type
export async function getChannelsByType(type: string): Promise<Channel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_channels')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Create a new channel
export async function createChannel(input: CreateChannelInput): Promise<Channel> {
  const supabase = await createClient();

  // Generate widget token for website type
  let config = input.config;
  if (input.type === 'website') {
    const widgetToken = generateUUID().replace(/-/g, '').substring(0, 16);
    config = {
      widget_token: widgetToken,
      website_url: '',
      welcome_message: '¡Hola! 👋 ¿En qué podemos ayudarte?',
      welcome_title: 'Chatea con nosotros',
      widget_color: '#3B82F6',
      reply_time: 'few_minutes',
      pre_chat_form_enabled: true,
      pre_chat_fields: [
        { name: 'name', type: 'text', label: 'Nombre', required: true },
        { name: 'email', type: 'email', label: 'Correo electrónico', required: true },
      ],
      online_status: 'auto',
      position: 'right',
      ...input.config,
    } as WebsiteWidgetConfig;
  }

  const { data, error } = await supabase
    .from('mkt_channels')
    .insert({
      name: input.name,
      type: input.type,
      status: 'pending',
      config,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update channel
export async function updateChannel(id: string, input: UpdateChannelInput): Promise<Channel> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.config !== undefined) {
    // Merge config with existing config
    const { data: existing } = await supabase
      .from('mkt_channels')
      .select('config')
      .eq('id', id)
      .single();

    updateData.config = { ...existing?.config, ...input.config };
  }

  const { data, error } = await supabase
    .from('mkt_channels')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete channel
export async function deleteChannel(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_channels').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

// Regenerate widget token
export async function regenerateWidgetToken(id: string): Promise<string> {
  const supabase = await createClient();
  const newToken = generateUUID().replace(/-/g, '').substring(0, 16);

  const { data: channel } = await supabase
    .from('mkt_channels')
    .select('config')
    .eq('id', id)
    .single();

  if (!channel) {
    throw new Error('Channel not found');
  }

  const { error } = await supabase
    .from('mkt_channels')
    .update({
      config: { ...channel.config, widget_token: newToken },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }

  return newToken;
}
