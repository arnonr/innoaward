# Contestant Email/Password Auth, 2-Project Quota & Configurable Deadline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable contestants to register and log in with Email + Password to view 3-round status, manage up to 2 projects per account, edit full 3-step forms (including drafts and submitted projects) until a configurable submission deadline, and attach late Poster/Presentation files after the deadline while locking public `Tracking Code` lookups to view-only.

**Architecture:** Harden `/api/auth/login` to verify real credentials and return `401` on unknown email or wrong password. Extend `/api/config` with `PATCH /api/config/deadline` to update `CompetitionYear.submissionEnd` as the single source of truth for the countdown timer and form-edit cutoff. Enforce the 2-project quota, deadline cutoff, and owner authentication in `/api/submissions`, and add a "ผลงานของฉัน (สูงสุด 2 โครงการ)" workspace inside the Portal Modal in `client/src/App.jsx`.

**Tech Stack:** Bun, Elysia.js, Prisma (PostgreSQL), React 19 (Vite), Vitest, `bun:test`.

**Spec:** `docs/superpowers/specs/2026-11-05-contestant-auth-and-deadline-design.md`

## Global Constraints

- Maximum `2` projects per user account (`DRAFT` + `SUBMITTED` combined) in the current competition year.
- Real Email + Password authentication (`POST /api/auth/register` and `POST /api/auth/login`); no silent fake user creation on login when email is not registered or password is wrong.
- Full 3-step form creation and editing (`DRAFT` or `SUBMITTED`) is allowed while `Date.now() <= submissionDeadline` (or by `ADMIN`).
- After `submissionDeadline`, `POST /api/submissions` rejects new submissions and full-form edits by contestants (`403`), while `PATCH /api/submissions/tracking/:trackingCode/artifacts` still allows the authenticated project owner (or `ADMIN`) to attach/update Poster and Presentation links.
- Public `Tracking Code` lookup (`GET /api/submissions/status/:trackingCode`) is strictly view-only (PDPA-masked); `PATCH /api/submissions/tracking/:trackingCode/artifacts` requires an authenticated owner or `ADMIN`.
- Default fallback deadline: `2027-02-28T23:59:59+07:00` (`process.env.SUBMISSION_DEADLINE` or `CompetitionYear.submissionEnd`).

## Review Focus

- Unregistered email on `POST /api/auth/login` must return `401` with a clear Thai message instead of creating a demo user.
- Updating an existing submission (`payload.id` present) when the user already has `2` projects must succeed (`200`), whereas creating a 3rd project (`payload.id` absent) must fail (`400`).
- Attempting `PATCH /api/submissions/tracking/:trackingCode/artifacts` without a token must return `401`, and with another contestant's token must return `403`.
- Attempting `POST /api/submissions` after `CompetitionYear.submissionEnd` has passed must return `403` for a contestant, while `PATCH /api/submissions/tracking/:trackingCode/artifacts` by the owner still succeeds (`200`).
- Hydrating a server submission from `GET /api/submissions/my` into `subForm` must preserve `id`, `trackingCode`, `status`, `category.code`, `educationLevel.code`, `members`, `primaryCoordinator`, `secondaryCoordinator`, and all 5 artifact URLs.

---

### Task 1: Auth Hardening & Configurable Deadline API (`/api/auth` & `/api/config`)

**Files:**
- Modify: `server/src/modules/auth/auth.controller.ts:96-171`
- Modify: `server/src/modules/config/config.controller.ts:1-83`
- Test: `server/tests/auth.test.ts`
- Test: `server/tests/masters.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/auth/login` -> returns `401` `{ success: false, message: 'ไม่พบบัญชีอีเมลนี้ หรือรหัสผ่านไม่ถูกต้อง' }` when email is not found or password does not match (`!password || !verifyPassword(...)`).
  - `GET /api/config` -> returns `event.submissionDeadline` (ISO string from `currentYear.submissionEnd` or `process.env.SUBMISSION_DEADLINE` or `'2027-02-28T16:59:59.000Z'`).
  - `PATCH /api/config/deadline` -> accepts `{ submissionDeadline: string }`, requires `currentUser.role === Role.ADMIN` (returns `401`/`403` otherwise, `400` if date is invalid), updates `CompetitionYear.submissionEnd` for `isCurrent: true`, and returns `{ success: true, submissionDeadline: string }`.

- [ ] **Step 1: Write the failing tests in `server/tests/auth.test.ts` and `server/tests/masters.test.ts`**

Add to `server/tests/auth.test.ts`:
```ts
  test("POST /api/auth/login fails with 401 for unregistered email", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `nonexistent-${Date.now()}@kmutnb.ac.th`,
          password: "AnyPassword123!",
        }),
      })
    );
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
  });
```

