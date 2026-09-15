<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';

	let {
		reducedMotion = false,
		mouse = { x: 0, y: 0 }
	}: {
		reducedMotion?: boolean;
		mouse?: { x: number; y: number };
	} = $props();

	const count = 1200;
	const positions = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);

	for (let i = 0; i < count; i++) {
		positions[i * 3] = (Math.random() - 0.5) * 10;
		positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
		positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
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

	let points = $state.raw<THREE.Points | undefined>(undefined);

	useTask((delta) => {
		if (!points || reducedMotion) return;
		points.rotation.y += delta * 0.015;
		points.rotation.x = THREE.MathUtils.lerp(points.rotation.x, mouse.y * 0.08, delta * 2);
	});
</script>

<T.Points bind:ref={points} {geometry}>
	<T.PointsMaterial
		size={0.028}
		vertexColors
		transparent
		opacity={0.65}
		sizeAttenuation
		depthWrite={false}
	/>
</T.Points>
