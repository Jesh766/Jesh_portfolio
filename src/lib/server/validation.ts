import type { RequestEvent } from '@sveltejs/kit';

const MAX_JSON_BYTES = 32 * 1024;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 320;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_PATH_LENGTH = 2048;
const MAX_METADATA_KEYS = 20;

export class RequestValidationError extends Error {}

export async function readJsonBody(request: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown> {
	const contentLength = Number(request.headers.get('content-length') ?? 0);
	if (contentLength > maxBytes) throw new RequestValidationError('Request body is too large.');

	const bytes = new Uint8Array(await request.arrayBuffer());
	if (bytes.byteLength > maxBytes) throw new RequestValidationError('Request body is too large.');
	if (!bytes.byteLength) throw new RequestValidationError('Request body is required.');

	try {
		return JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		throw new RequestValidationError('Request body must be valid JSON.');
	}
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateContactPayload(value: unknown) {
	if (!isRecord(value)) throw new RequestValidationError('Request body must be an object.');
	const name = typeof value.name === 'string' ? value.name.trim() : '';
	const email = typeof value.email === 'string' ? value.email.trim() : '';
	const message = typeof value.message === 'string' ? value.message.trim() : '';

	if (!name || !email || !message) throw new RequestValidationError('All fields are required.');
	if (
		name.length > MAX_NAME_LENGTH ||
		email.length > MAX_EMAIL_LENGTH ||
		message.length > MAX_MESSAGE_LENGTH
	) {
		throw new RequestValidationError('One or more fields are too long.');
	}
	if (!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))
		throw new RequestValidationError('Invalid email address.');

	return { name, email, message };
}

export type ValidAnalyticsPayload = {
	event_type: string;
	page_path: string | null;
	section_id: string | null;
	metadata: Record<string, string | number | boolean>;
	session_id: string | null;
	duration_ms: number | null;
};

const VALID_EVENTS = new Set([
	'page_view',
	'session_start',
	'session_heartbeat',
	'session_end',
	'section_view',
	'cursor_grid',
	'resume_download'
]);

export function validateAnalyticsPayload(value: unknown): ValidAnalyticsPayload {
	if (!isRecord(value)) throw new RequestValidationError('Request body must be an object.');
	const eventType = typeof value.event_type === 'string' ? value.event_type.trim() : '';
	if (!VALID_EVENTS.has(eventType)) throw new RequestValidationError('Invalid analytics event.');

	const pagePath = value.page_path ?? value.path;
	const sectionId = value.section_id ?? value.section;
	const sessionId = value.session_id;
	const duration = value.duration_ms;
	if (
		pagePath !== undefined &&
		pagePath !== null &&
		(typeof pagePath !== 'string' || pagePath.length > MAX_PATH_LENGTH)
	)
		throw new RequestValidationError('Invalid page path.');
	if (
		sectionId !== undefined &&
		sectionId !== null &&
		(typeof sectionId !== 'string' || sectionId.length > 120)
	)
		throw new RequestValidationError('Invalid section.');
	if (
		sessionId !== undefined &&
		sessionId !== null &&
		(typeof sessionId !== 'string' || sessionId.length > 100)
	)
		throw new RequestValidationError('Invalid session.');
	if (
		duration !== undefined &&
		duration !== null &&
		(typeof duration !== 'number' ||
			!Number.isInteger(duration) ||
			duration < 0 ||
			duration > 86_400_000)
	)
		throw new RequestValidationError('Invalid duration.');

	const metadata = value.metadata ?? {};
	if (!isRecord(metadata) || Object.keys(metadata).length > MAX_METADATA_KEYS)
		throw new RequestValidationError('Invalid analytics metadata.');
	const safeMetadata: Record<string, string | number | boolean> = {};
	for (const [key, item] of Object.entries(metadata)) {
		if (key.length > 80 || !['string', 'number', 'boolean'].includes(typeof item))
			throw new RequestValidationError('Invalid analytics metadata.');
		safeMetadata[key] = item as string | number | boolean;
	}

	return {
		event_type: eventType,
		page_path: typeof pagePath === 'string' ? pagePath : null,
		section_id: typeof sectionId === 'string' ? sectionId : null,
		metadata: safeMetadata,
		session_id: typeof sessionId === 'string' ? sessionId : null,
		duration_ms: typeof duration === 'number' ? duration : null
	};
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]) {
	return Object.keys(value).every((key) => allowed.includes(key));
}

