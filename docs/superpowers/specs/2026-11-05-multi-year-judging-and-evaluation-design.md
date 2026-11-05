# Multi-Year Judging, Weighted Rubric Evaluation, Judge Management & Result Publishing — Design Spec

**Date:** 2026-11-05  
**Project:** KMUTNB Innovation Awards (`innoaward`)  
**Scope Size:** A project (Backend Prisma schema & Elysia APIs + Frontend Admin & Judge Workspace UI)

---

## 1. Intent & Why

Build a complete, reusable **Multi-Year Judging, Evaluation & Result Publishing System** for `Role.ADMIN` and `Role.JUDGE` so the competition can operate end-to-end every year without code changes:
1. **Stage 0 — ตรวจคัดกรองความถูกต้อง (Admin Screening):** Staff/Admin verifies document completeness and eligibility (`SUBMITTED` $\rightarrow$ `UNDER_REVIEW` or `REJECTED`).
2. **Stage 1 — ตัดสินรอบที่ 1 (Round 1 Evaluation):** Judges assigned to each of the 5 innovation categories score eligible projects (`UNDER_REVIEW` and beyond) using a **Weighted 1–5 Rubric** based on Proposal PDF, Video, and Cover Image. Admin reviews ranked averages and advances qualifying teams (`round1Status: PASSED`, `status: PASSED_FIRST_ROUND`).
3. **Stage 2 — ตัดสินรอบที่ 2 (Round 2 Evaluation + Mandatory POSTER):** Qualifying teams attach their `posterUrl` (and optional `presentationUrl`). Judges see `hasPoster` status and evaluate Round 2 using the Weighted 1–5 Rubric. Admin advances finalists (`round2Status: PASSED`, `status: FINALIST`).
4. **Stage 3 — ตัดสินรอบชิงชนะเลิศ (Final Round Evaluation & Awards):** Judges evaluate on-site prototype demonstrations & final pitching (`ROUND_3`). Admin assigns `AwardTier` (`GRAND_WINNER`, `RUNNER_UP_1`, `RUNNER_UP_2`, `HONORABLE_MENTION`) and sets `status: AWARDED` (`round3Status: PASSED`).
5. **One-Click Result Publishing & Multi-Year Lifecycle:** Admin can publish official announcement rosters (`Announcement` + `AnnouncementRoster`) for any stage with one click, and can create/activate future competition years (e.g. `2571` / `2028`) with their own deadline, rubric weights, and category judge assignments while preserving all historical years in the Hall of Fame and Announcements archive.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Multi-year & Dynamic Category architecture (`CompetitionYear`-scoped):**
  - Every judge assignment (`JudgeCategoryAssignment`), rubric configuration (`CompetitionYear.rubricConfig`), active category list (`CompetitionYearCategory`), submission (`Submission`), and announcement (`Announcement`) belongs to a specific `CompetitionYear`.
  - The number of innovation categories in any year is **fully dynamic** (can be 3, 5, 6, 7, or more). Admin can add new categories to the catalog, edit category names/descriptions, or toggle which categories are active (`isActive`) for a given `CompetitionYear` via `POST /api/config/categories`.
  - Admin can create a new `CompetitionYear` or switch the active year (`isCurrent: true`) via `POST /api/config/years`, automatically cloning active `CompetitionYearCategory` links and the rubric configuration from the previous year.
- **Category-based Judge Management (`JudgeCategoryAssignment`):**
  - Admin can create/update `Role.JUDGE` accounts (`POST /api/judging/judges`) and assign each judge to 1 or more of the active innovation categories (`CompetitionYearCategory`) for a given `CompetitionYear`.
  - Judges automatically see all non-draft, non-rejected submissions in their assigned categories for that competition year—no per-submission manual assignment is required.
