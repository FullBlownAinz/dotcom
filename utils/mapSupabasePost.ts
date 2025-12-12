import { Post } from '../types/index.ts';

function inferMediaType(url = '') {
  const u = url.toLowerCase();
  if (u.endsWith('.gif')) return 'gif';
  if (/\.(mp4|webm|mov)(\?|$)/.test(u)) return 'video';
  return 'image';
}

// Maps a raw row from the Supabase 'posts' table to the frontend 'Post' type.
export function mapSupabasePostToFrontendPost(row: any): Post {
  return {
    id: row.id,
    created_at: row.created_at,
    title: row.title || '',
    header_media_url: row.header_media_url || row.cover_url || '',
    header_media_type: row.header_media_type || inferMediaType(row.header_media_url || ''),
    body_richtext: row.body_richtext || [{ type: 'html', html: row.body_html || '' }],
    external_links: row.external_links || [],
    hidden: !!row.hidden,
    order_index: typeof row.order_index === 'number' ? row.order_index : 1000,
    is_published: row.is_published !== undefined ? row.is_published : true,
  };
}
