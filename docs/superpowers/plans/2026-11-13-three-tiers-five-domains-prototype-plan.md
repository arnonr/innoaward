# 3-Tier Competition Levels (`CompetitionYearLevel`), 5 Innovation Domains & Prototype Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand KMUTNB Innovation Awards 2027 (ประจำปี 2570) to 3 year-scoped competition tiers (`255,000` THB total across Royal Trophy and KMUTNB Trophies), replace the active 5 innovation categories with the new official 2570 domains (๑–๕), and enforce a mandatory Prototype confirmation gate while preserving 2569 Hall of Fame history.

**Architecture:** Introduce a `CompetitionYearLevel` Prisma model parallel to `CompetitionYearCategory` so each `CompetitionYear` owns its active tiers, trophy titles (`isRoyalTrophy`), prototype rules, and `prizeBreakdown` JSON. Expose year-aware tier/prize data through `/api/config` and `/api/masters`, validate active year levels and prototype confirmation in `/api/submissions`, update the 5-slot Three.js domain showcase with two newly generated domain visuals, and render dynamic 3-tier Guidelines/Prizes and submission controls in React.

**Tech Stack:** Bun, Elysia.js, TypeScript, Prisma (`postgresql`), React 19, Vite, Three.js, `bun test`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-13-three-tiers-five-domains-prototype-design.md`

## Global Constraints

- Total 2570 prize pool is `255,000` THB across `18` awards (`6` per tier): `general_public` (`105,000` THB, `ถ้วยพระราชทานฯ`, `isRoyalTrophy: true`), `higher_education` (`75,000` THB, `ถ้วยรางวัล มจพ.`, `isRoyalTrophy: false`), `below_higher` (`75,000` THB, `ถ้วยรางวัล มจพ.`, `isRoyalTrophy: false`).
- Never mention plaques (`โล่` / `โล่รางวัล`) in any prize, announcement, or dossier text.
- All 3 tiers in 2570 require a minimum working/testable Prototype (`ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)`).
- Draft saves (`isDraft: true`) require only `titleTh` on the client (plus `category` and `educationLevel` on API) and must never fail when `hasPrototypeConfirmed` is `false`.
- Historical year `2569` must retain its 2 historical levels (`higher_and_above`, `below_higher`), `180,000` THB prize pool, and 5 historical categories (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`) with zero label mutation on `KMUTNB-2569-0001`..`0006`.
- Active 2570 categories are strictly the 5 official domains (`agri_food`, `health_medtech`, `engineering_ai`, `energy_env_material_bcg`, `quality_of_life_soft_power` in order `1..5`); do not auto-append `others` to 2570 submission choices.
- Maintain 5 WebGL domain slots (`0..4`), `prefers-reduced-motion`, WCAG AA contrast, and zero `letter-spacing` on Thai copy.

## Review Focus

1. **Draft save (`isDraft: true`) while `hasPrototypeConfirmed` is `false`:** Both `validateSubmissionStep(form, step, true)` and `POST /api/submissions` (`isDraft: true`) must succeed without requiring the Step 3 prototype checkbox. *(Pinned in Task 3 & Task 5)*
2. **Hydrating an already-submitted (`status !== 'DRAFT'`) record into the edit form:** Because `Submission` does not store a DB boolean column for the Soft Gate, `hydrateSubmissionFormFromServer` must set `hasPrototypeConfirmed: true` when `status !== 'DRAFT'` and `false` when `status === 'DRAFT'`. *(Pinned in Task 5)*
3. **Querying historical `?year=2569` on `GET /api/config` and `GET /api/winners?year=2569`:** Must return `totalPrizePool: 180000`, 2 levels (`higher_and_above`, `below_higher`), and 2569's original category names on all 6 winners without leaking 2570's `255,000` THB or renaming 2569 winner categories. *(Pinned in Task 1 & Task 2)*
4. **Contestant submitting to year `2570` with legacy `educationLevel: "higher_and_above"`:** `POST /api/submissions` must reject with HTTP `400` because `higher_and_above` is not an active `CompetitionYearLevel` for 2570. *(Pinned in Task 3)*
5. **Admin awarding `GRAND_WINNER` to `higher_education` or `below_higher` vs `general_public`:** Champion result/badge text must resolve to `ถ้วยรางวัล มจพ.` when `isRoyalTrophy === false` and `ถ้วยพระราชทานฯ` only when `isRoyalTrophy === true`. *(Pinned in Task 3 & Task 5)*

---

## File Map

