---
target: client/src/App.jsx
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 4
target_identity: "file:/Users/macbook-arnon/Projects/innoaward/client/src/App.jsx"
target_fingerprint: "sha256:c21e077f56b59ec505c535fb1bab84778a8d1398c9cae2b9245da1afa98023c7"
target_path: /Users/macbook-arnon/Projects/innoaward/client/src/App.jsx
timestamp: 2026-11-04T08-13-35Z
slug: client-src-app-jsx
---
Method: dual-agent (A: 2e844660-1eb2-4178-901b-ebcc458b8ca3 · B: 2e988add-b06b-4e62-9ab1-dc9bca6d56c3)

### Design Health Score (Nielsen's 10 Heuristics)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Missing `[🔍 ตรวจสถานะ]` in global navbar (`App.jsx:1426-1484`); "Save Draft" (`บันทึกแบบร่าง`) triggers the same final completion screen (`ยื่นผลงานเรียบร้อยแล้ว!`) as final submit (`App.jsx:3066-3077`). |
| 2 | Match System / Real World | 2 | Sci-fi military/cinema telemetry (`SCENE 00 //`, `LIVE // T-MINUS TO DEADLINE`, `HOLOGRAM STAGE`) clashes with Royal Trophy academic prestige; download buttons on `#/contact` (`App.jsx:2814-2830`) redirect to `#/guidelines` instead of downloading files. |
| 3 | User Control and Freedom | 1 | 32-second 3D camera loop (`HeroThreeStage.jsx:1300-1315`) has no Pause/Play button and yanks control back after 2.6s; saving a draft locks the form with no way to edit, and closing the modal wipes the tracking code. |
| 4 | Consistency and Standards | 1 | Hero dock exposes `06 Others` (`App.jsx:1692-1704`) which contradicts the 5 official domains and fails to match any `<option>` in `#submission-category` (`App.jsx:3114-3124`); `#/announcements` PDF buttons use `href="#"` (`App.jsx:2578`), resetting the route to Home. |
| 5 | Error Prevention | 1 | `handleSubmission` (`App.jsx:799-802`) only checks `titleTh`, allowing empty team/abstract/video submissions; required fields (`titleEn`, `advisorName`, `documentUrl`) exist in state (`App.jsx:545-556`) but have no inputs in the form; Login tab (`App.jsx:3044-3061`) has no password input. |
| 6 | Recognition Rather Than Recall | 2 | Generated tracking code (`KMUTNB-2570-XXXX` at `App.jsx:3073`) has no copy button and is not persisted in local state/storage. |
| 7 | Flexibility and Efficiency | 2 | Good domain pre-selection (`openSubmissionWithDomain`), but zero keyboard navigation or focus support for the 3D Hero stage (`HeroThreeStage.jsx:1447-1460`). |
| 8 | Aesthetic and Minimalist Design | 2 | 49 anti-pattern instances on `#/` (`12` nested-cards, `11` dark-glow, `7` undersized-ui-text, `3` tiny-text); Hero identity disappears for 25.5s of every 32s loop. |
| 9 | Error Recovery | 1 | Entering a newly generated `KMUTNB-2570-XXXX` tracking code into Status Check (`App.jsx:858-866`) fails in fallback mode because it only matches hardcoded `2569-0001`. |
| 10 | Help and Documentation | 3 | Strong structured guidelines on `#/guidelines`, but official template download buttons (`Proposal Template.docx`, `Official Guidelines.pdf`) are fake links. |
| **Total** | | **18/40** | **Poor (Major UX Overhaul Required)** |

### Design Specificity Verdict
Visually ambitious (Three.js holographic stage, GLSL shader cards, video chapter scrubbing) but conceptually fractured: wraps a Royal Trophy university competition in cyberpunk telemetry jargon (`SCENE 00 //`, `LIVE // T-MINUS`), paints a fake macOS browser window with traffic-light dots inside the 3D hologram (`HeroThreeStage.jsx:130-165`), hides the competition title and Royal Trophy for 80% of the 32-second camera loop (`HeroThreeStage.jsx:1381`), and misconfigures `--gold-*` tokens as orange (`#FDBA74` / `#FB923C` / `#EA580C` in `index.css:33-37`).

