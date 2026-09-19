<script lang="ts">
	import { contentState } from '$lib/stores/content.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import SectionOrbs from '$lib/components/global/SectionOrbs.svelte';
	import { revealSectionHeaders } from '$lib/utils/scrollReveal';
	import AboutAmbient from '$lib/components/about/AboutAmbient.svelte';
	import AboutAICore from '$lib/components/about/AboutAICore.svelte';
	import AboutIntro from '$lib/components/about/AboutIntro.svelte';
	import AboutImpactMetrics from '$lib/components/about/AboutImpactMetrics.svelte';
	import AboutCurrentFocus from '$lib/components/about/AboutCurrentFocus.svelte';

	onMount(() => {
		void (async () => {
			await revealSectionHeaders();
			const { default: ScrollTrigger } = await import('gsap/ScrollTrigger');
			gsap.registerPlugin(ScrollTrigger);
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!reduced) {
				gsap.from('#about [data-about-reveal]', {
					scrollTrigger: { trigger: '#about .about-left', start: 'top 78%' },
					y: 32,
					opacity: 0,
					stagger: 0.12,
					duration: 0.8,
					ease: 'power3.out'
				});

				gsap.from('#about [data-about-metrics] .about-metric-card', {
					scrollTrigger: { trigger: '#about [data-about-metrics]', start: 'top 88%' },
					y: 22,
					opacity: 0,
					stagger: 0.1,
					duration: 0.65,
					ease: 'power2.out'
				});
			}
		})();
	});
</script>

<section id="about" class="section-padding section-secondary about-section relative z-[1] overflow-hidden">
	<AboutAmbient />
	<div class="section-dot-grid about-section__dot-grid" aria-hidden="true"></div>
	<SectionOrbs variant="about" />

	<div class="relative z-[1] mx-auto max-w-3xl">
		<SectionHeader
			eyebrow={contentState.about.eyebrow}
			title={contentState.about.title}
			description={contentState.about.description}
		/>

		<p class="status-available relative z-[1] mt-6" data-editable="site.availability">
			<span class="status-available__dot" aria-hidden="true"></span>
			{contentState.site.availability}
		</p>

		<div class="about-left mx-auto mt-12 max-w-2xl space-y-8">
				<div data-about-reveal>
					<AboutAICore />
				</div>
				<AboutIntro />
				<AboutImpactMetrics />
				<AboutCurrentFocus />
			</div>
		</div>
</section>

<style>
	.about-section__dot-grid {
		background-image:
			linear-gradient(rgba(201, 168, 76, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(201, 168, 76, 0.05) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.35;
	}
</style>
