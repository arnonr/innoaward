export const DOMAIN_ORBIT_COLORS = [
  0x00F5A0, // Energy, Environment & BCG Economy
  0x22C55E, // Food & Agriculture
  0x00D9F5, // Social & Economy
  0xFB7185, // Medical Device
  0xF59E0B, // Material
];

export const CITY_TOUR_DURATION = 20;

const DISTRICT_RADIUS = 2.35;

export const DISTRICT_LAYOUTS = DOMAIN_ORBIT_COLORS.map((color, index) => {
  const angle = (index * Math.PI * 2) / DOMAIN_ORBIT_COLORS.length;
  const x = Number((Math.cos(angle) * DISTRICT_RADIUS).toFixed(3));
  const z = Number((Math.sin(angle) * DISTRICT_RADIUS).toFixed(3));

  return Object.freeze({
    index,
    color,
    position: Object.freeze([x, 0, z]),
    cameraOffset: Object.freeze([
      Number((Math.cos(angle) * 0.85).toFixed(3)),
      1.05,
      Number((Math.sin(angle) * 0.85 + 1.35).toFixed(3)),
    ]),
    lookAtOffset: Object.freeze([0, 0.35, 0]),
  });
});

const DISTRICT_STATE_DIVE_ACTIVE = Object.freeze({
  activityMultiplier: 2.4,
  conduitPulseIntensity: 1.0,
  emissiveBoost: 1.1,
});

const DISTRICT_STATE_DIVE_DIMMED = Object.freeze({
  activityMultiplier: 0.45,
  conduitPulseIntensity: 0.18,
  emissiveBoost: 0.25,
});

const DISTRICT_STATE_SURGE = Object.freeze({
  activityMultiplier: 2.0,
  conduitPulseIntensity: 1.0,
  emissiveBoost: 0.95,
});

const DISTRICT_STATE_GLIDE_ACTIVE = Object.freeze({
  activityMultiplier: 2.1,
  conduitPulseIntensity: 0.95,
  emissiveBoost: 0.9,
});

const DISTRICT_STATE_GLIDE_IDLE = Object.freeze({
  activityMultiplier: 0.75,
  conduitPulseIntensity: 0.3,
  emissiveBoost: 0.4,
});

const REDUCED_MOTION_FACTOR = Object.freeze({
  speedFactor: 0.15,
  parallaxFactor: 0,
});

const FULL_MOTION_FACTOR = Object.freeze({
  speedFactor: 1,
  parallaxFactor: 1,
});

export function getTourStoryState(elapsedSeconds, activeDomainIndex) {
  const safeElapsed = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const cycleTime =
    ((safeElapsed % CITY_TOUR_DURATION) + CITY_TOUR_DURATION) % CITY_TOUR_DURATION;
  const tourProgress = cycleTime / CITY_TOUR_DURATION;

  if (
    typeof activeDomainIndex === 'number' &&
    activeDomainIndex >= 0 &&
    activeDomainIndex < DOMAIN_ORBIT_COLORS.length
  ) {
    return {
      mode: 'dive',
      activeDistrictIndex: activeDomainIndex,
      tourProgress,
      districtProgress: 0,
      surgeProgress: 0,
    };
  }

  if (cycleTime < 15) {
    const activeDistrictIndex = Math.min(4, Math.floor(cycleTime / 3));
    const districtProgress = (cycleTime % 3) / 3;
    return {
      mode: 'glide',
      activeDistrictIndex,
      tourProgress,
      districtProgress,
      surgeProgress: 0,
    };
  }

  const surgeProgress = (cycleTime - 15) / 5;
  return {
    mode: 'surge',
    activeDistrictIndex: -1,
    tourProgress,
    districtProgress: 1,
    surgeProgress,
  };
}

export function getDistrictTargetState(districtIndex, storyState) {
  if (storyState?.mode === 'dive') {
    return districtIndex === storyState.activeDistrictIndex
      ? DISTRICT_STATE_DIVE_ACTIVE
      : DISTRICT_STATE_DIVE_DIMMED;
  }

  if (storyState?.mode === 'surge') {
    return DISTRICT_STATE_SURGE;
  }

  return districtIndex === storyState?.activeDistrictIndex
    ? DISTRICT_STATE_GLIDE_ACTIVE
    : DISTRICT_STATE_GLIDE_IDLE;
}

export function getStageResponsiveConfig(width, height) {
  const safeWidth = Math.max(1, width || 0);
  const safeHeight = Math.max(1, height || 0);
  const aspect = safeWidth / safeHeight;

  if (safeWidth <= 768) {
    return {
      safeWidth,
      safeHeight,
      aspect,
      particleCount: 50,
      cityOffsetX: 0,
      cityOffsetY: -0.25,
      distanceScale: 1.18,
    };
  }

  if (safeWidth <= 1024) {
    return {
      safeWidth,
      safeHeight,
      aspect,
      particleCount: 80,
      cityOffsetX: 0.65,
      cityOffsetY: -0.3,
      distanceScale: 1.06,
    };
  }

  return {
    safeWidth,
    safeHeight,
    aspect,
    particleCount: 120,
    cityOffsetX: 1.15,
    cityOffsetY: -0.32,
    distanceScale: 1.0,
  };
}

export function getMotionFactor(prefersReducedMotion) {
  return prefersReducedMotion ? REDUCED_MOTION_FACTOR : FULL_MOTION_FACTOR;
}
