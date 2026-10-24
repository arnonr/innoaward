# 2.5D Living Photo Hero Shader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dizzying low-poly 3D island Hero scene with a stationary-camera 2.5D Living Photo Shader stage that renders the 5 real innovation domain photographs with luminance depth parallax, liquid-wave transitions, and domain-specific light pulses traveling along the real network/grid lines in each image.

**Architecture:** `client/src/components/heroThreeStageConfig.js` provides pure, zero-allocation state helpers for aspect-preserving `object-fit: cover` UV scaling, auto-cycle vs. hover domain resolution, smooth shader transition state progression, and reduced-motion factors. `client/src/components/HeroThreeStage.jsx` mounts a single-draw-call `THREE.OrthographicCamera` + `THREE.PlaneGeometry(2, 2)` + `THREE.ShaderMaterial` pipeline that loads `/domain-energy.jpg` through `/domain-material.jpg` and executes both 2.5D depth parallax and the 5 domain-specific living light micro-animations on the GPU.

**Tech Stack:** React 19.2.8, Vite 8.2.0, Three.js (`^0.186.1`), Node.js built-in test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-10-24-living-photo-hero-shader-design.md`

## Global Constraints

- **Stack:** React 19.2.8 + Vite 8.2.0 + vanilla `three` (`^0.186.1`).
- **Assets:** Use the 5 existing public domain photographs (`/domain-energy.jpg`, `/domain-food.jpg`, `/domain-social.jpg`, `/domain-medical.jpg`, `/domain-material.jpg`) with zero external model or extra image downloads.
- **Performance & Lifecycle:** Single draw call (`PlaneGeometry(2, 2)` + `ShaderMaterial`), pixel ratio capped at `<= 2`, `ResizeObserver` updating cover-UV aspect uniforms, `IntersectionObserver` pausing the animation loop when scrolled offscreen, `prefers-reduced-motion: reduce` support, and full WebGL texture/material/geometry/renderer disposal on unmount.
- **No Layout Breakage:** Keep `.hero-three-canvas-wrap` and the `HeroThreeStage({ activeDomainIndex })` component prop contract unchanged in `client/src/App.jsx`.

## Review Focus

1. **Zero or negative container dimensions (`width <= 0` or `height <= 0`):** `getStageResponsiveConfig` and `getCoverUvScale` must clamp dimensions to `>= 1` and return finite UV scale factors in `(0, 1]` without `NaN` or `Infinity`.
2. **Out-of-range or unhovered `activeDomainIndex` (`null`, `undefined`, `-1`, `5` for "Others", or `NaN`):** `resolveTargetDomainIndex` must ignore invalid indices and return `mode: 'auto'` with a valid auto-cycled `domainIndex` in `0..4`.
3. **Negative or non-finite `elapsedSeconds`:** `resolveTargetDomainIndex` must safely normalize negative or `NaN` elapsed times into a valid `0..4` domain index.
4. **Mid-transition retargeting (user hovers a new domain while a transition is already in progress):** `advanceTransitionState` must cleanly snap or retarget `nextIndex` to the newly requested domain and complete the transition in `[0, 1]` without getting stuck.
5. **Reduced motion preference (`prefers-reduced-motion: reduce`):** `getMotionFactor(true)` must return `parallaxFactor: 0`, `breathFactor: 0`, and reduced `speedFactor: 0.25`.

---

### Task 1: Living Photo Shader State & Cover-UV Helpers

**Files:**
- Modify: `client/src/components/heroThreeStageConfig.js`
- Test: `client/src/components/heroThreeStageConfig.test.mjs`

**Interfaces:**
- Produces:
  - `DOMAIN_ORBIT_COLORS: readonly number[]` (`[0x00F5A0, 0x22C55E, 0x00D9F5, 0xFB7185, 0xF59E0B]`)
  - `DOMAIN_PHOTO_URLS: readonly string[]` (`['/domain-energy.jpg', '/domain-food.jpg', '/domain-social.jpg', '/domain-medical.jpg', '/domain-material.jpg']`)
  - `DOMAIN_CYCLE_SECONDS: 6`
  - `DEFAULT_IMAGE_ASPECT: number` (`16 / 9`)
  - `getCoverUvScale(containerWidth: number, containerHeight: number, imageAspect?: number) -> { scaleX: number, scaleY: number }`
  - `resolveTargetDomainIndex(elapsedSeconds: number, activeDomainIndex: number | null | undefined) -> { mode: 'hover' | 'auto', domainIndex: number }`
  - `advanceTransitionState(state: { currentIndex: number, nextIndex: number, mixProgress: number, transitioning: boolean }, targetDomainIndex: number, deltaSeconds: number, transitionSpeed?: number) -> { currentIndex: number, nextIndex: number, mixProgress: number, transitioning: boolean }`
  - `getStageResponsiveConfig(width: number, height: number) -> { safeWidth: number, safeHeight: number, aspect: number, uvScaleX: number, uvScaleY: number, parallaxStrength: number }`
  - `getMotionFactor(prefersReducedMotion: boolean) -> Readonly<{ speedFactor: number, parallaxFactor: number, breathFactor: number }>`

- [ ] **Step 1: Write the failing unit tests in `client/src/components/heroThreeStageConfig.test.mjs`**

```js
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
```

- [ ] **Step 2: Run the unit tests to verify they fail**

Run: `node --test client/src/components/heroThreeStageConfig.test.mjs`
Expected: FAIL (missing `DOMAIN_PHOTO_URLS`, `getCoverUvScale`, `resolveTargetDomainIndex`, `advanceTransitionState`).

- [ ] **Step 3: Implement the helpers in `client/src/components/heroThreeStageConfig.js`**

Implement `DOMAIN_ORBIT_COLORS`, `DOMAIN_PHOTO_URLS`, `DOMAIN_CYCLE_SECONDS`, `DEFAULT_IMAGE_ASPECT`, `getCoverUvScale`, `resolveTargetDomainIndex`, `advanceTransitionState`, `getStageResponsiveConfig`, and `getMotionFactor` matching the interfaces and assertions in Step 1. In `advanceTransitionState(state, targetDomainIndex, deltaSeconds, transitionSpeed = 1.8)`, when `state.transitioning` is already `true` and `targetDomainIndex !== state.nextIndex`, set `state.currentIndex = state.mixProgress >= 0.5 ? state.nextIndex : state.currentIndex`, `state.nextIndex = targetDomainIndex`, and reset `state.mixProgress = 0` before advancing by `Math.max(0, deltaSeconds) * transitionSpeed`.

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `node --test client/src/components/heroThreeStageConfig.test.mjs`
Expected: PASS (5 passing tests).

- [ ] **Step 5: Commit Task 1**

```bash
git add client/src/components/heroThreeStageConfig.js client/src/components/heroThreeStageConfig.test.mjs
git commit -m "feat(client): add Living Photo shader state and cover-UV helpers"
```

---

### Task 2: 2.5D Living Photo `ShaderMaterial` Stage in `HeroThreeStage.jsx`

**Files:**
- Modify: `client/src/components/HeroThreeStage.jsx`
- Test: `client/src/components/heroThreeStageConfig.test.mjs`

**Interfaces:**
- Consumes from `client/src/components/heroThreeStageConfig.js`:
  - `DOMAIN_ORBIT_COLORS`
  - `DOMAIN_PHOTO_URLS`
  - `resolveTargetDomainIndex`
  - `advanceTransitionState`
  - `getStageResponsiveConfig`
  - `getMotionFactor`
- Produces:
  - `export default function HeroThreeStage({ activeDomainIndex = null }): JSX.Element` rendering `<div ref={containerRef} className="hero-three-canvas-wrap" aria-hidden="true" />`

- [ ] **Step 1: Replace the 3D scene in `client/src/components/HeroThreeStage.jsx` with the Single-Pass 2.5D Living Photo `ShaderMaterial` stage**

Implement `HeroThreeStage.jsx` using:
- `THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)` at `z = 1` (100% stationary camera).
- `THREE.TextureLoader` loading the 5 `DOMAIN_PHOTO_URLS` with `minFilter = THREE.LinearFilter`, `magFilter = THREE.LinearFilter`, `wrapS = THREE.ClampToEdgeWrapping`, `wrapT = THREE.ClampToEdgeWrapping`.
- `THREE.PlaneGeometry(2, 2)` and `THREE.ShaderMaterial` with uniforms:
  - `uTexCurrent`, `uTexNext`, `uDomainCurrent`, `uDomainNext`, `uMix`, `uMouse`, `uTime`, `uUvScale`, `uParallaxStrength`, `uAccent`
- GLSL fragment shader implementing:
  - Cover-UV mapping (`(vUv - 0.5) * uUvScale * 0.91 + 0.5`) so images never stretch and have margin for 2.5D parallax.
  - Luminance-based 2.5D depth parallax (`uMouse`) + gentle breathing offset (`autoBreath`).
  - `applyLivingPhotoEffect(vec3 col, vec2 uv, float domainId, float time)` for all 5 domains:
    - `0` (`Energy & Env`): emerald-cyan grid pulses (`gridPulse1 + gridPulse2`) along offshore solar hexagons/cables + ocean water shimmer.
    - `1` (`Food & Agri`): vertical green bio-laser scan bar sweeping across the hydroponic plant racks + pulsing left holographic HUD monitors.
    - `2` (`Social & Digital`): high-speed cyan/gold data packets (`packetA + packetB + packetC`) racing along the sky-network lines and highways.
    - `3` (`Medical Device`): live ECG sweep across the left holographic diagnostic HUD + pulsing surgical laser focal point and robotic arm rings.
    - `4` (`Material`): golden-cyan atomic current flowing through the hexagonal graphene lattice bonds and carbon nanotubes.
  - Liquid-wave transition (`uMix`) between `uTexCurrent` and `uTexNext` with an accent ripple flash.
- Full lifecycle management: `ResizeObserver` updating `renderer.setSize` and `uUvScale`/`uParallaxStrength`, `IntersectionObserver` pausing offscreen rendering, `prefers-reduced-motion` media query listener, and complete disposal of textures, geometry, material, and renderer on unmount.

- [ ] **Step 2: Run unit tests and production build verification**

Run: `node --test client/src/components/heroThreeStageConfig.test.mjs && npm --prefix client run build`
Expected: All unit tests PASS and Vite production build succeeds with 0 errors.

- [ ] **Step 3: Commit Task 2**

```bash
git add client/src/components/HeroThreeStage.jsx
git commit -m "feat(client): replace 3D island with 2.5D Living Photo Hero Shader"
```
