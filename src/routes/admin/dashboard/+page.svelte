<script lang="ts">
	import { onMount } from 'svelte';
	import { PROJECTS, SITE } from '$lib/data/site';

	type Analytics = {
		totals: { visitors: number; pageViews: number; averageDurationMs: number; days: number };
		sections: { section: string; views: number }[];
		recent: { event_type: string; page_path: string | null; section_id: string | null; created_at: string }[];
	};

	let contentText = JSON.stringify({ site: SITE, projects: PROJECTS }, null, 2);
	let analytics: Analytics = { totals: { visitors: 0, pageViews: 0, averageDurationMs: 0, days: 30 }, sections: [], recent: [] };
	let notice = '';
	let error = '';
	let saving = false;

	onMount(async () => {
		const [contentResponse, analyticsResponse] = await Promise.all([
			fetch('/api/admin/content'),
			fetch('/api/admin/analytics?days=30')
		]);
		if (contentResponse.status === 401 || analyticsResponse.status === 401) {
			window.location.href = '/admin';
			return;
		}
		const content = await contentResponse.json();
		if (content.content && Object.keys(content.content).length) contentText = JSON.stringify(content.content, null, 2);
		analytics = await analyticsResponse.json();
	});

	async function saveContent() {
		notice = '';
		error = '';
		let content: unknown;
		try { content = JSON.parse(contentText); } catch { error = 'Content is not valid JSON.'; return; }
		saving = true;
		const response = await fetch('/api/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
		saving = false;
		if (!response.ok) { error = (await response.json()).error ?? 'Unable to save content.'; return; }
		notice = 'Content saved.';
	}

	async function signOut() {
		await fetch('/api/admin', { method: 'DELETE' });
		window.location.href = '/admin';
	}

	function formatDuration(milliseconds: number) {
		if (!milliseconds) return '—';
		const seconds = Math.round(milliseconds / 1000);
		return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	}
</script>

<svelte:head>
	<title>Admin dashboard | Jayshil Thakkar</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell">
	<header class="admin-header">
		<div><p class="admin-kicker">Private workspace</p><h1>Portfolio control room</h1></div>
		<div class="admin-actions"><a href="/" target="_blank" rel="noreferrer">View site</a><button onclick={signOut}>Sign out</button></div>
	</header>

	<section class="metrics" aria-label="Visitor metrics">
		<div><span>Visitors</span><strong>{analytics.totals.visitors}</strong><small>anonymous sessions / {analytics.totals.days} days</small></div>
		<div><span>Page views</span><strong>{analytics.totals.pageViews}</strong><small>recorded portfolio visits</small></div>
		<div><span>Average time</span><strong>{formatDuration(analytics.totals.averageDurationMs)}</strong><small>from reported sessions</small></div>
	</section>

	<main class="admin-grid">
		<section class="panel editor-panel">
			<div class="panel-heading"><div><p class="admin-kicker">Publishable data</p><h2>Content editor</h2></div><button class="primary" onclick={saveContent} disabled={saving}>{saving ? 'Saving...' : 'Save content'}</button></div>
			<p class="muted">Edit the structured JSON document used by your content layer. Keep a backup before large changes.</p>
			<textarea bind:value={contentText} aria-label="Portfolio content JSON" spellcheck="false"></textarea>
			{#if notice}<p class="success">{notice}</p>{/if}{#if error}<p class="error">{error}</p>{/if}
		</section>
		<section class="panel">
			<div class="panel-heading"><div><p class="admin-kicker">Engagement</p><h2>Section views</h2></div></div>
			{#if analytics.sections.length}<div class="section-list">{#each analytics.sections as item}<div><span>{item.section}</span><strong>{item.views}</strong></div>{/each}</div>{:else}<p class="muted">No section data yet.</p>{/if}
		</section>
		<section class="panel recent-panel">
			<div class="panel-heading"><div><p class="admin-kicker">Event stream</p><h2>Recent activity</h2></div></div>
			<div class="table-wrap"><table><thead><tr><th>Event</th><th>Path</th><th>Time</th></tr></thead><tbody>{#each analytics.recent as event}<tr><td>{event.event_type}</td><td>{event.section_id ?? event.page_path ?? '—'}</td><td>{new Date(event.created_at).toLocaleString()}</td></tr>{/each}</tbody></table></div>
		</section>
	</main>
</div>

<style>
	:global(body) { background: #080604; }
	.admin-shell { min-height: 100svh; padding: 2rem clamp(1rem, 4vw, 4rem) 5rem; color: #fff; background: radial-gradient(circle at 90% 0%, rgba(201,168,76,.1), transparent 30rem), #080604; }
	.admin-header, .panel-heading, .admin-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
	.admin-header { max-width: 90rem; margin: 0 auto 2.5rem; }
	.admin-kicker { color: #c9a84c; font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; margin: 0; }
	h1, h2 { margin: .45rem 0 0; font-family: 'Cormorant Garamond', serif; font-weight: 500; }
	h1 { font-size: clamp(2.2rem, 6vw, 4.5rem); line-height: .95; } h2 { font-size: 2rem; }
	.admin-actions a, .admin-actions button { color: rgba(255,255,255,.75); text-decoration: none; background: transparent; border: 1px solid rgba(255,255,255,.15); padding: .65rem .9rem; cursor: pointer; }
	.metrics, .admin-grid { max-width: 90rem; margin: 0 auto; }
	.metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,.1); margin-bottom: 1.5rem; }
	.metrics > div { display: grid; gap: .35rem; padding: 1.3rem; background: #100d09; } .metrics span, .metrics small, .muted { color: rgba(255,255,255,.56); } .metrics strong { font-size: 2.2rem; font-weight: 400; }
	.admin-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(18rem, .65fr); gap: 1.5rem; }
	.panel { padding: 1.4rem; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035); } .editor-panel, .recent-panel { min-width: 0; }
	textarea { display: block; width: 100%; min-height: 32rem; margin-top: 1rem; padding: 1rem; resize: vertical; color: #e9ddc7; background: #090806; border: 1px solid rgba(255,255,255,.12); font: .84rem/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
	button.primary { padding: .7rem 1rem; border: 0; background: #c9a84c; color: #080604; font-weight: 700; cursor: pointer; } button:disabled { opacity: .6; cursor: wait; }
	.success { color: #8ee0bf; }.error { color: #ff9b8d; }.section-list { margin-top: 1rem; }.section-list div { display: flex; justify-content: space-between; padding: .85rem 0; border-bottom: 1px solid rgba(255,255,255,.1); }.section-list strong { color: #c9a84c; }
	.recent-panel { grid-column: 1 / -1; }.table-wrap { overflow-x: auto; margin-top: 1rem; } table { width: 100%; border-collapse: collapse; text-align: left; font-size: .85rem; } th, td { padding: .8rem; border-bottom: 1px solid rgba(255,255,255,.08); } th { color: #c9a84c; font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }
	@media (max-width: 700px) { .admin-header { align-items: flex-start; flex-direction: column; }.metrics, .admin-grid { grid-template-columns: 1fr; }.recent-panel { grid-column: auto; } }
</style>
