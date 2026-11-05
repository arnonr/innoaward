# Multi-Year Judging, Weighted Rubric Evaluation, Judge Management & Result Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-year, dynamic-category Admin & Judge Evaluation Backoffice covering Stage 0 screening, category-based judge assignment per competition year, weighted `1–5` rubric scoring across Rounds 1–3 (with Round 2 mandatory `POSTER` status visibility), one-click announcement/Hall of Fame publishing, and multi-year/category setup.

**Architecture:** Extend `server/prisma/schema.prisma` with `EvaluationRound`, `CompetitionYear.rubricConfig`, `JudgeCategoryAssignment`, and `SubmissionEvaluation`. Add `/api/config/rubric`, `/api/config/years`, `/api/config/categories` in `config.controller.ts` and a new `judging.controller.ts` module (`/api/judging/*`). On the frontend (`client/src/App.jsx` + `submissionDossierUtils.js`), provide weighted rubric calculation helpers, dynamic category lists from `/api/config`, and a 3-tab **Judge & Admin Workspace** modal for `Role.JUDGE` and `Role.ADMIN`.

**Tech Stack:** Bun, Elysia.js, Prisma ORM (PostgreSQL), React 19 (Vite), `bun test`, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-05-multi-year-judging-and-evaluation-design.md`

## Global Constraints

- Weighted rubric formula out of `100`: `weightedTotal = Math.round(sum((score_i / 5) * weight_i) * 100) / 100` where each `score_i` is an integer in `1..5` and `Math.round(sum(weight_i)) === 100`.
- Default 5 rubric criteria (`DEFAULT_RUBRIC_CONFIG`) sum to `100%`: `creativity` (`25`), `prototype` (`25`), `impact` (`20`), `sustainability` (`15`), `presentation` (`15`).
- All judge assignments (`JudgeCategoryAssignment`), rubric configs (`CompetitionYear.rubricConfig`), active categories (`CompetitionYearCategory`), submissions, and published announcements are scoped by `competitionYearId` (`CompetitionYear`).
- The number of innovation categories per competition year is dynamic (`3`, `5`, `6`, `7`, or more via `CompetitionYearCategory`).

## Review Focus

- Attempting `PATCH /api/config/rubric` with criterion weights that do not sum to `100` (e.g. `90%`) or with a non-positive weight returns `400`.
- Creating a new category (`POST /api/config/categories`, e.g. a 6th category `ai_robotics`) for a competition year makes it appear in `GET /api/config` and allows assigning a judge to that 6th category.
- Creating a new competition year (`POST /api/config/years`, e.g. `2571`) clones active `CompetitionYearCategory` links and `rubricConfig` without modifying or deleting submissions/assignments from year `2570`.
- A `Role.JUDGE` user calling `POST /api/judging/submissions/:id/evaluate` on a submission whose category is NOT in the judge's `JudgeCategoryAssignment` for that competition year receives `403`, whereas a judge assigned to that category succeeds (`200`) and their `ROUND_1` and `ROUND_2` scores are stored independently without overwriting each other.
- Calling `POST /api/judging/publish-results` for `ROUND_2` (`FINALISTS`) and `ROUND_3` (`WINNERS`) creates/updates `Announcement` and `AnnouncementRoster` records containing the qualifying submissions for that competition year.

---

### Task 1: Prisma Schema, Rubric Utilities & Multi-Year/Category Config Endpoints

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/src/modules/judging/rubric-utils.ts`
- Modify: `server/src/modules/config/config.controller.ts`
- Modify: `server/tests/masters.test.ts`

**Interfaces:**
- Consumes: `prisma` (`server/src/lib/prisma.ts`), `authPlugin` (`server/src/modules/auth/auth.plugin.ts`)
- Produces:
  - Prisma models `JudgeCategoryAssignment`, `SubmissionEvaluation`, enum `EvaluationRound`, and `CompetitionYear.rubricConfig`
  - `DEFAULT_RUBRIC_CONFIG`, `normalizeRubricConfig(raw: unknown): RubricCriterion[]`, `validateRubricCriteriaInput(criteria: unknown): { valid: boolean; message?: string; criteria?: RubricCriterion[] }`, `computeWeightedRubricTotal(scores: Record<string, number>, criteria: RubricCriterion[]): { valid: boolean; message?: string; weightedTotal?: number; normalizedScores?: Record<string, number> }` in `server/src/modules/judging/rubric-utils.ts`
  - `GET /api/config?year=2570` returning `rubricConfig` and `years`
  - `PATCH /api/config/rubric` (`Role.ADMIN`)
  - `POST /api/config/categories` (`Role.ADMIN`)
  - `POST /api/config/years` (`Role.ADMIN`)

