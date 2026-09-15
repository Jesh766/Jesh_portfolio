import gsap from 'gsap';

export function magnetic(
	node: HTMLElement,
	params: { strength?: number; max?: number } = {}
) {
	const strength = params.strength ?? 0.35;
	const max = params.max ?? 12;
	const fine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
	const reduced =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!fine || reduced) {
		return { destroy() {} };
	}

	const xTo = gsap.quickTo(node, 'x', { duration: 0.45, ease: 'power3.out' });
	const yTo = gsap.quickTo(node, 'y', { duration: 0.45, ease: 'power3.out' });
	gsap.set(node, { x: 0, y: 0 });

	const onMove = (e: MouseEvent) => {
		const rect = node.getBoundingClientRect();
		const x = Math.max(-max, Math.min(max, (e.clientX - rect.left - rect.width / 2) * strength));
		const y = Math.max(-max, Math.min(max, (e.clientY - rect.top - rect.height / 2) * strength));
		xTo(x);
		yTo(y);
	};

	const onLeave = () => {
		xTo(0);
		yTo(0);
	};

	node.addEventListener('mousemove', onMove);
	node.addEventListener('mouseleave', onLeave);

	return {
		destroy() {
			node.removeEventListener('mousemove', onMove);
			node.removeEventListener('mouseleave', onLeave);
			gsap.set(node, { clearProps: 'x,y' });
		}
	};
}
