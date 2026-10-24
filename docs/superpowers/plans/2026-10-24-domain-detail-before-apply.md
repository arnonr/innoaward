# Innovation Domain Detail Before Apply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a rich Innovation Domain Detail modal (covering scope/sub-topics, initial criteria, and sample past winning works) whenever a user clicks any of the 5 domain cards before entering the registration/submission portal.

**Architecture:** Extract the structured 5-domain catalog and pure helper functions (`DOMAIN_CATALOG`, `getDomainById`, `getDomainSampleWinners`) into `client/src/components/domainCatalog.js` with unit tests in `client/src/components/domainCatalog.test.mjs`. Wire `client/src/App.jsx` so `.domain-card` elements in both the Home view and Guidelines view open `detailDomainModal(domain)` first, and upgrade `detailDomainModal` to render the domain overview, sub-topics, initial criteria, sample winners, and the `"สมัครประกวดในหมวดนี้"` CTA that hands off to `openSubmissionWithDomain(domain.id)`.

**Tech Stack:** React 19.2.8, Vite 8.2.0, Lucide React (`^1.31.0`), Node.js built-in test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-10-24-domain-detail-before-apply-design.md`

## Global Constraints

- **No Backend/Schema Changes:** Keep all changes on the frontend (`client/src/components/domainCatalog.js`, `client/src/components/domainCatalog.test.mjs`, `client/src/App.jsx`, `.gitignore`).
- **Pre-filled Category Handoff:** Clicking `"สมัครประกวดในหมวดนี้"` inside `detailDomainModal` must close `detailDomainModal` and invoke `openSubmissionWithDomain(detailDomainModal.id)` so the submission form opens with `subForm.category` pre-set to that domain.
- **Accessibility & Keyboard Support:** Preserve `role="dialog"`, `aria-modal="true"`, `aria-labelledby="domain-modal-title"`, `Escape` key closing, and focus management when `detailDomainModal` is open.
- **Consistent Entry Points:** All 3 domain entry points—the Hero category strip (`.editorial-category-item`), the Home page `.domain-card` grid, and the Competition Guidelines (`#domains`) `.domain-card` grid—must open the same upgraded `detailDomainModal`.

## Review Focus

1. **Unknown, empty, or non-string `domainId` (`null`, `undefined`, `''`, `'others'`):** `getDomainById` must safely return `null` instead of throwing, and `getDomainSampleWinners` must return `[]`.
2. **Empty, `null`, or malformed `winnersList` passed to `getDomainSampleWinners`:** When the API returns `[]`, `null`, or items missing `category`, `getDomainSampleWinners` must return a safe array without throwing a `TypeError`.
3. **Zero, negative, or non-finite `limit` in `getDomainSampleWinners`:** `getDomainSampleWinners(domainId, winnersList, 0)` or `limit = -1` / `NaN` must clamp cleanly and return `[]` instead of slicing from the end of the array.
4. **Clicking `"ดูรายละเอียดและสมัคร"` button inside a clickable `.domain-card`:** Event propagation or single-handler wiring must not double-toggle or fail to open `detailDomainModal(domain)`.
5. **Transition from `detailDomainModal` to `selectedWinnerModal` or `showPortalModal`:** Clicking `"สมัครประกวดในหมวดนี้"` (or clicking a sample winner inside the domain modal) must close `detailDomainModal` (`setDetailDomainModal(null)`) before opening the next modal so two `.modal-overlay` dialogs are never stacked simultaneously.

---

### Task 1: Structured 5-Domain Catalog & Winner Filtering Helpers

**Files:**
- Create: `client/src/components/domainCatalog.js`
- Test: `client/src/components/domainCatalog.test.mjs`

**Interfaces:**
- Produces:
  - `DOMAIN_CATALOG: ReadonlyArray<{ id: string, indexLabel: string, nameTh: string, nameEn: string, titleTh: string, titleEn: string, desc: string, overview: string, subTopics: ReadonlyArray<{ title: string, detail: string }>, initialCriteria: ReadonlyArray<{ title: string, detail: string }>, color: string, bgImage: string }>`
  - `getDomainById(domainId: string | null | undefined) -> object | null`
  - `getDomainSampleWinners(domainId: string | null | undefined, winnersList: ReadonlyArray<object> | null | undefined, limit?: number) -> Array<object>`

- [ ] **Step 1: Write the failing unit tests in `client/src/components/domainCatalog.test.mjs`**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_CATALOG,
  getDomainById,
  getDomainSampleWinners,
} from './domainCatalog.js';

test('DOMAIN_CATALOG defines all 5 innovation domains with overview, subTopics, and initialCriteria', () => {
  assert.equal(DOMAIN_CATALOG.length, 5);
  assert.deepEqual(
    DOMAIN_CATALOG.map((d) => d.id),
    [
      'energy_environment',
      'food_agriculture',
      'social_economy',
      'medical_device',
      'material',
    ]
  );

  for (const domain of DOMAIN_CATALOG) {
    assert.equal(typeof domain.indexLabel, 'string');
    assert.equal(domain.overview.length > domain.desc.length, true);
    assert.equal(Array.isArray(domain.subTopics) && domain.subTopics.length >= 3, true);
    assert.equal(Array.isArray(domain.initialCriteria) && domain.initialCriteria.length >= 3, true);
    for (const topic of domain.subTopics) {
      assert.equal(Boolean(topic.title && topic.detail), true);
    }
    for (const criterion of domain.initialCriteria) {
      assert.equal(Boolean(criterion.title && criterion.detail), true);
    }
  }
});

