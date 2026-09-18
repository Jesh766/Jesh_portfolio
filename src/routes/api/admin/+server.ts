import { json, type RequestHandler } from '@sveltejs/kit';
import {
	adminCookieOptions,
	ADMIN_COOKIE,
	createAdminSession,
	isAdminConfigured,
	isAdminSession,
	verifyAdminPassword
} from '$lib/server/admin';

export const prerender = false;

const loginWindows = new Map<string, { startedAt: number; count: number }>();
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_LIMIT = 8;

function isLoginRateLimited(ip: string) {
	const now = Date.now();
	const current = loginWindows.get(ip);
	if (!current || now - current.startedAt >= LOGIN_WINDOW_MS) {
		loginWindows.set(ip, { startedAt: now, count: 1 });
		return false;
	}
	current.count += 1;
	return current.count > LOGIN_LIMIT;
}

export const GET: RequestHandler = ({ cookies }) => {
	return json({ authenticated: isAdminSession(cookies.get(ADMIN_COOKIE)) });
};

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	if (isLoginRateLimited(getClientAddress()))
		return json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object' || Array.isArray(body))
		return json({ error: 'Invalid request.' }, { status: 400 });
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
