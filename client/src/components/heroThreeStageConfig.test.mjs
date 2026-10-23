import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_ORBIT_COLORS,
  CITY_TOUR_DURATION,
  DISTRICT_LAYOUTS,
  getTourStoryState,
  getDistrictTargetState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

test('DOMAIN_ORBIT_COLORS and DISTRICT_LAYOUTS define 5 innovation districts with matching colors and coordinates', () => {
  assert.deepEqual(DOMAIN_ORBIT_COLORS, [0x00F5A0, 0x22C55E, 0x00D9F5, 0xFB7185, 0xF59E0B]);
  assert.equal(CITY_TOUR_DURATION, 20);
  assert.equal(DISTRICT_LAYOUTS.length, 5);
  DISTRICT_LAYOUTS.forEach((d, idx) => {
    assert.equal(d.index, idx);
    assert.equal(d.color, DOMAIN_ORBIT_COLORS[idx]);
    assert.equal(d.position.length, 3);
    assert.equal(d.cameraOffset.length, 3);
    assert.equal(d.lookAtOffset.length, 3);
  });
});

test('getTourStoryState transitions through 5 districts in glide mode (0..15s) and enters surge climax (15..20s)', () => {
  const d0 = getTourStoryState(1.5, null);
  assert.equal(d0.mode, 'glide');
  assert.equal(d0.activeDistrictIndex, 0);
  assert.equal(d0.surgeProgress, 0);

  const d3 = getTourStoryState(10.2, 5); // 5 ("Others") is out of range -> stays in auto tour
  assert.equal(d3.mode, 'glide');
  assert.equal(d3.activeDistrictIndex, 3);

  const surge = getTourStoryState(17.5, null);
  assert.equal(surge.mode, 'surge');
  assert.equal(surge.activeDistrictIndex, -1);
  assert.equal(surge.surgeProgress, 0.5);
});

test('getTourStoryState switches to dive mode when activeDomainIndex is 0..4', () => {
  const dive = getTourStoryState(4.0, 2);
  assert.equal(dive.mode, 'dive');
  assert.equal(dive.activeDistrictIndex, 2);
  assert.equal(dive.surgeProgress, 0);
});

test('getDistrictTargetState boosts active district in glide/dive and boosts all districts in surge', () => {
  const glideState = getTourStoryState(1.0, null); // district 0 active
  const activeGlide = getDistrictTargetState(0, glideState);
  const idleGlide = getDistrictTargetState(2, glideState);
  assert.equal(activeGlide.activityMultiplier > idleGlide.activityMultiplier, true);
  assert.equal(activeGlide.conduitPulseIntensity > idleGlide.conduitPulseIntensity, true);

  const diveState = getTourStoryState(1.0, 4); // dive into district 4
  const activeDive = getDistrictTargetState(4, diveState);
  const dimmedDive = getDistrictTargetState(1, diveState);
  assert.equal(activeDive.activityMultiplier, 2.4);
  assert.equal(dimmedDive.activityMultiplier, 0.45);

  const surgeState = getTourStoryState(18.0, null);
  assert.deepEqual(getDistrictTargetState(0, surgeState), getDistrictTargetState(3, surgeState));
  assert.equal(getDistrictTargetState(0, surgeState).conduitPulseIntensity, 1);
});

test('getStageResponsiveConfig clamps zero dimensions and getMotionFactor returns frozen objects', () => {
  const zero = getStageResponsiveConfig(0, 0);
  assert.equal(zero.safeWidth, 1);
  assert.equal(zero.safeHeight, 1);
  assert.equal(Number.isFinite(zero.aspect), true);

  const mobile = getStageResponsiveConfig(390, 700);
  assert.equal(mobile.particleCount, 50);
  assert.equal(mobile.cityOffsetX, 0);

  const desktop = getStageResponsiveConfig(1280, 720);
  assert.equal(desktop.particleCount, 120);
  assert.equal(desktop.cityOffsetX > 0.8, true);

  assert.deepEqual(getMotionFactor(true), { speedFactor: 0.15, parallaxFactor: 0 });
  assert.deepEqual(getMotionFactor(false), { speedFactor: 1, parallaxFactor: 1 });
  assert.equal(getMotionFactor(true), getMotionFactor(true));
});
