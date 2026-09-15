<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';

	const particles = Array.from({ length: 18 }, (_, i) => ({
		left: `${8 + ((i * 5.2) % 88)}%`,
		top: `${12 + ((i * 17) % 76)}%`
	}));

	let layer: HTMLDivElement;
	let lightX = $state(50);
	let lightY = $state(40);

	onMount(() => {
		if (prefersReducedMotion() || !layer) return;

		const onMove = (e: PointerEvent) => {
			const rect = layer.getBoundingClientRect();
			lightX = ((e.clientX - rect.left) / rect.width) * 100;
			lightY = ((e.clientY - rect.top) / rect.height) * 100;
		};

		layer.addEventListener('pointermove', onMove, { passive: true });
		return () => layer.removeEventListener('pointermove', onMove);
	});
</script>

<div bind:this={layer} class="about-ambient" aria-hidden="true">
	<div class="about-ambient__grid"></div>
	<div class="about-ambient__lines"></div>
	<div class="about-ambient__gradient"></div>
	<div class="about-ambient__particles">
		{#each particles as p, i}
			<span
				class="about-ambient__particle"
				style="left: {p.left}; top: {p.top}; --i: {i}"
			></span>
		{/each}
	</div>
	<div
		class="about-ambient__light"
		style="--lx: {lightX}%; --ly: {lightY}%"
	></div>
</div>

<style>
	.about-ambient {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.about-ambient__grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(201, 168, 76, 0.06) 1px, transparent 1px),
			linear-gradient(90deg, rgba(201, 168, 76, 0.06) 1px, transparent 1px);
		background-size: 48px 48px;
		mask-image: radial-gradient(ellipse 80% 70% at 30% 40%, black 20%, transparent 75%);
		opacity: 0.55;
	}

	.about-ambient__lines {
		position: absolute;
		inset: -20%;
		background:
			linear-gradient(
				118deg,
				transparent 42%,
				rgba(201, 168, 76, 0.07) 49.5%,
				transparent 57%
			),
			linear-gradient(62deg, transparent 58%, rgba(201, 168, 76, 0.05) 62%, transparent 68%);
		opacity: 0.7;
	}

	.about-ambient__gradient {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 55% 45% at 20% 30%, rgba(201, 168, 76, 0.12), transparent 65%),
			radial-gradient(ellipse 40% 35% at 85% 75%, rgba(201, 168, 76, 0.06), transparent 60%);
	}

	.about-ambient__particles {
		position: absolute;
		inset: 0;
	}

	.about-ambient__particle {
		position: absolute;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: rgba(201, 168, 76, 0.55);
		left: 0;
		top: 0;
		opacity: 0.35;
		animation: about-particle-float calc(8s + var(--i) * 0.35s) ease-in-out infinite;
		animation-delay: calc(var(--i) * -0.45s);
	}

	@keyframes about-particle-float {
		0%,
		100% {
			transform: translateY(0) scale(1);
			opacity: 0.25;
		}
		50% {
			transform: translateY(-12px) scale(1.15);
			opacity: 0.55;
		}
	}

	.about-ambient__light {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle at var(--lx) var(--ly),
			rgba(201, 168, 76, 0.14) 0%,
			transparent 42%
		);
		transition: background 0.2s ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.about-ambient__particle {
			animation: none;
			opacity: 0.3;
		}

		.about-ambient__light {
			background: radial-gradient(circle at 30% 35%, rgba(201, 168, 76, 0.1), transparent 50%);
		}
	}
</style>
