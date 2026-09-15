<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from '$lib/utils/motion';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		if (prefersReducedMotion()) return;

		let lenisDestroy: (() => void) | undefined;

		Promise.all([
			import('lenis'),
			import('gsap'),
			import('gsap/ScrollTrigger')
		]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
			gsap.registerPlugin(ScrollTrigger);

			const lenis = new Lenis({
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				smoothWheel: true
			});

			document.documentElement.classList.add('lenis', 'lenis-smooth');

			lenis.on('scroll', ScrollTrigger.update);

			const raf = (time: number) => lenis.raf(time * 1000);
			gsap.ticker.add(raf);
			gsap.ticker.lagSmoothing(0);

			lenisDestroy = () => {
				lenis.destroy();
				document.documentElement.classList.remove('lenis', 'lenis-smooth');
				gsap.ticker.remove(raf);
			};
		});

		return () => lenisDestroy?.();
	});
</script>

<div>
	{@render children()}
</div>
