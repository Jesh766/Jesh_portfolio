<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { HERO_ROLES } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';

	const roles = $derived(contentState.heroRoles.length ? contentState.heroRoles : HERO_ROLES);

	let root: HTMLSpanElement;
	let display = $state<string>('');
	let roleIndex = 0;
	let charIndex = 0;
	let phase: 'pause' | 'erase' | 'type' = 'pause';

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		display = roles[0] ?? 'Software Engineer';
		charIndex = display.length;

		if (root) {
			gsap.from(root, { opacity: 0, duration: 0.5, delay: 1.8 });
		}

		const step = () => {
			const role = roles[roleIndex] ?? roles[0] ?? 'Software Engineer';

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
					roleIndex = (roleIndex + 1) % Math.max(roles.length, 1);
					phase = 'type';
					window.setTimeout(step, 280);
				}
				return;
			}

			const nextRole = roles[roleIndex] ?? 'Software Engineer';
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
