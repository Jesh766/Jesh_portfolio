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

	$effect(() => {
		onActiveChange?.(activeIndex);
	});

	onMount(() => {
		reduced = prefersReducedMotion();
		ready = true;

		const onMove = (e: PointerEvent) => {
			if (!wrap) return;
			const rect = wrap.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;
			mouse = {
				x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
				y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
			};
		};

		const onLeave = () => {
			activeIndex = -1;
		};

		wrap?.addEventListener('pointermove', onMove, { passive: true });
		wrap?.addEventListener('pointerleave', onLeave);
		return () => {
			wrap?.removeEventListener('pointermove', onMove);
			wrap?.removeEventListener('pointerleave', onLeave);
		};
	});
</script>

<div bind:this={wrap} class="skill-universe absolute inset-0 h-full min-h-[400px] w-full flex-1">
	{#if browser && ready}
		<div class="absolute inset-0 h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full">
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