test('getDomainById returns matching domain object or null for unknown/invalid ids', () => {
  const energy = getDomainById('energy_environment');
  assert.equal(energy?.titleTh, 'พลังงานและสิ่งแวดล้อม');
  assert.equal(getDomainById('others'), null);
  assert.equal(getDomainById(''), null);
  assert.equal(getDomainById(null), null);
  assert.equal(getDomainById(undefined), null);
});

test('getDomainSampleWinners filters winners by category and handles invalid inputs or limits safely', () => {
  const mockWinners = [
    { id: 'w1', category: 'energy_environment', titleTh: 'งานพลังงาน 1' },
    { id: 'w2', category: 'medical_device', titleTh: 'งานแพทย์ 1' },
    { id: 'w3', category: 'energy_environment', titleTh: 'งานพลังงาน 2' },
    { id: 'w4', category: 'energy_environment', titleTh: 'งานพลังงาน 3' },
    null,
    {},
  ];

  const topTwo = getDomainSampleWinners('energy_environment', mockWinners, 2);
  assert.equal(topTwo.length, 2);
  assert.deepEqual(topTwo.map((w) => w.id), ['w1', 'w3']);

  assert.deepEqual(getDomainSampleWinners('energy_environment', mockWinners, 0), []);
  assert.deepEqual(getDomainSampleWinners('energy_environment', mockWinners, -3), []);
  assert.deepEqual(getDomainSampleWinners('energy_environment', mockWinners, Number.NaN), []);
  assert.deepEqual(getDomainSampleWinners('energy_environment', null, 2), []);
  assert.deepEqual(getDomainSampleWinners(null, mockWinners, 2), []);
});
```

- [ ] **Step 2: Run the unit tests to verify they fail**

Run: `node --test client/src/components/domainCatalog.test.mjs`
Expected: FAIL (`Cannot find module './domainCatalog.js'`).

- [ ] **Step 3: Implement `DOMAIN_CATALOG`, `getDomainById`, and `getDomainSampleWinners` in `client/src/components/domainCatalog.js`**

Create `client/src/components/domainCatalog.js` exporting:
- `DOMAIN_CATALOG`: frozen array of the 5 domains (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`) preserving existing `nameTh`, `nameEn`, `titleTh`, `titleEn`, `desc`, `color`, `bgImage` values from `client/src/App.jsx:82-138`, and adding:
  - `indexLabel`: `'DOMAIN 01'` through `'DOMAIN 05'`
  - `overview`: detailed 2-sentence Thai description of the category's mission and scope
  - `subTopics`: 3 `{ title, detail }` items per domain covering specific sub-areas and technologies:
    - `energy_environment`: พลังงานหมุนเวียนและพลังงานสะอาด, การจัดการและอนุรักษ์พลังงานอัจฉริยะ, สิ่งแวดล้อมและเศรษฐกิจหมุนเวียน (Net Zero)
    - `food_agriculture`: เกษตรอัจฉริยะและแม่นยำสูง (Smart & Precision AgriTech), การแปรรูปอาหารและอาหารแห่งอนาคต (Future Food), ระบบจัดการหลังการเก็บเกี่ยวและความมั่นคงทางอาหาร
    - `social_economy`: แพลตฟอร์มดิจิทัลและปัญญาประดิษฐ์เพื่อเศรษฐกิจ/บริการ, เทคโนโลยีการศึกษาและการเรียนรู้ (EdTech), นวัตกรรมยกระดับคุณภาพชีวิตและพัฒนาชุมชนเมือง/ท้องถิ่น
    - `medical_device`: เครื่องมือตรวจวินิจฉัยและคัดกรองโรคอัจฉริยะ, อุปกรณ์การแพทย์ ชีววัสดุ และกายอุปกรณ์ฟื้นฟูสมรรถภาพ, ระบบดิจิทัลเฮลท์และการดูแลผู้สูงอายุ (HealthTech & Telemedicine)
    - `material`: วัสดุคอมโพสิต พอลิเมอร์ และวัสดุชีวภาพขั้นสูง, สารเคลือบผิวพิเศษและนาโนเทคโนโลยี (Functional Coatings & Nano), วัสดุเพื่ออุตสาหกรรมความร้อน วิศวกรรม และวัสดุรีไซเคิลมูลค่าสูง
  - `initialCriteria`: 3 `{ title, detail }` items per domain covering:
    1. `ความพร้อมของชิ้นงานต้นแบบ (Prototype Readiness)`: domain-appropriate requirement for working prototype, lab test results, or functional system demo
    2. `ผลลัพธ์และผลกระทบที่วัดผลได้ (Measurable Impact)`: domain-specific impact metric (e.g., energy/carbon reduction, yield/shelf-life improvement, user/community benefit, clinical/safety validation, material property test standards)
    3. `เอกสารและสื่อที่ใช้ยื่นสมัคร (Submission Deliverables)`: ข้อเสนอโครงการ (Proposal PDF ไม่เกิน 10 หน้า A4) และลิงก์คลิปวิดีโอสาธิตการทำงาน 2–3 นาที
