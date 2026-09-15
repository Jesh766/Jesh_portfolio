<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';

	let {
		mouse = { x: 0, y: 0 },
		reduced = false,
		active = true
	}: {
		mouse?: { x: number; y: number };
		reduced?: boolean;
		active?: boolean;
	} = $props();

	let coreGroup = $state.raw<THREE.Group | undefined>(undefined);
	let ringsGroup = $state.raw<THREE.Group | undefined>(undefined);
	let orbitGroup = $state.raw<THREE.Group | undefined>(undefined);
	let camera = $state.raw<THREE.PerspectiveCamera | undefined>(undefined);

	const gold = new THREE.Color('#c9a84c');
	const particleCount = 72;
	const orbitRadius = 1.55;

	const particlePositions = new Float32Array(particleCount * 3);
	for (let i = 0; i < particleCount; i++) {
		const t = (i / particleCount) * Math.PI * 2;
		const layer = 0.85 + (i % 5) * 0.12;
		const y = Math.sin(i * 1.7) * 0.35;
		particlePositions[i * 3] = Math.cos(t) * orbitRadius * layer;
		particlePositions[i * 3 + 1] = y;
		particlePositions[i * 3 + 2] = Math.sin(t) * orbitRadius * layer;
	}

	const particleGeo = new THREE.BufferGeometry();
	particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

	let floatPhase = 0;

	useTask((delta) => {
		if (!active || reduced) return;

		floatPhase += delta;
		const floatY = Math.sin(floatPhase * 0.9) * 0.08;

		if (coreGroup) {
			coreGroup.position.y = floatY;
			coreGroup.rotation.y += delta * 0.35;
		}
		if (ringsGroup) {
			ringsGroup.rotation.x += delta * 0.18;
			ringsGroup.rotation.z += delta * 0.12;
		}
		if (orbitGroup) {
			orbitGroup.rotation.y -= delta * 0.28;
			orbitGroup.rotation.x = Math.sin(floatPhase * 0.5) * 0.12;
		}

		if (camera) {
			camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.55, delta * 2.5);
			camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.35 + 0.15, delta * 2.5);
			camera.lookAt(0, floatY, 0);
		}
	});
</script>

<T.PerspectiveCamera bind:ref={camera} makeDefault position={[0, 0.15, 4.2]} fov={42} />
<T.AmbientLight intensity={0.45} color="#f5f0e6" />
<T.DirectionalLight position={[4, 6, 5]} intensity={0.9} color="#ffffff" />
<T.PointLight position={[-2, 1, 3]} intensity={1.1} color="#c9a84c" />
<T.PointLight position={[2, -1, 2]} intensity={0.35} color="#e8d5a3" />

<T.Group bind:ref={coreGroup}>
	<T.Mesh>
		<T.SphereGeometry args={[0.52, 48, 48]} />
		<T.MeshStandardMaterial
			color="#c9a84c"
			metalness={0.72}
			roughness={0.18}
			emissive="#c9a84c"
			emissiveIntensity={0.35}
		/>
	</T.Mesh>
	<T.Mesh scale={1.12}>
		<T.SphereGeometry args={[0.52, 32, 32]} />
		<T.MeshBasicMaterial color="#c9a84c" transparent opacity={0.08} />
	</T.Mesh>
</T.Group>

<T.Group bind:ref={ringsGroup}>
	<T.Mesh rotation.x={Math.PI / 2}>
		<T.TorusGeometry args={[0.95, 0.018, 16, 96]} />
		<T.MeshBasicMaterial color="#c9a84c" transparent opacity={0.55} />
	</T.Mesh>
	<T.Mesh rotation.x={Math.PI / 3} rotation.y={Math.PI / 5}>
		<T.TorusGeometry args={[1.15, 0.012, 12, 80]} />
		<T.MeshBasicMaterial color="#e8d5a3" transparent opacity={0.35} />
	</T.Mesh>
	<T.Mesh rotation.x={-Math.PI / 4} rotation.z={Math.PI / 6}>
		<T.TorusGeometry args={[1.32, 0.01, 12, 64]} />
		<T.MeshBasicMaterial color="#c9a84c" transparent opacity={0.22} />
	</T.Mesh>
</T.Group>

<T.Group bind:ref={orbitGroup}>
	<T.Points geometry={particleGeo}>
		<T.PointsMaterial
			size={0.045}
			color={gold}
			transparent
			opacity={0.85}
			sizeAttenuation
			depthWrite={false}
			blending={THREE.AdditiveBlending}
		/>
	</T.Points>
</T.Group>
