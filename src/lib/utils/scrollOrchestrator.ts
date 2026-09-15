import gsap from 'gsap';

export function splitWordsInElement(el: HTMLElement) {
	const text = el.textContent?.trim() ?? '';
	if (!text || el.querySelector('[data-word]')) return;
	el.textContent = '';
	text.split(/\s+/).forEach((word, i) => {
		const span = document.createElement('span');
		span.setAttribute('data-word', '');
		span.style.display = 'inline-block';
		span.style.marginRight = '0.28em';
		span.textContent = word;
		el.appendChild(span);
		if (i < text.split(/\s+/).length - 1) {
			el.appendChild(document.createTextNode(' '));
		}
	});
}

export async function initScrollOrchestrator() {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const { ScrollTrigger } = await import('gsap/ScrollTrigger');
	gsap.registerPlugin(ScrollTrigger);

	if (reduced) return;

	const sections = gsap.utils.toArray<HTMLElement>('main section[id]:not(#hero)');
	sections.forEach((section) => {
		gsap.from(section, {
			scrollTrigger: {
				trigger: section,
				start: 'top 88%',
				toggleActions: 'play none none none'
			},
			opacity: 0,
			y: 60,
			duration: 0.9,
			ease: 'power3.out'
		});
	});

	const animateHeading = (h2: HTMLElement) => {
		splitWordsInElement(h2);
		gsap.from(h2.querySelectorAll('[data-word]'), {
			scrollTrigger: { trigger: h2, start: 'top 85%' },
			y: 32,
			opacity: 0,
			filter: 'blur(10px)',
			duration: 0.75,
			stagger: 0.06,
			ease: 'power3.out'
		});
		gsap.to(h2.querySelectorAll('[data-word]'), {
			scrollTrigger: { trigger: h2, start: 'top 85%' },
			filter: 'blur(0px)',
			duration: 0.75,
			stagger: 0.06,
			ease: 'power3.out'
		});
	};

	document.querySelectorAll<HTMLElement>('[data-section-header] h2').forEach(animateHeading);
	document.querySelectorAll<HTMLElement>('[data-display-heading]').forEach(animateHeading);

	gsap.utils.toArray<HTMLElement>('[data-stat-count]').forEach((el) => {
		const target = Number(el.dataset.statCount ?? 0);
		const suffix = el.dataset.statSuffix ?? '';
		const obj = { n: 0 };
		gsap.to(obj, {
			scrollTrigger: { trigger: el, start: 'top 88%' },
			n: target,
			duration: 2,
			ease: 'power2.out',
			onUpdate: () => {
				el.textContent = `${Math.round(obj.n)}${suffix}`;
			}
		});
	});

	const heroBg = document.querySelector('[data-parallax-hero-bg]');
	if (heroBg) {
		gsap.to(heroBg, {
			scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
			y: () => window.innerHeight * 0.3,
			ease: 'none'
		});
	}

	document.querySelectorAll<HTMLElement>('[data-parallax-orbs]').forEach((orbs) => {
		gsap.to(orbs, {
			scrollTrigger: { trigger: orbs.parentElement ?? orbs, start: 'top bottom', end: 'bottom top', scrub: true },
			y: () => window.innerHeight * 0.6,
			ease: 'none'
		});
	});

	document.querySelectorAll<HTMLElement>('[data-skill-bar]').forEach((bar) => {
		const w = bar.dataset.skillWidth ?? '80%';
		gsap.fromTo(
			bar,
			{ width: '0%' },
			{
				width: w,
				scrollTrigger: { trigger: bar, start: 'top 92%' },
				duration: 1.2,
				ease: 'power2.out'
			}
		);
	});
}
