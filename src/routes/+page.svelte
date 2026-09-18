<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import Skills from '$lib/components/Skills.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import Certifications from '$lib/components/Certifications.svelte';
	import Achievements from '$lib/components/Achievements.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PortfolioEditor from '$lib/components/PortfolioEditor.svelte';
	import { contentState } from '$lib/stores/content.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const seo = $derived(contentState.seo);
	const sectionVisible = (id: string) => contentState.sections.find((section) => section.id === id)?.visible ?? true;
</script>

<svelte:head>
	<title>{seo.title || data.meta.title}</title>
	<meta name="description" content={seo.description || data.meta.description} />
	<meta property="og:title" content={seo.ogTitle || data.meta.og.title} />
	<meta property="og:description" content={seo.ogDescription || data.meta.og.description} />
	<meta property="og:type" content={data.meta.og.type} />
	<meta property="og:url" content={data.meta.og.url} />
	<meta property="og:image" content={seo.ogImage || data.meta.og.image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.ogTitle || data.meta.og.title} />
	<meta name="twitter:description" content={seo.ogDescription || data.meta.og.description} />
	<!-- SEO keywords -->
	<meta name="keywords" content={seo.keywords} />
	<meta name="author" content="Jayshil Thakkar" />
</svelte:head>

{#if sectionVisible('hero')}<Hero />{/if}
{#if sectionVisible('about')}<About />{/if}
{#if sectionVisible('skills')}<Skills />{/if}
{#if sectionVisible('projects')}<Projects />{/if}
{#if sectionVisible('certifications')}<Certifications />{/if}
{#if sectionVisible('achievements')}<Achievements />{/if}
{#if sectionVisible('contact')}<Contact />{/if}
<Footer />
<PortfolioEditor />
