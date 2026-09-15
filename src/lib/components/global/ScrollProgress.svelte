<script lang="ts">
	import { onMount } from 'svelte';

	let bar: HTMLDivElement;

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const update = () => {
			if (!bar) return;
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const p = docHeight > 0 ? scrollTop / docHeight : 0;
			bar.style.width = `${Math.min(100, p * 100)}%`;
		};

		window.addEventListener('scroll', update, { passive: true });
		update();

		if (!reduced) {
			import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
				ScrollTrigger.addEventListener('refresh', update);
			});
		}

		return () => {
			window.removeEventListener('scroll', update);
		};
	});
</script>

<div bind:this={bar} class="scroll-progress" aria-hidden="true"></div>
