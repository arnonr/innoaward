# Three.js Hero Banner — "2.5D Living Photo Shader & Network Light Pulses" Design Spec

**Date:** 2026-10-24
**Size:** Small change (focused replacement of the Three.js Hero scene in `client/src/components/HeroThreeStage.jsx`, `client/src/components/heroThreeStageConfig.js`, and its unit test `client/src/components/heroThreeStageConfig.test.mjs`)

## 1. Intent & Why
Replace the previous procedural low-poly 3D island and flying camera tour—which caused motion sickness ("เวียนหัว") and looked like an unfinished wireframe/primitive blockout ("ไม่ใช่รูปจริง ดูเหมือนงานยังไม่เสร็จ เป็นโครงๆ")—with a **stationary-camera 2.5D Living Photo Shader stage** driven by the 5 photorealistic innovation domain images (`/domain-energy.jpg`, `/domain-food.jpg`, `/domain-social.jpg`, `/domain-medical.jpg`, `/domain-material.jpg`) and domain-specific light pulse micro-animations along the actual glowing lines in each image.

## 2. Goals, Non-Goals, and Anti-Goals
- **Goals:**
  - Render the 5 real high-resolution domain images (`client/public/domain-*.jpg`) inside `HeroThreeStage.jsx` using an orthographic fullscreen `THREE.ShaderMaterial` quad with aspect-preserving `object-fit: cover` UV mapping.
  - Provide subtle **2.5D luminance-based depth parallax** in response to pointer movement and a calm breathing drift while keeping the camera 100% locked and stationary.
  - Animate **domain-specific living light pulses** directly along the glowing structures in each photograph:
    1. **01 Energy & Environment (`/domain-energy.jpg`):** Emerald-cyan energy pulses traveling along the offshore solar hexagon grid and subsea power lines toward the city skyline, plus subtle water shimmer.
    2. **02 Food & Smart Agriculture (`/domain-food.jpg`):** Bioluminescent green laser scan sweeping vertically across the hydroponic plant racks and pulsing holographic status monitors.
    3. **03 Social & Digital Economy (`/domain-social.jpg`):** High-speed cyan/gold light packets racing along the sky-network connection lines between skyscrapers and smart highway arteries.
    4. **04 Medical Device & Healthcare (`/domain-medical.jpg`):** Live ECG heartbeat wave sweeping across the left holographic diagnostic HUD and gentle pulsing on the surgical laser focal point and robotic arm rings.
    5. **05 Advanced Material & Manufacturing (`/domain-material.jpg`):** Golden-cyan atomic current flowing along the hexagonal graphene lattice bonds and carbon nanotubes.
  - **Auto-Cycle & Interactive Liquid Wave Transition:** Automatically cycle through the 5 domains every ~6 seconds when idle; when the user hovers or focuses any of the 5 domain buttons (`.editorial-category-item`, indices `0..4`), smoothly transition to that domain's living photo via a liquid-wave shader crossfade.
- **Non-Goals:**
  - No external `.glb`/`.gltf` models or extra depth-map image downloads.
  - No layout changes to the Hero text, countdown HUD, or category strip in `App.jsx`.
- **Anti-Goals:**
  - Camera flying, orbiting, or tilting that causes dizziness/motion sickness.
  - Raw geometric primitives (`BoxGeometry`, `CylinderGeometry`, `ConeGeometry`, wireframe cages) pretending to be buildings or machines.

## 3. Constraints
- **Stack:** React 19.2.8 + Vite 8.2.0 + vanilla `three` (`^0.186.1`).
- **Performance & Lifecycle:** Single draw call (`PlaneGeometry(2, 2)` + `ShaderMaterial`), pixel ratio capped at `<= 2`, `ResizeObserver` updating cover-UV aspect uniforms, `IntersectionObserver` pausing the animation loop when scrolled offscreen, `prefers-reduced-motion: reduce` support (disables pointer parallax and slows pulse speed), and full WebGL texture/material/geometry/renderer disposal on unmount.

## 4. Approaches Considered
1. **Single-Pass GLSL `ShaderMaterial` on Fullscreen Quad Extracting Luminance Depth & Line Masks from the 5 Existing Photos (Selected):**
   - *Trade-off:* Zero extra asset downloads (reuses the 5 existing `.jpg` files), runs in 1 draw call at 60 FPS, and guarantees 100% pixel-accurate alignment between traveling light pulses and the glowing network/grid lines in the photographs.
2. **Separate Pre-Authored Depth-Map and Line-Mask PNG Files per Domain (15 Textures Total):**
   - *Trade-off:* Allows hand-painted depth channels, but triples network image payload on initial page load and adds asset maintenance overhead without visual advantage for neon-lit scenes.

## 5. Agreed Design & Behavior (User Decisions)
- **Visual Direction:** Option A — 2.5D Living Photo Shader using real innovation photography with a locked, non-dizzying camera.
- **Living Photo Micro-Motion:** Add traveling light pulses inside the images themselves (such as data packets running along the network lines in `03 Social & Digital`, plus matching per-domain light motion for the other 4 domains) and automatic domain cycling when idle.
- **Technical Approach:** Approach 1 — Single-pass GLSL `ShaderMaterial` in vanilla `three`.

## 6. Left to the Builder
- Exact GLSL shader constants (wave frequency, pulse exponent, cover-UV aspect math) and helper functions in `heroThreeStageConfig.js` for transition state, auto-cycle timing, and reduced-motion factors.
