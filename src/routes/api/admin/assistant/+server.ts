import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';
import { RequestValidationError, validatePortfolioContent } from '$lib/server/validation';

export const prerender = false;

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_BYTES = 180_000;
const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-2.5-flash';

type AssistantMode = 'editor' | 'analytics';

type AssistantRequest = {
	message: string;
	mode: AssistantMode;
	content?: unknown;
	analytics?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readAssistantRequest(value: unknown): AssistantRequest {
	if (!isRecord(value)) throw new RequestValidationError('Assistant request must be an object.');
	const message = typeof value.message === 'string' ? value.message.trim() : '';
	const mode = value.mode === 'editor' || value.mode === 'analytics' ? value.mode : null;
	if (!message || message.length > MAX_MESSAGE_LENGTH) throw new RequestValidationError('Enter a task or question up to 4,000 characters.');
	if (!mode) throw new RequestValidationError('Assistant mode is required.');
	const contextBytes = JSON.stringify({ content: value.content, analytics: value.analytics }).length;
	if (contextBytes > MAX_CONTEXT_BYTES) throw new RequestValidationError('Assistant context is too large.');
	return { message, mode, content: value.content, analytics: value.analytics };
}

function parseModelJson(text: string) {
	const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
	const parsed = JSON.parse(cleaned) as unknown;
	if (!isRecord(parsed) || typeof parsed.reply !== 'string') throw new Error('The assistant returned an invalid response.');
	return parsed;
}

export const POST: RequestHandler = async ({ cookies, request }) => {
	if (!isAdminSession(cookies.get(ADMIN_COOKIE))) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!env.GEMINI_API_KEY) return json({ error: 'AI assistant is not configured. Add GEMINI_API_KEY to the server environment.' }, { status: 503 });

	let input: AssistantRequest;
	try {
		input = readAssistantRequest(await request.json());
	} catch (error) {
		return json({ error: error instanceof RequestValidationError ? error.message : 'Invalid assistant request.' }, { status: 400 });
	}

	const editorRules = input.mode === 'editor'
		? `You are in EDITOR MODE. Help edit this portfolio content. Apply the user's requested changes to the full content object and return the complete updated content. Preserve every unrelated field exactly. You may edit site text, navigation, socials, hero roles/stats, about, contact, SEO, sections, footer, projects, skills, and certifications. Do not add Journey or Achievements fields. Never change passwords, authentication, analytics data, server secrets, or code. If the request is ambiguous or destructive, explain it and return the content unchanged.`
		: `You are in ANALYTICS MODE. Answer the user's question using the provided analytics context. Do not modify portfolio content. Explain numbers plainly and mention the selected period when relevant.`;

	const prompt = `${editorRules}

Return ONLY valid JSON with this shape:
{"reply":"short helpful answer","content":${input.mode === 'editor' ? 'the complete updated content object' : 'null'}}

User request:
${input.message}

Current portfolio content:
${JSON.stringify(input.content ?? null)}

Current analytics context:
${JSON.stringify(input.analytics ?? null)}`;

	try {
		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
			})
		});
		if (!response.ok) {
			console.error('gemini response', response.status, await response.text());
			return json({ error: 'The AI assistant could not complete that request.' }, { status: 502 });
		}
		const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
		const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) return json({ error: 'The AI assistant returned no answer.' }, { status: 502 });
		const result = parseModelJson(text);
		if (input.mode === 'editor') {
			try {
				validatePortfolioContent(result.content);
			} catch {
				return json({ error: 'The assistant suggested invalid portfolio content. Nothing was changed.' }, { status: 422 });
			}
			return json({ reply: result.reply, content: result.content });
		}
		return json({ reply: result.reply });
	} catch (error) {
		console.error('admin assistant', error);
		return json({ error: 'The AI assistant is temporarily unavailable.' }, { status: 502 });
	}
};
