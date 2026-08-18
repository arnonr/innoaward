# Design Document: Cinematic Monumental Hero Banner (KMUTNB Innovation Awards 2026)

Date: 2026-08-18  
Status: Approved  

---

## 1. Executive Summary

Transform the KMUTNB Innovation Awards 2026 Hero Banner from a standard, boxed 2-column layout into an unconstrained, high-impact **Cinematic Monumental Stage**. The centerpiece is an unbounded 3D Royal Trophy with radiant volumetric light bloom, floating glass achievement capsules, and a streamlined Mission Launch Countdown HUD.

---

## 2. Visual Architecture & Layout

### 2.1 Unbounded 3D Royal Trophy Centerpiece (Right Column)
- **Zero Box Cliché:** Remove solid card borders and nested frames. The 3D Royal Trophy asset (`/royal-trophy-3d.jpg`) is seamlessly integrated with radial vignette masking (`mask-image: radial-gradient(...)`) and volumetric backlighting.
- **Volumetric Ambient Light Bloom:** Multi-stop radial glow (`#F59E0B` gold and `#38BDF8` cyan) positioned behind the trophy to generate depth and spatial scale.
- **Anti-Gravity Floating Glass Badges:**
  - `👑 ถ้วยพระราชทานฯ สมเด็จพระเทพฯ` (top-left)
  - `💰 300,000+ บาท เงินรางวัลรวม` (top-right)
  - `🏆 Grand Prize & โล่เกียรติยศ` (bottom-left)
  - `🎓 2 ระดับการศึกษาทั่วประเทศ` (bottom-right)
  Each badge floats gently with staggered keyframe vertical translation (`translateY(-5px)` to `translateY(5px)`).

### 2.2 Dual-Accent Typography & Mission Launch HUD (Left Column)
- **Royal Honor Ribbon:** Golden glass pill with crown icon and shimmering gold border.
- **Monumental Headline:**
  - `KMUTNB` in 8K crisp metallic white.
  - `INNOVATION` in solid luminous Electric Cyan (`#38BDF8`).
  - `AWARDS 2026` in warm Royal Amber Gold (`#FBBF24`).
- **Mission Launch Countdown HUD:**
  - Sleek, ultra-thin frosted glass strip (`backdrop-filter: blur(20px)`).
  - High-contrast digital clock digits (`#FFFFFF` and `#FCD34D`) with pulsing colon separators.
  - Status indicator badge: `🟢 OPEN FOR SUBMISSION`.
- **CTA Actions:**
  - Primary CTA: `[ 🚀 สมัครเข้าร่วมประกวด (Submit Entry) ]` with continuous animated light sweep (`shimmerSweep` keyframe).
  - Secondary CTA: `[ 📖 ดูรายละเอียดการแข่งขัน ]` with frosted glass styling.

---

## 3. Technical Implementation Details

### 3.1 Files Modified
- `client/src/App.jsx`: Hero Banner DOM structure, unboxed 3D trophy container, floating chips, and streamlined HUD.
- `client/src/index.css`: CSS styles for `.hero-cinematic-stage`, `.trophy-unbounded-wrap`, `.trophy-unbounded-img`, `.floating-glass-pill`, `.hero-mission-hud`, and `@keyframes shimmerSweep`.

### 3.2 Verification Plan
- Verify clean build (`npm run build` in `client/`).
- Verify visual aesthetics on desktop (1440px), laptop (1024px), tablet (768px), and mobile (375px).
- Verify interactive states (button hover, modal triggers, navigation).
