<script lang="ts">
	import { onMount } from 'svelte';
	import { contentState } from '$lib/stores/content.svelte';

	let enabled = false;
	let status = 'Editor inactive';
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	function parsePath(path: string) {
		return path
			.replace(/\[(\d+)\]/g, '.$1')
			.replace(/\.\./g, '.')
			.split('.')
			.filter(Boolean);
	}

	function getValue(target: unknown, path: string[]) {
		let current: unknown = target;
		for (const key of path) {
			if (current === null || current === undefined) return undefined;
			current = (current as Record<string, unknown>)[key];
		}
		return current;
	}

	function setValue(target: unknown, path: string[], value: string) {
		if (!path.length) return;
		let current: Record<string, unknown> = target as Record<string, unknown>;
		for (let index = 0; index < path.length - 1; index += 1) {
			const key = path[index];
			const next = current[key] as Record<string, unknown> | undefined;
			if (!next || typeof next !== 'object') {
				current[key] = {};
			}
			current = current[key] as Record<string, unknown>;
		}
		current[path[path.length - 1]] = value;
	}

	function syncModeState() {
		enabled = new URLSearchParams(window.location.search).get('editor') === '1';
		const inlineEditors = document.querySelectorAll<HTMLElement>('[data-editable]');
		inlineEditors.forEach((element) => {
			const target = element.getAttribute('data-editable');
			if (!target) return;
			const isBound = element.dataset.editorBound === 'true';
			if (!isBound) {
				element.dataset.editorBound = 'true';
				element.addEventListener('focus', () => {
					element.dataset.previousValue = element.textContent ?? '';
				});
				element.addEventListener('blur', async () => {
					if (!enabled) return;
					const nextValue = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
					const previousValue = element.dataset.previousValue ?? '';
					if (nextValue === previousValue) return;
					const path = parsePath(target);
					setValue(contentState, path, nextValue);
					status = 'Saving...';
					await persistEdits();
				});
			}
			element.setAttribute('contenteditable', String(enabled));
			element.classList.toggle('portfolio-inline-editor', enabled);
			element.classList.toggle('portfolio-inline-editor--active', enabled);
			if (!enabled) {
				element.blur();
			}
		});
	}

	async function persistEdits() {
		try {
			const response = await fetch('/api/admin/content', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: {
						site: { ...contentState.site },
						projects: structuredClone(contentState.projects as unknown[]),
						journey: structuredClone(contentState.journey as unknown[]),
						skills: structuredClone(contentState.skills as unknown[]),
						certifications: structuredClone(contentState.certifications as unknown[]),
						achievements: structuredClone(contentState.achievements as unknown[]),
						contact: { ...contentState.contact }
					},
					action: 'publish'
				})
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				status = payload.error ?? 'Save failed';
				return;
			}
			status = 'Saved';
			clearTimeout(saveTimer);
			saveTimer = setTimeout(() => {
				status = 'Editor active';
			}, 1600);
		} catch {
			status = 'Save failed';
		}
	}

	async function verifyAdminSession() {
		try {
			const response = await fetch('/api/admin', { method: 'GET' });
			if (!response.ok) return false;
			const payload = await response.json().catch(() => ({ authenticated: false }));
			return Boolean(payload.authenticated);
		} catch {
			return false;
		}
	}

	onMount(() => {
		const sync = async () => {
			const params = new URLSearchParams(window.location.search);
			if (params.get('editor') !== '1') {
				enabled = false;
				status = 'Editor inactive';
				return;
			}
			const authed = await verifyAdminSession();
			if (!authed) {
				window.location.href = '/admin';
				return;
			}
			enabled = true;
			status = 'Editor active';
			syncModeState();
		};

		void sync();
		const observer = new MutationObserver(() => syncModeState());
		observer.observe(document.body, { childList: true, subtree: true });
		window.addEventListener('popstate', sync);
		return () => observer.disconnect();
	});

	async function exitEditor() {
		const url = new URL(window.location.href);
		url.searchParams.delete('editor');
		window.location.href = url.toString();
	}
</script>

{#if enabled}
	<div class="portfolio-editor-panel" aria-live="polite">
		<div>
			<p class="portfolio-editor-kicker">Editor mode</p>
			<h3>Portfolio controls</h3>
		</div>
		<div class="portfolio-editor-actions">
			<span class="portfolio-editor-status">{status}</span>
			<button class="portfolio-editor-button" type="button" on:click={exitEditor}>Exit editor</button>
		</div>
	</div>
{/if}

<style>
	:global([data-editable]) {
		touch-action: manipulation;
	}

	:global(.portfolio-inline-editor) {
		outline: 1px dashed rgba(201, 168, 76, 0.9);
		padding: 0.14rem 0.3rem;
		border-radius: 0.4rem;
		background: rgba(201, 168, 76, 0.08);
		transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
		min-height: 1.2em;
	}

	:global(.portfolio-inline-editor--active) {
		box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.25);
	}

	:global(.portfolio-inline-editor:focus) {
		outline: 1px solid rgba(201, 168, 76, 1);
		background: rgba(201, 168, 76, 0.14);
		box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.12);
	}

	.portfolio-editor-panel {
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: min(90vw, 32rem);
		padding: 0.8rem 1rem;
		border: 1px solid rgba(201, 168, 76, 0.4);
		background: rgba(10, 8, 6, 0.94);
		backdrop-filter: blur(12px);
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
		border-radius: 0.85rem;
		color: #fff;
	}

	.portfolio-editor-kicker {
		margin: 0;
		font-size: 0.65rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--accent-gold, #c9a84c);
	}

	.portfolio-editor-panel h3 {
		margin: 0.2rem 0 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.portfolio-editor-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.portfolio-editor-status {
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.75);
	}

	.portfolio-editor-button {
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: transparent;
		color: #fff;
		padding: 0.55rem 0.8rem;
		font-size: 0.72rem;
		border-radius: 0.5rem;
		cursor: pointer;
	}
</style>