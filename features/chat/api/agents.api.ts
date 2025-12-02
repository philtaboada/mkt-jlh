'use server';

import { createClient } from '@/lib/supabase/server';
import type { Agent, CreateAgentInput, UpdateAgentInput } from '../types/settings';

// Get all agents
export async function getAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_agents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }

  return data || [];
}

// Get agent by ID
export async function getAgentById(id: string): Promise<Agent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mkt_agents').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// Get agent by user ID
export async function getAgentByUserId(userId: string): Promise<Agent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_agents')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// Create a new agent
export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mkt_agents')
    .insert({
      user_id: input.user_id || null,
      name: input.name,
      email: input.email,
      role: input.role,
      status: 'offline',
      team_ids: input.team_ids || [],
      channel_ids: input.channel_ids || [],
      auto_assign: true,
      max_conversations: 10,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update agent
export async function updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.role !== undefined) updateData.role = input.role;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.team_ids !== undefined) updateData.team_ids = input.team_ids;
  if (input.channel_ids !== undefined) updateData.channel_ids = input.channel_ids;
  if (input.auto_assign !== undefined) updateData.auto_assign = input.auto_assign;
  if (input.max_conversations !== undefined) updateData.max_conversations = input.max_conversations;

  const { data, error } = await supabase
    .from('mkt_agents')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete agent
export async function deleteAgent(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_agents').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

// Update agent status (online/offline/busy)
export async function updateAgentStatus(
  id: string,
  status: 'online' | 'offline' | 'busy'
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('mkt_agents')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Get online agents
export async function getOnlineAgents(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mkt_agents').select('*').eq('status', 'online');

  if (error) {
    throw error;
  }

  return data || [];
}

// Get agents by channel
export async function getAgentsByChannel(channelId: string): Promise<Agent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_agents')
    .select('*')
    .contains('channel_ids', [channelId]);

  if (error) {
    throw error;
  }

  return data || [];
}
