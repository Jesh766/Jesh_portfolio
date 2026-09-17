<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	let dot: HTMLDivElement;
	let ring: HTMLDivElement;
	let label = $state<HTMLSpanElement | null>(null);
	let trail: HTMLDivElement;
	let visible = $state(false);
	let labelText = $state('');

	// Cursor state modes
	type CursorMode = 'default' | 'button' | 'link' | 'project' | 'image' | 'social' | 'whatsapp' | 'contact' | 'message';

	const RING_SIZES: Record<CursorMode, number> = {
		default: 40,
		button: 64,
		link: 32,
		project: 72,
		image: 72,
		social: 60,
		whatsapp: 60,
		contact: 60,
		message: 60
	};

	const LABELS: Partial<Record<CursorMode, string>> = {
		project: 'VIEW',
		image: 'EXPLORE',
		social: 'OPEN',
		whatsapp: 'CHAT',
		contact: 'OPEN',
		message: 'MESSAGE'
	};

	let targetX = 0;
	let targetY = 0;
	let dotX = 0;
	let dotY = 0;
	let ringX = 0;
	let ringY = 0;

	// Trail particles
	const TRAIL_COUNT = 8;
	interface TrailDot { x: number; y: number; life: number }
	let trailDots: TrailDot[] = Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0, life: 0 }));
	let trailEls: HTMLSpanElement[] = [];

	onMount(() => {
		const fine = window.matchMedia('(pointer: fine)').matches;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || reduced) return;

		document.body.classList.add('custom-cursor-active');

		const resolveMode = (el: Element | null): CursorMode => {
			if (!el) return 'default';
			const node = el as HTMLElement;
			// Specific overrides first
			if (node.closest('[data-cursor-whatsapp], [href*="wa.me"]')) return 'whatsapp';
			if (node.closest('[data-cursor-social]')) return 'social';
			if (node.closest('[data-cursor-project], [data-project-card].case-study')) return 'project';
			if (node.closest('img, [data-cursor-image], picture')) return 'image';
			if (node.closest('[data-cursor-message], .contact-btn-liquid')) return 'message';
			if (node.closest('[data-cursor-link], [href^="mailto"], [href^="tel"]')) return 'contact';
			if (
				node.closest(
					'button, [data-cursor-button], .nav-contact, .hero-cta-btn, [data-cursor-hover]'
				)
			) {
				return 'button';
			}
			if (node.closest('a, input, textarea, select')) return 'link';
			return 'default';
		};

		let currentMode: CursorMode = 'default';
		let raf = 0;
		let running = true;
		let frameCount = 0;

		const onMove = (e: MouseEvent) => {
			visible = true;
			targetX = e.clientX;
			targetY = e.clientY;

			const hoverTarget = (e.target as HTMLElement).closest(
				'a, button, [data-cursor-hover], [data-cursor-project], [data-project-card], img, [data-cursor-image], input, textarea, [data-cursor-social], [data-cursor-whatsapp], [data-cursor-message]'
			);
			const next = resolveMode(hoverTarget);
			if (next !== currentMode) {
				currentMode = next;
				const nextLabel = LABELS[next] ?? '';
				if (nextLabel !== labelText) {
					if (label) {
						gsap.to(label, {
							opacity: 0,
							scale: 0.6,
							duration: 0.1,
							onComplete: () => {
								labelText = nextLabel;
								if (nextLabel) {
									gsap.fromTo(label, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2)' });
								}
							}
						});
					} else {
						labelText = nextLabel;
					}
				}

				// Animate ring size change
				const size = RING_SIZES[next];
				if (ring) {
					gsap.to(ring, {
						width: size,
						height: size,
						duration: 0.35,
						ease: 'power3.out'
					});
				}

				// Mode class toggles
				if (ring) {
					ring.dataset.mode = next;
				}
			}
		};

		const onDown = () => {
			gsap.to(dot, { scale: 0.6, duration: 0.1, ease: 'power2.out' });
			gsap.to(ring, { scale: 0.88, duration: 0.1, ease: 'power2.out' });
		};

		const onUp = () => {
			gsap.to(dot, { scale: 1, duration: 0.25, ease: 'elastic.out(1.2, 0.5)' });
			gsap.to(ring, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
		};

		const tick = () => {
			if (!running) return;
			frameCount++;

			// Dot follows fast
			dotX += (targetX - dotX) * 0.42;
			dotY += (targetY - dotY) * 0.42;

			// Ring follows with delay
			ringX += (targetX - ringX) * 0.1;
			ringY += (targetY - ringY) * 0.1;

			if (dot) {
				dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
			}
			if (ring) {
				ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
			}

			// Trail — update every 2 frames
			if (frameCount % 2 === 0 && trailEls.length) {
				// Shift older dots back
				for (let i = TRAIL_COUNT - 1; i > 0; i--) {
					trailDots[i].x = trailDots[i - 1].x;
					trailDots[i].y = trailDots[i - 1].y;
				}
				trailDots[0].x = dotX;
				trailDots[0].y = dotY;

				trailEls.forEach((el, i) => {
					if (!el) return;
					const t = trailDots[i];
					const alpha = (1 - i / TRAIL_COUNT) * 0.45;
					const size = (1 - i / TRAIL_COUNT) * 5;
					el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%)`;
					el.style.opacity = String(alpha);
					el.style.width = `${size}px`;
					el.style.height = `${size}px`;
				});
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
		window.addEventListener('mouseenter', () => (visible = true));
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

<div class="cursor-layer {visible ? 'cursor-layer--visible' : ''}" aria-hidden="true">
	<!-- Gold particle trail -->
	<div bind:this={trail} class="cursor-trail">
		{#each { length: TRAIL_COUNT } as _, i}
			<span class="cursor-trail__dot" bind:this={trailEls[i]}></span>
		{/each}
	</div>

	<!-- Outer ring with delayed follow -->
	<div bind:this={ring} class="cursor-ring" data-mode="default">
		{#if labelText}
			<span bind:this={label} class="cursor-label">{labelText}</span>
		{/if}
	</div>

	<!-- Inner dot -->
	<div bind:this={dot} class="cursor-dot"></div>
</div>

<style>
	.cursor-layer {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.25s ease;
	}

	.cursor-layer--visible {
		opacity: 1;
	}

	/* Inner gold dot */
	.cursor-dot {
		position: absolute;
		top: 0;
		left: 0;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent-gold);
		box-shadow:
			0 0 10px rgba(201, 168, 76, 0.9),
			0 0 20px rgba(201, 168, 76, 0.5);
		will-change: transform;
		transform-origin: center;
	}

	/* Outer ring */
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
		border: 1.5px solid rgba(201, 168, 76, 0.6);
		background: rgba(201, 168, 76, 0.03);
		box-shadow:
			0 0 20px rgba(201, 168, 76, 0.2),
			inset 0 0 12px rgba(201, 168, 76, 0.05);
		will-change: transform, width, height;
		transform-origin: center;
		transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
	}

	/* Ring mode states */
	:global(.cursor-ring[data-mode='button']) {
		border-color: var(--accent-gold);
		box-shadow:
			0 0 0 3px rgba(201, 168, 76, 0.12),
			0 0 36px rgba(201, 168, 76, 0.5);
		background: rgba(201, 168, 76, 0.04);
		animation: ring-pulse 1.8s ease-in-out infinite;
	}

	:global(.cursor-ring[data-mode='project']),
	:global(.cursor-ring[data-mode='image']) {
		border-color: var(--accent-gold);
		background: rgba(201, 168, 76, 0.07);
		box-shadow:
			0 0 28px rgba(201, 168, 76, 0.4),
			inset 0 0 16px rgba(201, 168, 76, 0.08);
	}

	:global(.cursor-ring[data-mode='social']),
	:global(.cursor-ring[data-mode='whatsapp']),
	:global(.cursor-ring[data-mode='contact']),
	:global(.cursor-ring[data-mode='message']) {
		border-color: rgba(201, 168, 76, 0.85);
		background: rgba(201, 168, 76, 0.06);
		box-shadow:
			0 0 24px rgba(201, 168, 76, 0.35),
			0 0 48px rgba(201, 168, 76, 0.15);
	}

	:global(.cursor-ring[data-mode='link']) {
		border-color: rgba(201, 168, 76, 0.4);
		box-shadow: 0 0 14px rgba(201, 168, 76, 0.2);
	}

	/* Label inside ring */
	.cursor-label {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.22em;
		color: var(--accent-gold);
		text-transform: uppercase;
		pointer-events: none;
		user-select: none;
		text-shadow: 0 0 8px rgba(201, 168, 76, 0.7);
	}

	/* Trail */
	.cursor-trail {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.cursor-trail__dot {
		position: absolute;
		top: 0;
		left: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--accent-gold);
		box-shadow: 0 0 6px rgba(201, 168, 76, 0.6);
		pointer-events: none;
		will-change: transform, opacity;
	}

	@keyframes ring-pulse {
		0%, 100% {
			box-shadow:
				0 0 0 3px rgba(201, 168, 76, 0.1),
				0 0 28px rgba(201, 168, 76, 0.4);
		}
		50% {
			box-shadow:
				0 0 0 8px rgba(201, 168, 76, 0.05),
				0 0 48px rgba(201, 168, 76, 0.65);
		}
	}
</style>