Add to `server/tests/masters.test.ts`:
```ts
  test("PATCH /api/config/deadline rejects non-admin and allows ADMIN to update submissionDeadline", async () => {
    const unauthRes = await app.handle(
      new Request("http://localhost/api/config/deadline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionDeadline: "2027-03-15T16:59:59.000Z" }),
      })
    );
    expect([401, 403]).toContain(unauthRes.status);
  });
```

- [ ] **Step 2: Run backend tests to verify they fail**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/auth.test.ts tests/masters.test.ts`
Expected: FAIL (`POST /api/auth/login` returns `200` for unregistered email; `PATCH /api/config/deadline` returns `404`).

- [ ] **Step 3: Implement strict login check in `server/src/modules/auth/auth.controller.ts` and `PATCH /api/config/deadline` in `server/src/modules/config/config.controller.ts`**

In `server/src/modules/auth/auth.controller.ts`, remove the `else` auto-creation block in `POST /api/auth/login`; require both `user` and a valid `password` verified via `verifyPassword(password, user.passwordHash)`, returning `401` on failure.
In `server/src/modules/config/config.controller.ts`, `.use(authPlugin)` and add `.patch('/api/config/deadline', ...)` that validates `currentUser.role === Role.ADMIN`, parses `new Date(body.submissionDeadline)`, updates `prisma.competitionYear.update({ where: { id: currentYear.id }, data: { submissionEnd: parsedDate } })`, and returns the updated ISO string.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/auth.test.ts tests/masters.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/auth/auth.controller.ts server/src/modules/config/config.controller.ts server/tests/auth.test.ts server/tests/masters.test.ts
git commit -m "feat(server): enforce strict email/password login and add configurable deadline endpoint"
```

---

### Task 2: 2-Project Quota, Deadline Cutoff & Artifact Ownership in `/api/submissions`

**Files:**
- Modify: `server/src/modules/submissions/submissions.controller.ts:20-358,419-441`
- Test: `server/tests/submissions.test.ts`

**Interfaces:**
- Consumes: `authPlugin` (`currentUser`), `CompetitionYear.submissionEnd`
- Produces:
  - `POST /api/submissions`:
    - Checks deadline: if `compYear?.submissionEnd && Date.now() > compYear.submissionEnd.getTime() && currentUser?.role !== Role.ADMIN`, returns `403` `{ success: false, message: 'ปิดรับสมัครและสิ้นสุดเวลาแก้ไขข้อมูลใบสมัครแล้ว (หากต้องการแนบโปสเตอร์หรือสไลด์นำเสนอ กรุณาใช้เมนูแนบไฟล์เพิ่มเติม)' }`.
    - Checks 2-project quota on creation (`!payload.id`): counts existing submissions for `targetUserId` in `compYear.id`; if `count >= 2 && currentUser?.role !== Role.ADMIN`, returns `400` `{ success: false, message: 'บัญชีนี้สร้างผลงานครบโควตาสูงสุด 2 โครงการแล้ว' }`.
  - `PATCH /api/submissions/tracking/:trackingCode/artifacts`:
    - Requires `currentUser` (`401` if unauthenticated) and `currentUser.id === found.userId || currentUser.role === Role.ADMIN` (`403` otherwise).
  - `GET /api/submissions/my`:
    - Returns `{ success: true, data: submissions.map(s => formatDossierResponse(s, true)) }` (so each item includes both raw fields and normalized `rounds`, `artifacts`, `memberDetails`, `primaryCoordinator`, `secondaryCoordinator`).

- [ ] **Step 1: Update and add failing tests in `server/tests/submissions.test.ts`**

Update `server/tests/submissions.test.ts` to register a fresh contestant (`contestant-${Date.now()}@kmutnb.ac.th`) at suite start, test creating Project 1 and Project 2, assert that creating Project 3 returns `400`, assert that updating Project 2 with `id` still returns `200`, assert that unauthenticated `PATCH /api/submissions/tracking/:trackingCode/artifacts` returns `401` while authenticated owner `PATCH` returns `200`, and assert that `POST /api/submissions` after an expired `submissionEnd` returns `403` (restoring `submissionEnd` in `finally`).

