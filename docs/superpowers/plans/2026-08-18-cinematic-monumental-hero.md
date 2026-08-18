# Cinematic Monumental Hero Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the KMUTNB Innovation Awards 2026 Hero Banner into an unbounded Cinematic Monumental Stage with a 3D Royal Trophy Showcase, dual-accent typography, floating glass badges, and a streamlined Mission Launch Countdown HUD.

**Architecture:** Refactor the Hero Banner in `client/src/App.jsx` and `client/src/index.css` to eliminate nested box borders, apply radial vignette masking and volumetric light bloom behind the 3D trophy, and style high-contrast typography and interactive CTA buttons.

**Tech Stack:** React 19, Vite, Lucide Icons, Custom CSS Design System (Luminous Tech Sapphire).

## Global Constraints
- Strictly preserve all existing route logic and state management in `client/src/App.jsx`.
- Strict responsive support across desktop (1440px), laptop (1024px), tablet (768px), and mobile (375px).
- Zero build errors on `npm run build`.

---

### Task 1: Update App.jsx Hero Banner DOM Structure

**Files:**
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Replace Hero DOM with unbounded 3D Trophy Showcase and Mission Countdown HUD**
- [ ] **Step 2: Verify component rendering and imports**

---

### Task 2: Implement Cinematic Hero CSS Styles

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Add `.hero-cinematic-stage`, `.trophy-unbounded-wrap`, and `.trophy-unbounded-img` styles**
- [ ] **Step 2: Add `@keyframes trophyAuraGlow`, `@keyframes floatAntiGravityLeft/Right`, and `@keyframes shimmerSweep`**
- [ ] **Step 3: Add Mission Countdown HUD styles and responsive layout breakpoints**

---

### Task 3: Build Verification & Deployment

**Files:**
- Test & Verify: `client/`

- [ ] **Step 1: Run `npm run build` in `client/` to verify zero errors**
- [ ] **Step 2: Restart backend (3001) and frontend (5173) dev servers**
- [ ] **Step 3: Commit and push changes to GitHub branch `feat/luminous-bg-enhancement`**