- **Weighted 1–5 Rubric Scoring (`rubricConfig` & `SubmissionEvaluation`):**
  - Each criterion has a `weight` percentage (`> 0`), with all criteria weights summing to `100`.
  - Judges score each criterion on an integer scale of `1` to `5` (`5 = ดีเยี่ยม`, `4 = ดีมาก`, `3 = ปานกลาง`, `2 = พอใช้`, `1 = ต้องปรับปรุง`).
  - Weighted score formula:
    $$\text{weightedTotal} = \text{round2}\left(\sum_{i} \frac{\text{score}_i}{5} \times \text{weight}_i\right) \in [20, 100]$$
  - Default 5-criterion rubric (total weight = `100%`):
    1. `creativity` — ความคิดสร้างสรรค์และความใหม่ของนวัตกรรม (`weight: 25`)
    2. `prototype` — ความสมบูรณ์และประสิทธิภาพของชิ้นงานต้นแบบ (`weight: 25`)
    3. `impact` — การนำไปใช้งานจริงและผลกระทบที่วัดผลได้ (`weight: 20`)
    4. `sustainability` — ศักยภาพเชิงพาณิชย์ สังคม และความยั่งยืน (`weight: 15`)
    5. `presentation` — ความชัดเจนของเอกสาร โปสเตอร์ และการนำเสนอ (`weight: 15`)
  - Admin can customize criteria titles and weights (`sum == 100`) per competition year via `PATCH /api/config/rubric`.
- **Per-Round Evaluation & Poster Verification (`ROUND_1`, `ROUND_2`, `ROUND_3`):**
  - `SubmissionEvaluation` stores each judge's scores per `(submissionId, judgeId, round)` where `round` is `EvaluationRound` (`ROUND_1`, `ROUND_2`, `ROUND_3`).
  - In `ROUND_2`, both the API response and Judge UI clearly indicate `hasPoster: Boolean(submission.posterUrl)` and link directly to the Poster PDF so judges can verify mandatory poster submission.
- **Admin Ranking, Advancement & One-Click Result Publishing:**
  - Admin workspace displays each submission's average score and judge evaluation count per round (`round1Avg`, `round2Avg`, `round3Avg`), allows updating screening/round statuses and `awardTier`, and provides a **"ประกาศผลขึ้นหน้าเว็บไซต์"** action (`POST /api/judging/publish-results`) that creates/updates an `Announcement` (`GENERAL` for Round 1, `FINALISTS` for Round 2, `WINNERS` for Round 3) populated with `AnnouncementRoster` entries from the qualifying submissions.

### Non-Goals
- Assigning judges to individual submissions one by one (explicitly ruled out by user: judges are assigned by innovation category).
- External SMTP email notifications when scores or announcements are saved.

### Anti-Goals
- Allowing a `JUDGE` to score submissions in categories they are not assigned to for that competition year.
- Overwriting or losing a judge's Round 1 evaluation when the same judge submits their Round 2 or Round 3 evaluation.
- Hardcoding year `2570` so that creating year `2571` breaks judging, submissions, or announcements.

---

## 3. Approaches Considered

### Approach 1: Dedicated `JudgeCategoryAssignment` + `SubmissionEvaluation` Tables + Per-Year `rubricConfig` JSON on `CompetitionYear` (Selected)
- **How it works:**
  - Add `EvaluationRound` enum (`ROUND_1`, `ROUND_2`, `ROUND_3`), `JudgeCategoryAssignment` model (`@@unique([competitionYearId, judgeId, categoryId])`), `SubmissionEvaluation` model (`@@unique([submissionId, judgeId, round])`), and `rubricConfig Json?` on `CompetitionYear`.
  - Expose `/api/judging` endpoints for judge management, category assignment, rubric evaluation, ranking aggregation, and announcement publishing, plus `/api/config/rubric` and `/api/config/years` for multi-year management.
  - Render a role-aware **Admin & Judge Evaluation Workspace** in `client/src/App.jsx` when `user.role === 'ADMIN' || user.role === 'JUDGE'`.
- **Trade-offs:** Requires a Prisma schema update (`prisma db push`), in exchange for race-condition-free concurrent judge scoring, clean per-round history, and full multi-year isolation.

### Approach 2: Embedded JSON Arrays on `Submission` and `User`
- **How it works:** Store judge category codes on `User` and an array of evaluation objects inside a JSON column on `Submission`.
- **Trade-offs:** Fewer tables, but concurrent judge saves can overwrite each other and multi-year judge assignments cannot be cleanly separated per `CompetitionYear`. Rejected.

