import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_ORBIT_COLORS,
  DOMAIN_PHOTO_URLS,
  DOMAIN_CYCLE_SECONDS,
  getCoverUvScale,
  resolveTargetDomainIndex,
  advanceTransitionState,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

test('DOMAIN_ORBIT_COLORS and DOMAIN_PHOTO_URLS define 5 real domain photos and accent colors', () => {
  assert.deepEqual(DOMAIN_ORBIT_COLORS, [0x00F5A0, 0x22C55E, 0x00D9F5, 0xFB7185, 0xF59E0B]);
  assert.deepEqual(DOMAIN_PHOTO_URLS, [
    '/domain-energy.jpg',
    '/domain-food.jpg',
    '/domain-social.jpg',
    '/domain-medical.jpg',
    '/domain-material.jpg',
  ]);
  assert.equal(DOMAIN_CYCLE_SECONDS, 6);
});

test('getCoverUvScale preserves aspect ratio without stretching and handles zero/negative dimensions', () => {
  const zero = getCoverUvScale(0, -20);
  assert.equal(Number.isFinite(zero.scaleX) && zero.scaleX > 0 && zero.scaleX <= 1, true);
  assert.equal(Number.isFinite(zero.scaleY) && zero.scaleY > 0 && zero.scaleY <= 1, true);

  // Wide container (wider than 16:9) crops vertically (scaleY < 1, scaleX === 1)
  const wide = getCoverUvScale(1920, 600, 16 / 9);
  assert.equal(wide.scaleX, 1);
  assert.equal(wide.scaleY < 1, true);

  // Tall mobile container (narrower than 16:9) crops horizontally (scaleX < 1, scaleY === 1)
  const tall = getCoverUvScale(390, 720, 16 / 9);
  assert.equal(tall.scaleX < 1, true);
  assert.equal(tall.scaleY, 1);
});

test('resolveTargetDomainIndex auto-cycles every 6s when unhovered or out of range and locks when hovered (0..4)', () => {
  assert.deepEqual(resolveTargetDomainIndex(0.5, null), { mode: 'auto', domainIndex: 0 });
  assert.deepEqual(resolveTargetDomainIndex(6.1, null), { mode: 'auto', domainIndex: 1 });
  assert.deepEqual(resolveTargetDomainIndex(13.0, 5), { mode: 'auto', domainIndex: 2 }); // 5 = Others
  assert.deepEqual(resolveTargetDomainIndex(-2.0, undefined), { mode: 'auto', domainIndex: 4 });
  assert.deepEqual(resolveTargetDomainIndex(Number.NaN, null), { mode: 'auto', domainIndex: 0 });

  assert.deepEqual(resolveTargetDomainIndex(1.2, 3), { mode: 'hover', domainIndex: 3 });
});

test('advanceTransitionState interpolates mixProgress to 1, settles on target, and handles mid-transition retargeting', () => {
  const state = { currentIndex: 0, nextIndex: 0, mixProgress: 0, transitioning: false };

  advanceTransitionState(state, 2, 0.25, 2.0);
  assert.equal(state.transitioning, true);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.nextIndex, 2);
  assert.equal(state.mixProgress, 0.5);

  // Mid-transition retarget to domain 4 before previous transition finishes
  advanceTransitionState(state, 4, 0.1, 2.0);
  assert.equal(state.transitioning, true);
  assert.equal(state.nextIndex, 4);
  assert.equal(state.mixProgress > 0 && state.mixProgress < 1, true);

  // Finish transition
  advanceTransitionState(state, 4, 1.0, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 4);
  assert.equal(state.nextIndex, 4);
  assert.equal(state.mixProgress, 0);
});

test('getStageResponsiveConfig and getMotionFactor handle mobile/desktop and reduced motion', () => {
  const mobile = getStageResponsiveConfig(390, 700);
  const desktop = getStageResponsiveConfig(1440, 760);
  assert.equal(mobile.parallaxStrength < desktop.parallaxStrength, true);
  assert.equal(mobile.uvScaleX < 1, true);

  assert.deepEqual(getMotionFactor(true), {
    speedFactor: 0.25,
    parallaxFactor: 0,
    breathFactor: 0,
  });
  assert.deepEqual(getMotionFactor(false), {
    speedFactor: 1,
    parallaxFactor: 1,
    breathFactor: 1,
  });
});
