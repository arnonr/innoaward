export const DOMAIN_IDS = Object.freeze([
  'energy_environment',
  'food_agriculture',
  'social_economy',
  'medical_device',
  'material',
]);

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
export const SHOWREEL_CYCLE_SECONDS = 32;

export const DEFAULT_IMAGE_ASPECT = 16 / 9;

export const LIVING_PHOTO_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const LIVING_PHOTO_GLSL_HELPERS = `
  float sq(float v) {
    return v * v;
  }

  vec3 sampleSharpTexture(sampler2D tex, vec2 uv) {
    vec2 stepUv = vec2(1.0 / 2752.0, 1.0 / 1536.0);
    vec3 center = texture2D(tex, uv).rgb;
    vec3 north  = texture2D(tex, clamp(uv + vec2(0.0, stepUv.y), 0.002, 0.998)).rgb;
    vec3 south  = texture2D(tex, clamp(uv - vec2(0.0, stepUv.y), 0.002, 0.998)).rgb;
    vec3 east   = texture2D(tex, clamp(uv + vec2(stepUv.x, 0.0), 0.002, 0.998)).rgb;
    vec3 west   = texture2D(tex, clamp(uv - vec2(stepUv.x, 0.0), 0.002, 0.998)).rgb;
    vec3 neighborAvg = (north + south + east + west) * 0.25;
    vec3 sharpened = center + (center - neighborAvg) * 0.38;
    return clamp(sharpened, 0.0, 1.0);
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
${LIVING_PHOTO_GLSL_HELPERS}
  void main() {
    // Smooth spatial depth (no per-pixel luminance UV offset, keeping photos 100% sharp)
    float spatialDepth = 0.55 + 0.45 * (1.0 - vUv.y);
    vec2 parallaxOffset = uMouse * uParallaxStrength * spatialDepth;

    // Gentle zoom-breath during transition instead of liquid wave distortion
    float scaleCurr = 0.972 - uMix * 0.010;
    float scaleNext = 0.982 - uMix * 0.010;

    vec2 uvCurr = clamp((vUv - 0.5) * uUvScale * scaleCurr + 0.5 + parallaxOffset, 0.002, 0.998);
    vec2 uvNext = clamp((vUv - 0.5) * uUvScale * scaleNext + 0.5 + parallaxOffset, 0.002, 0.998);

    vec3 colCurr = sampleSharpTexture(uTexCurrent, uvCurr);
    vec3 colNext = sampleSharpTexture(uTexNext, uvNext);

    colCurr = applyLivingPhotoEffect(colCurr, uvCurr, uDomainCurrent, uTime);
    colNext = applyLivingPhotoEffect(colNext, uvNext, uDomainNext, uTime);

    float mask = smoothstep(0.0, 1.0, uMix);
    vec3 col = mix(colCurr, colNext, mask);

    // Gentle tone-mapping on the left so the full photo remains crisp and visible
    // while taming blinding white hotspots behind the typography
    float leftScrim = 1.0 - smoothstep(0.06, 0.54, vUv.x);
    vec3 highlightCompressed = col / (1.0 + col * leftScrim * 0.45);
    col = mix(col, highlightCompressed * 0.92, leftScrim);

    // Subtle bottom vignette only behind the bottom category bar (matches Bright Midnight #11243E)
    float bottomVignette = (1.0 - smoothstep(0.0, 0.14, vUv.y)) * 0.28;
    col = mix(col, vec3(0.067, 0.141, 0.243), bottomVignette);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const DOMAIN_CARD_FRAGMENT_SHADER = `
  uniform sampler2D uTex;
  uniform float uDomainId;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec2 uUvScale;
  uniform float uParallaxStrength;
  uniform float uHover;
  varying vec2 vUv;
