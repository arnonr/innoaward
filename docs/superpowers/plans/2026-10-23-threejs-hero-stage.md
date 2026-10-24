# Living Future City (Cinematic Sweeping Tour) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the spinning-orb Hero 3D scene with a narrative-driven, purely visual 3D diorama ("Living Future City — Cinematic Sweeping Tour") featuring 5 living innovation districts, energy convergence conduits, a central Royal Trophy Spire, a 3-act `CatmullRomCurve3` camera tour, and interactive camera dives when hovering/focusing the 5 domain buttons.

**Architecture:** `client/src/components/heroThreeStageConfig.js` holds pure, unit-tested state helpers for the 3-act narrative timeline (`glide`, `surge`, `dive`), per-district machinery/conduit intensities, responsive framing, and reduced-motion factors. `client/src/components/HeroThreeStage.jsx` builds the procedural 3D island diorama, the 5 animated districts, the central Royal Trophy Spire with shockwave ring, and the `CatmullRomCurve3` camera flight rig with zero per-frame `Vector3` allocations and full GPU resource disposal.

**Tech Stack:** React 19.2.8, Vite 8.2.0, Three.js (`three` ^0.186.1), Node built-in test runner (`node --test`), `oxlint`.

**Spec:** `docs/superpowers/specs/2026-10-23-threejs-hero-stage-design.md`

## Global Constraints

- Pure visual storytelling only: zero 3D text, HTML labels, or captions inside the 3D scene.
- Domain palette (ordered 0–4): `[0x00F5A0, 0x22C55E, 0x00D9F5, 0xFB7185, 0xF59E0B]` with Royal Trophy Spire in `0xFB923C` / `0xEA580C` / `0xFDBA74`.
- Follow `threejs-fundamentals` and `threejs-performance`: `new THREE.Timer()` connected to `document`, `renderer.setAnimationLoop`, `renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))`, `CatmullRomCurve3.getPointAt(u, targetVector)` writing into pre-allocated `THREE.Vector3` scratch objects outside the animation loop, `ResizeObserver`, `IntersectionObserver`, and full geometry/material/renderer disposal on unmount.

## Review Focus

- `activeDomainIndex` out-of-range (`null`, `-1`, or `5` for "Others"): must stay in the automatic 3-act camera tour (`glide` / `surge`) instead of indexing `DISTRICT_LAYOUTS[5]` and throwing `TypeError`.
- Negative or large `elapsedSeconds` passed to `getTourStoryState`: modulo wrapping must always produce a finite `cycleTime` in `[0, CITY_TOUR_DURATION)` and valid `u` in `[0, 1]`.
- Zero-dimension container (`width === 0` or `height === 0`): `getStageResponsiveConfig` must clamp `safeWidth` and `safeHeight` to `>= 1` so `camera.aspect` is never `NaN` or `Infinity`.
- `prefers-reduced-motion: reduce`: `getMotionFactor(true)` must reduce tour speed (`speedFactor: 0.15`) and disable pointer parallax (`parallaxFactor: 0`).
- Zero per-frame `new THREE.Vector3()` allocations inside `animate`: `CatmullRomCurve3.getPointAt(t, target)` must always receive a pre-allocated target `Vector3`.

---

### Task 1: Implement "Living Future City" tour & district state helpers in `heroThreeStageConfig.js`

**Files:**
- Modify: `client/src/components/heroThreeStageConfig.js`
- Modify: `client/src/components/heroThreeStageConfig.test.mjs`

**Interfaces:**
- Produces:
  - `DOMAIN_ORBIT_COLORS`: `[0x00F5A0, 0x22C55E, 0x00D9F5, 0xFB7185, 0xF59E0B]`
  - `CITY_TOUR_DURATION`: `20`
  - `DISTRICT_LAYOUTS`: array of 5 objects `{ index: number, color: number, position: [number, number, number], cameraOffset: [number, number, number], lookAtOffset: [number, number, number] }`
  - `getTourStoryState(elapsedSeconds: number, activeDomainIndex: number | null): { mode: 'glide' | 'surge' | 'dive', activeDistrictIndex: number, tourProgress: number, districtProgress: number, surgeProgress: number }`
  - `getDistrictTargetState(districtIndex: number, storyState: { mode: string, activeDistrictIndex: number }): { activityMultiplier: number, conduitPulseIntensity: number, emissiveBoost: number }`
  - `getStageResponsiveConfig(width: number, height: number): { safeWidth: number, safeHeight: number, aspect: number, particleCount: number, cityOffsetX: number, cityOffsetY: number, distanceScale: number }`
  - `getMotionFactor(prefersReducedMotion: boolean): { speedFactor: number, parallaxFactor: number }`

