<script lang="ts">
	import './layout.css';
	import '$lib/styles/effects.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import GlobalAmbient from '$lib/components/global/GlobalAmbient.svelte';
	import ScrollProgress from '$lib/components/global/ScrollProgress.svelte';
	import ScrollInit from '$lib/components/global/ScrollInit.svelte';
	import AvailableForWork from '$lib/components/global/AvailableForWork.svelte';
	import {
		observeSections,
		startCursorSampling,
		startSessionTracking,
		trackEvent
	} from '$lib/utils/analytics';
	import { SITE } from '$lib/data/site';
	import { env } from '$env/dynamic/public';
	import { loadPublishedContent } from '$lib/stores/content.svelte';

	let { children } = $props();

	onMount(() => {
		void loadPublishedContent();
		if (window.location.pathname.startsWith('/admin')) return;
		trackEvent({ event_type: 'page_view', path: window.location.pathname });
		const stopSessionTracking = startSessionTracking();
		const stopCursorSampling = startCursorSampling();

		const cleanupSections = observeSections(
			['about', 'skills', 'projects', 'certifications', 'contact'],
			(section) => trackEvent({ event_type: 'section_view', section })
		);

		let lenisDestroy: (() => void) | undefined;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener('click', (e) => {
				const id = anchor.getAttribute('href')?.slice(1);
				if (!id) return;
				const target = document.getElementById(id);
				if (!target) return;
				e.preventDefault();
				target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
			});
		});

		if (!reduced) {
			import('lenis').then(({ default: Lenis }) => {
				import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
					import('gsap').then(({ gsap }) => {
						const lenis = new Lenis({
							duration: 1.15,
							easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
							smoothWheel: true
						});
						document.documentElement.classList.add('lenis', 'lenis-smooth');
						gsap.registerPlugin(ScrollTrigger);
						lenis.on('scroll', ScrollTrigger.update);
						const raf = (time: number) => {
							lenis.raf(time * 1000);
						};
						gsap.ticker.add(raf);
						gsap.ticker.lagSmoothing(0);
						lenisDestroy = () => {
							lenis.destroy();
							document.documentElement.classList.remove('lenis', 'lenis-smooth');
							gsap.ticker.remove(raf);
						};
					});
				});
			});
		}

		return () => {
			cleanupSections();
			stopSessionTracking();
			stopCursorSampling();
			lenisDestroy?.();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
	<meta name="theme-color" content="#080604" />
		{#if env.PUBLIC_CLARITY_PROJECT_ID}
			<script>
				(function (c, l, a, r, i, t, y) {
					c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
					t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
					y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
				})(window, document, 'clarity', 'script', {JSON.stringify(env.PUBLIC_CLARITY_PROJECT_ID)});
			</script>
		{/if}
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: SITE.name,
		jobTitle: SITE.title,
		email: SITE.email,
		telephone: SITE.phone,
		url: env.PUBLIC_SITE_URL || SITE.url,
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Ahmedabad',
			addressRegion: 'Gujarat',
			addressCountry: 'IN'
		},
		sameAs: [SITE.linkedin, SITE.github]
	})}</script>`}
</svelte:head>

{#if !page.url.pathname.startsWith('/admin')}
	<GlobalAmbient />
	<ScrollProgress />
	<ScrollInit />
	<LoadingScreen />
	<Navigation />
{/if}
<main>
	{@render children()}
</main>
{#if !page.url.pathname.startsWith('/admin')}
	<AvailableForWork />
{/if}