### Priority Issues
- **[P0] Broken Submission, Auth & Status Check Core Loop**: Missing inputs for `titleEn`, `advisorName`, and `documentUrl` (`App.jsx:3098-3201`); `บันทึกแบบร่าง` locks the form as submitted (`App.jsx:3203`); Status Check rejects newly generated `KMUTNB-2570-XXXX` codes (`App.jsx:858-866`); Login tab omits password input (`App.jsx:3044-3061`). Suggested: `/impeccable harden`
- **[P0] Missing Global `[🔍 ตรวจสถานะ]` Button, Fake Document Downloads & Phantom `06 Others` Domain**: Missing navbar status check button (`App.jsx:1426-1484`); `06 Others` (`App.jsx:1692-1704`) sets invalid category `'others'`; fake PDF/DOCX downloads on `#/contact` (`App.jsx:2814-2830`) and `href="#"` route-reset bug on `#/announcements` (`App.jsx:2578`). Suggested: `/impeccable clarify`
- **[P1] Hero Identity Vanishes for 80% of the Loop + Fake Browser Chrome & Unloaded Canvas Fonts**: `.sr-only` hides DOM `<h1>` (`App.jsx:1568`) while 3D overview plane hides after 6.5s (`HeroThreeStage.jsx:1381`); fake macOS traffic lights in 3D canvas (`HeroThreeStage.jsx:130-165`); unloaded canvas fonts (`Prompt`, `IBM Plex Sans Thai`); no Pause/Play button. Suggested: `/impeccable polish`
- **[P1] Mobile Horizontal Clipping of Countdown Dock & Sub-44px Touch Targets Across All Views**: `.hero-dock-digits` overflows to `right: 389px` on a `375px` screen (`14px` clipped); `.pro-nav-link` (`21px` high), mobile `.header-btn-cta` (`30px` high), `.modal-tab-btn` (`33px` high), and `.subnav-tab-btn` (`40px` high) fail 44×44px touch targets; mobile login button disappears at `<=480px` (`index.css:4899-4901`). Suggested: `/impeccable adapt`
- **[P1] Accessibility, Contrast & Typography Violations**: Missing `<h1>` on 4 routes (`#/schedule`, `#/announcements`, `#/halloffame`, `#/contact`) and skipped headings (`h1->h3`, `h2->h4`, `h3->h5`) on `#/` and `#/guidelines`; unlabeled search/select inputs on `#/announcements` and `#/halloffame`; contrast failures (`3.3:1` on `.editorial-category-index`, `4.4:1` on `.step-number`); 56 elements `<12px` (`9.28px` on `.hud-unit`); cramped `2px` vertical padding on Thai `.badge-royal`; positive `letter-spacing` on Thai text. Suggested: `/impeccable typeset`
- **[P1] 6–7 Simultaneous WebGL Contexts & Unthrottled Animation Loops**: `#/` mounts 1 Hero WebGLRenderer + 5 `DomainLivingCardBg` WebGLRenderers (+ 1 in modal = 7 total) with continuous `requestAnimationFrame` loops even when offscreen, plus `prefers-reduced-motion` still animating the 3D camera at `0.25x`. Suggested: `/impeccable optimize`
- **[P2] Visual Noise (12 Nested Cards, 11 Dark Glows on Home), Misnamed `--gold-*` Tokens & ~1,300 Lines of Dead CSS**: Card-in-card nesting across `#/` and `#/guidelines`; `--gold-*` tokens set to orange (`index.css:33-37`); 70+ inline style objects in modals; ~1,300 lines of unused prototype CSS in `index.css` and `App.css`. Suggested: `/impeccable distill`
