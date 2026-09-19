<script lang="ts">
	import { CERTIFICATIONS } from '$lib/data/site';
	import { contentState } from '$lib/stores/content.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';

	const certifications = $derived(contentState.certifications.length ? contentState.certifications : CERTIFICATIONS);

	function issuerKeyFor(cert: { issuer: string; issuerKey: string }) {
		const value = `${cert.issuerKey} ${cert.issuer}`.toLowerCase().replace(/[^a-z0-9]/g, '');
		if (value.includes('anthropic') || value.includes('claude')) return 'anthropic';
		if (value.includes('be10x')) return 'be10x';
		if (value.includes('deloitte')) return 'deloitte';
		if (value.includes('google') || value.includes('gemini')) return 'google';
		return 'generic';
	}

	function issuerInitials(issuer: string) {
		const words = issuer.trim().split(/\s+/).filter(Boolean);
		return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : issuer.slice(0, 2)).toUpperCase();
	}

	onMount(async () => {
		await revealSectionHeaders();
		const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
		gsap.registerPlugin(ScrollTrigger);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		gsap.utils.toArray<HTMLElement>('[data-cert-card]').forEach((el, i) => {
			gsap.fromTo(
				el,
				{ opacity: 0, y: 25 },
				{
					scrollTrigger: { trigger: el, start: 'top 88%', once: true },
					opacity: 1,
					y: 0,
					duration: 0.5,
					delay: i * 0.1,
					ease: 'power2.out'
				}
			);
		});
	});
</script>

<section id="certifications" class="section-padding section-dark relative z-[1] overflow-hidden">
	<SectionOrbs variant="dark" />
	<p class="section-watermark section-watermark--certified" aria-hidden="true">CERTIFIED</p>

	<div class="relative z-[1] mx-auto max-w-6xl">
		<SectionHeader eyebrow={contentState.site.certificationsLabel ?? 'Certifications'} title={contentState.site.certificationsHeading ?? 'Credentials'} description={contentState.site.certificationsIntro} />

		<div class="mt-14 grid gap-5 sm:gap-6 md:grid-cols-2">
			{#each certifications as cert, i}
				<a
					data-cert-card
					href={cert.url}
					target="_blank"
					rel="noopener noreferrer"
					data-cursor-hover
					class="cert-card group relative overflow-hidden rounded-3xl p-5 sm:p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:border-[var(--border-accent)] hover:shadow-[var(--glow-gold)] md:p-8"
					style="transition-delay: {i * 40}ms;"
				>
					<div
						class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent-gold)]/10 blur-2xl transition-transform duration-700 group-hover:scale-150"
						aria-hidden="true"
					></div>

					<!-- top row: logo + year pill -->
					<div class="relative flex items-center justify-between gap-4">
						<div class="cert-logo cert-logo--{issuerKeyFor(cert)}" aria-label={cert.issuer}>
							{#if issuerKeyFor(cert) === 'anthropic'}
								<!-- Anthropic: black square with "AI" inside + wordmark -->
								<span class="logo-anthropic">
									<span class="logo-anthropic__badge">AI</span>
									<span class="logo-anthropic__name">Anthropic</span>
								</span>
							{:else if issuerKeyFor(cert) === 'be10x'}
								<!-- Be10x: their bold lowercase wordmark -->
								<span class="logo-be10x">
									<span class="logo-be10x__be">be</span><span class="logo-be10x__num">10x</span>
								</span>
							{:else if issuerKeyFor(cert) === 'deloitte'}
								<!-- Deloitte: serif wordmark + green dot -->
								<span class="logo-deloitte">
									<span class="logo-deloitte__text">Deloitte</span><span class="logo-deloitte__dot" aria-hidden="true"></span>
								</span>
							{:else if issuerKeyFor(cert) === 'google'}
								<!-- Google: 4-colour G icon + wordmark -->
								<span class="logo-google">
									<svg class="logo-google__g" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
										<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
										<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
										<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
									</svg>
									<span class="logo-google__text">Google</span>
								</span>
							{:else}
								<span class="logo-generic"><span class="logo-generic__badge">{issuerInitials(cert.issuer)}</span><span>{cert.issuer}</span></span>
							{/if}
						</div>
						<span class="cert-year-pill flex-shrink-0">{cert.year}</span>
					</div>

					<h3 class="relative mt-5 text-xl font-semibold leading-snug" data-editable={`certifications.${i}.title`} style="color: var(--text-primary);">
						{cert.title}
					</h3>
					<p class="relative mt-1.5 text-sm" data-editable={`certifications.${i}.issuer`} style="color: var(--text-secondary);">{cert.issuer}</p>

					{#if cert.note}
						<p class="relative mt-2 text-xs leading-relaxed" data-editable={`certifications.${i}.note`} style="color: var(--text-muted);">{cert.note}</p>
					{/if}

					<span
						class="relative mt-6 inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase transition group-hover:text-[var(--accent-gold)]"
						style="color: var(--text-muted);"
					>
						Verify credential
						<span class="transition-transform group-hover:translate-x-1">→</span>
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<style>
	/* ── Anthropic ────────────────────────────────── */
	.logo-anthropic {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.logo-anthropic__badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 5px;
		background: var(--text-primary);
		color: var(--bg-primary, #0a0a0c);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.03em;
		line-height: 1;
		flex-shrink: 0;
	}
	.logo-anthropic__name {
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.01em;
		color: var(--text-secondary);
	}

	/* ── Be10x ────────────────────────────────────── */
	.logo-be10x {
		display: inline-flex;
		align-items: baseline;
		font-size: 19px;
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--text-secondary);
	}
	.logo-be10x__num {
		opacity: 0.65;
	}

	/* ── Deloitte ─────────────────────────────────── */
	.logo-deloitte {
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}
	.logo-deloitte__text {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 17px;
		font-weight: 400;
		letter-spacing: -0.01em;
		color: var(--text-secondary);
		line-height: 1;
	}
	.logo-deloitte__dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #86BC25;
		flex-shrink: 0;
		margin-bottom: -2px;
	}

	/* ── Google ───────────────────────────────────── */
	.logo-google {
		display: inline-flex;
		align-items: center;
		gap: 7px;
	}
	.logo-google__g {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}
	.logo-google__text {
		font-size: 15px;
		font-weight: 400;
		letter-spacing: 0.01em;
		color: var(--text-secondary);
		line-height: 1;
	}
	.logo-generic { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 14px; font-weight: 500; }
	.logo-generic__badge { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 1px solid var(--accent-gold); border-radius: 6px; color: var(--accent-gold); font-size: 9px; font-weight: 800; letter-spacing: .04em; }

	/* ── Shared hover ─────────────────────────────── */
	.cert-logo {
		opacity: 0.75;
		transition: opacity 0.3s ease;
	}
	.cert-card:hover .cert-logo {
		opacity: 1;
	}
	.cert-card:hover .logo-anthropic__name,
	.cert-card:hover .logo-be10x,
	.cert-card:hover .logo-deloitte__text,
	.cert-card:hover .logo-google__text {
		color: var(--text-primary);
	}
	.cert-card:hover .logo-anthropic__badge {
		background: var(--accent-gold);
	}
</style>
