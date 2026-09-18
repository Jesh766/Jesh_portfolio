<script lang="ts">
	import { onMount } from 'svelte';
	import { NAV, NAV_CONTACT, SITE } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';

	const navigation = $derived(
		contentState.navigation.length
			? contentState.navigation.filter((item) => item.visible).sort((a, b) => a.order - b.order)
			: NAV.map((item, order) => ({ ...item, visible: true, order }))
	);

	async function downloadResume() {
		await fetch('/api/resume', { method: 'POST', keepalive: true }).catch(() => {});
		window.open(SITE.resume, '_blank');
	}
	let scrolled = $state(false);
	let activeSection = $state('hero');
	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
		document.body.style.overflow = menuOpen ? 'hidden' : '';
	}

	function closeMenu() {
		menuOpen = false;
		document.body.style.overflow = '';
	}

	$effect(() => {
		const onScroll = () => {
			scrolled = window.scrollY > 50;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	onMount(() => {
		const sectionIds = ['hero', ...navigation.map((n) => n.id), NAV_CONTACT.id];
		const observers: IntersectionObserver[] = [];

		sectionIds.forEach((id) => {
			const el = document.getElementById(id);
			if (!el) return;
			const io = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) activeSection = id;
				},
				{ rootMargin: '-40% 0px -50% 0px', threshold: 0 }
			);
			io.observe(el);
			observers.push(io);
		});

		// Close menu on escape key
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && menuOpen) closeMenu();
		};
		window.addEventListener('keydown', onKeydown);

		return () => {
			observers.forEach((o) => o.disconnect());
			window.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<header class="site-header" class:scrolled>
	<nav class="site-nav" aria-label="Primary">
		<a
			href="#hero"
			data-cursor-hover
			class="nav-brand"
			aria-label="Jayshil's Portfolio — home"
			onclick={closeMenu}
		>
			<span class="nav-brand__text">
				Jayshil<span class="nav-brand__accent">'s</span> Portfolio
			</span>
			<span class="nav-brand__mark" aria-hidden="true"></span>
		</a>

		<!-- Desktop nav links -->
		<ul class="nav-links" role="list">
			{#each navigation as item}
				<li>
					<a
						href="#{item.id}"
						data-cursor-hover
						data-cursor-link
						class="nav-link"
						class:nav-link--active={activeSection === item.id}
					>
						{item.label}
					</a>
				</li>
			{/each}
			<li>
				<a
					href="#{NAV_CONTACT.id}"
					data-cursor-hover
					class="nav-contact"
					class:nav-contact--active={activeSection === NAV_CONTACT.id}
				>
					{NAV_CONTACT.label}
				</a>
			</li>
			<li>
				<button
					type="button"
					data-cursor-hover
					class="nav-resume"
					onclick={downloadResume}
				>
					↓ Resume
				</button>
			</li>
		</ul>

		<!-- Hamburger toggle (mobile only) -->
		<button
			type="button"
			class="nav-hamburger"
			class:nav-hamburger--open={menuOpen}
			onclick={toggleMenu}
			aria-expanded={menuOpen}
			aria-controls="mobile-menu"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
		>
			<span class="bar bar--top"></span>
			<span class="bar bar--mid"></span>
			<span class="bar bar--bot"></span>
		</button>
	</nav>
</header>

<!-- Mobile drawer -->
<div
	id="mobile-menu"
	class="mobile-drawer"
	class:mobile-drawer--open={menuOpen}
	aria-hidden={!menuOpen}
>
	<!-- Backdrop -->
	<div class="mobile-backdrop" onclick={closeMenu} aria-hidden="true"></div>

	<nav class="mobile-nav" aria-label="Mobile navigation">
		<ul class="mobile-nav__list" role="list">
			{#each navigation as item}
				<li>
					<a
						href="#{item.id}"
						class="mobile-nav__link"
						class:mobile-nav__link--active={activeSection === item.id}
						onclick={closeMenu}
					>
						{item.label}
					</a>
				</li>
			{/each}
			<li>
				<a
					href="#{NAV_CONTACT.id}"
					class="mobile-nav__contact"
					onclick={closeMenu}
				>
					{NAV_CONTACT.label}
				</a>
			</li>
		</ul>

		<button
			type="button"
			class="mobile-nav__resume"
			onclick={() => { downloadResume(); closeMenu(); }}
		>
			↓ Download Resume
		</button>
	</nav>
</div>

<style>
	.site-header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		transition:
			background 0.4s ease,
			border-color 0.4s ease,
			backdrop-filter 0.4s ease;
	}

	.site-header.scrolled {
		background: rgba(8, 6, 4, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--border-subtle);
	}

	.site-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		max-width: 80rem;
		margin: 0 auto;
		padding: 0.85rem 1rem;
	}

	@media (min-width: 768px) {
		.site-nav {
			padding: 1rem 3rem;
		}
	}

	.nav-brand {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
		text-decoration: none;
		padding-right: 0.35rem;
	}

	.nav-brand__text {
		font-family: var(--font-display);
		font-size: clamp(0.95rem, 2.8vw, 1.15rem);
		font-weight: 500;
		letter-spacing: 0.03em;
		color: var(--text-primary);
		line-height: 1.2;
		white-space: nowrap;
	}

	.nav-brand__accent {
		color: var(--accent-gold);
		font-style: italic;
	}

	.nav-brand__mark {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--accent-gold);
		box-shadow: 0 0 12px rgba(201, 168, 76, 0.65);
		flex-shrink: 0;
	}

	/* ── Desktop nav links (hidden on mobile) ─────────────── */
	.nav-links {
		display: none;
		align-items: center;
		gap: clamp(0.65rem, 1.5vw, 1.75rem);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	@media (min-width: 768px) {
		.nav-links {
			display: flex;
		}
	}

	.nav-link {
		position: relative;
		flex-shrink: 0;
		color: rgba(255, 255, 255, 0.8);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-decoration: none;
		transition: color 0.3s ease;
		white-space: nowrap;
	}

	@media (min-width: 900px) {
		.nav-link {
			font-size: 12px;
			letter-spacing: 0.14em;
		}
	}

	.nav-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -4px;
		width: 0;
		height: 1px;
		background: var(--accent-gold);
		transition: width 0.3s ease;
	}

	.nav-link:hover,
	.nav-link--active {
		color: var(--accent-gold);
	}

	.nav-link:hover::after,
	.nav-link--active::after {
		width: 100%;
	}

	.nav-contact {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.45rem 0.75rem;
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent-gold);
		border: 1px solid var(--accent-gold);
		border-radius: 4px;
		text-decoration: none;
		transition:
			background 0.3s ease,
			color 0.3s ease,
			box-shadow 0.3s ease;
	}

	@media (min-width: 900px) {
		.nav-contact {
			padding: 0.5rem 1rem;
			font-size: 12px;
			letter-spacing: 0.14em;
		}
	}

	.nav-contact:hover,
	.nav-contact--active {
		background: var(--accent-gold);
		color: #000;
		box-shadow: var(--glow-gold);
	}

	.nav-resume {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.45rem 0.75rem;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		border: 1px solid var(--border-subtle);
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
		transition:
			border-color 0.3s ease,
			color 0.3s ease;
	}

	@media (min-width: 900px) {
		.nav-resume {
			padding: 0.5rem 1rem;
			font-size: 11px;
		}
	}

	.nav-resume:hover {
		border-color: var(--border-accent);
		color: var(--accent-gold);
	}

	/* ── Hamburger button (mobile only) ───────────────────── */
	.nav-hamburger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
	}

	@media (min-width: 768px) {
		.nav-hamburger {
			display: none;
		}
	}

	.bar {
		display: block;
		width: 22px;
		height: 1.5px;
		background: var(--text-primary);
		border-radius: 2px;
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
		transform-origin: center;
	}

	.nav-hamburger--open .bar--top {
		transform: translateY(6.5px) rotate(45deg);
	}

	.nav-hamburger--open .bar--mid {
		opacity: 0;
		transform: scaleX(0);
	}

	.nav-hamburger--open .bar--bot {
		transform: translateY(-6.5px) rotate(-45deg);
	}

	/* ── Mobile drawer ────────────────────────────────────── */
	.mobile-drawer {
		position: fixed;
		inset: 0;
		z-index: 49;
		pointer-events: none;
	}

	.mobile-drawer--open {
		pointer-events: auto;
	}

	@media (min-width: 768px) {
		.mobile-drawer {
			display: none;
		}
	}

	.mobile-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		opacity: 0;
		transition: opacity 0.35s ease;
	}

	.mobile-drawer--open .mobile-backdrop {
		opacity: 1;
	}

	.mobile-nav {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(80vw, 22rem);
		background: rgba(8, 6, 4, 0.97);
		border-left: 1px solid var(--border-subtle);
		padding: 6rem 2rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		transform: translateX(100%);
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
		overflow-y: auto;
	}

	.mobile-drawer--open .mobile-nav {
		transform: translateX(0);
	}

	.mobile-nav__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.mobile-nav__link {
		display: block;
		padding: 1rem 0;
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		color: rgba(255, 255, 255, 0.75);
		text-decoration: none;
		border-bottom: 1px solid var(--border-subtle);
		transition: color 0.25s ease, padding-left 0.25s ease;
	}

	.mobile-nav__link:hover,
	.mobile-nav__link--active {
		color: var(--accent-gold);
		padding-left: 0.5rem;
	}

	.mobile-nav__contact {
		display: block;
		margin-top: 0.5rem;
		padding: 0.85rem 1.5rem;
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent-gold);
		border: 1px solid var(--accent-gold);
		border-radius: 6px;
		text-decoration: none;
		text-align: center;
		transition: background 0.3s ease, color 0.3s ease;
	}

	.mobile-nav__contact:hover {
		background: var(--accent-gold);
		color: #000;
	}

	.mobile-nav__resume {
		padding: 0.85rem 1.5rem;
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
		transition: border-color 0.3s ease, color 0.3s ease;
		text-align: center;
	}

	.mobile-nav__resume:hover {
		border-color: var(--border-accent);
		color: var(--accent-gold);
	}
</style>
