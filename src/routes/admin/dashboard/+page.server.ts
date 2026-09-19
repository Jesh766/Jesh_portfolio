import { redirect } from '@sveltejs/kit';
import { ADMIN_COOKIE, adminCookieOptions, isAdminSession } from '$lib/server/admin';

export const prerender = false;

export function load({ cookies }) {
	if (!isAdminSession(cookies.get(ADMIN_COOKIE))) {
		cookies.delete(ADMIN_COOKIE, adminCookieOptions(0));
		throw redirect(303, '/admin');
	}
	return {};
}
