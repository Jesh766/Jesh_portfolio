import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ADMIN_COOKIE, isAdminSession } from '$lib/server/admin';
import { RequestValidationError, validatePortfolioContent } from '$lib/server/validation';

export const prerender = false;

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_BYTES = 180_000;
const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-3.6-flash';
const XAI_MODEL = env.XAI_MODEL || 'grok-4.6';

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

async function requestGemini(prompt: string) {
	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY ?? '')}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
			})
		}
	);
	if (!response.ok) throw new Error(`Gemini returned ${response.status}.`);
	const payload = (await response.json()) as {
		candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
	};
	const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) throw new Error('Gemini returned no answer.');
	return text;
}

async function requestGrok(prompt: string) {
	const response = await fetch('https://api.x.ai/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.XAI_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: XAI_MODEL,
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.2,
			response_format: { type: 'json_object' }
		})
	});
	if (!response.ok) throw new Error(`Grok returned ${response.status}.`);
	const payload = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const text = payload.choices?.[0]?.message?.content;
	if (!text) throw new Error('Grok returned no answer.');
	return text;
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

	const providers: Array<[string, (prompt: string) => Promise<string>]> = [['gemini', requestGemini]];
	if (env.XAI_API_KEY) providers.push(['grok', requestGrok]);
	for (const [provider, requestProvider] of providers) {
		try {
			const result = parseModelJson(await requestProvider(prompt));
			if (input.mode === 'editor') {
				validatePortfolioContent(result.content);
				return json({ reply: result.reply, content: result.content, provider });
			}
			return json({ reply: result.reply, provider });
		} catch (error) {
			console.error(`${provider} assistant`, error);
		}
	}
	return json({ error: 'The AI assistant could not complete that request.' }, { status: 502 });
};
