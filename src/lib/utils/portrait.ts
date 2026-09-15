import { SITE } from '$lib/data/site';

/** Ordered fallbacks when the primary portrait file is missing. */
export const PORTRAIT_SOURCES = [
	SITE.portrait,
	'/images/jayshil-portrait.png',
	'/images/jayshil-portrait.svg'
] as const;

export function loadPortraitImage(): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const tryLoad = (index: number) => {
			if (index >= PORTRAIT_SOURCES.length) {
				reject(new Error('No portrait image found'));
				return;
			}
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => resolve(img);
			img.onerror = () => tryLoad(index + 1);
			img.src = PORTRAIT_SOURCES[index];
		};
		tryLoad(0);
	});
}
