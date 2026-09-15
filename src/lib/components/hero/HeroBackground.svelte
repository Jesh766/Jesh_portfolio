<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { prefersReducedMotion } from '$lib/utils/motion';

	let {
		mouse = { x: 0, y: 0 }
	}: {
		mouse?: { x: number; y: number };
	} = $props();

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	onMount(() => {
		if (!container || !canvas || prefersReducedMotion()) return;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x080604);

		const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
		camera.position.z = 5;

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		const count = 1400;
		const positions = new Float32Array(count * 3);
		const colors = new Float32Array(count * 3);
		const velocities = new Float32Array(count * 2);

		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 14;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
			velocities[i * 2] = (Math.random() - 0.5) * 0.002;
			velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.002;
			const roll = Math.random();
			if (roll < 0.6) {
				colors[i * 3] = 1;
				colors[i * 3 + 1] = 1;
				colors[i * 3 + 2] = 1;
			} else if (roll < 0.85) {
				colors[i * 3] = 0.788;
				colors[i * 3 + 1] = 0.659;
				colors[i * 3 + 2] = 0.298;
			} else {
				colors[i * 3] = 0.831;
				colors[i * 3 + 1] = 0.627;
				colors[i * 3 + 2] = 1;
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 0.035,
			vertexColors: true,
			transparent: true,
			opacity: 0.75,
			sizeAttenuation: true,
			depthWrite: false
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let width = 0;
		let height = 0;
		let running = true;
		let mouseRipple = { x: 0, y: 0 };

		const resize = () => {
			if (!container) return;
			width = container.clientWidth;
			height = container.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height, false);
		};

		const ro = new ResizeObserver(resize);
		ro.observe(container);
		resize();

		const onVisibility = () => {
			running = document.visibilityState === 'visible';
		};
		document.addEventListener('visibilitychange', onVisibility);

		let io: IntersectionObserver | undefined;
		io = new IntersectionObserver(
			([entry]) => {
				running = entry.isIntersecting && document.visibilityState === 'visible';
			},
			{ threshold: 0.05 }
		);
		io.observe(container);

		const onPointer = (e: PointerEvent) => {
			if (!container) return;
			const rect = container.getBoundingClientRect();
			mouseRipple = {
				x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
				y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
			};
		};
		container.addEventListener('pointermove', onPointer, { passive: true });

		let raf = 0;
		const tick = () => {
			raf = requestAnimationFrame(tick);
			if (!running) return;

			points.rotation.y += 0.0008;
			points.rotation.x = THREE.MathUtils.lerp(
				points.rotation.x,
				mouseRipple.y * 0.06 + mouse.y * 0.04,
				0.02
			);
			points.rotation.y += mouseRipple.x * 0.0004;

			const pos = geometry.attributes.position as THREE.BufferAttribute;
			const arr = pos.array as Float32Array;
			for (let i = 0; i < count; i++) {
				const dx = mouseRipple.x * 0.015;
				const dy = mouseRipple.y * 0.015;
				arr[i * 3] += velocities[i * 2] + dx * 0.001;
				arr[i * 3 + 1] += velocities[i * 2 + 1] + dy * 0.001;
				if (Math.abs(arr[i * 3]) > 7) velocities[i * 2] *= -1;
				if (Math.abs(arr[i * 3 + 1]) > 5) velocities[i * 2 + 1] *= -1;
			}
			pos.needsUpdate = true;

			renderer.render(scene, camera);
		};
		tick();

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io?.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			container.removeEventListener('pointermove', onPointer);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		};
	});
</script>

<div bind:this={container} class="hero-bg-layer" aria-hidden="true">
	<canvas bind:this={canvas} class="hero-bg-canvas"></canvas>
</div>
