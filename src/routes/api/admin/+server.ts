import { json, type RequestHandler } from '@sveltejs/kit';
import { adminCookieOptions, ADMIN_COOKIE, createAdminSession, isAdminConfigured, verifyAdminPassword } from '$lib/server/admin';

export const prerender = false;

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json().catch(() => ({}));
	const password = typeof body.password === 'string' ? body.password : '';

	if (!isAdminConfigured()) {
		return json({ error: 'Admin access is not configured.' }, { status: 503 });
	}
	if (!verifyAdminPassword(password)) {
		return json({ error: 'Invalid password.' }, { status: 401 });
	}

	const session = createAdminSession();
	cookies.set(ADMIN_COOKIE, session.value, adminCookieOptions(session.maxAge));
	return json({ success: true });
};

export const DELETE: RequestHandler = ({ cookies }) => {
	cookies.delete(ADMIN_COOKIE, adminCookieOptions(0));
	return json({ success: true });
};