---

## 4. Detailed Architecture & Data Model

### 4.1 Prisma Schema Additions (`server/prisma/schema.prisma`)

```prisma
enum EvaluationRound {
  ROUND_1
  ROUND_2
  ROUND_3
}

// Added field on CompetitionYear:
// rubricConfig Json?

model JudgeCategoryAssignment {
  id                String          @id @default(cuid())
  competitionYearId String
  competitionYear   CompetitionYear @relation(fields: [competitionYearId], references: [id], onDelete: Cascade)
  judgeId           String
  judge             User            @relation(fields: [judgeId], references: [id], onDelete: Cascade)
  categoryId        String
  category          Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  createdAt         DateTime        @default(now())

  @@unique([competitionYearId, judgeId, categoryId])
  @@index([competitionYearId, judgeId])
  @@index([competitionYearId, categoryId])
  @@map("judge_category_assignments")
}

model SubmissionEvaluation {
  id            String          @id @default(cuid())
  submissionId  String
  submission    Submission      @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  judgeId       String
  judge         User            @relation(fields: [judgeId], references: [id], onDelete: Cascade)
  round         EvaluationRound
  scores        Json            // Record<criterionId, number (1..5)>
  weightedTotal Float           // Computed 0..100 score using CompetitionYear.rubricConfig
  comment       String?         @db.Text @default("")
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@unique([submissionId, judgeId, round])
  @@index([submissionId, round])
  @@index([judgeId, round])
  @@map("submission_evaluations")
}
```

### 4.2 Default Rubric Configuration (`DEFAULT_RUBRIC_CONFIG`)

Stored in `CompetitionYear.rubricConfig` (and used as fallback when `rubricConfig` is `null`):
```json
[
  {
    "id": "creativity",
    "titleTh": "ความคิดสร้างสรรค์และความใหม่ของนวัตกรรม",
    "titleEn": "Creativity & Novelty",
    "weight": 25
  },
  {
    "id": "prototype",
    "titleTh": "ความสมบูรณ์และประสิทธิภาพของชิ้นงานต้นแบบ",
    "titleEn": "Prototype Readiness & Performance",
    "weight": 25
  },
  {
    "id": "impact",
    "titleTh": "การนำไปใช้งานจริงและผลกระทบที่วัดผลได้",
    "titleEn": "Practical Application & Measurable Impact",
    "weight": 20
  },
  {
    "id": "sustainability",
    "titleTh": "ศักยภาพเชิงพาณิชย์ สังคม และความยั่งยืน",
    "titleEn": "Commercial, Social & Sustainability Potential",
    "weight": 15
  },
  {
    "id": "presentation",
    "titleTh": "ความชัดเจนของเอกสาร โปสเตอร์ และการนำเสนอ",
    "titleEn": "Clarity of Documentation, Poster & Presentation",
    "weight": 15
  }
]
```

### 4.3 Backend API Endpoints

1. **Multi-Year & Rubric Config (`server/src/modules/config/config.controller.ts`):**
   - `GET /api/config` (and optional `?year=2570`): includes `event.year`, `event.submissionDeadline`, `rubricConfig` (normalized array of criteria summing to 100%), and `years` (all `CompetitionYear` records ordered by `year desc`).
   - `PATCH /api/config/rubric` (`Role.ADMIN` only):
     - Body: `{ year?: number, criteria: Array<{ id: string, titleTh: string, titleEn?: string, weight: number }> }`
     - Validates `criteria.length >= 1`, each `weight > 0`, and `Math.round(sum(weight)) === 100`. Updates `CompetitionYear.rubricConfig`.
   - `POST /api/config/years` (`Role.ADMIN` only):
     - Body: `{ year: number, yearAd?: number, titleTh?: string, titleEn?: string, submissionDeadline?: string, setAsCurrent?: boolean }`
     - Upserts the `CompetitionYear`, clones active `CompetitionYearCategory` links from the previous current year (or binds all active `Category` records), copies `rubricConfig` from the previous current year (or `DEFAULT_RUBRIC_CONFIG`), and if `setAsCurrent !== false`, marks previous years `isCurrent: false` and the new year `isCurrent: true`.
   - `POST /api/config/categories` (`Role.ADMIN` only):
     - Body: `{ year?: number, code: string, nameTh: string, nameEn?: string, descriptionTh?: string, color?: string, isActive?: boolean }`
     - Upserts a `Category` in the master catalog and upserts its `CompetitionYearCategory` link (`isActive: body.isActive ?? true`) for the target `CompetitionYear`. This allows any competition year to have 3, 5, 6, 7, or any number of innovation categories without code changes.

