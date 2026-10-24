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

export const DOMAIN_CYCLE_SECONDS = 6;

export const DEFAULT_IMAGE_ASPECT = 16 / 9;

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
  transitionSpeed = 1.8
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
  const safeSpeed = Number.isFinite(transitionSpeed) && transitionSpeed > 0 ? transitionSpeed : 1.8;

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
      parallaxStrength: 0.01,
    };
  }

  if (safeWidth <= 1024) {
    return {
      safeWidth,
      safeHeight,
      aspect,
      uvScaleX,
      uvScaleY,
      parallaxStrength: 0.015,
    };
  }

  return {
    safeWidth,
    safeHeight,
    aspect,
    uvScaleX,
    uvScaleY,
    parallaxStrength: 0.02,
  };
}

export function getMotionFactor(prefersReducedMotion) {
  return prefersReducedMotion ? REDUCED_MOTION_FACTOR : FULL_MOTION_FACTOR;
}