- **Create:** `server/src/modules/config/competition-defaults.ts` — Canonical TypeScript definitions for 2570 & 2569 tier structures (`PrizeBreakdownItem`, `YearLevelSeedSpec`), 5 official 2570 categories (full Thai copy ๑–๕), and helper formatters shared by `seed.ts` and `config.controller.ts`.
- **Modify:** `server/prisma/schema.prisma` — Add `CompetitionYearLevel` model and relations on `CompetitionYear`, `EducationLevel`, and `Submission`.
- **Modify:** `server/prisma/seed.ts` — Upsert 4 master `EducationLevel` rows (`general_public`, `higher_education`, `below_higher` active; `higher_and_above` inactive), 10 master `Category` rows (5 active 2570 + 5 inactive 2569), year-scoped `CompetitionYearCategory` and `CompetitionYearLevel` bindings for `2570` vs `2569`..`2566`, and `255,000 บาท` in the 2570 opening announcement.
- **Modify:** `server/src/modules/config/config.controller.ts` — Year-scoped `levels` in `GET /api/config`, dynamic `totalPrizePool`/`totalAwardCount`/`prizes`, new `POST /api/config/levels`, and cloning `CompetitionYearLevel` in `POST /api/config/years`.
- **Modify:** `server/src/modules/masters/masters.controller.ts` — Add `GET /api/masters/years/:year/levels`.
- **Modify:** `server/src/modules/auth/auth.controller.ts` — Fallback default `educationLevel` to `general_public` while still resolving `higher_education`, `below_higher`, and legacy `higher_and_above`.
- **Modify:** `server/src/modules/submissions/submissions.schema.ts`, `submissions.controller.ts`, `dossier-utils.ts` — Add `hasPrototypeConfirmed`, validate active `CompetitionYearLevel` for the target year, link `competitionYearLevelId`, and include `isRoyalTrophy`/`trophyShortTh` in dossier responses.
- **Modify:** `server/src/modules/judging/judging.controller.ts` — Include `isRoyalTrophy`/`trophyShortTh` in judging queue responses, derive trophy-accurate `GRAND_WINNER` defaults, and update `ROUND_3` publish copy.
- **Modify:** `server/tests/winners-announcements.test.ts`, `masters.test.ts`, `auth.test.ts`, `submissions.test.ts`, `judging.test.ts`, `uploads.test.ts` — Update and expand backend test suites.
- **Create:** `client/public/domain-engineering.jpg`, `client/public/domain-softpower.jpg` — Cohesive 16:9 visuals for Domain 3 and Domain 5.
- **Modify:** `client/src/components/domainCatalog.js`, `heroThreeStageConfig.js`, `HeroThreeStage.jsx` (+ `.test.mjs` files) — 5 new domains, `relatedCategoryIds` winner lookup, shader colors/photos, and `255,000 THB` / 3-tier / Prototype HUD copy.
- **Modify:** `client/src/components/submissionDossierUtils.js` (+ `submissionDossierUtils.test.mjs`), `client/src/App.jsx`, `client/src/App.css`, `CONTEXT.md`, `PRODUCT.md` — Dynamic 3-tier Guidelines & Prizes UI, Step 3 `hasPrototypeConfirmed` gate, Hall of Fame/Judging multi-year filters, Admin level setup form, and documentation sync.

---

### Task 1: Prisma `CompetitionYearLevel` Schema & Year-Scoped Seed Data (`2569` vs `2570`)

**Files:**
- Create: `server/src/modules/config/competition-defaults.ts`
- Modify: `server/prisma/schema.prisma:59-235`
- Modify: `server/prisma/seed.ts`
- Test: `server/tests/winners-announcements.test.ts`

**Interfaces:**
- Produces in `server/src/modules/config/competition-defaults.ts`:
  - `export interface PrizeBreakdownItem { tier: 'GRAND_WINNER' | 'RUNNER_UP_1' | 'RUNNER_UP_2' | 'HONORABLE_MENTION'; labelTh: string; count: number; amountEach: number; totalAmount: number; honorTextTh: string; }`
  - `export const PROTOTYPE_RULE_TH = 'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)';`
  - `export const LEVELS_2570_DEFAULTS` (3 items: `general_public`, `higher_education`, `below_higher` with exact spec values from Spec §5.1)
  - `export const LEVELS_2569_DEFAULTS` (2 items: `higher_and_above`, `below_higher` with `105000` / `75000` and `isRoyalTrophy: true`)
  - `export const CATEGORIES_2570_DEFAULTS` (5 items: `agri_food`, `health_medtech`, `engineering_ai`, `energy_env_material_bcg`, `quality_of_life_soft_power` with full official Thai paragraphs ๑–๕ from Spec §5.2)
  - `export function formatLevelPrizeSummaryLine(level: { prizeBreakdown?: unknown; trophyShortTh?: string }): string`
- Produces in Prisma Client: `prisma.competitionYearLevel`, `Submission.competitionYearLevelId`.

- [ ] **Step 1: Update `server/tests/winners-announcements.test.ts` with failing assertions for 2570 announcement & 2569 preservation**

Update `openingAnn` expectation in `server/tests/winners-announcements.test.ts` and add a test verifying 2569 winners keep their historical level/category labels while `CompetitionYearLevel` rows exist for both `2570` (3 rows) and `2569` (2 rows):

```ts
expect(openingAnn.abstract).toContain("255,000 บาท");
expect(openingAnn.abstract).toContain("3 ประเภท");
```

