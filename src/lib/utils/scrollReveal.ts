import gsap from 'gsap';

export async function registerScrollReveal() {
	const { ScrollTrigger } = await import('gsap/ScrollTrigger');
	gsap.registerPlugin(ScrollTrigger);
	return ScrollTrigger;
}

export async function revealSectionHeaders() {
	await registerScrollReveal();
	gsap.utils.toArray<HTMLElement>('[data-section-header]').forEach((el) => {
		const targets = [...el.children].filter((c) => c.tagName !== 'H2');
		if (!targets.length) return;
		gsap.from(targets, {
			scrollTrigger: { trigger: el, start: 'top 82%' },
			y: 36,
			opacity: 0,
			duration: 0.9,
			stagger: 0.1,
			ease: 'power3.out',
			clearProps: 'opacity,transform'
		});
	});
}

export async function revealElements(selector: string, options?: gsap.TweenVars) {
	await registerScrollReveal();
	gsap.utils.toArray<HTMLElement>(selector).forEach((el, i) => {
		gsap.from(el, {
			scrollTrigger: { trigger: el, start: 'top 88%' },
			y: 40,
			opacity: 0,
			duration: 0.85,
			delay: (options?.delay as number) ?? i * 0.1,
			ease: 'power3.out',
			clearProps: 'opacity,transform',
			...options
		});
	});
}
