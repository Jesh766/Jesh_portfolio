<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import HeroParticles from './HeroParticles.svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';
	import { appState } from '$lib/stores/app.svelte';

	let {
		mouse = $bindable({ x: 0, y: 0 })
	}: {
		mouse?: { x: number; y: number };
	} = $props();

	let reducedMotion = $state(false);
	let ready = $state(false);

	onMount(() => {
		reducedMotion = prefersReducedMotion();
		ready = true;
		appState.heroReady = true;
	});
</script>

<div class="absolute inset-0 overflow-hidden rounded-2xl opacity-90">
	{#if browser && ready}
		<div class="absolute inset-0 h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full">
			<Canvas>
				<T.PerspectiveCamera makeDefault position={[0, 0.1, 5]} fov={48} />
				<T.AmbientLight intensity={0.5} color="#ffffff" />
				<T.DirectionalLight position={[4, 4, 6]} intensity={0.9} color="#ffffff" />
				<T.PointLight position={[-2, 1, 3]} intensity={0.6} color="#c4a574" />

				{#if !reducedMotion}
					<HeroParticles {reducedMotion} {mouse} />
				{/if}
			</Canvas>
		</div>
	{/if}
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20"
		aria-hidden="true"
	></div>
</div>
