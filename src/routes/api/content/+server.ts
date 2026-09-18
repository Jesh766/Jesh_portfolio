import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';

export const prerender = false;

export const GET: RequestHandler = async ({ cookies, url }) => {
	const supabase = getSupabaseAdmin();
	if (!supabase) return json({ content: {} });
	const preview = url.searchParams.get('preview') === '1' && isAdminSession(cookies.get(ADMIN_COOKIE));
	const { data, error } = await supabase.from('portfolio_content').select('content, draft_content').eq('id', 'default').maybeSingle();
	if (error) return json({ content: {} });
	return json({ content: preview ? (data?.draft_content ?? data?.content ?? {}) : (data?.content ?? {}) }, { headers: { 'cache-control': 'no-store' } });
};