- [ ] **Step 1: Add `EvaluationRound`, `rubricConfig`, `JudgeCategoryAssignment`, and `SubmissionEvaluation` to `server/prisma/schema.prisma` and push schema**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bunx prisma db push`
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 2: Write the failing tests in `server/tests/masters.test.ts`**

Add tests in `server/tests/masters.test.ts` for:
1. `PATCH /api/config/rubric` rejecting weights summing to `90` (`400`) and accepting weights summing to `100` (`200`).
2. `POST /api/config/categories` adding a 6th category (`ai_robotics`) for year `2570` and verifying `GET /api/config?year=2570` returns 6 categories.
3. `POST /api/config/years` creating year `2571` (`setAsCurrent: false`) with cloned categories and rubric config.

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/masters.test.ts`
Expected: FAIL (`404` on `/api/config/rubric`, `/api/config/categories`, `/api/config/years`).

- [ ] **Step 4: Implement `server/src/modules/judging/rubric-utils.ts` and update `server/src/modules/config/config.controller.ts`**

Implement `DEFAULT_RUBRIC_CONFIG`, `normalizeRubricConfig`, `validateRubricCriteriaInput`, and `computeWeightedRubricTotal` in `server/src/modules/judging/rubric-utils.ts`, and add `?year` query support + `PATCH /api/config/rubric`, `POST /api/config/categories`, and `POST /api/config/years` in `server/src/modules/config/config.controller.ts`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/masters.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/prisma/schema.prisma server/src/modules/judging/rubric-utils.ts server/src/modules/config/config.controller.ts server/tests/masters.test.ts
git commit -m "feat(server): add multi-year rubric, category, and competition year config endpoints"
```

---

### Task 2: Judging Controller — Judge Category Assignment, Weighted Rubric Evaluation & Result Publishing

**Files:**
- Create: `server/src/modules/judging/judging.controller.ts`
- Modify: `server/src/index.ts`
- Create: `server/tests/judging.test.ts`

**Interfaces:**
- Consumes: `DEFAULT_RUBRIC_CONFIG`, `normalizeRubricConfig`, `computeWeightedRubricTotal` from `server/src/modules/judging/rubric-utils.ts`, `formatDossierResponse` from `server/src/modules/submissions/dossier-utils.ts`
- Produces:
  - `GET /api/judging/judges?year=...` (`Role.ADMIN`)
  - `POST /api/judging/judges` (`Role.ADMIN`)
  - `PUT /api/judging/judges/:judgeId/categories` (`Role.ADMIN`)
  - `GET /api/judging/submissions?year=...&category=...&educationLevel=...` (`Role.ADMIN` | `Role.JUDGE`)
  - `POST /api/judging/submissions/:submissionId/evaluate` (`Role.ADMIN` | `Role.JUDGE`)
  - `POST /api/judging/publish-results` (`Role.ADMIN`)

- [ ] **Step 1: Write the failing integration tests in `server/tests/judging.test.ts`**

Cover:
1. Admin creating/assigning a judge via `POST /api/judging/judges` to `energy_environment` (and a dynamic category) for year `2570`.
2. Judge listing `GET /api/judging/submissions` and seeing only submissions in their assigned categories, including `hasPoster: Boolean(posterUrl)`.
3. Judge attempting `POST /api/judging/submissions/:submissionId/evaluate` on an unassigned category (`403`) vs. assigned category (`200`) for `ROUND_1` and `ROUND_2` independently, verifying `weightedTotal` calculation and `roundSummaries.ROUND_1.avgScore` / `roundSummaries.ROUND_2.avgScore`.
4. Admin advancing submissions (`PATCH /api/submissions/:id/status`) and calling `POST /api/judging/publish-results` for `ROUND_2` (`FINALISTS`) and `ROUND_3` (`WINNERS`), verifying `GET /api/announcements` includes the published roster.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/judging.test.ts`
Expected: FAIL (`Cannot find module` / `404`).

- [ ] **Step 3: Implement `server/src/modules/judging/judging.controller.ts` and mount in `server/src/index.ts`**

Implement all 6 endpoints in `server/src/modules/judging/judging.controller.ts` and register `.use(judgingController)` in `server/src/index.ts`.

- [ ] **Step 4: Run backend test suite to verify it passes**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test`
Expected: PASS (all test files green).

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/judging/judging.controller.ts server/src/index.ts server/tests/judging.test.ts
git commit -m "feat(server): add judging controller for judge assignments, weighted evaluations, and result publishing"
```

---

### Task 3: Frontend Weighted Rubric & Judging Helper Utilities