2. **Judging, Screening, Judge Assignment & Result Publishing (`server/src/modules/judging/judging.controller.ts`):**
   - `GET /api/judging/judges?year=2570` (`Role.ADMIN` only):
     - Lists all users with `role: Role.JUDGE`, along with their assigned category codes (`assignedCategories: string[]`) for the target `CompetitionYear`.
   - `POST /api/judging/judges` (`Role.ADMIN` only):
     - Body: `{ email: string, password?: string, fullName: string, phone?: string, institution?: string, categories: string[], year?: number }`
     - Creates a new `Role.JUDGE` user (or updates an existing user to `Role.JUDGE`) and replaces their `JudgeCategoryAssignment` rows for the target `CompetitionYear`.
   - `PUT /api/judging/judges/:judgeId/categories` (`Role.ADMIN` only):
     - Body: `{ categories: string[], year?: number }`
     - Replaces the judge's `JudgeCategoryAssignment` rows for that `CompetitionYear`.
   - `GET /api/judging/submissions?year=2570&category=all&educationLevel=all&round= all` (`Role.ADMIN` or `Role.JUDGE`):
     - For `Role.ADMIN`: returns all non-`DRAFT` submissions for the target `CompetitionYear` (plus `assignedCategories` = all 5 categories).
     - For `Role.JUDGE`: looks up the judge's `JudgeCategoryAssignment` rows for the target `CompetitionYear` and returns all non-`DRAFT` submissions in those assigned categories (`status != DRAFT`).
     - Each submission item includes:
       - Full dossier fields (`formatDossierResponse(s, true)`), `hasPoster: Boolean(s.posterUrl && s.posterUrl.trim())`, `hasPresentation: Boolean(s.presentationUrl && s.presentationUrl.trim())`
       - `myEvaluations`: `{ ROUND_1: evalOrNull, ROUND_2: evalOrNull, ROUND_3: evalOrNull }` for the current user
       - `roundSummaries`: `{ ROUND_1: { avgScore, count, evaluations }, ROUND_2: { avgScore, count, evaluations }, ROUND_3: { avgScore, count, evaluations } }`
   - `POST /api/judging/submissions/:submissionId/evaluate` (`Role.JUDGE` or `Role.ADMIN`):
     - Body: `{ round: 'ROUND_1' | 'ROUND_2' | 'ROUND_3', scores: Record<string, number>, comment?: string }`
     - Authorization & validation:
       - If `currentUser.role === Role.JUDGE`, verifies `JudgeCategoryAssignment` exists for `(submission.competitionYearId, currentUser.id, submission.categoryId)` — returns `403` if the judge is not assigned to that category.
       - Verifies `submission.status !== 'DRAFT' && submission.status !== 'REJECTED'`.
       - Validates that every criterion in `competitionYear.rubricConfig` has an integer score in `1..5`.
       - Computes `weightedTotal` out of `100` and upserts `SubmissionEvaluation` for `(submissionId, currentUser.id, round)`.
   - `POST /api/judging/publish-results` (`Role.ADMIN` only):
     - Body: `{ year?: number, stage: 'ROUND_1' | 'ROUND_2' | 'ROUND_3', title?: string, abstract?: string }`
     - Finds qualifying submissions for that `CompetitionYear`:
       - `ROUND_1`: `round1Status === 'PASSED'` (or `status in ['PASSED_FIRST_ROUND', 'FINALIST', 'AWARDED']`)
       - `ROUND_2`: `round2Status === 'PASSED'` (or `status in ['FINALIST', 'AWARDED']`) $\rightarrow$ `AnnouncementType.FINALISTS`
       - `ROUND_3`: `status === 'AWARDED'` $\rightarrow$ `AnnouncementType.WINNERS`
     - Creates or updates the official `Announcement` and replaces its `AnnouncementRoster` items with the qualifying projects (sorted by category, education level, and award tier / tracking code). Also updates `CompetitionYear.status` (`REVIEWING` / `FINALIST_ANNOUNCED` / `COMPLETED`).