- [ ] **Step 1: Update unit tests in `client/src/components/heroThreeStageConfig.test.mjs`**

```javascript
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
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run: `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/heroThreeStageConfig.test.mjs`
Expected: FAIL (`CITY_TOUR_DURATION` / `DISTRICT_LAYOUTS` / `getTourStoryState` not exported).

- [ ] **Step 3: Implement `client/src/components/heroThreeStageConfig.js`**

Export `DOMAIN_ORBIT_COLORS`, `CITY_TOUR_DURATION = 20`, `DISTRICT_LAYOUTS` (5 districts arranged on a pentagon of radius `2.35` around `[0, 0, 0]`, each with a tailored close-up `cameraOffset` and `lookAtOffset`), `getTourStoryState(elapsedSeconds, activeDomainIndex)`, `getDistrictTargetState(districtIndex, storyState)` using pre-allocated frozen return objects, `getStageResponsiveConfig(width, height)` (`mobile <= 768`: `particleCount: 50, cityOffsetX: 0, cityOffsetY: -0.25, distanceScale: 1.18`; `tablet <= 1024`: `particleCount: 80, cityOffsetX: 0.65, cityOffsetY: -0.3, distanceScale: 1.06`; `desktop`: `particleCount: 120, cityOffsetX: 1.15, cityOffsetY: -0.32, distanceScale: 1.0`), and `getMotionFactor(prefersReducedMotion)` returning frozen constants.

- [ ] **Step 4: Run the unit tests to verify Task 1 passes**

Run: `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/heroThreeStageConfig.test.mjs`
Expected: PASS (5/5 tests pass).

- [ ] **Step 5: Commit Task 1**

```bash
git add client/src/components/heroThreeStageConfig.js client/src/components/heroThreeStageConfig.test.mjs
git commit -m "feat(client): add Living Future City tour and district state helpers"
```

---

### Task 2: Build the 3D "Living Future City" diorama and `CatmullRomCurve3` camera tour in `HeroThreeStage.jsx`

**Files:**
- Modify: `client/src/components/HeroThreeStage.jsx`

**Interfaces:**
- Consumes: `DOMAIN_ORBIT_COLORS`, `DISTRICT_LAYOUTS`, `getTourStoryState`, `getDistrictTargetState`, `getStageResponsiveConfig`, `getMotionFactor` from `./heroThreeStageConfig.js`
- Produces: `default export function HeroThreeStage({ activeDomainIndex = null })`

- [ ] **Step 1: Replace the scene in `client/src/components/HeroThreeStage.jsx` with the "Living Future City" diorama and 3-act camera rig**

Implement `HeroThreeStage({ activeDomainIndex = null })` in `client/src/components/HeroThreeStage.jsx`:
1. **Island Foundation & Energy Conduits:**
   - Create `cityGroup` positioned at `(config.cityOffsetX, config.cityOffsetY, 0)`.
   - Add a multi-tiered hexagonal/cylindrical island platform (`CylinderGeometry(3.2, 2.6, 0.28, 6)` + dark emerald metallic material `0x062019` and glowing hexagonal rim `TorusGeometry(3.15, 0.02, 8, 6)` in `0x00F5A0`).
   - For each of the 5 districts in `DISTRICT_LAYOUTS`, create a glowing radial conduit track connecting the district's `[x, 0.16, z]` to the central Royal Spire `[0, 0.16, 0]`, plus 2 moving energy pulse spheres (`SphereGeometry(0.065, 12, 12)`) that travel from the district into the central spire (`Act 2: Energy Convergence`).
2. **Central Royal Trophy Spire (`[0, 0, 0]`):**
   - Stepped golden pedestal + faceted golden spire (`ConeGeometry(0.42, 1.55, 6)` + `OctahedronGeometry(0.36, 1)` crown in `0xFB923C` / `0xEA580C`) + counter-rotating geodesic halo rings (`TorusGeometry` in `0xFDBA74`).
   - Add a horizontal **Royal Surge Shockwave Ring** (`TorusGeometry(0.55, 0.035, 12, 64)` rotated `Math.PI / 2` on X in `0xFDBA74`), which expands from scale `1` to `6.2` and fades out during `storyState.mode === 'surge'` (`Act 3: The Royal Surge`) while pulsing the central golden `PointLight`.
3. **5 Living Innovation Districts (`DISTRICT_LAYOUTS` 0–4):**
   - **District 0 (`0x00F5A0` Energy & Environment):** 3 wind turbines (tower `CylinderGeometry` + hub + 3 rotor blades that spin continuously) + 2 angled solar array panels.
   - **District 1 (`0x22C55E` Food & Smart Agriculture):** Geodesic bio-dome (`IcosahedronGeometry(0.42, 1)` wireframe + inner translucent dome) + 2 vertical hydro-towers + 2 orbiting agri-drones with downward scan cones (`ConeGeometry` with additive/transparent glow).
   - **District 2 (`0x00D9F5` Social & Digital Economy):** 4 stepped cyber-skyscrapers (`BoxGeometry`) with glowing crowns + an elevated circular sky-rail (`TorusGeometry(0.56, 0.014, 8, 48)`) with 2 moving light-train capsules orbiting along the track.
   - **District 3 (`0xFB7185` Medical Device & Healthcare):** Med-tech pavilion base + a rotating 3D double-helix DNA monument (6 paired strand nodes and connecting rungs) + a rising horizontal vitality pulse ring.
   - **District 4 (`0xF59E0B` Advanced Material & Manufacturing):** Industrial forge frame (4 pillars + top beam) + 2 articulating gantry arms + a levitating faceted crystal cube (`OctahedronGeometry(0.24, 0)`) rotating in the forge center.
4. **3-Act `CatmullRomCurve3` Camera Rig & Interactive Dive:**
   - Build a closed `cameraCurve = new THREE.CatmullRomCurve3([...], true)` and `lookAtCurve = new THREE.CatmullRomCurve3([...], true)` whose waypoints sweep low past Districts 0 ➔ 1 ➔ 2 ➔ 3 ➔ 4 during `u = 0..0.75` and rise to a sweeping panoramic city shot during `u = 0.75..1.0` (`Act 3: The Royal Surge`).
   - In `animate(timestamp)`:
     - Compute `storyState = getTourStoryState(elapsed * speedFactor, activeDomainRef.current)`.
     - If `storyState.mode === 'dive'`, set `desiredCamPos` and `desiredLookAt` from `DISTRICT_LAYOUTS[storyState.activeDistrictIndex]` (plus `cityGroup.position` and subtle pointer parallax).
     - Otherwise (`glide` or `surge`), sample `cameraCurve.getPointAt(storyState.tourProgress, desiredCamPos)` and `lookAtCurve.getPointAt(storyState.tourProgress, desiredLookAt)`, applying `config.distanceScale`, `cityGroup.position`, and pointer parallax.
     - Smoothly damp `camera.position.lerp(desiredCamPos, 0.06)` and `currentLookAt.lerp(desiredLookAt, 0.08)`, then `camera.lookAt(currentLookAt)`.
     - Update each district's machinery speed, emissive intensity, and conduit energy pulses from `getDistrictTargetState(i, storyState)`.
5. **Lifecycle & Cleanup:**
   - Maintain `ResizeObserver`, `IntersectionObserver`, `prefers-reduced-motion` listener, and complete geometry/material/timer/renderer disposal on unmount.

- [ ] **Step 2: Run unit tests, linter, and production build**

Run: `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/heroThreeStageConfig.test.mjs && npm --prefix /Users/macbook-arnon/Projects/innoaward/client run lint && npm --prefix /Users/macbook-arnon/Projects/innoaward/client run build`
Expected: 5/5 unit tests pass, `oxlint` reports 0 warnings/errors, and `vite build` succeeds cleanly.

- [ ] **Step 3: Commit Task 2**

```bash
git add client/src/components/HeroThreeStage.jsx
git commit -m "feat(client): replace spinning core with Living Future City 3D tour"
```