```ts
test("Year 2569 winners preserve historical category and educationLevel labels while 2570 has 3 CompetitionYearLevels", async () => {
  const res = await app.handle(new Request("http://localhost/api/winners?year=2569"));
  const json = await res.json();
  const osse = json.data.find((w: any) => w.trackingCode === "KMUTNB-2569-0001");
  expect(osse.category).toBe("medical_device");
  expect(osse.educationLevel).toBe("higher_and_above");
  expect(osse.educationLevelNameTh).toBe("ระดับอุดมศึกษาและบุคคลทั่วไป");

  const y2570 = await prisma.competitionYear.findUnique({
    where: { year: 2570 },
    include: { levels: true, categories: { where: { isActive: true } } },
  });
  expect(y2570?.levels.filter((l) => l.isActive).length).toBe(3);
  expect(y2570?.categories.length).toBe(5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/winners-announcements.test.ts`
Expected: FAIL (`levels` does not exist on `CompetitionYear` / `openingAnn.abstract` still has `180,000 บาท`).

- [ ] **Step 3: Add `CompetitionYearLevel` to `server/prisma/schema.prisma` and push schema**

Add `CompetitionYearLevel` exactly as specified in Spec §5.3 (`customNameTh`, `customNameEn`, `customEligibleTh`, `trophyTitleTh`, `trophyShortTh`, `isRoyalTrophy`, `totalPrizeAmount`, `prizeBreakdown`, `requiresPrototype`, `prototypeRuleTh`, `isActive`, `orderIndex`, `@@unique([competitionYearId, educationLevelId])`, `@@map("competition_year_levels")`), add `levels CompetitionYearLevel[]` to `CompetitionYear`, `yearLevels CompetitionYearLevel[]` to `EducationLevel`, and `competitionYearLevelId String?` + `competitionYearLevel CompetitionYearLevel?` to `Submission`. Run:
`cd /Users/macbook-arnon/Projects/innoaward/server && bunx prisma db push && bunx prisma generate`

- [ ] **Step 4: Create `server/src/modules/config/competition-defaults.ts` and update `server/prisma/seed.ts`**

