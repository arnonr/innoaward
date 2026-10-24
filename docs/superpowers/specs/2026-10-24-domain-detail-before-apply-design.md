# Innovation Domain Detail Before Apply Flow — Design Spec

**Date:** 2026-10-24
**Size:** Small change (focused update to `DOMAINS`, `.domain-card` interactions, and `detailDomainModal` in `client/src/App.jsx` and `client/src/App.css`)

## 1. Intent & Why
Previously, clicking any of the 5 innovation domain cards (`Energy & Environment`, `Food & Agriculture`, `Social & Economy`, `Medical Device`, `Material`) on the Home page or the Competition Guidelines page immediately opened the registration/submission portal (`openSubmissionWithDomain`). That skipped the evaluation step where prospective applicants check whether their project fits the category's scope and initial requirements. Changing the flow so clicking a category card first opens a rich Domain Detail modal—showing scope/sub-areas, initial criteria, and past winning examples—lets applicants understand the category before clicking **"สมัครประกวดในหมวดนี้"**.

## 2. Goals, Non-Goals, and Anti-Goals
- **Goals:**
  - Enrich each entry in `DOMAINS` (`client/src/App.jsx`) with structured detail fields:
    - `overview`: Expanded explanation of the domain's focus and objective.
    - `subTopics`: 3–4 bullet points detailing specific technologies, sub-fields, and problem areas covered by the domain.
    - `initialCriteria`: 3 bullet points outlining basic eligibility/readiness criteria for projects in that domain (prototype/test readiness, measurable impact in that domain, and required submission deliverables).
  - Update the 5 `.domain-card` items in both the Home view (`currentView === 'home'`) and the Guidelines view (`currentView === 'guidelines'`, `#domains`) so clicking the card or its action button (`"ดูรายละเอียดและสมัคร"`) opens `detailDomainModal(domain)` instead of jumping straight to the submission portal.
  - Upgrade `detailDomainModal` (`MODAL 4` in `client/src/App.jsx`) to display:
    1. Domain header banner, badge, English & Thai titles, and expanded `overview`.
    2. **ขอบเขตและด้านที่เกี่ยวข้อง (Scope & Sub-Topics)** list.
    3. **เกณฑ์เบื้องต้นของผลงานในหมวดนี้ (Initial Criteria)** list.
    4. **ตัวอย่างผลงานที่เคยได้รับรางวัลในหมวดนี้** (1–2 matching items filtered from `winners` / `FALLBACK_WINNERS` by `w.category === detailDomainModal.id`).
    5. Primary CTA **"สมัครประกวดในหมวดนี้"** (which closes the detail modal and calls `openSubmissionWithDomain(detailDomainModal.id)`) and secondary CTA **"ดูกติกาฉบับเต็ม"** (navigates to `#/guidelines`).
- **Non-Goals:**
  - No database schema changes or backend API modifications.
  - No changes to the actual submission form fields inside `showPortalModal`.
- **Anti-Goals:**
  - Opening the registration/submission form directly from a domain card without showing the domain details first.
  - Repeating only the single-line summary inside the detail modal without deeper scope or criteria information.

## 3. Constraints
- Must preserve existing keyboard accessibility (`Escape` to close, focus trap inside `[role="dialog"]`) and responsive layout on both desktop and mobile screens.
- Must work seamlessly with existing `openSubmissionWithDomain(domainId)` so the selected category is pre-filled when the user clicks **"สมัครประกวดในหมวดนี้"**.

## 4. Approaches Considered
1. **Approach 1 (Selected): Enrich `DOMAINS` and upgrade `detailDomainModal` in Frontend (`client/src/App.jsx`)**
   - *Trade-off:* Reuses the existing `detailDomainModal` state already wired to the Hero category strip, keeps all 3 entry points (Hero strip, Home domain cards, Guidelines domain cards) consistent, and requires zero database migrations. Content edits happen in `client/src/App.jsx` alongside the rest of the guidelines copy.
2. **Approach 2: Extend Prisma `Category` schema & backend seed (`server/prisma/schema.prisma`, `server/prisma/seed.ts`) with Frontend fallback**
   - *Trade-off:* Stores sub-topics and criteria in PostgreSQL for potential future Admin CMS editing, but adds schema migration overhead when the guidelines content is currently static per competition year.

## 5. Agreed Design & Behavior
- **Card Trigger:** Clicking a domain card or its button (`"ดูรายละเอียดและสมัคร"`) on either the Home page or the Guidelines page opens `detailDomainModal` for that domain.
- **Modal Content:** Displays the domain overview, **ขอบเขตและด้านที่เกี่ยวข้อง** (what the domain relates to / sub-areas), **เกณฑ์เบื้องต้น** (initial criteria), and **ตัวอย่างผลงานที่เคยได้รับรางวัลในหมวดนี้** (proposed addition approved during brainstorming), followed by the **"สมัครประกวดในหมวดนี้"** button.
- **Implementation Path:** Approach 1 (Frontend `DOMAINS` + `detailDomainModal`).

## 6. Left to the Builder
- Exact Thai copywriting for the `subTopics` and `initialCriteria` of each of the 5 domains (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`) and styling refinements inside `detailDomainModal`.
