'use server';
import { createClient } from '@/lib/supabase/server';
import { Tag } from '../types/tag';

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('mkt_tags').select('*').order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_tags')
    .insert({
      name,
      color: color || '#888888',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mkt_tags')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('mkt_tags').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
