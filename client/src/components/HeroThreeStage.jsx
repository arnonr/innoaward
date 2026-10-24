import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  DOMAIN_ORBIT_COLORS,
  DOMAIN_PHOTO_URLS,
  LIVING_PHOTO_VERTEX_SHADER,
  LIVING_PHOTO_FRAGMENT_SHADER,
  resolveDomainPhotoUrl,
  resolveTargetDomainIndex,
  advanceTransitionState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

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
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    let config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(config.safeWidth, config.safeHeight);
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.position.z = 1;

    const baseUrl = import.meta.env?.BASE_URL || '/';
    const textureLoader = new THREE.TextureLoader();
    const textures = DOMAIN_PHOTO_URLS.map((url) => {
      const tex = textureLoader.load(resolveDomainPhotoUrl(url, baseUrl));
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    });

    const domainColors = DOMAIN_ORBIT_COLORS.map((hex) => new THREE.Color(hex));
    const targetAccent = domainColors[0].clone();

    const uniforms = {
      uTexCurrent: { value: textures[0] },
      uTexNext: { value: textures[0] },
      uDomainCurrent: { value: 0 },
      uDomainNext: { value: 0 },
      uMix: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uUvScale: { value: new THREE.Vector2(config.uvScaleX, config.uvScaleY) },
      uParallaxStrength: { value: config.parallaxStrength },
      uAccent: { value: domainColors[0].clone() },
    };

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: LIVING_PHOTO_VERTEX_SHADER,
      fragmentShader: LIVING_PHOTO_FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
    });
    const quadMesh = new THREE.Mesh(quadGeo, quadMat);
    scene.add(quadMesh);

    const transitionState = {
      currentIndex: 0,
      nextIndex: 0,
      mixProgress: 0,
      transitioning: false,
    };

    const pointer = { x: 0, y: 0 };
    const smoothedPointer = { x: 0, y: 0 };

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
      const { speedFactor, parallaxFactor, breathFactor } = getMotionFactor(prefersReducedMotion);

      const { domainIndex } = resolveTargetDomainIndex(elapsed, activeDomainRef.current);
      advanceTransitionState(transitionState, domainIndex, delta);

      uniforms.uTexCurrent.value = textures[transitionState.currentIndex];
      uniforms.uTexNext.value = textures[transitionState.nextIndex];
      uniforms.uDomainCurrent.value = transitionState.currentIndex;
      uniforms.uDomainNext.value = transitionState.nextIndex;
      uniforms.uMix.value = transitionState.mixProgress;
      uniforms.uTime.value = elapsed * speedFactor;

      const activeAccentIdx = transitionState.transitioning
        ? transitionState.nextIndex
        : transitionState.currentIndex;
      targetAccent.copy(domainColors[activeAccentIdx] || domainColors[0]);
      uniforms.uAccent.value.lerp(targetAccent, 0.08);

      const breathX = Math.sin(elapsed * 0.55) * 0.18 * breathFactor;
      const breathY = Math.cos(elapsed * 0.45) * 0.18 * breathFactor;
      const targetMouseX = pointer.x * parallaxFactor + breathX;
      const targetMouseY = pointer.y * parallaxFactor + breathY;

      smoothedPointer.x += (targetMouseX - smoothedPointer.x) * 0.07;
      smoothedPointer.y += (targetMouseY - smoothedPointer.y) * 0.07;
      uniforms.uMouse.value.set(smoothedPointer.x, smoothedPointer.y);

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);
        renderer.setSize(config.safeWidth, config.safeHeight);
        uniforms.uUvScale.value.set(config.uvScaleX, config.uvScaleY);
        uniforms.uParallaxStrength.value = config.parallaxStrength;
      });
      resizeObserver.observe(container);
    }

    let intersectionObserver;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    }

    return () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      motionQuery?.removeEventListener?.('change', handleMotionChange);

      quadGeo.dispose();
      quadMat.dispose();
      for (let i = 0; i < textures.length; i += 1) {
        textures[i].dispose();
      }
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-three-canvas-wrap" aria-hidden="true" />;
}
