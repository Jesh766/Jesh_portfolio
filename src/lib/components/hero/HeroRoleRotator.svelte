<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { HERO_ROLES } from '$lib/data/site';

	let root: HTMLSpanElement;
	let display = $state<string>(HERO_ROLES[0]);
	let roleIndex = 0;
	let charIndex = HERO_ROLES[0].length;
	let phase: 'pause' | 'erase' | 'type' = 'pause';

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		display = HERO_ROLES[0];
		charIndex = HERO_ROLES[0].length;

		if (root) {
			gsap.from(root, { opacity: 0, duration: 0.5, delay: 1.8 });
		}

		const step = () => {
			const role = HERO_ROLES[roleIndex];

			if (phase === 'pause') {
				phase = 'erase';
				window.setTimeout(step, 2000);
				return;
			}

			if (phase === 'erase') {
				if (charIndex > 0) {
					charIndex--;
					display = role.slice(0, charIndex);
					window.setTimeout(step, 32);
				} else {
					roleIndex = (roleIndex + 1) % HERO_ROLES.length;
					phase = 'type';
					window.setTimeout(step, 280);
				}
				return;
			}

			const nextRole = HERO_ROLES[roleIndex];
			if (charIndex < nextRole.length) {
				charIndex++;
				display = nextRole.slice(0, charIndex);
				window.setTimeout(step, 48);
			} else {
				phase = 'pause';
				window.setTimeout(step, 2000);
			}
		};

		const startId = window.setTimeout(step, 2400);
		return () => clearTimeout(startId);
	});
</script>

<span class="relative inline-block min-h-[1.35em] align-bottom">
	<span bind:this={root} class="typewriter-cursor inline-block font-medium" style="color: rgba(255,255,255,0.85);">
		{display}
	</span>
</span>
