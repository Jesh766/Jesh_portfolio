import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
	if (!adminClient) {
		adminClient = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
			auth: { persistSession: false, autoRefreshToken: false },
			realtime: { transport: WebSocket as never }
		});
	}
	return adminClient;
}

export const getServiceSupabase = getSupabaseAdmin;

export function getSupabaseAnon(): SupabaseClient | null {
	const url = publicEnv.PUBLIC_SUPABASE_URL;
	const key = publicEnv.PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return null;
	return createClient(url, key, {
		auth: { persistSession: false }
	});
}
