# Three.js Hero Stage — "Living Future City (Cinematic Sweeping Tour)" Design Spec

**Date:** 2026-10-23
**Size:** Small change (focused replacement of the Three.js Hero scene in `client/src/components/HeroThreeStage.jsx` and `client/src/components/heroThreeStageConfig.js`)

## 1. Intent & Why
Replace the simple spinning-object Hero scene with a **purely visual, narrative-driven 3D diorama ("Living Future City — The 5-District Innovation Island")** that tells a visual story of how the 5 innovation domains power Thailand and converge into the Royal Trophy spire at the center of the city — without any floating text or captions inside the 3D scene.

## 2. Goals, Non-Goals, and Anti-Goals
- **Goals:**
  - Build a stylized futuristic 3D island diorama in `client/src/components/HeroThreeStage.jsx` with a central golden **Royal Trophy Spire** (`#FB923C` / `#FDBA74`) surrounded by 5 active, living innovation districts connected to the center by glowing energy conduits:
    1. **01 Energy & Environment (`#00F5A0`):** Rotating wind turbines and solar array towers sending energy pulses along the conduit.
    2. **02 Food & Smart Agriculture (`#22C55E`):** Geodesic bio-domes and vertical farm towers with autonomous drones orbiting and scanning crops.
    3. **03 Social & Digital Economy (`#00D9F5`):** Cyber skyscrapers and a sky-rail loop with moving light-train packets and data bridges.
    4. **04 Medical Device & Healthcare (`#FB7185`):** Med-tech research towers with a rotating 3D double-helix DNA monument and expanding pulse rings.
    5. **05 Advanced Material & Manufacturing (`#F59E0B`):** Precision assembly gantries and levitating crystalline lattice structures being forged.
  - Drive the camera along a **3-act Cinematic Sweeping Tour (`CatmullRomCurve3`)**:
    - **Act 1 — District Glide:** Camera sweeps low through the 5 districts in sequence; as the camera passes each district, its machinery accelerates.
    - **Act 2 — Energy Convergence:** Each visited district fires luminous energy pulses along its conduit road into the central Royal Trophy Spire.
    - **Act 3 — The Royal Surge:** After visiting all 5 districts, the camera pulls back and rises into a wide establishing shot while the central Royal Trophy Spire erupts with a golden shockwave ring across the city before seamlessly looping.
  - **Interactive Dive on Domain Hover/Focus:** When the user hovers or focuses any of the 5 domain buttons (`.editorial-category-item`, indices `0..4`) at the bottom of the Hero, smoothly transition the camera from the auto-tour to a close-up vantage point overlooking that specific district (and return smoothly to the tour when unhovered or when "Others" is hovered).
- **Non-Goals:**
  - No 3D text labels, HTML overlays, or captions inside the storytelling animation.
  - No external heavy `.glb`/`.gltf` model downloads.
- **Anti-Goals:**
  - Static "just spinning in place" geometry with no camera progression or narrative arc.
  - Visual clutter obscuring the left-column Hero text or frame drops/memory leaks.

## 3. Constraints
- **Stack:** React 19.2.8 + Vite 8.2.0 + vanilla `three` (`^0.186.1`).
- **Performance & Lifecycle (`threejs-fundamentals` & `threejs-performance`):**
  - `new THREE.Timer()` connected to `document`, `renderer.setAnimationLoop`, pixel ratio capped at `<= 2`, pre-allocated `THREE.Vector3` scratch objects (zero per-frame heap allocations in the render loop), `ResizeObserver`, `IntersectionObserver` offscreen pause, and complete geometry/material/renderer disposal on unmount.
- **Responsive & Accessibility:**
  - Mobile (`<= 768px`) scales down ambient particle count and adjusts camera framing; `prefers-reduced-motion: reduce` slows the tour to a gentle overview without rapid camera swoops.

## 4. Approaches Considered
1. **Procedural 3D City Diorama & `CatmullRomCurve3` Camera Rig in Vanilla `three` (Selected):**
   - *Trade-off:* Requires building stylized architectural primitives and spline paths in code, but loads instantaneously (0 MB external assets), runs at 60 FPS, and gives 100% programmatic control over each district's machinery, energy pulses, and camera transitions.
2. **External Pre-Modeled City Asset (`.glb` / `.gltf`) via `GLTFLoader`:**
   - *Trade-off:* Allows external 3D DCC modeling, but introduces multi-megabyte network loading delays and makes per-domain interactive lighting/machinery harder to customize.

## 5. Agreed Design & Behavior (User Decisions)
- **Concept:** Option 2 — "Living Future City (Camera Fly-Through)" with pure visual storytelling (no text or captions in the story).
- **Camera & Narrative Arc:** Combined "Cinematic Sweeping Tour" (District Glide through the 5 zones ➔ Energy Convergence into the central Royal Spire ➔ Wide Royal Surge climax, plus interactive camera dive to a specific district when hovering/focusing a domain button in the bottom strip).
- **Technical Approach:** Approach 1 — Procedural 3D Diorama & `CatmullRomCurve3` Camera Rig in vanilla `three`.

## 6. Left to the Builder
- Exact spline waypoint coordinates for the 5 districts, wide climax vantage point, and per-district hover camera targets (`getDistrictCameraPose`, `getTourPhaseState`).
- Geometry proportions for the 5 district landmarks, energy conduit pulse interpolation, and golden surge shockwave animation.
