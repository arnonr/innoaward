import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  DOMAIN_PHOTO_URLS,
  LIVING_PHOTO_VERTEX_SHADER,
  DOMAIN_CARD_FRAGMENT_SHADER,
  resolveDomainIndexById,
  resolveDomainPhotoUrl,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

THREE.Cache.enabled = true;

export default function DomainLivingCardBg({ domainId, bgImage }) {
  const containerRef = useRef(null);
  const domainIndex = resolveDomainIndexById(domainId);
  const baseUrl = import.meta.env?.BASE_URL || '/';
  const photoUrl = resolveDomainPhotoUrl(bgImage || DOMAIN_PHOTO_URLS[domainIndex], baseUrl);

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

    const textureLoader = new THREE.TextureLoader();
    const maxAnisotropy = renderer.capabilities?.getMaxAnisotropy?.() || 1;
    const texture = textureLoader.load(photoUrl);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = maxAnisotropy;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const uniforms = {
      uTex: { value: texture },
      uDomainId: { value: domainIndex },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: domainIndex * 1.7 },
      uUvScale: { value: new THREE.Vector2(config.uvScaleX, config.uvScaleY) },
      uParallaxStrength: { value: 0.014 },
      uHover: { value: 0 },
    };

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: LIVING_PHOTO_VERTEX_SHADER,
      fragmentShader: DOMAIN_CARD_FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
    });
    const quadMesh = new THREE.Mesh(quadGeo, quadMat);
    quadMesh.matrixAutoUpdate = false;
    quadMesh.updateMatrix();
    scene.add(quadMesh);

    const pointer = { x: 0, y: 0 };
    const smoothedPointer = { x: 0, y: 0 };
    let isHovered = false;
    let smoothedHover = 0;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReducedMotion = Boolean(motionQuery?.matches);

    const handleMotionChange = (event) => {
      prefersReducedMotion = Boolean(event.matches);
    };
    motionQuery?.addEventListener?.('change', handleMotionChange);

    const hostEl = container.parentElement || container;

    const handlePointerEnter = () => {
      isHovered = true;
    };

    const handlePointerLeave = () => {
      isHovered = false;
      pointer.x = 0;
      pointer.y = 0;
    };

    const handlePointerMove = (event) => {
      const rect = hostEl.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / height) * 2 - 1);
      isHovered = true;
    };

    hostEl.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    hostEl.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    hostEl.addEventListener('pointermove', handlePointerMove, { passive: true });

    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const { speedFactor, parallaxFactor, breathFactor } = getMotionFactor(prefersReducedMotion);

      const targetHover = isHovered ? 1 : 0;
      smoothedHover += (targetHover - smoothedHover) * 0.08;
      uniforms.uHover.value = smoothedHover;

      const hoverSpeedBoost = 1 + smoothedHover * 0.35;
      uniforms.uTime.value = elapsed * speedFactor * hoverSpeedBoost + domainIndex * 1.7;

      const breathX = Math.sin(elapsed * 0.65 + domainIndex * 1.1) * 0.22 * breathFactor;
      const breathY = Math.cos(elapsed * 0.52 + domainIndex * 0.9) * 0.22 * breathFactor;
      const targetMouseX = pointer.x * parallaxFactor + breathX;
      const targetMouseY = pointer.y * parallaxFactor + breathY;

      smoothedPointer.x += (targetMouseX - smoothedPointer.x) * 0.08;
      smoothedPointer.y += (targetMouseY - smoothedPointer.y) * 0.08;
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
      hostEl.removeEventListener('pointerenter', handlePointerEnter);
      hostEl.removeEventListener('pointerleave', handlePointerLeave);
      hostEl.removeEventListener('pointermove', handlePointerMove);
      motionQuery?.removeEventListener?.('change', handleMotionChange);

      quadGeo.dispose();
      quadMat.dispose();
      texture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [domainIndex, photoUrl]);

  return (
    <div ref={containerRef} className="domain-card-living-bg" aria-hidden="true">
      <img
        className="domain-card-bg-fallback"
        src={photoUrl}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
