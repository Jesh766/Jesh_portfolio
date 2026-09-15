<script lang="ts">
	let password = '';
	let error = '';
	let loading = false;

	async function signIn() {
		loading = true;
		error = '';
		const response = await fetch('/api/admin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password })
		});
		loading = false;
		if (response.ok) {
			window.location.href = '/admin/dashboard';
			return;
		}
		error = (await response.json()).error ?? 'Unable to sign in.';
	}
</script>

<svelte:head>
	<title>Admin access | Jayshil Thakkar</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="admin-login">
	<div class="admin-login__panel">
		<p class="admin-kicker">Private workspace</p>
		<h1>Portfolio admin</h1>
		<p class="admin-muted">Sign in to manage published portfolio content and review anonymous visitor analytics.</p>
		<form onsubmit={(event) => { event.preventDefault(); signIn(); }}>
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} autocomplete="current-password" required />
			<button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Enter workspace'}</button>
		</form>
		{#if error}<p class="admin-error" role="alert">{error}</p>{/if}
	</div>
</main>

<style>
	.admin-login { min-height: 100svh; display: grid; place-items: center; padding: 2rem; background: #080604; color: #fff; }
	.admin-login__panel { width: min(100%, 30rem); max-width: 30rem; padding: 2.5rem; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); box-shadow: 0 24px 80px rgba(0,0,0,.35); }
	.admin-kicker { color: #c9a84c; font-size: .72rem; letter-spacing: .22em; text-transform: uppercase; }
	h1 { margin: .8rem 0; font: 500 clamp(2rem, 7vw, 3.5rem)/1 'Cormorant Garamond', serif; }
	.admin-muted { color: rgba(255,255,255,.62); line-height: 1.6; }
	form { display: grid; gap: .7rem; margin-top: 2rem; }
	label { font-size: .78rem; color: rgba(255,255,255,.7); }
	input, button { min-height: 3rem; padding: .8rem 1rem; font: inherit; border: 1px solid rgba(255,255,255,.15); }
	input { color: #fff; background: rgba(0,0,0,.28); }
	button { cursor: pointer; color: #080604; background: #c9a84c; font-weight: 600; }
	button:disabled { cursor: wait; opacity: .65; }
	.admin-error { margin-top: 1rem; color: #ff9b8d; }
</style>
