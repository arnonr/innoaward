import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_ORBIT_COLORS,
  DOMAIN_PHOTO_URLS,
  DOMAIN_CYCLE_SECONDS,
  LIVING_PHOTO_FRAGMENT_SHADER,
  resolveDomainPhotoUrl,
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
  assert.equal(DOMAIN_CYCLE_SECONDS, 14);
});

test('resolveDomainPhotoUrl prefixes Vite BASE_URL without double slashes', () => {
  assert.equal(resolveDomainPhotoUrl('/domain-energy.jpg', '/innoawards/'), '/innoawards/domain-energy.jpg');
  assert.equal(resolveDomainPhotoUrl('/domain-energy.jpg', '/innoawards'), '/innoawards/domain-energy.jpg');
  assert.equal(resolveDomainPhotoUrl('/domain-energy.jpg', '/'), '/domain-energy.jpg');
  assert.equal(resolveDomainPhotoUrl('domain-energy.jpg', '/innoawards/'), '/innoawards/domain-energy.jpg');
});

test('LIVING_PHOTO_FRAGMENT_SHADER avoids negative-base pow(), avoids per-pixel luminance UV tearing, and includes leftScrim', () => {
  assert.equal(typeof LIVING_PHOTO_FRAGMENT_SHADER, 'string');
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('float sq(float v)'), true);
  // Must not use pow(..., 2.0) on signed differences like (uv.y - scanY), (uv.x - ecgSweepX), or (vUv.x - uMix)
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes(', 2.0)'), false);
  // Must not tear pixels by using raw texture luminance as a UV offset
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('0.35 + depth * 0.95'), false);
  // Must include left-side editorial scrim so hero text is easy to read
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('leftScrim'), true);
  // Every remaining pow( must clamp its base with max(0.0,
  const powMatches = LIVING_PHOTO_FRAGMENT_SHADER.match(/pow\([^,]+/g) || [];
  assert.equal(powMatches.length > 0, true);
  powMatches.forEach((snippet) => {
    assert.equal(snippet.startsWith('pow(max(0.0'), true, `Unclamped pow base: ${snippet}`);
  });
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

test('resolveTargetDomainIndex auto-cycles every 14s when unhovered or out of range and locks when hovered (0..4)', () => {
  assert.deepEqual(resolveTargetDomainIndex(0.5, null), { mode: 'auto', domainIndex: 0 });
  assert.deepEqual(resolveTargetDomainIndex(14.1, null), { mode: 'auto', domainIndex: 1 });
  assert.deepEqual(resolveTargetDomainIndex(29.0, 5), { mode: 'auto', domainIndex: 2 }); // 5 = Others
  assert.deepEqual(resolveTargetDomainIndex(-2.0, undefined), { mode: 'auto', domainIndex: 4 });
  assert.deepEqual(resolveTargetDomainIndex(Number.NaN, null), { mode: 'auto', domainIndex: 0 });

  assert.deepEqual(resolveTargetDomainIndex(1.2, 3), { mode: 'hover', domainIndex: 3 });
});

test('advanceTransitionState keeps hovered domain when mouse leaves and continues auto-cycling forward from there', () => {
  const state = {
    currentIndex: 0,
    nextIndex: 0,
    mixProgress: 0,
    transitioning: false,
    cycleTimer: 0,
  };

  // 1. User hovers domain 2 ("03 Social & Economy") briefly (0.25s)
  advanceTransitionState(state, 2, 0.25, 2.0);
  assert.equal(state.transitioning, true);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.nextIndex, 2);
  assert.equal(state.mixProgress, 0.5);

  // 2. User moves mouse away (activeDomainIndex = null) BEFORE transition finishes:
  // Must NOT revert to 0 — must finish transitioning to 2!
  advanceTransitionState(state, null, 0.25, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 2);
  assert.equal(state.nextIndex, 2);
  assert.equal(state.mixProgress, 0);

  // 3. Mouse remains unhovered for 13.9s (< 14s): stays on domain 2
  advanceTransitionState(state, null, 13.9, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 2);
  assert.equal(state.nextIndex, 2);

  // 4. At 14.0s of idle time: auto-cycles forward from 2 -> 3 (not back to 0!)
  advanceTransitionState(state, null, 0.2, 2.0);
  assert.equal(state.transitioning, true);
  assert.equal(state.currentIndex, 2);
  assert.equal(state.nextIndex, 3);

  // Finish transition to 3
  advanceTransitionState(state, null, 1.0, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 3);
  assert.equal(state.nextIndex, 3);

  // 5. Mid-transition retarget when user hovers domain 4, then bounces back to 3 before mixProgress >= 0.5
  advanceTransitionState(state, 4, 0.1, 2.0); // mixProgress = 0.2 (< 0.5), currentIndex = 3, nextIndex = 4
  advanceTransitionState(state, 3, 0.1, 2.0); // user hovers back on 3
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 3);
  assert.equal(state.nextIndex, 3);
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