Implement `competition-defaults.ts` with exact Spec §5.1–5.2 values, then update `seed.ts`:
- Upsert `EducationLevel` rows: `general_public` (`orderIndex: 1, isActive: true`), `higher_education` (`orderIndex: 2, isActive: true`), `below_higher` (`orderIndex: 3, isActive: true`), and legacy `higher_and_above` (`orderIndex: 4, isActive: false`, `nameTh: 'ระดับอุดมศึกษาและบุคคลทั่วไป'`).
- Upsert the 5 new 2570 `Category` rows (`isActive: true`, `orderIndex: 1..5`) and mark the 5 legacy 2569 `Category` rows (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`) as `isActive: false` globally while keeping them bound (`isActive: true`) in `CompetitionYearCategory` for years `2569`, `2568`, `2567`, `2566`. For year `2570`, bind ONLY the 5 new categories (`isActive: true`) and set any previously bound legacy categories on `2570` to `isActive: false`.
- Upsert `CompetitionYearLevel` rows: bind the 3 `LEVELS_2570_DEFAULTS` to `2570` (`isActive: true`) and set `higher_and_above` on `2570` (if present) to `isActive: false`; bind the 2 `LEVELS_2569_DEFAULTS` to `2569`..`2566` (`isActive: true`) and link `competitionYearLevelId` on the 6 seeded 2569 winners.
- Update default seeded users (`admin`, `judge`, `contestant`) to use `general_public` (or `higher_education`), and update the 2570 `GENERAL` announcement abstract to mention `3 ประเภทการแข่งขัน`, `5 หมวดหมู่`, `ถ้วยพระราชทานฯ ถ้วยรางวัล มจพ.`, and `เงินรางวัลรวม 255,000 บาท`.
- Run `cd /Users/macbook-arnon/Projects/innoaward/server && bun run seed`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/winners-announcements.test.ts`
Expected: PASS (all tests in `winners-announcements.test.ts` pass).

- [ ] **Step 6: Commit**

```bash
git -C /Users/macbook-arnon/Projects/innoaward add server/prisma/schema.prisma server/prisma/seed.ts server/src/modules/config/competition-defaults.ts server/tests/winners-announcements.test.ts
git -C /Users/macbook-arnon/Projects/innoaward commit -m "feat(db): add CompetitionYearLevel schema and seed 2570 3-tier & 5-domain rules"
```

---

### Task 2: Multi-Year Levels, Categories & Rollover Endpoints (`/api/config` & `/api/masters`)

**Files:**
- Modify: `server/src/modules/config/config.controller.ts`
- Modify: `server/src/modules/masters/masters.controller.ts`
- Modify: `server/src/modules/auth/auth.controller.ts`
- Test: `server/tests/masters.test.ts`, `server/tests/auth.test.ts`

**Interfaces:**
- Consumes: `LEVELS_2570_DEFAULTS`, `PROTOTYPE_RULE_TH`, `formatLevelPrizeSummaryLine` from `server/src/modules/config/competition-defaults.ts`.
- Produces HTTP contracts:
  - `GET /api/config?year=YYYY` -> `{ event, rubricConfig, years, categories, educationLevels: Array<{ id, code, educationLevelId, nameTh, nameEn, eligible, trophyTitleTh, trophyShortTh, isRoyalTrophy, totalPrizeAmount, requiresPrototype, prototypeRuleTh, prizeBreakdown }>, totalPrizePool: number, totalAwardCount: number, prizes: Array<{ rank: string, title: string }> }`
  - `POST /api/config/levels` (Admin Only) -> body `{ year?: number, code: string, nameTh: string, nameEn?: string, eligibleTh?: string, trophyTitleTh?: string, trophyShortTh?: string, isRoyalTrophy?: boolean, totalPrizeAmount?: number, prizeBreakdown?: any[], requiresPrototype?: boolean, isActive?: boolean, orderIndex?: number }`
  - `GET /api/masters/years/:year/levels` -> `{ success: true, data: CompetitionYearLevel[] }`

- [ ] **Step 1: Write failing tests in `server/tests/masters.test.ts` and `server/tests/auth.test.ts`**

Update `server/tests/masters.test.ts` to assert:
- `GET /api/masters/education-levels` returns `3` active levels (`general_public`, `higher_education`, `below_higher`).
- `GET /api/masters/years/2570/levels` returns `3` year-scoped levels and `GET /api/masters/years/2569/levels` returns `2` year-scoped levels (`higher_and_above`, `below_higher`).
- `GET /api/masters/years/2570/categories` returns the 5 new codes (`agri_food`, `health_medtech`, `engineering_ai`, `energy_env_material_bcg`, `quality_of_life_soft_power`).
- `GET /api/config` (default 2570) returns `totalPrizePool === 255000`, `totalAwardCount === 18`, `educationLevels.length === 3`, `educationLevels[0].code === 'general_public'`, `educationLevels[0].isRoyalTrophy === true`, `educationLevels[1].isRoyalTrophy === false`, `educationLevels.every(l => l.requiresPrototype === true)`, and `prizes.every(p => !p.title.includes('โล่'))`.
- *(Review Focus #3)* `GET /api/config?year=2569` returns `totalPrizePool === 180000`, `educationLevels.length === 2`, and `categories.map(c => c.code)` equal to 2569's 5 historical categories.
- `POST /api/config/levels` rejects non-admin (`401`/`403`) and lets `ADMIN` update/add a year level; `POST /api/config/years` clones both `categories` and `levels` to a test year (cleaning up the test year in `finally`).
- Update `server/tests/auth.test.ts` to test registration with `educationLevel: "general_public"` and default registration without `educationLevel`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/masters.test.ts tests/auth.test.ts`
Expected: FAIL (`totalPrizePool` is still hardcoded `180000`, `/api/masters/years/2570/levels` is `404`).

- [ ] **Step 3: Implement year-scoped levels in `config.controller.ts`, `masters.controller.ts`, and `auth.controller.ts`**

- In `config.controller.ts`:
  - Include `levels: { where: { isActive: true }, include: { educationLevel: true }, orderBy: { orderIndex: 'asc' } }` in `targetYear` queries (`GET /api/config` and `POST /api/config/years`).
  - Format `educationLevels` from `targetYear.levels` (using `customNameTh || educationLevel.nameTh`, `customNameEn || educationLevel.nameEn`, `customEligibleTh || educationLevel.eligibleTh`, `trophyTitleTh`, `trophyShortTh`, `isRoyalTrophy`, `totalPrizeAmount`, `requiresPrototype`, `prototypeRuleTh`, `prizeBreakdown`).
  - Sum `totalPrizePool` from `levelsFormatted.reduce((s, l) => s + l.totalPrizeAmount, 0)` and `totalAwardCount` from `prizeBreakdown` counts (defaulting to `6` per level if `prizeBreakdown` is empty). Build `prizes` from `levelsFormatted` using `formatLevelPrizeSummaryLine`.
  - Add `POST /api/config/levels` (Admin Only) mirroring `POST /api/config/categories`.
  - Extend `POST /api/config/years` to upsert cloned `CompetitionYearLevel` rows from `previousCurrent.levels` (or `LEVELS_2570_DEFAULTS` fallback).
- In `masters.controller.ts`: add `GET /api/masters/years/:year/levels`.
- In `auth.controller.ts`: resolve `educationLevel` by `{ code: educationLevel }` or `{ id: educationLevel }`; if omitted or not found, fall back to `code: 'general_public'` then `findFirst({ where: { isActive: true } })`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/masters.test.ts tests/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/macbook-arnon/Projects/innoaward add server/src/modules/config/config.controller.ts server/src/modules/masters/masters.controller.ts server/src/modules/auth/auth.controller.ts server/tests/masters.test.ts server/tests/auth.test.ts
git -C /Users/macbook-arnon/Projects/innoaward commit -m "feat(api): expose year-scoped competition levels, dynamic prize pools, and rollover cloning"
```

---

### Task 3: Submission Year-Level Validation, Mandatory Prototype Gate & Trophy-Aware Judging

**Files:**
- Modify: `server/src/modules/submissions/submissions.schema.ts`
- Modify: `server/src/modules/submissions/submissions.controller.ts`
- Modify: `server/src/modules/submissions/dossier-utils.ts`
- Modify: `server/src/modules/judging/judging.controller.ts`
- Test: `server/tests/submissions.test.ts`, `server/tests/judging.test.ts`, `server/tests/uploads.test.ts`

**Interfaces:**
- Accepts in `POST /api/submissions`: `hasPrototypeConfirmed?: boolean` (in `submissionPayloadSchema`).
- Produces in `formatDossierResponse` & `GET /api/judging/submissions`: `isRoyalTrophy: boolean`, `trophyShortTh: string`.

- [ ] **Step 1: Write failing tests in `server/tests/submissions.test.ts`, `judging.test.ts`, and `uploads.test.ts`**

Update test fixtures in `submissions.test.ts`, `judging.test.ts`, and `uploads.test.ts` to use 2570 active codes (`category: "agri_food"` / `"engineering_ai"`, `educationLevel: "general_public"` / `"higher_education"` / `"below_higher"`), and add tests for:
- *(Review Focus #4)* `POST /api/submissions` for year `2570` by a `CONTESTANT` with `educationLevel: "higher_and_above"` returns `400`.
- `POST /api/submissions` with `isDraft: false` and `hasPrototypeConfirmed: false` returns `400` mentioning `Prototype`.
- *(Review Focus #1)* `POST /api/submissions` with `isDraft: true` and `hasPrototypeConfirmed: false` succeeds (`200`, `status === 'DRAFT'`).
- *(Review Focus #5)* In `judging.test.ts`, awarding `GRAND_WINNER` via `PATCH /api/submissions/:id/status` (when `round3Result` / `awardNameTh` are not manually overridden) sets `รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)` for a `general_public` submission and `รางวัลชนะเลิศ (ถ้วยรางวัล มจพ.)` for a `higher_education` submission; `POST /api/judging/publish-results` (`stage: 'ROUND_3'`) mentions both `ถ้วยพระราชทานฯ` and `ถ้วยรางวัล มจพ.`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/submissions.test.ts tests/judging.test.ts tests/uploads.test.ts`
Expected: FAIL (`higher_and_above` is not rejected in 2570, `hasPrototypeConfirmed: false` is not rejected, `GRAND_WINNER` does not auto-resolve KMUTNB Trophy).

- [ ] **Step 3: Implement validation & trophy resolution in `submissions.*` and `judging.controller.ts`**

- `submissions.schema.ts`: add `hasPrototypeConfirmed: t.Optional(t.Boolean())` to `submissionPayloadSchema`.
- `submissions.controller.ts`:
  - Look up `yearLevel = await prisma.competitionYearLevel.findUnique({ where: { competitionYearId_educationLevelId: { competitionYearId: compYear!.id, educationLevelId: educationLevel.id } } })`.
  - If the target `compYear` has any active `CompetitionYearLevel` rows and (`!yearLevel || !yearLevel.isActive`) and `currentUser?.role !== Role.ADMIN`, return HTTP `400` (`ประเภทการแข่งขันที่เลือกไม่เปิดรับในปีการแข่งขันนี้`).
  - If `!isDraft && (yearLevel?.requiresPrototype ?? true) && payload.hasPrototypeConfirmed === false`, return HTTP `400` (`กรุณายืนยันว่าผลงานมีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำตามเกณฑ์การแข่งขัน`).
  - Save `competitionYearLevelId: yearLevel?.id` on `Submission` and include `competitionYearLevel: true` in `findUnique` / `findMany` queries.
  - When `PATCH /:id/status` sets `awardTier` to `GRAND_WINNER` and `body.round3Result` is omitted, default `round3Result` and `awardNameTh` from `existing`'s `competitionYearLevel` (`isRoyalTrophy ? 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)' : \`รางวัลชนะเลิศ (\${trophyShortTh || 'ถ้วยรางวัล มจพ.'})\``).
- `dossier-utils.ts`: include `isRoyalTrophy: Boolean(found.competitionYearLevel?.isRoyalTrophy ?? (found.educationLevel?.code === 'general_public' || found.educationLevel?.code === 'higher_and_above'))` and `trophyShortTh: found.competitionYearLevel?.trophyShortTh || (isRoyalTrophy ? 'ถ้วยพระราชทานฯ' : 'ถ้วยรางวัล มจพ.')` in `formatDossierResponse`.
- `judging.controller.ts`: fallback default judge `educationLevel` to `'general_public'` (then `findFirst`), include `competitionYearLevel: true` when querying submissions so `isRoyalTrophy` and `trophyShortTh` are returned, and update `ROUND_3` publish default title/abstract to `'ประกาศผลการตัดสินรางวัลชนะเลิศ ถ้วยพระราชทานฯ และถ้วยรางวัล มจพ. ประจำปี ...'`.

- [ ] **Step 4: Run full backend test suite to verify everything passes**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test`
Expected: PASS across all 7 backend test files (`0 fail`).

- [ ] **Step 5: Commit**

```bash
git -C /Users/macbook-arnon/Projects/innoaward add server/src/modules/submissions/ server/src/modules/judging/judging.controller.ts server/tests/submissions.test.ts server/tests/judging.test.ts server/tests/uploads.test.ts
git -C /Users/macbook-arnon/Projects/innoaward commit -m "feat(submissions,judging): enforce active year levels, prototype confirmation, and trophy-aware awards"
```

---

### Task 4: 5 New Innovation Domains Catalog, Domain Artwork & 3D Hero Stage

**Files:**
- Create: `client/public/domain-engineering.jpg`, `client/public/domain-softpower.jpg`
- Modify: `client/src/components/domainCatalog.js`
- Modify: `client/src/components/heroThreeStageConfig.js:1-110,184-201`
- Modify: `client/src/components/HeroThreeStage.jsx:138-146,188-210,278-300,555-562`
- Test: `client/src/components/domainCatalog.test.mjs`, `client/src/components/heroThreeStageConfig.test.mjs`

**Interfaces:**
- Produces in `domainCatalog.js`:
  - `DOMAIN_CATALOG` with IDs `['agri_food', 'health_medtech', 'engineering_ai', 'energy_env_material_bcg', 'quality_of_life_soft_power']`, each having `{ id, indexLabel, nameTh, nameEn, titleTh, titleEn, desc, overview, subTopics, initialCriteria, relatedCategoryIds, color, bgImage }`.
  - `getDomainSampleWinners(domainId, winnersList, limit = 2)` matching `item.category === domainId || domain.relatedCategoryIds.includes(item.category)`.
- Produces in `heroThreeStageConfig.js`:
  - `DOMAIN_IDS = Object.freeze(['agri_food', 'health_medtech', 'engineering_ai', 'energy_env_material_bcg', 'quality_of_life_soft_power'])`
  - `DOMAIN_ORBIT_COLORS = Object.freeze([0x22C55E, 0xFB7185, 0x00D9F5, 0x00F5A0, 0xF59E0B])`
  - `DOMAIN_PHOTO_URLS = Object.freeze(['/domain-food.jpg', '/domain-medical.jpg', '/domain-engineering.jpg', '/domain-energy.jpg', '/domain-softpower.jpg'])`

- [ ] **Step 1: Generate `/domain-engineering.jpg` and `/domain-softpower.jpg` via `image-generator` subagent**

Invoke `image-generator` to create two crisp 16:9 dark-sapphire/luminous-accent editorial photographs saved to `client/public/domain-engineering.jpg` (robotics, AI neural vision, IoT smart control systems, rail/industrial automation) and `client/public/domain-softpower.jpg` (Thai contemporary architecture/product design, interactive digital media, cultural craft innovation & creative Soft Power). Verify both files exist and are non-empty.

- [ ] **Step 2: Write failing tests in `domainCatalog.test.mjs` and `heroThreeStageConfig.test.mjs`**

Update `domainCatalog.test.mjs` and `heroThreeStageConfig.test.mjs` to assert:
- `DOMAIN_CATALOG.map(d => d.id)` equals `['agri_food', 'health_medtech', 'engineering_ai', 'energy_env_material_bcg', 'quality_of_life_soft_power']`.
- Each domain's `overview` contains key phrases from the official Thai scope (๑–๕), e.g. `อาหารฟังก์ชัน` / `แมลงเศรษฐกิจ` in `agri_food`, `Healthtech` / `Medtech` in `health_medtech`, `Robotics` / `Machine Learning` in `engineering_ai`, `BCG Economy Model` in `energy_env_material_bcg`, and `อุตสาหกรรมสร้างสรรค์ 11 สาขา` / `Soft Power` in `quality_of_life_soft_power`.
- Each domain's `initialCriteria[0].detail` explicitly mentions `Prototype` and rejects Idea-only works.
- `getDomainSampleWinners('energy_env_material_bcg', mock2569Winners, 2)` matches legacy `'energy_environment'` and `'material'` winners via `relatedCategoryIds`.
- `DOMAIN_IDS`, `DOMAIN_ORBIT_COLORS`, `DOMAIN_PHOTO_URLS`, and `resolveDomainIndexById` match the new 5-domain order (`0..4`).

- [ ] **Step 3: Run client domain/shader tests to verify they fail**

Run: `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/domainCatalog.test.mjs /Users/macbook-arnon/Projects/innoaward/client/src/components/heroThreeStageConfig.test.mjs`
Expected: FAIL (`DOMAIN_CATALOG` and `DOMAIN_IDS` still have legacy IDs).

- [ ] **Step 4: Implement updated `domainCatalog.js`, `heroThreeStageConfig.js`, and `HeroThreeStage.jsx`**

- Populate `domainCatalog.js` with the 5 new domains from Spec §5.2 and update `getDomainSampleWinners` to check `relatedCategoryIds`.
- Update `DOMAIN_IDS`, `DOMAIN_ORBIT_COLORS`, `DOMAIN_PHOTO_URLS`, and reorder the 5 `applyLivingPhotoEffect` shader branches in `heroThreeStageConfig.js` (`0`: agri/leaf scan, `1`: medical ECG sweep, `2`: engineering cyan AI packets, `3`: energy/BCG emerald grid pulse, `4`: soft power golden-amber shimmer) while keeping all `pow(max(0.0, ...))` clamps intact.
- Update `HeroThreeStage.jsx` HUD strings per Spec §5.4 (`5 หมวดการแข่งขัน`, `ต้องมี Prototype ขั้นต่ำ`, `เงินรางวัลรวม 255,000 บาท`, `255,000 THB`, `เงินรางวัลรวม 3 ประเภท (18 รางวัล)`, `ถ้วยพระราชทานฯ & ถ้วย มจพ.`, no `+ อื่นๆ`).

- [ ] **Step 5: Run client domain/shader tests to verify they pass**

Run: `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/domainCatalog.test.mjs /Users/macbook-arnon/Projects/innoaward/client/src/components/heroThreeStageConfig.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/macbook-arnon/Projects/innoaward add client/public/domain-engineering.jpg client/public/domain-softpower.jpg client/src/components/domainCatalog.js client/src/components/domainCatalog.test.mjs client/src/components/heroThreeStageConfig.js client/src/components/heroThreeStageConfig.test.mjs client/src/components/HeroThreeStage.jsx
git -C /Users/macbook-arnon/Projects/innoaward commit -m "feat(client): update 5 innovation domains catalog, 3D hero HUD, and domain visuals for 2570"
```

---

### Task 5: Frontend Submission Utilities, Dynamic 3-Tier Guidelines/Prizes UI, Prototype Checkbox & Docs Sync

**Files:**
- Modify: `client/src/components/submissionDossierUtils.js`
- Modify: `client/src/components/submissionDossierUtils.test.mjs`
- Modify: `client/src/App.jsx`
- Modify: `client/src/App.css`
- Modify: `CONTEXT.md`, `PRODUCT.md`
- Test: `client/src/components/submissionDossierUtils.test.mjs`

**Interfaces:**
- Produces in `submissionDossierUtils.js`:
  - `export const DEFAULT_COMPETITION_LEVELS_2570` (3 tier objects matching `/api/config` `educationLevels` shape: `code`, `nameTh`, `nameEn`, `eligible`, `trophyTitleTh`, `trophyShortTh`, `isRoyalTrophy`, `totalPrizeAmount`, `requiresPrototype`, `prototypeRuleTh`, `prizeBreakdown`).
  - `CATEGORY_LABELS_TH` & `LEVEL_LABELS_TH` containing both 2570 codes (`agri_food`, `health_medtech`, `engineering_ai`, `energy_env_material_bcg`, `quality_of_life_soft_power`, `general_public`, `higher_education`, `below_higher`) and 2569 historical codes (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`, `higher_and_above`, `others`).
  - `createInitialSubmissionForm()` -> `category: 'agri_food'`, `educationLevel: 'general_public'`, `hasPrototypeConfirmed: false`.
  - `validateSubmissionStep(form, step, isDraft)` -> requires `form.hasPrototypeConfirmed === true` on `(!step || step === 3)` when `isDraft === false`.
  - `buildSubmissionApiPayload(form, isDraft, userId)` -> includes `hasPrototypeConfirmed: Boolean(form?.hasPrototypeConfirmed)`.
  - `hydrateSubmissionFormFromServer(record)` -> sets `hasPrototypeConfirmed: Boolean(record.hasPrototypeConfirmed ?? (record.status && record.status !== 'DRAFT'))`.

- [ ] **Step 1: Write failing tests in `client/src/components/submissionDossierUtils.test.mjs`**

Add tests in `submissionDossierUtils.test.mjs` pinning:
- `DEFAULT_COMPETITION_LEVELS_2570` has 3 tiers summing to `255000`, where only `general_public` has `isRoyalTrophy === true` and both `higher_education` and `below_higher` have `trophyShortTh === 'ถ้วยรางวัล มจพ.'` and `requiresPrototype === true`.
- `validateSubmissionStep(form, 3, false)` fails with a `Prototype` error when `hasPrototypeConfirmed` is `false` and passes when `true`.
- *(Review Focus #1)* `validateSubmissionStep({ titleTh: 'ร่างโครงการ', hasPrototypeConfirmed: false }, 3, true)` returns `''` (draft save never blocked).
- *(Review Focus #2)* `hydrateSubmissionFormFromServer` sets `hasPrototypeConfirmed: true` when `record.status === 'SUBMITTED'` and `false` when `record.status === 'DRAFT'`.
- `App.jsx` source assertions: integrates `DEFAULT_COMPETITION_LEVELS_2570`, `dynamicLevels`, `hasPrototypeConfirmed`, `/config/levels`, trophy-aware `isRoyalTrophy` champion awarding (`ถ้วยรางวัล มจพ.`), and does not auto-append `'others'` into `dynamicCategories`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/submissionDossierUtils.test.mjs`
Expected: FAIL (`DEFAULT_COMPETITION_LEVELS_2570` and `hasPrototypeConfirmed` not implemented yet).

- [ ] **Step 3: Implement `submissionDossierUtils.js` updates**

Update `CATEGORY_LABELS_TH`, `LEVEL_LABELS_TH`, `KNOWN_CATEGORY_PATTERNS`, `DEFAULT_COMPETITION_LEVELS_2570`, `createInitialSubmissionForm`, `validateSubmissionStep`, `buildSubmissionApiPayload`, `hydrateSubmissionFormFromServer`, and `normalizeStatusDossier` per the task Interfaces.

- [ ] **Step 4: Update `client/src/App.jsx`, `client/src/App.css`, `CONTEXT.md`, and `PRODUCT.md`**

- `App.jsx`:
  - Import `Cpu`, `Sparkles` from `lucide-react` and map `DOMAIN_ICONS` for the 5 new domain IDs (`agri_food: Leaf`, `health_medtech: Activity`, `engineering_ai: Cpu`, `energy_env_material_bcg: Zap`, `quality_of_life_soft_power: Sparkles`).
  - Add `dynamicLevels` state initialized to `DEFAULT_COMPETITION_LEVELS_2570` and `totalPrizePool` state initialized to `255000`; hydrate both in `fetchConfigForYear` from `data.educationLevels` and `data.totalPrizePool`. Remove the `if (!normalizedCats.some(c => c.code === 'others'))` injection in `fetchConfigForYear` and initialize `dynamicCategories` to the 5 new 2570 categories.
  - Update Home Hero copy, 3-Pillar Overview (`เงินรางวัลรวม 255,000 บาท`, `3 ประเภทการแข่งขัน • รวม 18 รางวัล`, `ถ้วยพระราชทานฯ (ประเภทบุคคลทั่วไป) และถ้วยรางวัล มจพ. (อุดมศึกษา / ต่ำกว่าอุดมศึกษา)`), Quick Checklist (`ต้องมีชิ้นงานต้นแบบ Prototype ขั้นต่ำ ไม่รับเฉพาะแนวคิด`), and fallback 2570 opening announcement copy.
  - Render Guidelines `#eligibility` (3 cards in a responsive 3-column grid via `.levels-grid` in `App.css`) and `#prizes` (3 tier prize grids) dynamically from `dynamicLevels`, applying `.gold-tier` / `.gold-champion` styling when `lvl.isRoyalTrophy` is `true` and KMUTNB Trophy cyan/sapphire styling when `false`, showing `ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ มีแต่ Idea ไม่ได้` on every tier card and in `#standards`.
  - Update Submission Form: `regForm.educationLevel` defaults to `'general_public'`; Step 1 level `<select>` renders `dynamicLevels`; Step 3 adds the mandatory `hasPrototypeConfirmed` checkbox card above the action buttons.
  - Update Hall of Fame & Judging level/category `<select>` filters and winner badge helpers (`LEVEL_LABELS_TH[w.educationLevel]`, `CATEGORY_LABELS_TH[w.category]`) so both 2570 and 2569 entries display human-readable Thai names.
  - *(Review Focus #5)* Update Admin "มอบรางวัลชนะเลิศ" button in Judging Queue to pass `round3Result: sub.isRoyalTrophy ? 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)' : \`รางวัลชนะเลิศ (\${sub.trophyShortTh || 'ถ้วยรางวัล มจพ.'})\``, and add a compact Competition Tiers manager form in `judgingTab === 'setup'` posting to `/api/config/levels`.
- Update `CONTEXT.md` and `PRODUCT.md` to match the 3 tiers, `255,000` THB prize pool, Royal Trophy vs KMUTNB Trophy honors, mandatory Prototype rule, and the 5 official 2570 categories.

- [ ] **Step 5: Run all client tests, lint, production build, and backend tests**

Run:
1. `node --test /Users/macbook-arnon/Projects/innoaward/client/src/components/*.test.mjs`
2. `cd /Users/macbook-arnon/Projects/innoaward/client && npm run lint && npm run build`
3. `cd /Users/macbook-arnon/Projects/innoaward/server && bun test`
Expected: All client unit tests PASS, `oxlint` reports `0` errors, Vite production build succeeds, and all Bun backend tests PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/macbook-arnon/Projects/innoaward add client/src/ CONTEXT.md PRODUCT.md
git -C /Users/macbook-arnon/Projects/innoaward commit -m "feat(ui,docs): render dynamic 3-tier levels & prizes, enforce prototype checkbox, and sync docs"
```