- [ ] **Step 2: Run backend submission tests to verify they fail**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test tests/submissions.test.ts`
Expected: FAIL (3rd submission returns `200` instead of `400`; unauthenticated `PATCH` returns `200` instead of `401`).

- [ ] **Step 3: Implement 2-project quota, deadline check, artifact auth check, and formatted `/my` response in `server/src/modules/submissions/submissions.controller.ts`**

In `POST /api/submissions`:
1. Check `compYear?.submissionEnd` against `Date.now()` for non-ADMIN users.
2. When creating a new submission (`!submission`), if `currentUser?.role !== Role.ADMIN`, query `prisma.submission.count({ where: { userId: targetUserId, competitionYearId: compYear!.id } })` and reject with `400` if `>= 2`.
In `PATCH /api/submissions/tracking/:trackingCode/artifacts`:
1. If `!currentUser`, return `401`.
2. If `currentUser.id !== found.userId && currentUser.role !== Role.ADMIN`, return `403`.
In `GET /api/submissions/my`:
Return `submissions.map((s) => ({ ...s, ...formatDossierResponse(s, true) }))`.

- [ ] **Step 4: Run all backend tests to verify they pass**

Run: `cd /Users/macbook-arnon/Projects/innoaward/server && bun test`
Expected: PASS (all backend test suites green).

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/submissions/submissions.controller.ts server/tests/submissions.test.ts
git commit -m "feat(server): enforce 2-project quota, submission deadline cutoff, and artifact owner auth"
```

---

### Task 3: Frontend Dossier Utilities for Form Hydration, `id` Preservation & Deadline Helpers

**Files:**
- Modify: `client/src/components/submissionDossierUtils.js:250-414`
- Test: `client/src/components/__tests__/submissionDossierUtils.test.js`

**Interfaces:**
- Produces in `client/src/components/submissionDossierUtils.js`:
  - `buildSubmissionApiPayload(form, isDraft = false, userId = 'guest-user')` -> includes `...(form?.id ? { id: String(form.id) } : {})`.
  - `hydrateSubmissionFormFromServer(record)` -> converts a server submission object from `GET /api/submissions/my` into the full `subForm` shape (`id`, `trackingCode`, `status`, `titleTh`, `titleEn`, `category`, `educationLevel`, `teamName`, `affiliation`, `advisorName`, `abstractTh`, `members`, `primaryCoordinator`, `secondaryCoordinator`, `proposalPdfUrl`, `videoUrl`, `posterUrl`, `coverImage`, `presentationUrl`, `documentUrl`).
  - `isSubmissionDeadlinePassed(deadlineIso, nowMs = Date.now())` -> returns `boolean` (`true` when `deadlineIso` parses to a valid timestamp `< nowMs`).
  - `MAX_PROJECTS_PER_ACCOUNT = 2`.

- [ ] **Step 1: Write failing unit tests in `client/src/components/__tests__/submissionDossierUtils.test.js`**

Add tests asserting:
1. `buildSubmissionApiPayload({ ...validForm, id: 'sub-123' }, false, 'user-1')` includes `id: 'sub-123'`.
2. `hydrateSubmissionFormFromServer(serverRecord)` maps nested `category.code`, `educationLevel.code`, `members`, `primaryCoordinator`, `secondaryCoordinator`, and `artifacts` back into an editable `subForm` with `id` and `trackingCode`.
3. `isSubmissionDeadlinePassed('2027-02-28T23:59:59+07:00', Date.parse('2027-03-01T00:00:00+07:00'))` returns `true` and before deadline returns `false`.

- [ ] **Step 2: Run frontend unit tests to verify they fail**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && npx vitest run src/components/__tests__/submissionDossierUtils.test.js`
Expected: FAIL (`hydrateSubmissionFormFromServer` and `isSubmissionDeadlinePassed` not exported; `payload.id` undefined).

- [ ] **Step 3: Implement `id` preservation, `hydrateSubmissionFormFromServer`, `isSubmissionDeadlinePassed`, and `MAX_PROJECTS_PER_ACCOUNT` in `client/src/components/submissionDossierUtils.js`**

Update `createInitialSubmissionForm` to include `id: ''`, `trackingCode: ''`, `status: 'DRAFT'`, update `buildSubmissionApiPayload` to include `id` when `form?.id` is non-empty, and export `MAX_PROJECTS_PER_ACCOUNT = 2`, `hydrateSubmissionFormFromServer(record)`, and `isSubmissionDeadlinePassed(deadlineIso, nowMs = Date.now())`.

- [ ] **Step 4: Run frontend unit tests to verify they pass**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && npx vitest run src/components/__tests__/submissionDossierUtils.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/components/submissionDossierUtils.js client/src/components/__tests__/submissionDossierUtils.test.js
git commit -m "feat(client): add submission form hydration, id preservation, and deadline helpers"
```

---

### Task 4: Contestant Portal "ผลงานของฉัน (สูงสุด 2 โครงการ)", Dynamic Deadline & View-Only Public Status Modal in `App.jsx`