function stringField(value: unknown, maxLength: number) {
	return typeof value === 'string' && value.length <= maxLength;
}

function arrayOfStrings(value: unknown, maxItems: number, maxLength: number) {
	return (
		Array.isArray(value) &&
		value.length <= maxItems &&
		value.every((item) => stringField(item, maxLength))
	);
}

export function validatePortfolioContent(value: unknown) {
	if (
		!isRecord(value) ||
		!hasOnlyKeys(value, [
			'site', 'navigation', 'socials', 'heroRoles', 'heroStats', 'about', 'contact', 'seo', 'sections', 'footer',
			'projects', 'skills', 'certifications'
		])
	)
		throw new RequestValidationError('Content has an invalid structure.');
	if (value.site !== undefined) {
		if (
			!isRecord(value.site) ||
			!hasOnlyKeys(value.site, [
				'name',
				'nameLine1',
				'nameLine2',
				'title',
				'location',
				'email',
				'phone',
				'linkedin',
				'github',
				'instagram',
				'whatsapp',
				'brand',
				'url',
				'portrait',
				'resume', 'availability', 'projectsLabel', 'projectsHeading', 'projectsIntro', 'contactLabel', 'contactHeading', 'skillsLabel', 'skillsHeading', 'skillsIntro', 'certificationsLabel', 'certificationsHeading', 'certificationsIntro', 'footerDescription', 'copyrightText'
			])
		)
			throw new RequestValidationError('Site content has an invalid structure.');
		for (const item of Object.values(value.site))
			if (!stringField(item, 1000))
				throw new RequestValidationError('Site content has an invalid value.');
	}
	if (value.navigation !== undefined && (!Array.isArray(value.navigation) || value.navigation.length > 30 || value.navigation.some((item) => !isRecord(item) || !hasOnlyKeys(item, ['id', 'label', 'visible', 'order']) || !stringField(item.id, 80) || !stringField(item.label, 120) || typeof item.visible !== 'boolean' || !Number.isInteger(item.order)))) throw new RequestValidationError('Navigation content has an invalid structure.');
	if (value.socials !== undefined && (!Array.isArray(value.socials) || value.socials.length > 30 || value.socials.some((item) => !isRecord(item) || !hasOnlyKeys(item, ['id', 'label', 'href', 'icon', 'visible', 'order']) || !stringField(item.id, 80) || !stringField(item.label, 120) || !stringField(item.href, 2048) || !stringField(item.icon, 80) || typeof item.visible !== 'boolean' || !Number.isInteger(item.order)))) throw new RequestValidationError('Social content has an invalid structure.');
	if (value.heroRoles !== undefined && !arrayOfStrings(value.heroRoles, 30, 120)) throw new RequestValidationError('Hero roles have an invalid structure.');
	if (value.heroStats !== undefined && (!Array.isArray(value.heroStats) || value.heroStats.length > 30 || value.heroStats.some((item) => !isRecord(item) || !hasOnlyKeys(item, ['value', 'suffix', 'label', 'display']) || typeof item.value !== 'number' || !Number.isFinite(item.value) || !stringField(item.suffix, 20) || !stringField(item.label, 120) || (item.display !== undefined && !stringField(item.display, 40))))) throw new RequestValidationError('Hero statistics have an invalid structure.');
	if (value.about !== undefined && (!isRecord(value.about) || !hasOnlyKeys(value.about, ['eyebrow', 'title', 'description', 'introEyebrow', 'introTitle', 'introTitleAccent', 'introDescription', 'focusEyebrow', 'focuses', 'metrics']) || Object.entries(value.about).some(([key, item]) => ['eyebrow', 'title', 'description', 'introEyebrow', 'introTitle', 'introTitleAccent', 'introDescription', 'focusEyebrow'].includes(key) && !stringField(item, 2000)) || !Array.isArray(value.about.focuses) || value.about.focuses.some((item) => !isRecord(item) || !stringField(item.icon, 20) || !stringField(item.label, 120)) || !Array.isArray(value.about.metrics) || value.about.metrics.some((item) => !isRecord(item) || typeof item.value !== 'number' || !stringField(item.suffix, 20) || !stringField(item.label, 120)))) throw new RequestValidationError('About content has an invalid structure.');
	if (value.seo !== undefined && (!isRecord(value.seo) || !hasOnlyKeys(value.seo, ['title', 'description', 'keywords', 'ogTitle', 'ogDescription', 'ogImage']) || Object.values(value.seo).some((item) => !stringField(item, 2048)))) throw new RequestValidationError('SEO content has an invalid structure.');
	if (value.sections !== undefined && (!Array.isArray(value.sections) || value.sections.length > 30 || value.sections.some((item) => !isRecord(item) || !hasOnlyKeys(item, ['id', 'label', 'visible', 'order']) || !stringField(item.id, 80) || !stringField(item.label, 120) || typeof item.visible !== 'boolean' || !Number.isInteger(item.order)))) throw new RequestValidationError('Section settings have an invalid structure.');
	if (value.footer !== undefined && (!isRecord(value.footer) || !hasOnlyKeys(value.footer, ['name', 'description', 'copyright']) || !stringField(value.footer.name, 200) || !stringField(value.footer.description, 500) || !stringField(value.footer.copyright, 500))) throw new RequestValidationError('Footer content has an invalid structure.');
	if (
		value.contact !== undefined &&
		(!isRecord(value.contact) ||
			!hasOnlyKeys(value.contact, ['email', 'phone', 'location', 'formTitle', 'formDescription', 'nameLabel', 'emailLabel', 'messageLabel', 'submitLabel', 'successMessage', 'errorMessage']) ||
			!stringField(value.contact.email, MAX_EMAIL_LENGTH) ||
			!stringField(value.contact.phone, 40) || Object.entries(value.contact).some(([key, item]) => key !== 'email' && key !== 'phone' && !stringField(item, 2000)))
	)
		throw new RequestValidationError('Contact content has an invalid structure.');
	if (
		value.projects !== undefined &&
		(!Array.isArray(value.projects) ||
			value.projects.length > 50 ||
			value.projects.some(
				(item) =>
					!isRecord(item) ||
					!hasOnlyKeys(item, [
						'id',
						'title',
						'tagline',
						'tags',
						'status',
						'year',
						'github',
						'demo',
						'metrics',
						'featured'
					]) ||
					!stringField(item.id, 120) ||
					!stringField(item.title, 200) ||
					!stringField(item.tagline, 2000) ||
					!arrayOfStrings(item.tags, 20, 80) ||
					!stringField(item.status, 120) ||
					!stringField(item.year, 20) ||
					!stringField(item.github, 2048) ||
					!stringField(item.demo, 2048) ||
					!Array.isArray(item.metrics) ||
					item.metrics.length > 20 ||
					item.metrics.some(
						(metric) =>
							!isRecord(metric) ||
							!hasOnlyKeys(metric, ['value', 'label']) ||
							!stringField(metric.value, 100) ||
							!stringField(metric.label, 120)
					) ||
					typeof item.featured !== 'boolean'
			))
	)
		throw new RequestValidationError('Projects content has an invalid structure.');
	if (
		value.skills !== undefined &&
		(!Array.isArray(value.skills) ||
			value.skills.length > 30 ||
			value.skills.some(
				(item) =>
					!isRecord(item) ||
					!stringField(item.category, 120) ||
					!stringField(item.icon, 20) ||
					!stringField(item.color, 120) ||
					!Array.isArray(item.items) ||
					item.items.some((skill) => !stringField(skill, 120))
			))
	)
		throw new RequestValidationError('Skills content has an invalid structure.');
	if (
		value.certifications !== undefined &&
		(!Array.isArray(value.certifications) ||
			value.certifications.length > 50 ||
			value.certifications.some(
				(item) =>
					!isRecord(item) ||
					!hasOnlyKeys(item, ['title', 'issuer', 'issuerKey', 'url', 'year', 'note', 'logoUrl']) ||
					!stringField(item.title, 300) ||
					!stringField(item.issuer, 120) ||
					!stringField(item.issuerKey, 80) ||
					!stringField(item.url, 2048) ||
					!stringField(item.year, 20) ||
					(item.note !== undefined && !stringField(item.note, 500)) ||
					(item.logoUrl !== undefined && !stringField(item.logoUrl, 2048))
			))
	)
		throw new RequestValidationError('Certifications content has an invalid structure.');
	return value;
}
