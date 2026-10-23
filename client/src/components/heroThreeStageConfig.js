export const DOMAIN_ORBIT_COLORS = [
  0x00F5A0, // Energy, Environment & BCG Economy
  0x22C55E, // Food & Agriculture
  0x00D9F5, // Social & Economy
  0xFB7185, // Medical Device
  0xF59E0B, // Material
];

export function getOrbitTargetState(orbitIndex, activeDomainIndex) {
  const hasValidActiveDomain =
    typeof activeDomainIndex === 'number' &&
    activeDomainIndex >= 0 &&
    activeDomainIndex < DOMAIN_ORBIT_COLORS.length;

  if (!hasValidActiveDomain) {
    return {
      opacity: 0.38,
      scale: 1,
      speedMultiplier: 1,
    };
  }

  if (orbitIndex === activeDomainIndex) {
    return {
      opacity: 0.95,
      scale: 1.85,
      speedMultiplier: 2.2,
    };
  }

  return {
    opacity: 0.14,
    scale: 0.9,
    speedMultiplier: 0.75,
  };
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
      groupOffsetX: 0,
      cameraZ: 5.8,
    };
  }

  if (safeWidth <= 1024) {
    return {
      safeWidth,
      safeHeight,
      aspect,
      particleCount: 80,
      groupOffsetX: 0.55,
      cameraZ: 5.5,
    };
  }

  return {
    safeWidth,
    safeHeight,
    aspect,
    particleCount: 120,
    groupOffsetX: 0.95,
    cameraZ: 5.2,
  };
}

export function getMotionFactor(prefersReducedMotion) {
  if (prefersReducedMotion) {
    return {
      speedFactor: 0.15,
      parallaxFactor: 0,
    };
  }

  return {
    speedFactor: 1,
    parallaxFactor: 1,
  };
}
