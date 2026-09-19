<script lang="ts">
	type Props = {
		mode: 'editor' | 'analytics';
		content?: unknown;
		analytics?: unknown;
		onApplyContent?: (content: unknown) => void | Promise<void>;
	};

	let { mode, content, analytics, onApplyContent }: Props = $props();
	let message = $state('');
	let reply = $state('');
	let error = $state('');
	let loading = $state(false);
	let minimized = $state(false);

	async function ask() {
		const request = message.trim();
		if (!request || loading) return;
		loading = true;
		error = '';
		reply = '';
		try {
			const response = await fetch('/api/admin/assistant', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: request, mode, content, analytics })
			});
			const payload = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(payload.error ?? 'The assistant could not complete that request.');
			reply = payload.reply ?? 'Done.';
			if (mode === 'editor' && payload.content) await onApplyContent?.(payload.content);
			message = '';
		} catch (caught) {
			error = caught instanceof Error ? caught.message : 'The assistant could not complete that request.';
		} finally {
			loading = false;
		}
	}
</script>

<section class="assistant-card" class:assistant-card--minimized={minimized} aria-label={mode === 'editor' ? 'Portfolio editing assistant' : 'Analytics assistant'}>
	<div class="assistant-heading">
		<div>
			<p class="assistant-kicker">Jesh Admin Copilot</p>
			{#if !minimized}<h3>{mode === 'editor' ? 'Editing mode' : 'Analytics mode'}</h3>{/if}
		</div>
		<div class="assistant-heading-actions">
			<span class="assistant-status">{loading ? 'Working...' : 'Ready'}</span>
			<button class="assistant-minimize" type="button" aria-label={minimized ? 'Expand assistant' : 'Minimize assistant'} title={minimized ? 'Expand assistant' : 'Minimize assistant'} onclick={() => minimized = !minimized}>{minimized ? '□' : '−'}</button>
		</div>
	</div>
	{#if !minimized}
	<p class="assistant-help">
		{mode === 'editor'
			? 'Tell me what to add or change. I will prepare the update and save it after validation.'
			: 'Ask about visitors, views, sources, sessions, or any selected analytics period.'}
	</p>
	<form onsubmit={(event) => { event.preventDefault(); void ask(); }}>
		<textarea bind:value={message} rows="2" placeholder={mode === 'editor' ? 'Add my Google certificate from this link: ...' : 'How many visitors came today?'} disabled={loading}></textarea>
		<div class="assistant-actions">
			<span>Enter a complete task or question</span>
			<button type="submit" disabled={loading || !message.trim()}>{loading ? 'Thinking...' : mode === 'editor' ? 'Apply task' : 'Ask assistant'}</button>
		</div>
	</form>
	{#if reply}<p class="assistant-reply" role="status">{reply}</p>{/if}
	{#if error}<p class="assistant-error" role="alert">{error}</p>{/if}
	{/if}
</section>

<style>
	.assistant-card {
		padding: 1rem;
		border: 1px solid rgba(201, 168, 76, 0.3);
		background: rgba(16, 12, 8, 0.96);
		box-shadow: 0 18px 45px rgba(0, 0, 0, 0.24);
	}
	.assistant-heading, .assistant-actions, .assistant-heading-actions { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
	.assistant-heading-actions { justify-content: flex-end; }
	.assistant-kicker { margin: 0; color: #c9a84c; font-size: .62rem; letter-spacing: .18em; text-transform: uppercase; }
	.assistant-heading h3 { margin: .25rem 0 0; color: #fff; font-size: 1rem; font-weight: 500; }
	.assistant-status { color: #8ee0bf; font-size: .68rem; }
	.assistant-help { margin: .7rem 0; color: rgba(255,255,255,.62); font-size: .76rem; line-height: 1.5; }
	textarea { width: 100%; box-sizing: border-box; resize: vertical; border: 1px solid rgba(255,255,255,.16); border-radius: .3rem; padding: .7rem; color: #fff; background: rgba(0,0,0,.28); font: inherit; font-size: .8rem; }
	textarea:focus { outline: 1px solid rgba(201,168,76,.75); }
	.assistant-actions { margin-top: .55rem; }
	.assistant-actions span { color: rgba(255,255,255,.4); font-size: .64rem; }
	button { border: 1px solid rgba(201,168,76,.55); padding: .55rem .75rem; color: #080604; background: #c9a84c; font: inherit; font-size: .72rem; cursor: pointer; }
	button:disabled { cursor: wait; opacity: .45; }
	.assistant-minimize { width: 1.8rem; height: 1.8rem; padding: 0; color: #c9a84c; background: transparent; border-color: rgba(201,168,76,.35); font-size: 1rem; line-height: 1; }
	.assistant-card--minimized { padding: .65rem .85rem; }
	.assistant-reply, .assistant-error { margin: .75rem 0 0; padding: .7rem; font-size: .78rem; line-height: 1.5; }
	.assistant-reply { color: #d9f5e9; border-left: 2px solid #8ee0bf; background: rgba(142,224,191,.07); }
	.assistant-error { color: #ffb0a5; border-left: 2px solid #ff8e7d; background: rgba(255,100,80,.07); }
</style>
