<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import AboutAICoreScene from './AboutAICoreScene.svelte';

	let wrap: HTMLDivElement;
	let mouse = $state({ x: 0, y: 0 });
	let reduced = $state(false);
	let ready = $state(false);
	let rendering = $state(false);

	onMount(() => {
		reduced = prefersReducedMotion();
		ready = true;

		let intersecting = false;

		const syncRunning = () => {
			rendering = intersecting && document.visibilityState === 'visible' && !reduced;
		};

		const onVisibility = () => syncRunning();
		document.addEventListener('visibilitychange', onVisibility);

		let io: IntersectionObserver | undefined;
		io = new IntersectionObserver(
			([entry]) => {
				intersecting = entry.isIntersecting;
				syncRunning();
			},
			{ threshold: 0.08, rootMargin: '80px' }
		);
		if (wrap) io.observe(wrap);

		const onMove = (e: PointerEvent) => {
			if (!wrap || reduced) return;
			const rect = wrap.getBoundingClientRect();
			if (rect.width === 0) return;
			mouse = {
				x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
				y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
			};
		};

		wrap?.addEventListener('pointermove', onMove, { passive: true });

		return () => {
			io?.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			wrap?.removeEventListener('pointermove', onMove);
		};
	});
</script>

<div bind:this={wrap} class="about-ai-core" aria-hidden="true">
	{#if reduced}
		<div class="about-ai-core__static">
			<div class="about-ai-core__static-orb"></div>
			<div class="about-ai-core__static-ring about-ai-core__static-ring--a"></div>
			<div class="about-ai-core__static-ring about-ai-core__static-ring--b"></div>
		</div>
	{:else if browser && ready}
		<div class="about-ai-core__canvas [&_canvas]:!h-full [&_canvas]:!w-full">
			<Canvas autoRender={rendering}>
				<AboutAICoreScene {mouse} {reduced} active={rendering} />
			</Canvas>
		</div>
		<div class="about-ai-core__glow" aria-hidden="true"></div>
	{/if}
</div>

<style>
	.about-ai-core {
		position: relative;
		width: 100%;
		height: clamp(280px, 50vw, 420px);
		max-width: 460px;
		margin-inline: auto;
	}

	.about-ai-core__canvas {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.about-ai-core__glow {
		position: absolute;
		inset: 15% 10%;
		z-index: 0;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(201, 168, 76, 0.28) 0%, transparent 68%);
		filter: blur(28px);
		pointer-events: none;
	}

	.about-ai-core__static {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.about-ai-core__static-orb {
		width: 42%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #f0e6c8, #c9a84c 45%, #6b5520 100%);
		box-shadow:
			0 0 48px rgba(201, 168, 76, 0.45),
			inset 0 -8px 24px rgba(0, 0, 0, 0.35);
	}

	.about-ai-core__static-ring {
		position: absolute;
		border: 1px solid rgba(201, 168, 76, 0.45);
		border-radius: 50%;
		pointer-events: none;
	}

	.about-ai-core__static-ring--a {
		width: 72%;
		aspect-ratio: 1;
		transform: rotateX(68deg);
	}

	.about-ai-core__static-ring--b {
		width: 88%;
		aspect-ratio: 1;
		transform: rotateX(52deg) rotateZ(24deg);
		opacity: 0.5;
	}
</style>
