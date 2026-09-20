<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { SKILLS_CATEGORIZED } from '$lib/data/site';
	import * as THREE from 'three';

	let {
		mouse = { x: 0, y: 0 },
		activeIndex = $bindable(-1),
		reduced = false
	}: {
		mouse?: { x: number; y: number };
		activeIndex?: number;
		reduced?: boolean;
	} = $props();

	let nodesGroup = $state.raw<THREE.Group | undefined>(undefined);
	let camera = $state.raw<THREE.PerspectiveCamera | undefined>(undefined);

	const golden = new THREE.Color('#c4a574');
	const charcoal = new THREE.Color('#1a1a1a');
	const skills = SKILLS_CATEGORIZED.flatMap((category) =>
		category.items.map((name) => ({ name, color: category.color }))
	);

	const nodes = skills.map((_, i) => {
		const t = (i / skills.length) * Math.PI * 2;
		const layer = 1.8 + (i % 4) * 0.35;
		const y = Math.sin(i * 0.85) * 1.1;
		return new THREE.Vector3(Math.cos(t) * layer, y, Math.sin(t) * layer);
	});

	const linePositions = new Float32Array(nodes.length * 12);
	let li = 0;
	for (const pos of nodes) {
		linePositions[li++] = 0;
		linePositions[li++] = 0;
		linePositions[li++] = 0;
		linePositions[li++] = pos.x;
		linePositions[li++] = pos.y;
		linePositions[li++] = pos.z;
	}
	for (let i = 0; i < nodes.length; i++) {
		const a = nodes[i];
		const b = nodes[(i + 1) % nodes.length];
		linePositions[li++] = a.x;
		linePositions[li++] = a.y;
		linePositions[li++] = a.z;
		linePositions[li++] = b.x;
		linePositions[li++] = b.y;
		linePositions[li++] = b.z;
	}

	const lineGeo = new THREE.BufferGeometry();
	lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

	function updateMaterials() {
		if (!nodesGroup) return;
		nodesGroup.children.forEach((child, i) => {
			if (!(child instanceof THREE.Mesh)) return;
			const mat = child.material as THREE.MeshStandardMaterial;
			if (i === activeIndex) {
				mat.color.copy(golden);
				mat.emissive.copy(golden);
				mat.emissiveIntensity = 0.4;
			} else {
				mat.color.copy(charcoal);
				mat.emissive.copy(charcoal);
				mat.emissiveIntensity = 0.06;
			}
		});
	}

	$effect(() => {
		activeIndex;
		nodesGroup;
		updateMaterials();
	});

	useTask((delta) => {
		if (!nodesGroup || reduced) return;
		nodesGroup.rotation.y += delta * 0.12;

		if (camera) {
			camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.45, delta * 3);
			camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.25 + 0.2, delta * 3);
			camera.lookAt(0, 0, 0);

			const raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(new THREE.Vector2(mouse.x, -mouse.y), camera);
			const meshes = nodesGroup.children.filter((c) => c instanceof THREE.Mesh) as THREE.Mesh[];
			const hits = raycaster.intersectObjects(meshes);
			const idx = hits[0] ? meshes.indexOf(hits[0].object as THREE.Mesh) : -1;
			if (idx !== activeIndex) activeIndex = idx;
		}
	});
</script>

<T.PerspectiveCamera bind:ref={camera} makeDefault position={[0, 0.2, 6.5]} fov={48} />
<T.AmbientLight intensity={0.55} color="#ffffff" />
<T.DirectionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
<T.PointLight position={[-3, 2, 4]} intensity={0.8} color="#c4a574" />

<T.Mesh>
	<T.SphereGeometry args={[0.2, 24, 24]} />
	<T.MeshStandardMaterial
		color="#c9a84c"
		metalness={0.6}
		roughness={0.25}
		emissive="#c9a84c"
		emissiveIntensity={0.15}
	/>
</T.Mesh>

<T.LineSegments geometry={lineGeo}>
	<T.LineBasicMaterial color="rgba(201,168,76,0.35)" transparent opacity={0.45} />
</T.LineSegments>

<T.Group bind:ref={nodesGroup}>
	{#each nodes as pos}
		<T.Mesh position={pos.toArray()}>
			<T.SphereGeometry args={[0.14, 20, 20]} />
			<T.MeshStandardMaterial color="#1a1a1a" metalness={0.45} roughness={0.35} />
		</T.Mesh>
	{/each}
</T.Group>

{#each nodes as pos, i}
	<HTML position={pos.toArray()} sprite distanceFactor={7} pointerEvents="none">
		<span class="skill-universe-label" style={`--skill-label-color: ${skills[i].color};`}>
			{skills[i].name}
		</span>
	</HTML>
{/each}

<style>
	:global(.skill-universe-label) {
		display: block;
		padding: 0.18rem 0.38rem;
		border: 1px solid color-mix(in srgb, var(--skill-label-color) 45%, transparent);
		border-radius: 999px;
		background: rgba(8, 6, 4, 0.78);
		box-shadow: 0 0 0.8rem color-mix(in srgb, var(--skill-label-color) 22%, transparent);
		color: var(--skill-label-color);
		font-family: inherit;
		font-size: clamp(0.48rem, 0.8vw, 0.65rem);
		font-weight: 600;
		letter-spacing: 0.02em;
		line-height: 1.1;
		white-space: nowrap;
		text-shadow: 0 1px 5px rgba(0, 0, 0, 0.9);
	}

	@media (max-width: 640px) {
		:global(.skill-universe-label) {
			padding: 0.14rem 0.28rem;
			font-size: 0.48rem;
		}
	}
</style>