${LIVING_PHOTO_GLSL_HELPERS}
  void main() {
    float spatialDepth = 0.55 + 0.45 * (1.0 - vUv.y);
    vec2 parallaxOffset = uMouse * uParallaxStrength * spatialDepth;
    float scale = 0.968 - uHover * 0.032;

    vec2 uv = clamp((vUv - 0.5) * uUvScale * scale + 0.5 + parallaxOffset, 0.002, 0.998);
    vec3 baseCol = sampleSharpTexture(uTex, uv);
    vec3 livingCol = applyLivingPhotoEffect(baseCol, uv, uDomainId, uTime);
    vec3 col = clamp(mix(baseCol, livingCol, 1.0 + uHover * 0.28), 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function resolveDomainIndexById(domainIdOrIndex) {
  if (
    typeof domainIdOrIndex === 'number' &&
    Number.isInteger(domainIdOrIndex) &&
    domainIdOrIndex >= 0 &&
    domainIdOrIndex < DOMAIN_IDS.length
  ) {
    return domainIdOrIndex;
  }
  if (typeof domainIdOrIndex === 'string') {
    const idx = DOMAIN_IDS.indexOf(domainIdOrIndex);
    if (idx !== -1) {
      return idx;
    }
  }
  return 0;
}

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
  activeDomainIndex,
  deltaSeconds,
  transitionSpeed = 1.1
) {
  const count = DOMAIN_PHOTO_URLS.length;
  const safeDelta = Number.isFinite(deltaSeconds) && deltaSeconds > 0 ? deltaSeconds : 0;
  const safeSpeed = Number.isFinite(transitionSpeed) && transitionSpeed > 0 ? transitionSpeed : 1.1;

  const isHoveredValid =
    typeof activeDomainIndex === 'number' &&
    Number.isInteger(activeDomainIndex) &&
    activeDomainIndex >= 0 &&
    activeDomainIndex < count;

  let safeTarget;
  if (isHoveredValid) {
    safeTarget = activeDomainIndex;
    state.cycleTimer = 0;
  } else if (state.transitioning) {
    // Finish the in-progress transition to nextIndex instead of snapping back to old image
    safeTarget = state.nextIndex;
    state.cycleTimer = 0;
  } else {
    state.cycleTimer = (Number.isFinite(state.cycleTimer) ? state.cycleTimer : 0) + safeDelta;
    if (state.cycleTimer >= DOMAIN_CYCLE_SECONDS) {
      state.cycleTimer %= DOMAIN_CYCLE_SECONDS;
      safeTarget = (state.currentIndex + 1) % count;
    } else {
      safeTarget = state.currentIndex;
    }
  }

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

export const HOLO_GLASS_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const HOLO_GLASS_FRAGMENT_SHADER = `
  uniform sampler2D uPanelTex;
  uniform sampler2D uPhotoTex;
  uniform float uHasPhoto;
  uniform float uDomainId;
  uniform vec3 uAccentColor;
  uniform float uTime;
  uniform float uElectricIntensity;
  uniform float uPortalOpen;
  uniform float uOpacity;
  uniform float uHover;
  varying vec2 vUv;
${LIVING_PHOTO_GLSL_HELPERS}

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    vec2 aspectCorrected = vec2(centered.x * 1.777, centered.y);

    // Rounded glass panel SDF
    float dBox = sdRoundedBox(aspectCorrected, vec2(1.72, 0.96), 0.075);
    float panelMask = 1.0 - smoothstep(-0.008, 0.012, dBox);
    if (panelMask <= 0.001) discard;

    // Sample HUD canvas texture
    vec4 hudSample = texture2D(uPanelTex, vUv);

    // Base glass color + optional living domain photography inside the card
    vec3 glassBase = vec3(0.025, 0.068, 0.138);
    float glassAlpha = 0.96;

    if (uHasPhoto > 0.5) {
      vec2 photoUv = clamp((vUv - 0.5) * (0.96 - uHover * 0.03) + 0.5, 0.002, 0.998);
      vec3 rawPhoto = sampleSharpTexture(uPhotoTex, photoUv);
      vec3 livingPhoto = applyLivingPhotoEffect(rawPhoto, photoUv, uDomainId, uTime);
      // Darken bottom and top slightly so HUD telemetry & titles pop with crystal clarity
      float hudScrim = smoothstep(0.0, 0.36, vUv.y) * (1.0 - smoothstep(0.76, 0.98, vUv.y));
      vec3 tonedPhoto = livingPhoto * (0.52 + 0.48 * hudScrim);
      glassBase = mix(glassBase, tonedPhoto, 0.88);
      glassAlpha = 0.92;
    }

    // Diagonal holographic glass sheen
    float sheenCoord = vUv.x * 0.85 + vUv.y * 0.55;
    float sweep = exp(-sq((sheenCoord - fract(uTime * 0.11) * 1.8 + 0.2) * 5.5)) * 0.14;
    float staticSheen = pow(max(0.0, 1.0 - abs(sheenCoord - 0.68)), 4.0) * 0.09;
    vec3 sheenCol = mix(uAccentColor, vec3(1.0, 0.95, 0.85), 0.5) * (sweep + staticSheen);

    // Composite HUD canvas texture over glass/photo
    vec3 col = mix(glassBase + sheenCol, hudSample.rgb, hudSample.a);
    float alpha = max(glassAlpha, hudSample.a);

    // Electric plasma / lightning border around the perimeter of the 3D glass screen
    float borderDist = abs(dBox + 0.012);
    float angle = atan(aspectCorrected.y, aspectCorrected.x);
    float jitter = sin(angle * 18.0 + uTime * 9.5) * 0.0055
                 + cos(angle * 31.0 - uTime * 14.0) * 0.0035;
    float arcDist = abs(dBox + 0.012 + jitter);

    float coreWire = exp(-sq(borderDist * 145.0));
    float lightningArc = exp(-sq(arcDist * 210.0));
    float outerHalo = exp(-sq(borderDist * 36.0)) * 0.48;

    float travelPulse1 = pow(max(0.0, 0.5 + 0.5 * sin(angle * 2.0 - uTime * 3.4)), 4.0);
    float travelPulse2 = pow(max(0.0, 0.5 + 0.5 * cos(angle * 3.0 + uTime * 2.7)), 6.0);
    float sparkIntensity = (0.45 + 0.55 * max(travelPulse1, travelPulse2)) * (uElectricIntensity + uHover * 0.35);

    vec3 electricCyan = mix(uAccentColor, vec3(0.35, 0.92, 1.0), 0.45);
    vec3 electricGold = vec3(1.0, 0.76, 0.28);
    vec3 plasmaCol = mix(electricCyan, electricGold, travelPulse2 * 0.45);

    vec3 borderGlow = plasmaCol * (coreWire * 0.95 + lightningArc * 1.35 * sparkIntensity + outerHalo * sparkIntensity);
    col += borderGlow;
    alpha = clamp(alpha + (coreWire + lightningArc * 0.8) * 0.6, 0.0, 1.0);

    // Holographic Layer Split & Portal Fly-Through Ring (uPortalOpen: 0 -> 1)
    if (uPortalOpen > 0.001) {
      float radialDist = length(aspectCorrected * vec2(0.72, 1.0));
      float portalRadius = uPortalOpen * 1.65;
      float holeMask = smoothstep(portalRadius - 0.14, portalRadius + 0.04, radialDist);
      float portalRing = exp(-sq((radialDist - portalRadius) * 14.0));
      vec3 ringCol = mix(vec3(0.0, 0.92, 1.0), vec3(1.0, 0.72, 0.2), 0.5 + 0.5 * sin(angle * 4.0 + uTime * 5.0));
      col += ringCol * portalRing * 2.1;
      alpha *= holeMask;
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), alpha * panelMask * uOpacity);
  }
`;

export function getDomainOrbitPose(
  domainIndex,
  orbitAngle = 0,
  radiusX = 4.6,
  radiusZ = 3.5,
  centerZ = -10.8
) {
  const count = DOMAIN_IDS.length;
  const safeIndex = ((domainIndex % count) + count) % count;
  const stepAngle = (Math.PI * 2) / count;
  const rawAngle = safeIndex * stepAngle + (Number.isFinite(orbitAngle) ? orbitAngle : 0);

  // Normalize angle to [-PI, PI] where 0 is front-center closest to the camera
  const normAngle = Math.atan2(Math.sin(rawAngle), Math.cos(rawAngle));
  const x = Math.sin(normAngle) * radiusX;
  const z = centerZ + Math.cos(normAngle) * radiusZ;
  const y = 0.54 + Math.sin(normAngle * 2.0) * 0.14;

  // Frontness: 1 when at front center (normAngle = 0), 0 when at back (|normAngle| = PI)
  const frontness = 0.5 + 0.5 * Math.cos(normAngle);

  // Cards face outward/toward the camera when in front, with subtle banking
  const rotY = -normAngle * 0.58;

  return {
    x,
    y,
    z,
    rotY,
    frontness,
    normAngle,
  };
}

function smoothstep01(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

export function getShowreelTimelineState(elapsedSeconds, activeTarget = null) {
  const count = DOMAIN_IDS.length;
  const stepAngle = (Math.PI * 2) / count;

  // 1. Interactive Override: Lock onto Overview ('overview' or -1)
  if (activeTarget === 'overview' || activeTarget === -1) {
    return {
      mode: 'interactive',
      act: 'overview',
      activeCardIndex: -1,
      portalOpen: 0,
      electricIntensity: 1.0,
      orbitAngle: 0,
      cameraTargetPos: { x: 0, y: 0.24, z: 7.35 },
      cameraLookAt: { x: 0, y: -0.16, z: 0 },
    };
  }

  // 2. Interactive Override: Lock onto specific Domain (0..4)
  if (
    typeof activeTarget === 'number' &&
    Number.isInteger(activeTarget) &&
    activeTarget >= 0 &&
    activeTarget < count
  ) {
    const targetOrbitAngle = -activeTarget * stepAngle;
    return {
      mode: 'interactive',
      act: 'orbit',
      activeCardIndex: activeTarget,
      portalOpen: 1,
      electricIntensity: 1.0,
      orbitAngle: targetOrbitAngle,
      cameraTargetPos: { x: 0, y: 0.24, z: -1.65 },
      cameraLookAt: { x: 0, y: -0.12, z: -7.5 },
    };
  }

  // 3. Automatic 3-Act Showreel Loop (32s cycle: energetic tempo + clear reading holds)
  const safeElapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const t = ((safeElapsed % SHOWREEL_CYCLE_SECONDS) + SHOWREEL_CYCLE_SECONDS) % SHOWREEL_CYCLE_SECONDS;

  // Act 1: 0.0s .. 6.5s (6.5s energetic hold) — Main Holographic Glass Frame (KMUTNB INNOVATION AWARDS 2027)
  if (t < 6.5) {
    const progress = t / 6.5;
    const swayX = Math.sin(progress * Math.PI * 2) * 0.32;
    const zoomZ = 7.55 - smoothstep01(progress) * 0.5;
    return {
      mode: 'auto',
      act: 'overview',
      activeCardIndex: -1,
      portalOpen: 0,
      electricIntensity: 1.0,
      orbitAngle: 0,
      cameraTargetPos: { x: swayX, y: 0.24, z: zoomZ },
      cameraLookAt: { x: 0, y: -0.16, z: 0 },
    };
  }

  // Act 2: 6.5s .. 10.2s (3.7s) — Fast Portal Split, 1.9s Kinetic Push-in on Breakthrough Headline, then Burst into Orbit
  if (t < 10.2) {
    const btElapsed = t - 6.5;
    const p = btElapsed / 3.7;
    const portalOpen = smoothstep01(Math.min(1, btElapsed / 0.95));

    let camZ;
    let lookZ;
    let breakthroughPortal = 0;

    if (btElapsed < 0.9) {
      // Phase 2A (0..0.9s): Fast fly-through Main Glass Portal up to Breakthrough Hologram (z = +1.45 looking at -4.2)
      const pA = smoothstep01(btElapsed / 0.9);
      camZ = 7.05 - pA * 5.6; // 7.05 -> 1.45
      lookZ = 0.0 - pA * 4.2;
    } else if (btElapsed < 2.8) {
      // Phase 2B (0.9..2.8s): 1.9s kinetic push-in hold on Breakthrough Headline
      const pB = (btElapsed - 0.9) / 1.9;
      camZ = 1.45 - pB * 0.7; // Continuous push-in 1.45 -> 0.75 while reading
      lookZ = -4.2;
    } else {
      // Phase 2C (2.8..3.7s): Fast portal burst through Breakthrough Hologram into Orbital Chamber
      const pC = smoothstep01((btElapsed - 2.8) / 0.9);
      camZ = 0.75 - pC * 2.4; // 0.75 -> -1.65
      lookZ = -4.2 - pC * 3.6; // -4.2 -> -7.8
      breakthroughPortal = smoothstep01(Math.min(1, (btElapsed - 2.7) / 0.65));
    }

    return {
      mode: 'auto',
      act: 'breakthrough',
      activeCardIndex: -1,
      portalOpen,
      breakthroughPortal,
      electricIntensity: 1.22,
      orbitAngle: 0,
      cameraTargetPos: { x: Math.sin(p * Math.PI * 2) * 0.16, y: 0.24 + Math.sin(p * Math.PI) * 0.1, z: camZ },
      cameraLookAt: { x: 0, y: -0.15, z: lookZ },
    };
  }

  // Act 3: 10.2s .. 29.7s (19.5s = 3.9s per domain) — Orbiting 5 Innovation Domain Glass Panels
  if (t < 29.7) {
    const orbitElapsed = t - 10.2;
    const orbitDuration = 19.5; // 3.9s per domain (~2.9s reading hold + ~1.0s snappy whip-rotation)
    const domainFloat = (orbitElapsed / orbitDuration) * count;
    const activeCardIndex = Math.min(count - 1, Math.floor(domainFloat));
    const localProgress = domainFloat - activeCardIndex;

    // Hold for 74% of the slot (~2.9s) so user can read, then snappy 26% (~1.0s) whip-rotation
    const rotationPhase = Math.max(0, (localProgress - 0.74) / 0.26);
    const steppedIndex = activeCardIndex + smoothstep01(rotationPhase);
    const orbitAngle = -steppedIndex * stepAngle;

    // Boost electric plasma intensity during the snappy rotation for extra excitement
    const rotationBurst = Math.sin(rotationPhase * Math.PI) * 0.42;

    return {
      mode: 'auto',
      act: 'orbit',
      activeCardIndex,
      portalOpen: 1,
      breakthroughPortal: 1,
      electricIntensity: 0.96 + rotationBurst,
      orbitAngle,
      cameraTargetPos: {
        x: Math.sin(orbitElapsed * 0.85) * 0.24,
        y: 0.24,
        z: -1.65,
      },
      cameraLookAt: { x: 0, y: -0.12, z: -7.8 },
    };
  }

  // Return Transition: 29.7s .. 32.0s (2.3s) — Snappy warp back to Main Holographic Stage
  const retP = smoothstep01((t - 29.7) / 2.3);
  const camZ = -1.65 + retP * 9.2;
  const lookZ = -7.8 + retP * 7.8;
  return {
    mode: 'auto',
    act: 'overview',
    activeCardIndex: -1,
    portalOpen: 1 - retP,
    breakthroughPortal: 1 - retP,
    electricIntensity: 1.08,
    orbitAngle: -count * stepAngle,
    cameraTargetPos: { x: 0, y: 0.24, z: camZ },
    cameraLookAt: { x: 0, y: -0.16, z: lookZ },
  };
}
