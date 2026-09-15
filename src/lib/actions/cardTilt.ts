export function cardTilt(node: HTMLElement, maxDeg = 12) {
	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) return { destroy() {} };

	const onMove = (e: MouseEvent) => {
		const rect = node.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		const rotateY = x * maxDeg * 2;
		const rotateX = -y * maxDeg * 2;
		node.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
	};

	const onLeave = () => {
		node.style.transform = '';
	};

	node.style.transformStyle = 'preserve-3d';
	node.addEventListener('mousemove', onMove);
	node.addEventListener('mouseleave', onLeave);

	return {
		destroy() {
			node.removeEventListener('mousemove', onMove);
			node.removeEventListener('mouseleave', onLeave);
			node.style.transform = '';
		}
	};
}
