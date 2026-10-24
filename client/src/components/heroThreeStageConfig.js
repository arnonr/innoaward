export const DOMAIN_ORBIT_COLORS = Object.freeze([
  0x00F5A0, // Energy, Environment & BCG Economy
  0x22C55E, // Food & Agriculture
  0x00D9F5, // Social & Economy
  0xFB7185, // Medical Device
  0xF59E0B, // Material
]);

export const DOMAIN_PHOTO_URLS = Object.freeze([
  '/domain-energy.jpg',
  '/domain-food.jpg',
  '/domain-social.jpg',
  '/domain-medical.jpg',
  '/domain-material.jpg',
]);

export const DOMAIN_CYCLE_SECONDS = 14;

export const DEFAULT_IMAGE_ASPECT = 16 / 9;

export const LIVING_PHOTO_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const LIVING_PHOTO_FRAGMENT_SHADER = `
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

  float sq(float v) {
    return v * v;
  }

  vec3 applyLivingPhotoEffect(vec3 col, vec2 uv, float domainId, float time) {
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 boost = vec3(0.0);

    if (abs(domainId - 0.0) < 0.4) {
      // 01 ENERGY & ENV: Subtle emerald/cyan pulses along the solar & ocean grid lines
      float greenCyanMask = smoothstep(0.16, 0.48, max(col.g, col.b) - col.r * 0.85) * smoothstep(0.30, 0.78, lum);
      float gridPulse1 = pow(max(0.0, 0.5 + 0.5 * sin((uv.x * 16.0 + uv.y * 8.0) - time * 2.8)), 14.0);
      float gridPulse2 = pow(max(0.0, 0.5 + 0.5 * sin((uv.x * 12.0 - uv.y * 10.0) - time * 2.2)), 16.0);
      boost = vec3(0.0, 0.95, 0.68) * greenCyanMask * (gridPulse1 + gridPulse2) * 0.52;

    } else if (abs(domainId - 1.0) < 0.4) {
      // 02 FOOD & AGRI: Gentle bioluminescent scan over vertical plant racks
      float plantZone = smoothstep(0.38, 0.52, uv.x);
      float scanY = fract(time * 0.14);
      float scanBeam = exp(-sq((uv.y - scanY) * 32.0)) * plantZone;
      float greenLeafMask = smoothstep(0.10, 0.38, col.g - max(col.r, col.b) * 0.65);
      float hudZone = (1.0 - smoothstep(0.12, 0.38, uv.x)) * smoothstep(0.30, 0.68, col.g);
      float hudPulse = pow(max(0.0, 0.5 + 0.5 * sin(uv.x * 30.0 - time * 3.2)), 10.0);
      boost = vec3(0.15, 0.95, 0.45) * scanBeam * (0.22 + greenLeafMask * 0.42)
            + vec3(0.0, 0.95, 0.62) * hudZone * hudPulse * 0.38;

    } else if (abs(domainId - 2.0) < 0.4) {
      // 03 SOCIAL & DIGITAL: Clean light packets racing along the cyan sky-network lines
      float cyanLineMask = smoothstep(0.18, 0.52, col.b - col.r * 0.60) * smoothstep(0.36, 0.85, lum);
      float highwayMask = smoothstep(0.20, 0.55, max(col.b, col.r) - col.g * 0.35) * smoothstep(0.42, 0.88, lum);
      float networkMask = max(cyanLineMask, highwayMask * 0.65);

      float packetA = pow(max(0.0, 0.5 + 0.5 * sin((uv.x * 18.0 + uv.y * 9.0) - time * 3.6)), 16.0);
      float packetB = pow(max(0.0, 0.5 + 0.5 * sin((uv.x * -15.0 + uv.y * 11.0) - time * 3.0)), 16.0);

      float totalPackets = packetA + packetB;
      boost = mix(vec3(0.0, 0.88, 1.0), vec3(1.0, 0.92, 0.65), 0.3) * networkMask * totalPackets * 0.58;

    } else if (abs(domainId - 3.0) < 0.4) {
      // 04 MEDICAL DEVICE: Clean ECG sweep across the holographic HUD + subtle ring pulse
      float hudScreenMask = smoothstep(0.06, 0.12, uv.x) * (1.0 - smoothstep(0.46, 0.52, uv.x)) * smoothstep(0.22, 0.88, uv.y);
      float ecgSweepX = mix(0.08, 0.48, fract(time * 0.28));
      float ecgWave = exp(-sq((uv.x - ecgSweepX) * 36.0)) * hudScreenMask * smoothstep(0.30, 0.75, lum);

      float ringMask = smoothstep(0.22, 0.52, col.b - col.r * 0.55) * smoothstep(0.48, 0.92, lum);
      float ringPulse = 0.5 + 0.5 * sin(time * 3.0 - uv.y * 8.0);
      boost = vec3(0.2, 0.95, 1.0) * ecgWave * 0.65
            + vec3(1.0, 0.38, 0.58) * ringMask * ringPulse * 0.32;

    } else {
      // 05 MATERIAL: Subtle golden-cyan current along the hexagonal graphene lattice
      float latticeMask = smoothstep(0.38, 0.85, lum) * smoothstep(0.12, 0.46, max(col.b, col.r) - col.g * 0.25);
      float hexStream1 = pow(max(0.0, 0.5 + 0.5 * sin((uv.x * 20.0 + uv.y * 14.0) - time * 3.2)), 14.0);
      float hexStream2 = pow(max(0.0, 0.5 + 0.5 * sin((uv.x * -16.0 + uv.y * 18.0) - time * 2.6)), 14.0);
      boost = mix(vec3(1.0, 0.68, 0.15), vec3(0.0, 0.92, 1.0), 0.45) * latticeMask * (hexStream1 + hexStream2) * 0.48;
    }

    return clamp(col + boost, 0.0, 1.0);
  }

  void main() {
    // Smooth spatial depth (no per-pixel luminance UV offset, keeping photos 100% sharp)
    float spatialDepth = 0.55 + 0.45 * (1.0 - vUv.y);
    vec2 parallaxOffset = uMouse * uParallaxStrength * spatialDepth;

    // Gentle zoom-breath during transition instead of liquid wave distortion
    float scaleCurr = 0.94 - uMix * 0.015;
    float scaleNext = 0.955 - uMix * 0.015;

    vec2 uvCurr = clamp((vUv - 0.5) * uUvScale * scaleCurr + 0.5 + parallaxOffset, 0.002, 0.998);
    vec2 uvNext = clamp((vUv - 0.5) * uUvScale * scaleNext + 0.5 + parallaxOffset, 0.002, 0.998);

    vec3 colCurr = texture2D(uTexCurrent, uvCurr).rgb;
    vec3 colNext = texture2D(uTexNext, uvNext).rgb;

    colCurr = applyLivingPhotoEffect(colCurr, uvCurr, uDomainCurrent, uTime);
    colNext = applyLivingPhotoEffect(colNext, uvNext, uDomainNext, uTime);

    float mask = smoothstep(0.0, 1.0, uMix);
    vec3 col = mix(colCurr, colNext, mask);

    // Left-side editorial scrim & top/bottom vignette so hero typography & HUD are always crisp and readable
    float leftScrim = 1.0 - smoothstep(0.15, 0.65, vUv.x);
    float topBottomVignette = (1.0 - smoothstep(0.0, 0.22, vUv.y)) * 0.45
                            + smoothstep(0.80, 1.0, vUv.y) * 0.28;
    vec3 darkBase = vec3(0.016, 0.051, 0.039);
    float scrimAlpha = clamp(leftScrim * 0.52 + topBottomVignette, 0.0, 0.72);
    col = mix(col, darkBase, scrimAlpha);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const REDUCED_MOTION_FACTOR = Object.freeze({
  speedFactor: 0.25,
  parallaxFactor: 0,
  breathFactor: 0,
});

const FULL_MOTION_FACTOR = Object.freeze({
  speedFactor: 1,
  parallaxFactor: 1,
  breathFactor: 1,
});

export function resolveDomainPhotoUrl(photoPath, baseUrl = '/') {
  const cleanPath = String(photoPath || '').replace(/^\/+/, '');
  const normalizedBase = String(baseUrl || '/').endsWith('/')
    ? String(baseUrl || '/')
    : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}

export function getCoverUvScale(
  containerWidth,
  containerHeight,
  imageAspect = DEFAULT_IMAGE_ASPECT
) {
  const safeWidth = Math.max(1, Number.isFinite(containerWidth) ? containerWidth : 1);
  const safeHeight = Math.max(1, Number.isFinite(containerHeight) ? containerHeight : 1);
  const safeImageAspect =
    Number.isFinite(imageAspect) && imageAspect > 0 ? imageAspect : DEFAULT_IMAGE_ASPECT;
  const containerAspect = safeWidth / safeHeight;

  if (containerAspect > safeImageAspect) {
    return {
      scaleX: 1,
      scaleY: safeImageAspect / containerAspect,
    };
  }

  return {
    scaleX: containerAspect / safeImageAspect,
    scaleY: 1,
  };
}

export function resolveTargetDomainIndex(elapsedSeconds, activeDomainIndex) {
  const count = DOMAIN_PHOTO_URLS.length;

  if (
    typeof activeDomainIndex === 'number' &&
    Number.isInteger(activeDomainIndex) &&
    activeDomainIndex >= 0 &&
    activeDomainIndex < count
  ) {
    return {
      mode: 'hover',
      domainIndex: activeDomainIndex,
    };
  }

  const safeElapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const totalCycle = count * DOMAIN_CYCLE_SECONDS;
  const wrapped = ((safeElapsed % totalCycle) + totalCycle) % totalCycle;
  const domainIndex = Math.min(count - 1, Math.floor(wrapped / DOMAIN_CYCLE_SECONDS));

  return {
    mode: 'auto',
    domainIndex,
  };
}

export function advanceTransitionState(
  state,
  targetDomainIndex,
  deltaSeconds,
  transitionSpeed = 1.1
) {
  const count = DOMAIN_PHOTO_URLS.length;
  const safeTarget =
    typeof targetDomainIndex === 'number' &&
    Number.isInteger(targetDomainIndex) &&
    targetDomainIndex >= 0 &&
    targetDomainIndex < count
      ? targetDomainIndex
      : 0;
  const safeDelta = Number.isFinite(deltaSeconds) && deltaSeconds > 0 ? deltaSeconds : 0;
  const safeSpeed = Number.isFinite(transitionSpeed) && transitionSpeed > 0 ? transitionSpeed : 1.1;

  if (!state.transitioning) {
    if (safeTarget !== state.currentIndex) {
      state.nextIndex = safeTarget;
      state.mixProgress = 0;
      state.transitioning = true;
    } else {
      state.nextIndex = state.currentIndex;
      state.mixProgress = 0;
      return state;
    }
  } else if (safeTarget !== state.nextIndex) {
    state.currentIndex = state.mixProgress >= 0.5 ? state.nextIndex : state.currentIndex;
    state.nextIndex = safeTarget;
    state.mixProgress = 0;
    if (state.currentIndex === safeTarget) {
      state.transitioning = false;
      return state;
    }
  }

  state.mixProgress = Math.min(1, state.mixProgress + safeDelta * safeSpeed);

  if (state.mixProgress >= 1) {
    state.currentIndex = state.nextIndex;
    state.mixProgress = 0;
    state.transitioning = false;
  }

  return state;
}

export function getStageResponsiveConfig(width, height) {
  const safeWidth = Math.max(1, Number.isFinite(width) ? width : 0);
  const safeHeight = Math.max(1, Number.isFinite(height) ? height : 0);
  const aspect = safeWidth / safeHeight;
  const { scaleX: uvScaleX, scaleY: uvScaleY } = getCoverUvScale(safeWidth, safeHeight);

  if (safeWidth <= 768) {
    return {
      safeWidth,
      safeHeight,
      aspect,
      uvScaleX,
      uvScaleY,
      parallaxStrength: 0.006,
    };
  }

  if (safeWidth <= 1024) {
    return {
      safeWidth,
      safeHeight,
      aspect,
      uvScaleX,
      uvScaleY,
      parallaxStrength: 0.009,
    };
  }

  return {
    safeWidth,
    safeHeight,
    aspect,
    uvScaleX,
    uvScaleY,
    parallaxStrength: 0.012,
  };
}

export function getMotionFactor(prefersReducedMotion) {
  return prefersReducedMotion ? REDUCED_MOTION_FACTOR : FULL_MOTION_FACTOR;
}