**Files:**
- Modify: `client/src/App.jsx`
- Test: `client/src/components/__tests__/App.submission.test.jsx`

**Interfaces:**
- Consumes from `client/src/components/submissionDossierUtils.js`:
  - `hydrateSubmissionFormFromServer`, `isSubmissionDeadlinePassed`, `MAX_PROJECTS_PER_ACCOUNT`, `buildSubmissionApiPayload`
- Produces in `client/src/App.jsx`:
  - Dynamic `submissionDeadlineIso` state initialized from `import.meta.env.VITE_SUBMISSION_DEADLINE || '2027-02-28T23:59:59+07:00'` and updated from `GET /api/config` (`data.event?.submissionDeadline`), driving `calculateTimeLeft(submissionDeadlineIso)` and `deadlinePassed = isSubmissionDeadlinePassed(submissionDeadlineIso)`.
  - Strict `handleAuthLogin` & `handleAuthRegister`: displays `authError` when `data.success === false` (no fake login on wrong password), stores `authToken` + `user`, and calls `fetchMySubmissions(data.token)`.
  - `mySubmissions` state (`GET /api/submissions/my`) & Contestant Workspace in Portal Modal:
    - Shows the logged-in user's email, logout button, quota badge (`ผลงานของคุณ: X / 2 โครงการ`), and cards for each existing project with its 3-round status, `trackingCode`, **"ดูแฟ้มสถานะ & แนบไฟล์เพิ่ม"** button, and (when `!deadlinePassed`) **"แก้ไขข้อมูลใบสมัคร (3 ขั้นตอน)"** button.
    - Shows **"+ สร้างโครงการใหม่"** button when `mySubmissions.length < MAX_PROJECTS_PER_ACCOUNT && !deadlinePassed`.
    - Server-backed `handleSubmission(true)` (`Save Draft`): saves to `POST /api/submissions` (`isDraft: true`) with `Authorization: Bearer ${authToken}` as well as `localStorage`, and refreshes `mySubmissions`.
  - Public `Tracking Code` Status Modal (`showStatusModal`):
    - Only shows the Late Artifact Editor (`showLateArtifactEditor`) if the logged-in `user` owns the submission (`user && (statusResult.userId === user.id || user.role === 'ADMIN')`); otherwise renders a **"เข้าสู่ระบบด้วยอีเมลเพื่อแก้ไขข้อมูล / แนบไฟล์เพิ่มเติม"** button that opens the Portal Modal on the `'login'` tab.
    - Sends `Authorization: Bearer ${authToken}` header in `handleSaveLateArtifacts`.

- [ ] **Step 1: Write failing integration tests in `client/src/components/__tests__/App.submission.test.jsx`**

Add tests verifying:
1. Logging in with wrong password (`401` from `/api/auth/login`) shows the error message and does NOT log the user in.
2. Logging in with valid credentials fetches `GET /api/submissions/my`, displays the user's existing projects (`1 / 2 โครงการ`), allows clicking **"แก้ไขข้อมูลใบสมัคร"** to populate the 3-step form with the existing project's data, and sends `id` on save.
3. Public status search (`GET /api/submissions/status/:trackingCode`) when not logged in hides the late artifact edit inputs and shows the **"เข้าสู่ระบบด้วยอีเมลเพื่อแก้ไขข้อมูล / แนบไฟล์เพิ่มเติม"** button instead.

- [ ] **Step 2: Run frontend integration tests to verify they fail**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && npx vitest run src/components/__tests__/App.submission.test.jsx`
Expected: FAIL

- [ ] **Step 3: Implement Contestant Workspace, strict auth error handling, server-backed drafts, dynamic deadline, and owner-gated late artifact editing in `client/src/App.jsx`**

Update `client/src/App.jsx` to wire `/api/config` deadline, `authError`, `mySubmissions`, `fetchMySubmissions`, project selection/creation up to `MAX_PROJECTS_PER_ACCOUNT`, server-persisted draft saving, and owner-gated late artifact editing in the Status Modal.

- [ ] **Step 4: Run all frontend and backend tests to verify everything passes**

Run: `cd /Users/macbook-arnon/Projects/innoaward/client && npx vitest run && cd /Users/macbook-arnon/Projects/innoaward/server && bun test`
Expected: PASS (all frontend and backend tests pass).

- [ ] **Step 5: Commit**

```bash
git add client/src/App.jsx client/src/components/__tests__/App.submission.test.jsx
git commit -m "feat(client): add 2-project contestant workspace, email/pass login flow, and dynamic deadline"
```
