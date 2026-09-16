<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import emailjs from '@emailjs/browser';
	import { SITE } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import ContactSocialConnect from '$lib/components/contact/ContactSocialConnect.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';

	const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '';
	const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
	const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
	let errorMsg = $state('');
	let toast = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let form: HTMLFormElement;
	let formWrap: HTMLDivElement;
	let burstLayer: HTMLDivElement;
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(async () => {
		if (publicKey) emailjs.init(publicKey);
		await revealSectionHeaders();
		const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
		gsap.registerPlugin(ScrollTrigger);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		if (formWrap) {
			gsap.from(formWrap, {
				scrollTrigger: { trigger: '#contact', start: 'top 78%' },
				y: 40,
				opacity: 0,
				duration: 0.85,
				ease: 'power3.out'
			});
		}

		if (form) {
			gsap.from(form.querySelectorAll('.contact-form-field'), {
				scrollTrigger: { trigger: form, start: 'top 85%' },
				y: 28,
				opacity: 0,
				stagger: 0.1,
				duration: 0.7,
				ease: 'power2.out'
			});
		}
	});

	function showToast(type: 'success' | 'error', text: string) {
		toast = { type, text };
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast = null;
		}, 5000);
	}

	function pulseFormSuccess() {
		if (!formWrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		gsap.fromTo(
			formWrap,
			{ boxShadow: '0 0 0 0 rgba(201, 168, 76, 0.45)' },
			{
				boxShadow: '0 0 48px 4px rgba(201, 168, 76, 0.35)',
				duration: 0.6,
				yoyo: true,
				repeat: 1,
				ease: 'power2.inOut'
			}
		);
	}

	function spawnBurst(x: number, y: number) {
		if (!burstLayer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		for (let i = 0; i < 14; i++) {
			const p = document.createElement('span');
			p.className = 'contact-burst-particle';
			const angle = (i / 14) * Math.PI * 2;
			const dist = 40 + Math.random() * 60;
			p.style.left = `${x}px`;
			p.style.top = `${y}px`;
			p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
			p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
			burstLayer.appendChild(p);
			p.addEventListener('animationend', () => p.remove());
		}
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (status === 'sending') return;

		const btn = (e.submitter as HTMLButtonElement | null) ?? form?.querySelector('button[type="submit"]');
		if (btn) {
			const rect = btn.getBoundingClientRect();
			spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
		}

		if (!serviceId || !templateId || !publicKey) {
			status = 'error';
			errorMsg = 'Email is not configured. Add VITE_EMAILJS_* keys to .env (see SETUP.md).';
			showToast('error', 'Failed to send message. Please try again later.');
			return;
		}

		status = 'sending';
		errorMsg = '';
		try {
			await emailjs.send(
				serviceId,
				templateId,
				{
					from_name: name,
					from_email: email,
					reply_to: email,
					message,
					to_name: SITE.name
				},
				publicKey
			);
			status = 'sent';
			showToast('success', "Message sent successfully. I'll get back to you soon.");
			pulseFormSuccess();
			name = '';
			email = '';
			message = '';
			setTimeout(() => {
				if (status === 'sent') status = 'idle';
			}, 4000);
		} catch (err) {
			status = 'error';
			errorMsg = err instanceof Error ? err.message : 'Failed to send message';
			showToast('error', 'Failed to send message. Please try again later.');
		}
	}

	function focusGlow(node: HTMLInputElement | HTMLTextAreaElement) {
		const onFocus = () => node.classList.add('field-focused');
		const onBlur = () => node.classList.remove('field-focused');
		node.addEventListener('focus', onFocus);
		node.addEventListener('blur', onBlur);
		return {
			destroy() {
				node.removeEventListener('focus', onFocus);
				node.removeEventListener('blur', onBlur);
			}
		};
	}
</script>

<section id="contact" class="section-padding contact-noise relative z-[1] overflow-hidden">
	<SectionOrbs variant="dark" />
	<div bind:this={burstLayer} class="contact-burst-layer pointer-events-none fixed inset-0 z-[150]" aria-hidden="true"></div>

	{#if toast}
		<div
			class="contact-toast {toast.type === 'success' ? 'contact-toast--success' : 'contact-toast--error'}"
			role="status"
			aria-live="polite"
		>
			{#if toast.type === 'success'}
				<svg class="contact-toast__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
					<path
						class="contact-toast__check"
						d="M7 12.5l3 3 7-7"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
			<span>{toast.text}</span>
		</div>
	{/if}

	<div class="relative z-[1] mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-start">
		<div data-section-header>
			<p class="text-xs tracking-[0.4em] uppercase" style="color: var(--text-muted);" data-editable="site.contactLabel">Contact</p>
			<h2 class="display-heading mt-4 text-3xl sm:text-4xl md:text-5xl" data-editable="site.contactHeading">Let's build something remarkable</h2>
			<ul class="mt-10 space-y-4" style="color: var(--text-secondary);" data-contact-details>
				<li>
					<a
						href="mailto:{contentState.contact.email}?subject=Hello%20Jayshil&body=Hi%20Jayshil%2C%0A%0AI%20came%20across%20your%20portfolio%20and%20would%20love%20to%20connect.%0A%0A"
						data-cursor-hover
						data-cursor-link
						class="transition hover:text-[var(--accent-gold)]"
						data-editable="contact.email">{contentState.contact.email}</a
					>
				</li>
				<li>
					<a
						href="tel:{contentState.contact.phone.replace(/\s/g, '')}"
						data-cursor-hover
						data-cursor-link
						class="transition hover:text-[var(--accent-gold)]"
						data-editable="contact.phone">{contentState.contact.phone}</a
					>
				</li>
				<li data-editable="site.location">{SITE.location}</li>
			</ul>

			<ContactSocialConnect />
		</div>

		<div
			bind:this={formWrap}
			class="contact-form-shell"
			class:contact-form-shell--success={status === 'sent'}
		>
			<form bind:this={form} class="contact-form space-y-6" onsubmit={submit} novalidate>
				<div class="contact-form-field">
					<label for="name" class="contact-label">Name</label>
					<input
						id="name"
						name="name"
						required
						autocomplete="name"
						bind:value={name}
						use:focusGlow
						class="contact-field w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 placeholder:text-[var(--text-muted)]"
						style="color: var(--text-primary);"
						placeholder="Your name"
						disabled={status === 'sending'}
					/>
				</div>
				<div class="contact-form-field">
					<label for="email" class="contact-label">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						bind:value={email}
						use:focusGlow
						class="contact-field w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 placeholder:text-[var(--text-muted)]"
						style="color: var(--text-primary);"
						placeholder="you@email.com"
						disabled={status === 'sending'}
					/>
				</div>
				<div class="contact-form-field">
					<label for="message" class="contact-label">Message</label>
					<textarea
						id="message"
						name="message"
						required
						rows="5"
						bind:value={message}
						use:focusGlow
						class="contact-field w-full resize-none rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 placeholder:text-[var(--text-muted)]"
						style="color: var(--text-primary);"
						placeholder="Tell me about your project…"
						disabled={status === 'sending'}
					></textarea>
				</div>

				{#if status === 'error' && errorMsg}
					<p class="text-sm text-red-400" role="alert">{errorMsg}</p>
				{/if}

				<button
					type="submit"
					disabled={status === 'sending'}
					aria-busy={status === 'sending'}
					data-cursor-hover
					data-cursor-button
					class="contact-btn-liquid cta-shimmer inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium tracking-wide disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
				>
					{#if status === 'sending'}
						<span class="contact-spinner" aria-hidden="true"></span>
						<span>Sending…</span>
					{:else if status === 'sent'}
						<span aria-hidden="true">✓</span>
						<span>Sent</span>
					{:else}
						<span>Send message</span>
					{/if}
				</button>
			</form>
		</div>
	</div>
</section>

<style>
	.contact-form-shell {
		padding: 1.75rem 1.5rem;
		border-radius: 1.25rem;
		background: var(--bg-card);
		border: 1px solid var(--border-subtle);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		box-shadow:
			0 8px 40px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
		transition: box-shadow 0.45s ease;
	}

	@media (min-width: 768px) {
		.contact-form-shell {
			padding: 2rem 2.25rem;
		}
	}

	.contact-form-shell--success {
		border-color: var(--border-accent);
	}

	.contact-label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.contact-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(201, 168, 76, 0.25);
		border-top-color: var(--accent-gold);
		border-radius: 50%;
		animation: contact-spin 0.7s linear infinite;
	}

	@keyframes contact-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.contact-toast {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		max-width: min(22rem, calc(100vw - 2rem));
	}

	.contact-toast__icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}

	.contact-toast__check {
		stroke-dasharray: 24;
		stroke-dashoffset: 24;
		animation: check-draw 0.5s ease forwards 0.15s;
	}

	@keyframes check-draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	:global(.contact-burst-particle) {
		position: fixed;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-gold);
		pointer-events: none;
		animation: contact-burst 0.65s ease-out forwards;
	}

	@keyframes contact-burst {
		from {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
		to {
			transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-spinner {
			animation: none;
			border-top-color: var(--accent-gold);
		}

		.contact-toast__check {
			stroke-dashoffset: 0;
			animation: none;
		}
	}
</style>
