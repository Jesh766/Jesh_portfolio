<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	let dot: HTMLDivElement;
	let ring: HTMLDivElement;
	let visible = $state(false);
	let labelText = $state('');
	let mode = $state<'default' | 'button' | 'link' | 'project' | 'image'>('default');

	const RING_SIZE = 40;
	const RING_BUTTON = 64;
	const RING_LINK = 32;
	const RING_PROJECT = 72;

	let targetX = 0;
	let targetY = 0;
	let dotX = 0;
	let dotY = 0;
	let ringX = 0;
	let ringY = 0;

	onMount(() => {
		const fine = window.matchMedia('(pointer: fine)').matches;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || reduced) return;

		document.body.classList.add('custom-cursor-active');

		const resolveMode = (el: Element | null): typeof mode => {
			if (!el) return 'default';
			const node = el as HTMLElement;
			if (node.closest('[data-cursor-project], [data-project-card].case-study')) return 'project';
			if (node.closest('img, [data-cursor-image], picture')) return 'image';
			if (node.closest('[data-cursor-link]')) return 'link';
			if (
				node.closest(
					'button, [data-cursor-button], .nav-contact, .hero-cta-btn, .contact-btn-liquid, [data-cursor-hover]'
				)
			) {
				return 'button';
			}
			if (node.closest('a, input, textarea, select')) return 'link';
			return 'default';
		};

		const onMove = (e: MouseEvent) => {
			visible = true;
			targetX = e.clientX;
			targetY = e.clientY;

			const hoverTarget = (e.target as HTMLElement).closest(
				'a, button, [data-cursor-hover], [data-cursor-project], [data-project-card], img, [data-cursor-image], input, textarea'
			);
			const next = resolveMode(hoverTarget);
			mode = next;

			if (next === 'project') labelText = 'VIEW';
			else if (next === 'image') labelText = 'EXPLORE';
			else labelText = '';
		};

		const onDown = () => {
			gsap.to(dot, { scale: 0.75, duration: 0.12, ease: 'power2.out' });
			gsap.to(ring, { scale: 0.9, duration: 0.12, ease: 'power2.out' });
		};

		const onUp = () => {
			gsap.to(dot, { scale: 1, duration: 0.2, ease: 'power2.out' });
			gsap.to(ring, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.5)' });
		};

		let raf = 0;
		let running = true;

		const tick = () => {
			if (!running) return;
			dotX += (targetX - dotX) * 0.35;
			dotY += (targetY - dotY) * 0.35;
			ringX += (targetX - ringX) * 0.12;
			ringY += (targetY - ringY) * 0.12;

			if (dot) {
				dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
			}
			if (ring) {
				const size =
					mode === 'button'
						? RING_BUTTON
						: mode === 'link'
							? RING_LINK
							: mode === 'project' || mode === 'image'
								? RING_PROJECT
								: RING_SIZE;
				ring.style.width = `${size}px`;
				ring.style.height = `${size}px`;
				ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
				ring.classList.toggle('cursor-ring--pulse', mode === 'button');
				ring.classList.toggle('cursor-ring--project', mode === 'project' || mode === 'image');
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		const onVisibility = () => {
			if (document.hidden) {
				running = false;
				cancelAnimationFrame(raf);
			} else {
				if (!running) {
					running = true;
					raf = requestAnimationFrame(tick);
				}
			}
		};

		window.addEventListener('mousemove', onMove, { passive: true });
		window.addEventListener('mousedown', onDown);
		window.addEventListener('mouseup', onUp);
		window.addEventListener('mouseleave', () => (visible = false));
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			running = false;
			cancelAnimationFrame(raf);
			document.body.classList.remove('custom-cursor-active');
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mousedown', onDown);
			window.removeEventListener('mouseup', onUp);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>

<div
	class="cursor-layer {visible ? 'cursor-layer--visible' : ''}"
	aria-hidden="true"
>
	<div bind:this={ring} class="cursor-ring">
		{#if labelText}
			<span class="cursor-label">{labelText}</span>
		{/if}
	</div>
	<div bind:this={dot} class="cursor-dot"></div>
</div>

<style>
	.cursor-layer {
		position: fixed;
		inset: 0;
		z-index: 200;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.cursor-layer--visible {
		opacity: 1;
	}

	.cursor-dot {
		position: absolute;
		top: 0;
		left: 0;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-gold);
		box-shadow: 0 0 12px rgba(201, 168, 76, 0.8);
		will-change: transform;
	}

	.cursor-ring {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1.5px solid rgba(201, 168, 76, 0.55);
		background: transparent;
		mix-blend-mode: difference;
		box-shadow: 0 0 24px rgba(201, 168, 76, 0.25);
		will-change: transform, width, height;
		transition:
			border-color 0.25s ease,
			box-shadow 0.25s ease;
	}

	:global(.cursor-ring--pulse) {
		border-color: var(--accent-gold);
		box-shadow:
			0 0 0 4px rgba(201, 168, 76, 0.15),
			0 0 32px rgba(201, 168, 76, 0.45);
		animation: cursor-pulse 1.6s ease-in-out infinite;
	}

	:global(.cursor-ring--project) {
		border-color: var(--accent-gold);
		background: rgba(201, 168, 76, 0.06);
		mix-blend-mode: normal;
	}

	.cursor-label {
		position: absolute;
		font-size: 9px;
		font-weight: 600;
		letter-spacing: 0.2em;
		color: var(--accent-gold);
		text-transform: uppercase;
		pointer-events: none;
		will-change: transform;
	}

	@keyframes cursor-pulse {
		0%,
		100% {
			box-shadow:
				0 0 0 4px rgba(201, 168, 76, 0.12),
				0 0 24px rgba(201, 168, 76, 0.3);
		}
		50% {
			box-shadow:
				0 0 0 10px rgba(201, 168, 76, 0.06),
				0 0 40px rgba(201, 168, 76, 0.55);
		}
	}
</style>
