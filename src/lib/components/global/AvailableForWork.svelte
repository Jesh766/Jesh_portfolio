<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(true);

	onMount(() => {
		const hero = document.getElementById('hero');
		if (!hero) return;

		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
		}, { threshold: 0.05 });
		observer.observe(hero);

		return () => observer.disconnect();
	});

	function scrollToContact() {
		const target = document.getElementById('contact');
		if (!target) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
	}
</script>

<button type="button" class:available-pill--hidden={!visible} class="available-pill" data-cursor-hover onclick={scrollToContact} aria-hidden={!visible} tabindex={visible ? 0 : -1}>
	<span class="available-pill__dot" aria-hidden="true"></span>
	<span class="available-pill__text">✦ Available for work</span>
</button>

<style>
	.available-pill {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 180;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.65rem 1.15rem;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		letter-spacing: 0.06em;
		color: var(--text-primary);
		background: rgba(8, 6, 4, 0.75);
		border: 1px solid var(--border-accent);
		border-radius: 999px;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		cursor: pointer;
		transition:
		opacity 0.3s ease,
			background 0.35s ease,
			border-color 0.35s ease,
			box-shadow 0.35s ease,
			transform 0.35s ease;
	}

	.available-pill--hidden {
		pointer-events: none;
		opacity: 0;
		transform: translateY(0.5rem);
	}

	.available-pill:hover {
		background: rgba(201, 168, 76, 0.12);
		border-color: var(--accent-gold);
		box-shadow: var(--glow-gold);
		transform: translateY(-2px);
	}

	.available-pill__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
		animation: available-pulse 2s ease-in-out infinite;
		flex-shrink: 0;
	}

	@keyframes available-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.available-pill__dot {
			animation: none;
		}

		.available-pill:hover {
			transform: none;
		}
	}
</style>