---

## 5. Frontend Admin & Judge Workspace (`client/src/App.jsx`)

When a user is logged in with `user.role === 'ADMIN'` or `user.role === 'JUDGE'`:
1. **Top Navigation / Portal Mode Switcher:**
   - Displays a prominent **"ระบบกรรมการและผู้ดูแล (Judge & Admin Portal)"** button in the navbar and inside the Portal Modal.
2. **Role-Specific Tabs in the Evaluation Workspace:**
   - **Tab 1: ประเมินและคัดกรองผลงาน (Submissions & Evaluation Queue)** *(Visible to `JUDGE` and `ADMIN`)*
     - **Year Selector (`2570`, `2569`, ...), Stage Filter (`0. คัดกรองเบื้องต้น`, `1. ตัดสินรอบที่ 1`, `2. ตัดสินรอบที่ 2 (ตรวจ POSTER)`, `3. ตัดสินรอบชิงชนะเลิศ`), Category Filter, Education Level Filter.**
     - Shows each project card with links to all 5 artifacts (`Proposal PDF`, `Video`, `Cover Image`, `Poster PDF` with a clear badge `"ส่ง POSTER แล้ว"` / `"ยังไม่ส่ง POSTER"`, `Presentation`), average scores per round (`ROUND_1`, `ROUND_2`, `ROUND_3`), and a **"ให้คะแนน Rubric (1–5)"** drawer/panel where judges click `1 | 2 | 3 | 4 | 5` for each weighted criterion, see their live calculated score out of `100`, enter feedback, and save.
     - For `ADMIN`: includes quick action controls on each project to pass/reject Stage 0 screening (`UNDER_REVIEW` / `REJECTED`), pass/fail `ROUND_1` (`PASSED_FIRST_ROUND`), pass/fail `ROUND_2` (`FINALIST`), or assign `AwardTier` + `AWARDED` in `ROUND_3`.
   - **Tab 2: จัดการกรรมการประจำปี (Judge Management & Dynamic Category Assignment)** *(Visible to `ADMIN`)*
     - Add/edit judge accounts (`email`, `password`, `fullName`, `institution`) and toggle checkboxes dynamically rendered from the active `CompetitionYearCategory` list of the selected `CompetitionYear` (supporting any number of categories: 3, 5, 6, 7+).
   - **Tab 3: ตั้งค่ากลุ่มนวัตกรรม, เกณฑ์คะแนน, วันปิดรับสมัคร & ปีการแข่งขัน (Categories, Rubric, Deadline & Multi-Year Setup)** *(Visible to `ADMIN`)*
     - Add new innovation categories or toggle active/inactive categories for the selected competition year (`POST /api/config/categories`), and use that dynamic category list in the Contestant Submission Form and Judge/Admin filters.
     - Edit the rubric criteria titles and `%` weights (validating total = `100%`).
     - Adjust `submissionDeadline` date/time (`PATCH /api/config/deadline`).
     - One-click **"ประกาศผลขึ้นหน้าเว็บไซต์"** buttons for Round 1, Round 2 (`FINALISTS`), and Final Round (`WINNERS`).
     - **"เปิดปีการแข่งขันถัดไป (Create Next Competition Year)"** form (`POST /api/config/years`, e.g. `2571`) so next year's competition can be launched from the UI without touching code.

---

## 6. Builder Decisions (Left to Implementation)
- Exact CSS class names and layout styling inside the Admin/Judge modal, reusing the existing dark/emerald/cyan design tokens in `App.jsx`.
- Default Thai titles and badge classes generated by `POST /api/judging/publish-results` when `title` or `abstract` are omitted.
