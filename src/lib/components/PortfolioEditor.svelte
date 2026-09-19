<script lang="ts">
	import { onMount } from 'svelte';
	import { contentState } from '$lib/stores/content.svelte';
	import type { Certification, Project } from '$lib/data/site';
	import AssistantChat from '$lib/components/assistant/AssistantChat.svelte';

	let enabled = $state(false);
	let status = $state('Editor inactive');
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let projectsOpen = $state(false);
	let certificationsOpen = $state(false);

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
						navigation: structuredClone(contentState.navigation),
						socials: structuredClone(contentState.socials),
						heroRoles: structuredClone(contentState.heroRoles),
						heroStats: structuredClone(contentState.heroStats),
						about: structuredClone(contentState.about),
						seo: structuredClone(contentState.seo),
						sections: structuredClone(contentState.sections),
						footer: structuredClone(contentState.footer),
						projects: structuredClone(contentState.projects as unknown[]),
						skills: structuredClone(contentState.skills as unknown[]),
						certifications: structuredClone(contentState.certifications as unknown[]),
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

	function createProject(): Project {
		return {
			id: `project-${Date.now()}`,
			title: 'New project',
			tagline: 'Add a short project description.',
			tags: [],
			status: 'In progress',
			year: String(new Date().getFullYear()),
			github: '',
			demo: '',
			metrics: [],
			featured: false
		};
	}

	async function addProject() {
		contentState.projects = [...contentState.projects, createProject()];
		projectsOpen = true;
		status = 'Saving...';
		await persistEdits();
	}

	async function removeProject(index: number) {
		const project = contentState.projects[index];
		if (!project || !window.confirm(`Delete ${project.title || 'this project'}?`)) return;
		contentState.projects = contentState.projects.filter((_, projectIndex) => projectIndex !== index);
		status = 'Saving...';
		await persistEdits();
	}

	async function updateProject(index: number, key: keyof Project, value: string | string[]) {
		contentState.projects = contentState.projects.map((project, projectIndex) => projectIndex === index ? { ...project, [key]: value } : project);
		status = 'Saving...';
		await persistEdits();
	}

	function createCertification(): Certification {
		return { title: 'New certification', issuer: 'Issuer name', issuerKey: 'google', url: 'https://', year: String(new Date().getFullYear()), note: '', logoUrl: '' };
	}

	async function addCertification() {
		contentState.certifications = [...contentState.certifications, createCertification()];
		certificationsOpen = true;
		status = 'Saving...';
		await persistEdits();
	}

	async function removeCertification(index: number) {
		const certification = contentState.certifications[index];
		if (!certification || !window.confirm(`Delete ${certification.title || 'this certification'}?`)) return;
		contentState.certifications = contentState.certifications.filter((_, certificationIndex) => certificationIndex !== index);
		status = 'Saving...';
		await persistEdits();
	}

	async function updateCertification(index: number, key: keyof Certification, value: string) {
		contentState.certifications = contentState.certifications.map((certification, certificationIndex) => certificationIndex === index ? { ...certification, [key]: value } : certification);
		status = 'Saving...';
		await persistEdits();
	}

	async function applyAssistantContent(value: unknown) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return;
		Object.assign(contentState, value);
		status = 'Saving AI update...';
		await persistEdits();
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
		<AssistantChat mode="editor" content={contentState} onApplyContent={applyAssistantContent} />
		<div class="portfolio-editor-heading">
			<p class="portfolio-editor-kicker">Editor mode</p>
			<h3>Portfolio controls</h3>
			<div class="portfolio-editor-toggles">
				<button class="portfolio-editor-project-toggle" type="button" onclick={() => projectsOpen = !projectsOpen} aria-expanded={projectsOpen}>
					Projects {projectsOpen ? '−' : '+'}
				</button>
				<button class="portfolio-editor-project-toggle" type="button" onclick={() => certificationsOpen = !certificationsOpen} aria-expanded={certificationsOpen}>
					Certifications {certificationsOpen ? '−' : '+'}
				</button>
			</div>
		</div>
		<div class="portfolio-editor-actions">
			<span class="portfolio-editor-status">{status}</span>
			<button class="portfolio-editor-button" type="button" onclick={exitEditor}>Exit editor</button>
		</div>
		{#if projectsOpen}
			<div class="portfolio-editor-projects">
				<div class="portfolio-editor-projects__header">
					<div><strong>Projects</strong><small>Add links and details visitors can use.</small></div>
					<button class="portfolio-editor-add" type="button" onclick={addProject}>+ Add project</button>
				</div>
				{#each contentState.projects as project, index}
					<article class="portfolio-editor-card">
						<div class="portfolio-editor-card__header"><span class="portfolio-editor-index">{String(index + 1).padStart(2, '0')}</span><strong>{project.title || 'Untitled project'}</strong><button class="portfolio-editor-delete" type="button" onclick={() => removeProject(index)}>Delete</button></div>
						<div class="portfolio-editor-fields">
							<label>Project title<input value={project.title} oninput={(event) => updateProject(index, 'title', event.currentTarget.value)} /></label>
							<label>Year<input value={project.year} oninput={(event) => updateProject(index, 'year', event.currentTarget.value)} /></label>
							<label class="wide">Short description<textarea rows="2" oninput={(event) => updateProject(index, 'tagline', event.currentTarget.value)}>{project.tagline}</textarea></label>
							<label>GitHub URL<input type="url" placeholder="https://github.com/..." value={project.github} oninput={(event) => updateProject(index, 'github', event.currentTarget.value)} /></label>
							<label>Live demo URL<input type="url" placeholder="https://..." value={project.demo} oninput={(event) => updateProject(index, 'demo', event.currentTarget.value)} /></label>
							<label>Status<input value={project.status} oninput={(event) => updateProject(index, 'status', event.currentTarget.value)} /></label>
							<label>Tags<input placeholder="AI, Svelte, Full Stack" value={project.tags.join(', ')} oninput={(event) => updateProject(index, 'tags', event.currentTarget.value.split(',').map((tag) => tag.trim()).filter(Boolean))} /></label>
						</div>
					</article>
				{:else}
					<p class="portfolio-editor-empty">No projects yet. Add your first project.</p>
				{/each}
			</div>
		{/if}
		{#if certificationsOpen}
			<div class="portfolio-editor-projects">
				<div class="portfolio-editor-projects__header">
					<div><strong>Certifications</strong><small>Add the verification URL visitors can open.</small></div>
					<button class="portfolio-editor-add" type="button" onclick={addCertification}>+ Add certification</button>
				</div>
				{#each contentState.certifications as certification, index}
					<article class="portfolio-editor-card">
						<div class="portfolio-editor-card__header"><span class="portfolio-editor-index">{String(index + 1).padStart(2, '0')}</span><strong>{certification.title || 'Untitled certification'}</strong><button class="portfolio-editor-delete" type="button" onclick={() => removeCertification(index)}>Delete</button></div>
						<div class="portfolio-editor-fields">
							<label>Certificate title<input value={certification.title} oninput={(event) => updateCertification(index, 'title', event.currentTarget.value)} /></label>
							<label>Issuer<input value={certification.issuer} oninput={(event) => updateCertification(index, 'issuer', event.currentTarget.value)} /></label>
							<label>Year<input value={certification.year} oninput={(event) => updateCertification(index, 'year', event.currentTarget.value)} /></label>
							<label>Issuer key<input placeholder="google" value={certification.issuerKey} oninput={(event) => updateCertification(index, 'issuerKey', event.currentTarget.value as Certification['issuerKey'])} /></label>
							<label class="wide">Verification URL<input type="url" placeholder="https://..." value={certification.url} oninput={(event) => updateCertification(index, 'url', event.currentTarget.value)} /></label>
							<label class="wide">Note<input value={certification.note ?? ''} oninput={(event) => updateCertification(index, 'note', event.currentTarget.value)} /></label>
						</div>
					</article>
				{:else}
					<p class="portfolio-editor-empty">No certifications yet. Add your first certification.</p>
				{/each}
			</div>
		{/if}
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
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		width: min(94vw, 48rem);
		max-height: min(82vh, 42rem);
		overflow: auto;
		padding: 1rem;
		border: 1px solid rgba(201, 168, 76, 0.4);
		background: rgba(10, 8, 6, 0.97);
		backdrop-filter: blur(12px);
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
		border-radius: 0.85rem;
		color: #fff;
	}

	.portfolio-editor-heading {
		min-width: 0;
		align-self: start;
	}

	.portfolio-editor-panel > :global(.assistant-card) {
		grid-column: 1 / -1;
	}

	.portfolio-editor-toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		justify-content: flex-end;
	}

	.portfolio-editor-project-toggle,
	.portfolio-editor-add,
	.portfolio-editor-delete {
		border: 1px solid rgba(201, 168, 76, 0.35);
		background: rgba(201, 168, 76, 0.08);
		color: #fff;
		padding: 0.4rem 0.6rem;
		font-size: 0.68rem;
		border-radius: 0.35rem;
		cursor: pointer;
	}

	.portfolio-editor-project-toggle {
		margin-top: 0.65rem;
	}

	.portfolio-editor-projects {
		grid-column: 1 / -1;
		width: 100%;
		padding-top: 0.7rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.portfolio-editor-projects__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.portfolio-editor-projects__header {
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.72);
	}

	.portfolio-editor-projects__header div {
		display: grid;
		gap: 0.2rem;
	}

	.portfolio-editor-projects__header small {
		color: rgba(255, 255, 255, 0.46);
		font-size: 0.64rem;
	}

	.portfolio-editor-card {
		padding: 0.85rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.035);
	}

	.portfolio-editor-card + .portfolio-editor-card {
		margin-top: 0.7rem;
	}

	.portfolio-editor-card__header {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-bottom: 0.75rem;
	}

	.portfolio-editor-card__header strong {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.78rem;
	}

	.portfolio-editor-index {
		color: var(--accent-gold, #c9a84c);
		font-size: 0.65rem;
	}

	.portfolio-editor-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.65rem;
	}

	.portfolio-editor-fields label {
		display: grid;
		gap: 0.3rem;
		color: rgba(255, 255, 255, 0.58);
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.portfolio-editor-fields label.wide {
		grid-column: 1 / -1;
	}

	.portfolio-editor-fields input,
	.portfolio-editor-fields textarea {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(0, 0, 0, 0.3);
		color: #fff;
		padding: 0.55rem 0.6rem;
		font: inherit;
		font-size: 0.72rem;
		letter-spacing: normal;
		text-transform: none;
		border-radius: 0.3rem;
	}

	.portfolio-editor-fields textarea {
		resize: vertical;
	}

	.portfolio-editor-delete {
		border-color: rgba(255, 130, 110, 0.35);
		background: rgba(255, 100, 80, 0.08);
		white-space: nowrap;
	}

	.portfolio-editor-empty {
		margin: 0;
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.55);
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

	@media (max-width: 700px) {
		.portfolio-editor-panel {
			left: 0.65rem;
			bottom: 0.65rem;
			width: calc(100vw - 1.3rem);
			grid-template-columns: 1fr;
		}

		.portfolio-editor-actions {
			justify-content: space-between;
		}

		.portfolio-editor-toggles {
			width: 100%;
			justify-content: flex-start;
		}

		.portfolio-editor-fields {
			grid-template-columns: 1fr;
		}

		.portfolio-editor-fields label.wide {
			grid-column: auto;
		}
	}
</style>