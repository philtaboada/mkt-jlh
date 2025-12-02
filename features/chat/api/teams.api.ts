'use server';

import { createClient } from '@/lib/supabase/server';
import type { Team, CreateTeamInput, UpdateTeamInput } from '../types/settings';

// Get all teams
export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_teams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }

  return data || [];
}

// Get team by ID
export async function getTeamById(id: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mkt_teams').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// Create a new team
export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mkt_teams')
    .insert({
      name: input.name,
      description: input.description || null,
      auto_assign: input.auto_assign ?? true,
      agent_ids: [],
      channel_ids: [],
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Update team
export async function updateTeam(id: string, input: UpdateTeamInput): Promise<Team> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.auto_assign !== undefined) updateData.auto_assign = input.auto_assign;
  if (input.agent_ids !== undefined) updateData.agent_ids = input.agent_ids;
  if (input.channel_ids !== undefined) updateData.channel_ids = input.channel_ids;

  const { data, error } = await supabase
    .from('mkt_teams')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Delete team
export async function deleteTeam(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_teams').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

// Add agent to team
export async function addAgentToTeam(teamId: string, agentId: string): Promise<void> {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from('mkt_teams')
    .select('agent_ids')
    .eq('id', teamId)
    .single();

  if (!team) {
    throw new Error('Team not found');
  }

  const agentIds = [...(team.agent_ids || []), agentId];

  const { error } = await supabase
    .from('mkt_teams')
    .update({ agent_ids: agentIds, updated_at: new Date().toISOString() })
    .eq('id', teamId);

  if (error) {
    throw error;
  }
}

// Remove agent from team
export async function removeAgentFromTeam(teamId: string, agentId: string): Promise<void> {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from('mkt_teams')
    .select('agent_ids')
    .eq('id', teamId)
    .single();

  if (!team) {
    throw new Error('Team not found');
  }

  const agentIds = (team.agent_ids || []).filter((id: string) => id !== agentId);

  const { error } = await supabase
    .from('mkt_teams')
    .update({ agent_ids: agentIds, updated_at: new Date().toISOString() })
    .eq('id', teamId);

  if (error) {
    throw error;
  }
}
