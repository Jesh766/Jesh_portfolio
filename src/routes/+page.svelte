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
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:title" content={data.meta.og.title} />
	<meta property="og:description" content={data.meta.og.description} />
	<meta property="og:type" content={data.meta.og.type} />
	<meta property="og:url" content={data.meta.og.url} />
	<meta property="og:image" content={data.meta.og.image} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.meta.og.title} />
	<meta name="twitter:description" content={data.meta.og.description} />
	<!-- SEO keywords -->
	<meta name="keywords" content="Jayshil Thakkar, Software Engineer Portfolio, AI Developer, Full Stack Developer, Ahmedabad Developer, Web Developer India" />
	<meta name="author" content="Jayshil Thakkar" />
</svelte:head>

<Hero />
<About />
<Skills />
<Projects />
<Certifications />
<Achievements />
<Contact />
<Footer />
<PortfolioEditor />
