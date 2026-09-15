import { redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';

export const prerender = false;

export function load({ cookies }) {
	if (!isAdminSession(cookies.get(ADMIN_COOKIE))) throw redirect(303, '/admin');
	return {};
}
