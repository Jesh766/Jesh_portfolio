import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const ADMIN_COOKIE = 'portfolio_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret() {
	return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

export function isAdminConfigured() {
	return Boolean(env.ADMIN_PASSWORD && getSecret());
}

export function verifyAdminPassword(password: string) {
	if (!env.ADMIN_PASSWORD || !password) return false;
	const expected = Buffer.from(env.ADMIN_PASSWORD);
	const received = Buffer.from(password);
	return expected.length === received.length && timingSafeEqual(expected, received);
}

export function createAdminSession() {
	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
	const payload = String(expiresAt);
	const signature = createHmac('sha256', getSecret()).update(payload).digest('base64url');
	return { value: `${payload}.${signature}`, maxAge: SESSION_TTL_SECONDS };
}

export function isAdminSession(value: string | undefined) {
	if (!value || !getSecret()) return false;
	const [expiresAt, signature] = value.split('.');
	if (!expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
	const expected = createHmac('sha256', getSecret()).update(expiresAt).digest('base64url');
	const received = Buffer.from(signature);
	const expectedBuffer = Buffer.from(expected);
	return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export function adminCookieOptions(maxAge: number) {
	return {
		httpOnly: true,
		secure: env.NODE_ENV === 'production',
		sameSite: 'strict' as const,
		path: '/',
		maxAge
	};
}
