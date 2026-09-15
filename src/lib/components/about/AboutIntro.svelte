<script lang="ts">
	import { SITE } from '$lib/data/site';
</script>

<div class="about-intro" data-about-reveal>
	<div class="about-intro__bg-text" aria-hidden="true">STORY</div>
	<p class="about-intro__eyebrow">Software Engineer & AI Enthusiast</p>
	<h3 class="about-intro__title">Building Intelligent<br /><span class="about-intro__title--gold">Digital Experiences</span></h3>
	<p class="about-intro__desc">
		I transform ideas into impactful digital products by combining modern full-stack development,
		AI-powered tools, and thoughtful product design — bridging the gap between creativity and code.
	</p>
	<div class="about-intro__divider" aria-hidden="true"></div>
	<p class="about-intro__signature font-display">{SITE.name}</p>
</div>

<style>
	.about-intro {
		position: relative;
	}

	.about-intro__bg-text {
		position: absolute;
		top: -0.3em;
		left: -0.1em;
		font-family: var(--font-display);
		font-size: clamp(4rem, 12vw, 7rem);
		font-weight: 700;
		letter-spacing: 0.15em;
		color: rgba(201, 168, 76, 0.04);
		pointer-events: none;
		user-select: none;
		white-space: nowrap;
		line-height: 1;
		z-index: 0;
	}

	.about-intro__eyebrow {
		position: relative;
		z-index: 1;
		font-size: 0.65rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--accent-gold);
		margin-bottom: 0.65rem;
		opacity: 0.9;
	}

	.about-intro__title {
		position: relative;
		z-index: 1;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.8vw, 2rem);
		line-height: 1.2;
		color: var(--text-primary);
		letter-spacing: 0.02em;
	}

	.about-intro__title--gold {
		color: var(--accent-gold);
		display: block;
	}

	.about-intro__desc {
		position: relative;
		z-index: 1;
		margin-top: 1rem;
		max-width: 38ch;
		font-size: 0.9375rem;
		line-height: 1.75;
		color: var(--text-secondary);
	}

	.about-intro__divider {
		position: relative;
		z-index: 1;
		margin-top: 1.35rem;
		width: 3.5rem;
		height: 2px;
		background: linear-gradient(90deg, var(--accent-gold), transparent);
		border-radius: 2px;
	}

	.about-intro__signature {
		position: relative;
		z-index: 1;
		margin-top: 0.85rem;
		font-size: clamp(0.8rem, 2.2vw, 0.95rem);
		letter-spacing: 0.18em;
		color: var(--text-primary);
		opacity: 0.7;
	}
</style>