- `getDomainById(domainId)`: returns the matching domain from `DOMAIN_CATALOG` or `null` if not a non-empty string or not found.
- `getDomainSampleWinners(domainId, winnersList, limit = 2)`: returns `[]` if `typeof domainId !== 'string' || !domainId || !Array.isArray(winnersList) || !Number.isFinite(limit) || limit <= 0`; otherwise filters `winnersList` for truthy objects with `w.category === domainId` and slices `0..Math.floor(limit)`.

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `node --test client/src/components/domainCatalog.test.mjs`
Expected: PASS (3 passing tests).

- [ ] **Step 5: Commit Task 1**

```bash
git add client/src/components/domainCatalog.js client/src/components/domainCatalog.test.mjs
git commit -m "feat(client): add structured domain catalog and sample winner helpers"
```

---

### Task 2: Domain Card Click Flow & Upgraded `detailDomainModal` in `App.jsx`

**Files:**
- Modify: `client/src/App.jsx:81-139`, `client/src/App.jsx:1252-1281`, `client/src/App.jsx:1636-1662`, `client/src/App.jsx:2895-2970`
- Modify: `.gitignore`

**Interfaces:**
- Consumes from `client/src/components/domainCatalog.js`:
  - `DOMAIN_CATALOG`
  - `getDomainSampleWinners`

- [ ] **Step 1: Wire `DOMAIN_CATALOG`, `.domain-card` triggers, and the upgraded `detailDomainModal` in `client/src/App.jsx` (and ignore `.superpowers/` in `.gitignore`)**

1. In `.gitignore`, append `.superpowers/` under `# System & IDE files`.
2. In `client/src/App.jsx`:
   - Import `{ DOMAIN_CATALOG, getDomainSampleWinners }` from `./components/domainCatalog`.
   - Build `DOMAINS` from `DOMAIN_CATALOG` by mapping `id` to its Lucide icon (`energy_environment: Zap`, `food_agriculture: Leaf`, `social_economy: Users`, `medical_device: Activity`, `material: Box`).
   - In both `.domains-grid` sections (Home page `lines 1252-1281` and Guidelines page `lines 1636-1662`):
     - Make `.domain-card` open `setDetailDomainModal(domain)` on click (`onClick={() => setDetailDomainModal(domain)}`, `style={{ cursor: 'pointer' }}`).
     - Update `.domain-card-btn` so its `onClick` calls `e.stopPropagation(); setDetailDomainModal(domain);` and change the button label from `"สมัครประกวด"` to `"ดูรายละเอียดและสมัคร"`.
   - In `MODAL 4: DOMAIN DETAIL MODAL` (`detailDomainModal` block around `lines 2895-2970`), widen `maxWidth` to `'720px'` and render:
     - Top image banner with `detailDomainModal.indexLabel || 'INNOVATION DOMAIN'` badge and `detailDomainModal.titleEn`.
     - `<h2 id="domain-modal-title">{detailDomainModal.titleTh}</h2>` and `<p>{detailDomainModal.overview || detailDomainModal.desc}</p>`.
     - **ขอบเขตและด้านที่เกี่ยวข้อง (Scope & Sub-Topics)** card listing `detailDomainModal.subTopics` (`topic.title` + `topic.detail`).
     - **เกณฑ์เบื้องต้นของผลงานในหมวดนี้ (Initial Criteria)** card listing `detailDomainModal.initialCriteria` (`item.title` + `item.detail`).
     - **ตัวอย่างผลงานที่เคยได้รับรางวัลในหมวดนี้** card using `getDomainSampleWinners(detailDomainModal.id, winners.length > 0 ? winners : FALLBACK_WINNERS, 2)` — each item displays its title, year, and award name, and clicking it closes `detailDomainModal` (`setDetailDomainModal(null)`) and opens `setSelectedWinnerModal(w)`.
     - Action footer with:
       - Primary CTA button (`btn-solid-primary`): **"สมัครประกวดในหมวดนี้"** (calls `const targetId = detailDomainModal.id; setDetailDomainModal(null); openSubmissionWithDomain(targetId);`)
       - Secondary CTA button (`btn-outline-cyan`): **"ดูกติกาฉบับเต็ม"** (calls `setDetailDomainModal(null); navigateTo('guidelines', 'domains');`)

- [ ] **Step 2: Run all unit tests, linter, and production build**

Run: `node --test client/src/components/*.test.mjs && npm --prefix client run lint && npm --prefix client run build`
Expected: All unit tests PASS, `oxlint` reports 0 errors, and `vite build` succeeds.

- [ ] **Step 3: Commit Task 2**

```bash
git add .gitignore client/src/App.jsx
git commit -m "feat(client): show domain details and criteria before opening apply modal"
```
