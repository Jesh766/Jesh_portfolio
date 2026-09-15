<script lang="ts">
	import { onMount } from 'svelte';
	import { initScrollOrchestrator } from '$lib/utils/scrollOrchestrator';

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		const run = () => {
			void initScrollOrchestrator();
		};

		if (document.readyState === 'complete') {
			requestAnimationFrame(run);
		} else {
			window.addEventListener('load', run, { once: true });
		}
	});
</script>
