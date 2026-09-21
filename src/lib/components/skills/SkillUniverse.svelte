<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { browser } from '$app/environment';
	import { SKILLS } from '$lib/data/site';
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import SkillUniverseScene from './SkillUniverseScene.svelte';

	let {
		activeIndex = $bindable(-1),
		onActiveChange
	}: {
		activeIndex?: number;
		onActiveChange?: (index: number) => void;
	} = $props();

	let wrap: HTMLDivElement;
	let mouse = $state({ x: 0, y: 0 });
	let reduced = $state(false);
	let ready = $state(false);

	function updatePointer(clientX: number, clientY: number) {
		if (!wrap) return;
		const rect = wrap.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		mouse = {
			x: ((clientX - rect.left) / rect.width - 0.5) * 2,
			y: ((clientY - rect.top) / rect.height - 0.5) * 2
		};
	}

	$effect(() => {
		onActiveChange?.(activeIndex);
	});

	onMount(() => {
		reduced = prefersReducedMotion();
		ready = true;

		const onMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
		const onTouchStart = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (touch) updatePointer(touch.clientX, touch.clientY);
		};
		const onTouchMove = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (touch) updatePointer(touch.clientX, touch.clientY);
		};

		const onLeave = () => {
			activeIndex = -1;
		};

		wrap?.addEventListener('pointermove', onMove, { passive: true });
		wrap?.addEventListener('pointerleave', onLeave);
		wrap?.addEventListener('touchstart', onTouchStart, { passive: true });
		wrap?.addEventListener('touchmove', onTouchMove, { passive: true });
		return () => {
			wrap?.removeEventListener('pointermove', onMove);
			wrap?.removeEventListener('pointerleave', onLeave);
			wrap?.removeEventListener('touchstart', onTouchStart);
			wrap?.removeEventListener('touchmove', onTouchMove);
		};
	});
</script>

<div bind:this={wrap} class="skill-universe absolute inset-0 h-full min-h-0 w-full touch-none flex-1">
	{#if browser && ready}
		<div class="skill-universe-canvas absolute inset-0 h-full min-h-0 w-full">
			<Canvas>
				<SkillUniverseScene bind:activeIndex {mouse} {reduced} />
			</Canvas>
		</div>
	{/if}

	<div
		class="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4"
		aria-live="polite"
	>
		<p
			class="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-xs tracking-wide backdrop-blur-md"
			style="color: var(--text-secondary);"
		>
			{activeIndex >= 0 ? SKILLS[activeIndex] : 'Explore the skill universe'}
		</p>
	</div>
</div>

<style>
	.skill-universe-canvas :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
	}

	@media (max-width: 640px) {
		.skill-universe-canvas {
			min-height: 0;
		}
	}
</style>
