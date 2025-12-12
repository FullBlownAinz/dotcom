import { SupabaseClient } from '@supabase/supabase-js';

export async function hidePost(client: SupabaseClient, id: string, hidden: boolean) {
  const { error } = await client.from('posts').update({ hidden }).eq('id', id);
  if (error) throw error;
}

export async function deletePost(client: SupabaseClient, id: string) {
  const { error } = await client.from('posts').delete().eq('id', id);
  if (error) throw error;
}

export async function hideMerch(client: SupabaseClient, id: string, hidden: boolean) {
  const { error } = await client.from('merch').update({ hidden }).eq('id', id);
  if (error) throw error;
}

export async function deleteMerch(client: SupabaseClient, id: string) {
  const { error } = await client.from('merch').delete().eq('id', id);
  if (error) throw error;
}

export async function hideApp(client: SupabaseClient, id: string, hidden: boolean) {
  const { error } = await client.from('apps').update({ hidden }).eq('id', id);
  if (error) throw error;
}

export async function deleteApp(client: SupabaseClient, id: string) {
  const { error } = await client.from('apps').delete().eq('id', id);
  if (error) throw error;
}
