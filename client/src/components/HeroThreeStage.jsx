import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  DOMAIN_ORBIT_COLORS,
  DOMAIN_PHOTO_URLS,
  resolveTargetDomainIndex,
  advanceTransitionState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexCurrent;
  uniform sampler2D uTexNext;
  uniform float uDomainCurrent;
  uniform float uDomainNext;
  uniform float uMix;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec2 uUvScale;
  uniform float uParallaxStrength;
  uniform vec3 uAccent;
  varying vec2 vUv;

  vec3 applyLivingPhotoEffect(vec3 col, vec2 uv, float domainId, float time) {
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 boost = vec3(0.0);

    if (abs(domainId - 0.0) < 0.4) {
      // 01 ENERGY & ENV: Emerald/cyan ocean grid lines & solar hexagons sending pulses toward city
      float greenCyanMask = smoothstep(0.12, 0.45, max(col.g, col.b) - col.r * 0.85) * smoothstep(0.25, 0.75, lum);
      float gridPulse1 = pow(0.5 + 0.5 * sin((uv.x * 16.0 + uv.y * 8.0) - time * 4.2), 10.0);
      float gridPulse2 = pow(0.5 + 0.5 * sin((uv.x * 12.0 - uv.y * 10.0) - time * 3.4), 12.0);
      float waterShimmer = smoothstep(0.55, 0.1, uv.y) * pow(0.5 + 0.5 * sin(uv.x * 40.0 + sin(uv.y * 25.0 + time * 2.0) * 3.0 - time * 3.0), 8.0) * 0.25;
      boost = vec3(0.0, 1.0, 0.72) * greenCyanMask * (gridPulse1 + gridPulse2) * 1.45
            + vec3(0.2, 1.0, 0.8) * waterShimmer * greenCyanMask;

    } else if (abs(domainId - 1.0) < 0.4) {
      // 02 FOOD & AGRI: Bioluminescent vertical laser scan over plant racks + glowing HUD monitors
      float plantZone = smoothstep(0.35, 0.48, uv.x);
      float scanY = fract(time * 0.22);
      float scanBeam = exp(-pow((uv.y - scanY) * 28.0, 2.0)) * plantZone;
      float greenLeafMask = smoothstep(0.08, 0.35, col.g - max(col.r, col.b) * 0.65);
      float hudZone = (1.0 - smoothstep(0.12, 0.38, uv.x)) * smoothstep(0.25, 0.65, col.g);
      float hudPulse = pow(0.5 + 0.5 * sin(uv.x * 35.0 - time * 5.0), 8.0);
      boost = vec3(0.15, 1.0, 0.45) * scanBeam * (0.45 + greenLeafMask * 0.9)
            + vec3(0.0, 1.0, 0.65) * hudZone * hudPulse * 0.9;

    } else if (abs(domainId - 2.0) < 0.4) {
      // 03 SOCIAL & DIGITAL: Sharp light packets racing along the cyan sky-network lines & highways
      float cyanLineMask = smoothstep(0.14, 0.48, col.b - col.r * 0.55) * smoothstep(0.32, 0.82, lum);
      float highwayMask = smoothstep(0.15, 0.50, max(col.b, col.r) - col.g * 0.3) * smoothstep(0.38, 0.85, lum);
      float networkMask = max(cyanLineMask, highwayMask * 0.85);

      float packetA = pow(0.5 + 0.5 * sin((uv.x * 18.0 + uv.y * 9.0) - time * 5.2), 14.0);
      float packetB = pow(0.5 + 0.5 * sin((uv.x * -15.0 + uv.y * 11.0) - time * 4.4), 14.0);
      float packetC = pow(0.5 + 0.5 * sin((uv.x * 10.0 - uv.y * 16.0) - time * 3.8), 16.0);

      float totalPackets = packetA + packetB + packetC;
      boost = mix(vec3(0.0, 0.88, 1.0), vec3(1.0, 0.92, 0.65), 0.35) * networkMask * totalPackets * 1.65;

    } else if (abs(domainId - 3.0) < 0.4) {
      // 04 MEDICAL DEVICE: Live ECG sweep across the left holographic HUD + surgical laser & robot ring pulse
      float hudScreenMask = smoothstep(0.06, 0.12, uv.x) * (1.0 - smoothstep(0.46, 0.52, uv.x)) * smoothstep(0.22, 0.88, uv.y);
      float ecgSweepX = mix(0.08, 0.48, fract(time * 0.45));
      float ecgWave = exp(-pow((uv.x - ecgSweepX) * 32.0, 2.0)) * hudScreenMask * smoothstep(0.25, 0.7, lum);

      float ringMask = smoothstep(0.18, 0.48, col.b - col.r * 0.5) * smoothstep(0.45, 0.9, lum);
      float ringPulse = 0.5 + 0.5 * sin(time * 4.5 - uv.y * 8.0);
      boost = vec3(0.2, 0.95, 1.0) * ecgWave * 1.5
            + vec3(1.0, 0.35, 0.55) * ringMask * ringPulse * 0.75;

    } else {
      // 05 MATERIAL: Golden-cyan atomic current racing through the hexagonal graphene lattice & nanotubes
      float latticeMask = smoothstep(0.32, 0.82, lum) * smoothstep(0.08, 0.42, max(col.b, col.r) - col.g * 0.2);
      float hexStream1 = pow(0.5 + 0.5 * sin((uv.x * 20.0 + uv.y * 14.0) - time * 4.6), 12.0);
      float hexStream2 = pow(0.5 + 0.5 * sin((uv.x * -16.0 + uv.y * 18.0) - time * 3.9), 12.0);
      boost = mix(vec3(1.0, 0.68, 0.15), vec3(0.0, 0.92, 1.0), 0.45) * latticeMask * (hexStream1 + hexStream2) * 1.35;
    }

    return col + boost;
  }

  void main() {
    // Aspect-preserving cover UV with 0.91 overscan margin so 2.5D parallax never exposes edges
    vec2 uv = (vUv - 0.5) * uUvScale * 0.91 + 0.5;

    vec4 baseSample = texture2D(uTexCurrent, uv);
    float depth = dot(baseSample.rgb, vec3(0.299, 0.587, 0.114));

    vec2 parallaxOffset = uMouse * uParallaxStrength * (0.35 + depth * 0.95);
    float wave = sin(uv.y * 10.0 + uTime * 2.5) * 0.016 * sin(uMix * 3.14159);

    vec2 uvCurr = clamp(uv + parallaxOffset + vec2(uMix * 0.05 + wave, 0.0), 0.002, 0.998);
    vec2 uvNext = clamp(uv + parallaxOffset - vec2((1.0 - uMix) * 0.05 - wave, 0.0), 0.002, 0.998);

    vec3 colCurr = texture2D(uTexCurrent, uvCurr).rgb;
    vec3 colNext = texture2D(uTexNext, uvNext).rgb;

    colCurr = applyLivingPhotoEffect(colCurr, uvCurr, uDomainCurrent, uTime);
    colNext = applyLivingPhotoEffect(colNext, uvNext, uDomainNext, uTime);

    float mask = smoothstep(0.0, 1.0, uMix + (vUv.x - 0.5) * 0.25 * sin(uMix * 3.14159));
    vec3 col = mix(colCurr, colNext, mask);

    float ripple = exp(-pow((vUv.x - uMix) * 7.5, 2.0)) * sin(uMix * 3.14159);
    col += uAccent * ripple * 0.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;

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

    const textureLoader = new THREE.TextureLoader();
    const textures = DOMAIN_PHOTO_URLS.map((url) => {
      const tex = textureLoader.load(url);
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
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
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
