import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_ORBIT_COLORS,
  getOrbitTargetState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

test('DOMAIN_ORBIT_COLORS defines 5 domain hex colors', () => {
  assert.deepEqual(DOMAIN_ORBIT_COLORS, [0x00F5A0, 0x22C55E, 0x00D9F5, 0xFB7185, 0xF59E0B]);
});

test('getOrbitTargetState returns neutral values when activeDomainIndex is null or out of range (e.g. Others = 5)', () => {
  assert.deepEqual(getOrbitTargetState(0, null), { opacity: 0.38, scale: 1, speedMultiplier: 1 });
  assert.deepEqual(getOrbitTargetState(2, -1), { opacity: 0.38, scale: 1, speedMultiplier: 1 });
  assert.deepEqual(getOrbitTargetState(2, 5), { opacity: 0.38, scale: 1, speedMultiplier: 1 });
});

test('getOrbitTargetState highlights matching orbit and dims non-matching orbits for valid domain 0..4', () => {
  assert.deepEqual(getOrbitTargetState(3, 3), { opacity: 0.95, scale: 1.85, speedMultiplier: 2.2 });
  assert.deepEqual(getOrbitTargetState(1, 3), { opacity: 0.14, scale: 0.9, speedMultiplier: 0.75 });
});

test('getStageResponsiveConfig clamps zero dimensions and scales particle count & offset for mobile vs desktop', () => {
  const zero = getStageResponsiveConfig(0, 0);
  assert.equal(zero.safeWidth, 1);
  assert.equal(zero.safeHeight, 1);
  assert.equal(Number.isFinite(zero.aspect), true);

  const mobile = getStageResponsiveConfig(390, 700);
  assert.equal(mobile.particleCount, 50);
  assert.equal(mobile.groupOffsetX, 0);

  const desktop = getStageResponsiveConfig(1280, 720);
  assert.equal(desktop.particleCount, 120);
  assert.equal(desktop.groupOffsetX > 0.5, true);
});

test('getMotionFactor reduces motion and disables parallax when prefersReducedMotion is true', () => {
  assert.deepEqual(getMotionFactor(true), { speedFactor: 0.15, parallaxFactor: 0 });
  assert.deepEqual(getMotionFactor(false), { speedFactor: 1, parallaxFactor: 1 });
});