**Files:**
- Modify: `client/src/components/submissionDossierUtils.js`
- Modify: `client/src/components/submissionDossierUtils.test.mjs`

**Interfaces:**
- Consumes: existing exports in `client/src/components/submissionDossierUtils.js`
- Produces:
  - `DEFAULT_RUBRIC_CRITERIA`
  - `RUBRIC_SCORE_LEVELS` (`[{ score: 5, label: 'ดีเยี่ยม' }, { score: 4, label: 'ดีมาก' }, { score: 3, label: 'ปานกลาง' }, { score: 2, label: 'พอใช้' }, { score: 1, label: 'ต้องปรับปรุง' }]`)
  - `calculateWeightedRubricScore(scores: Record<string, number>, criteria?: Array<{ id: string, weight: number }>): number`
  - `validateRubricWeights(criteria: Array<{ id: string, titleTh: string, weight: number }>): string` (returns `''` when valid or Thai error message when invalid)

- [ ] **Step 1: Write the failing unit tests in `client/src/components/submissionDossierUtils.test.mjs`**

Test `calculateWeightedRubricScore` (all `5`s $\rightarrow$ `100`, all `1`s $\rightarrow$ `20`, mixed weighted values $\rightarrow$ exact score) and `validateRubricWeights` (valid `100%` $\rightarrow$ `''`, sum `!= 100` $\rightarrow$ Thai error message).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/submissionDossierUtils.test.mjs`
Expected: FAIL (`calculateWeightedRubricScore is not a function`).

- [ ] **Step 3: Implement helpers in `client/src/components/submissionDossierUtils.js`**

Export `DEFAULT_RUBRIC_CRITERIA`, `RUBRIC_SCORE_LEVELS`, `calculateWeightedRubricScore`, and `validateRubricWeights`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/submissionDossierUtils.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/components/submissionDossierUtils.js client/src/components/submissionDossierUtils.test.mjs
git commit -m "feat(client): add weighted rubric calculation and validation helpers"
```

---

### Task 4: Frontend Admin & Judge Workspace Modal, Dynamic Categories & Multi-Year Setup

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/components/submissionDossierUtils.test.mjs`

**Interfaces:**
- Consumes:
  - `DEFAULT_RUBRIC_CRITERIA`, `RUBRIC_SCORE_LEVELS`, `calculateWeightedRubricScore`, `validateRubricWeights` from `client/src/components/submissionDossierUtils.js`
  - Backend `/api/judging/*` and `/api/config/*` endpoints from Tasks 1–2
- Produces:
  - Dynamic category list (`dynamicCategories`) synced from `GET /api/config` and rendered in the Contestant Submission Form and Judge/Admin Workspace
  - **Judge & Admin Evaluation Workspace** in `client/src/App.jsx` with 3 tabs:
    1. `queue`: 4-stage filtering (`0. ตรวจคัดกรอง`, `1. ตัดสินรอบที่ 1`, `2. ตัดสินรอบที่ 2 (ตรวจ POSTER)`, `3. ตัดสินรอบชิงชนะเลิศ`), `hasPoster` status badge, interactive `1–5` weighted rubric evaluator (`/api/judging/submissions/:id/evaluate`), and Admin status/award advancement (`/api/submissions/:id/status`).
    2. `judges`: Admin Judge Management & dynamic category checkbox assignment (`/api/judging/judges`).
    3. `setup`: Admin Rubric weight editor (`/api/config/rubric`), Dynamic Category manager (`/api/config/categories`), Deadline editor (`/api/config/deadline`), One-click Result Publisher (`/api/judging/publish-results`), and Next Competition Year creator (`/api/config/years`).

- [ ] **Step 1: Write failing test in `client/src/components/submissionDossierUtils.test.mjs`**

Assert that `client/src/App.jsx` integrates `calculateWeightedRubricScore`, `validateRubricWeights`, `/judging/submissions`, `/judging/judges`, `/judging/publish-results`, `/config/rubric`, `/config/categories`, and `/config/years`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/submissionDossierUtils.test.mjs`
Expected: FAIL

- [ ] **Step 3: Implement the Judge & Admin Workspace and dynamic categories in `client/src/App.jsx`**

Wire `dynamicCategories`, `rubricCriteria`, `availableYears`, and the 3-tab Judge & Admin Workspace in `client/src/App.jsx`.

- [ ] **Step 4: Run frontend tests and production build**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && node --test src/components/*.test.mjs && npm run build`
Expected: PASS (all tests pass and `vite build` succeeds).

- [ ] **Step 5: Commit**

```bash
git add client/src/App.jsx client/src/components/submissionDossierUtils.test.mjs
git commit -m "feat(client): add multi-year judge and admin evaluation workspace with dynamic categories"
```
