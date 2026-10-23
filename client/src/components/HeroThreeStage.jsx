import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  DOMAIN_ORBIT_COLORS,
  getOrbitTargetState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

const MAX_PARTICLES = 120;

export default function HeroThreeStage({ activeDomainIndex = null }) {
  const containerRef = useRef(null);
  const activeDomainRef = useRef(activeDomainIndex);

  useEffect(() => {
    activeDomainRef.current = activeDomainIndex;
  }, [activeDomainIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    let config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(config.safeWidth, config.safeHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, config.aspect, 0.1, 100);
    camera.position.set(0, 0.15, config.cameraZ);

    const ambientLight = new THREE.AmbientLight(0xECFDF5, 0.75);
    const keyLight = new THREE.DirectionalLight(0xFFFBEB, 2.4);
    keyLight.position.set(3.5, 4.5, 4.0);
    const rimLight = new THREE.PointLight(0x00F5A0, 3.2, 12);
    rimLight.position.set(-3.2, -2.0, 2.5);
    const cyanLight = new THREE.PointLight(0x00D9F5, 2.4, 12);
    cyanLight.position.set(2.8, -2.5, -2.0);
    const coreGlowLight = new THREE.PointLight(0xFB923C, 2.8, 8);
    coreGlowLight.position.set(0, 0, 0.5);
    scene.add(ambientLight, keyLight, rimLight, cyanLight, coreGlowLight);

    const disposableGeometries = [];
    const disposableMaterials = [];

    const group = new THREE.Group();
    group.position.set(config.groupOffsetX, 0.08, 0);
    scene.add(group);

    // 1. Faceted golden crystal core
    const coreGeo = new THREE.OctahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xFB923C,
      emissive: 0xEA580C,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.18,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);
    disposableGeometries.push(coreGeo);
    disposableMaterials.push(coreMat);

    // 2. Inner glow core
    const innerCoreGeo = new THREE.OctahedronGeometry(0.52, 0);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xFFF7ED,
      transparent: true,
      opacity: 0.45,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    group.add(innerCoreMesh);
    disposableGeometries.push(innerCoreGeo);
    disposableMaterials.push(innerCoreMat);

    // 3. Geodesic wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(1.18, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xFDBA74,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    group.add(cageMesh);
    disposableGeometries.push(cageGeo);
    disposableMaterials.push(cageMat);

    // 4. 5 tilted orbital rings + satellites
    const satGeo = new THREE.SphereGeometry(0.095, 16, 16);
    disposableGeometries.push(satGeo);

    const orbits = DOMAIN_ORBIT_COLORS.map((color, i) => {
      const radius = 1.45 + i * 0.24;
      const pivot = new THREE.Group();
      pivot.rotation.set(0.52 + i * 0.34, i * 0.48, 0.22 + i * 0.19);
      group.add(pivot);

      const ringGeo = new THREE.TorusGeometry(radius, 0.015, 12, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.38,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pivot.add(ringMesh);
      disposableGeometries.push(ringGeo);
      disposableMaterials.push(ringMat);

      const satMat = new THREE.MeshBasicMaterial({ color });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      const initialAngle = (i * Math.PI * 2) / DOMAIN_ORBIT_COLORS.length;
      satMesh.position.set(
        Math.cos(initialAngle) * radius,
        Math.sin(initialAngle) * radius,
        0
      );
      pivot.add(satMesh);
      disposableMaterials.push(satMat);

      return {
        pivot,
        ringMat,
        satMesh,
        radius,
        angle: initialAngle,
        baseSpeed: 0.52 - i * 0.055,
      };
    });

    // 5. Ambient particle field
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const scratchColor = new THREE.Color();

    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      const i3 = i * 3;
      const r = 2.2 + Math.random() * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75;
      positions[i3 + 2] = (r * Math.cos(phi)) * 0.65 - 0.8;

      scratchColor.setHex(DOMAIN_ORBIT_COLORS[i % DOMAIN_ORBIT_COLORS.length]);
      colors[i3] = scratchColor.r;
      colors[i3 + 1] = scratchColor.g;
      colors[i3 + 2] = scratchColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setDrawRange(0, config.particleCount);

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    disposableGeometries.push(particleGeo);
    disposableMaterials.push(particleMat);

    // Pre-allocated scratch vectors (zero per-frame allocations inside loop)
    const targetScaleVec = new THREE.Vector3(1, 1, 1);
    const targetGroupPosVec = new THREE.Vector3(config.groupOffsetX, 0.08, 0);
    const pointer = { x: 0, y: 0 };

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReducedMotion = Boolean(motionQuery?.matches);

    const handleMotionChange = (event) => {
      prefersReducedMotion = Boolean(event.matches);
    };
    motionQuery?.addEventListener?.('change', handleMotionChange);

    const handlePointerMove = (event) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      pointer.x = (event.clientX / width) * 2 - 1;
      pointer.y = -(event.clientY / height) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp) => {
      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
      const elapsed = timer.getElapsed();
      const { speedFactor, parallaxFactor } = getMotionFactor(prefersReducedMotion);

      coreMesh.rotation.y += delta * 0.38 * speedFactor;
      coreMesh.rotation.x += delta * 0.16 * speedFactor;

      innerCoreMesh.rotation.y -= delta * 0.52 * speedFactor;
      innerCoreMesh.scale.setScalar(1 + Math.sin(elapsed * 2.2 * speedFactor) * 0.06);

      cageMesh.rotation.y -= delta * 0.22 * speedFactor;
      cageMesh.rotation.z += delta * 0.12 * speedFactor;

      const bobOffset = Math.sin(elapsed * 1.35 * speedFactor) * 0.06;
      targetGroupPosVec.set(config.groupOffsetX, 0.08 + bobOffset, 0);
      group.position.lerp(targetGroupPosVec, 0.08);

      const targetRotY = pointer.x * 0.26 * parallaxFactor;
      const targetRotX = -pointer.y * 0.18 * parallaxFactor;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.06);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.06);

      const currentActiveDomain = activeDomainRef.current;
      for (let i = 0; i < orbits.length; i += 1) {
        const orbit = orbits[i];
        const target = getOrbitTargetState(i, currentActiveDomain);

        orbit.ringMat.opacity = THREE.MathUtils.lerp(orbit.ringMat.opacity, target.opacity, 0.1);
        targetScaleVec.set(target.scale, target.scale, target.scale);
        orbit.satMesh.scale.lerp(targetScaleVec, 0.12);

        orbit.angle += delta * orbit.baseSpeed * target.speedMultiplier * speedFactor;
        orbit.satMesh.position.set(
          Math.cos(orbit.angle) * orbit.radius,
          Math.sin(orbit.angle) * orbit.radius,
          0
        );
        orbit.pivot.rotation.z += delta * 0.06 * target.speedMultiplier * speedFactor;
      }

      particles.rotation.y += delta * 0.04 * speedFactor;

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    const handleResize = () => {
      config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);
      camera.aspect = config.aspect;
      camera.position.z = config.cameraZ;
      camera.updateProjectionMatrix();
      particleGeo.setDrawRange(0, config.particleCount);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(config.safeWidth, config.safeHeight);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              if (!entry) return;
              if (entry.isIntersecting) {
                renderer.setAnimationLoop(animate);
              } else {
                renderer.setAnimationLoop(null);
              }
            },
            { threshold: 0.05 }
          )
        : null;
    intersectionObserver?.observe(container);

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
      renderer.setAnimationLoop(null);
      timer.dispose();

      for (let i = 0; i < disposableGeometries.length; i += 1) {
        disposableGeometries[i].dispose();
      }
      for (let i = 0; i < disposableMaterials.length; i += 1) {
        disposableMaterials[i].dispose();
      }

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-three-canvas-wrap" aria-hidden="true" />;
}
