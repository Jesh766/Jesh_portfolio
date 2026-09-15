import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';

export const prerender = false;

export const GET: RequestHandler = async () => {
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ content: {} });
	const { data, error } = await supabase.from('portfolio_content').select('content').eq('id', 'default').maybeSingle();
	if (error) return json({ content: {} });
	return json({ content: data?.content ?? {} }, { headers: { 'cache-control': 'no-store' } });
};
