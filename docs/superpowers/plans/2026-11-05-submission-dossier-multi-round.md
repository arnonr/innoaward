# Submission Dossier & Multi-Round Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the KMUTNB Innovation Awards 2027 submission portal and tracking system to capture full project dossiers (affiliation, team members with citizen/passport IDs, primary/secondary coordinators, 5 deliverable artifacts with post-submission update capability for Poster & Presentation, and 3-round progression status) and display an official Submission Dossier card in the status lookup modal.

**Architecture:** Extend the Prisma PostgreSQL schema (`Submission`, `TeamMember`, `RoundStatus`) and Elysia `/api/submissions` endpoints with PDPA masking for unauthenticated status lookups, round status privilege sanitization, and post-submission deliverable updates (`PATCH /api/submissions/tracking/:trackingCode/artifacts`). On the frontend (`client/src/App.jsx`), organize the submission form into a 3-step tabbed flow (`1. ข้อมูลผลงานและสังกัด`, `2. สมาชิกและผู้ประสานงาน`, `3. แนบไฟล์ 5 รายการ`) backed by testable helper utilities (`client/src/components/submissionDossierUtils.js`) and render the full official Dossier + post-submission Poster/Presentation updater inside `showStatusModal`.

**Tech Stack:** Bun, Elysia.js, Prisma ORM, PostgreSQL, React 19, Vite, Lucide Icons, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-05-submission-dossier-multi-round-design.md`

## Global Constraints

- **Stack:** React 19 + Vite (Frontend), Bun + Elysia.js + Prisma ORM + PostgreSQL (Backend).
- **Design System:** KMUTNB Luminous Sapphire (Navy `#0A1628`, Cyan `#00F5D4`, Gold `#F59E0B`, Emerald `#10B981`).
- **Accessibility:** Touch targets >= 44px, WCAG AA color contrast, accessible form labels, escape key modal closure.
- **Data Integrity:** Graceful fallback to `localStorage` when backend is offline or unreachable; preserve backwards compatibility with existing string-array `members` and legacy `documentUrl` / `coverImage` payloads.
- **Master Category Compatibility:** `GET /api/masters/categories` and `GET /api/config` must continue returning the 5 canonical active innovation domains so `server/tests/masters.test.ts` passes, while `POST /api/submissions` accepts `category: "others"` by resolving or auto-creating the `others` category record (`isActive: false`).

## Review Focus

1. **Legacy string-array vs. object-array `members` payloads:** Callers (including existing tests and `localStorage` drafts) may pass `members` as `["นาย ก", "นางสาว ข"]` or as `[{ fullName: "ผศ.ดร.วัฒนา แก้วมณี", role: "หัวหน้าทีม", idCard: "5-1601-00029-58-2" }]`; both must normalize cleanly without throwing or dropping names (tested in Task 2 and Task 3).
2. **Contestant privilege escalation via round/award fields in `POST /api/submissions`:** If a contestant payload includes `round1Status: "PASSED"`, `round2Status: "PASSED"`, `round3Status: "PASSED"`, or `round3Result: "รางวัลชนะเลิศ"`, the server must ignore those fields and keep initial rounds at `PENDING` (tested in Task 2).
3. **PDPA masking on unauthenticated status lookup vs. owner lookup:** Public `GET /api/submissions/status/:trackingCode` must mask citizen IDs (`5-1601-XXXXX-XX-X`), phone numbers (`064-XXX-9888`), and emails (`w***@fte.kmutnb.ac.th`), while authenticated requests from the submission owner (`Authorization: Bearer <ownerToken>`) receive unmasked values (tested in Task 2).
4. **Optional initial Poster & Presentation with post-submission update:** Final submission (`isDraft: false`) must succeed when `proposalPdfUrl` (or `documentUrl`), `videoUrl`, and `coverImage` (or `imageUrl`) are provided even if `posterUrl` and `presentationUrl` are empty, and `PATCH /api/submissions/tracking/:trackingCode/artifacts` must allow attaching `posterUrl` and `presentationUrl` later without overwriting existing `proposalPdfUrl` or `videoUrl` (tested in Task 2 and Task 3).
5. **Short or hyphenless citizen/passport IDs during masking:** Passport numbers (e.g. `AA1234567`) or unformatted 13-digit Thai IDs (`5160100029582`) must be masked safely without throwing index errors or leaking the full identifier (tested in Task 2 and Task 3).

---

### Task 1: Prisma Schema, Database Push & Seed Data Enrichment

**Files:**
- Modify: `server/prisma/schema.prisma:15-215`
- Modify: `server/prisma/seed.ts:252-486`
- Test: `server/tests/masters.test.ts`, `server/tests/winners-announcements.test.ts`

**Interfaces:**
- Produces:
  - Prisma `enum RoundStatus { PENDING PASSED FAILED }`
  - `Submission` model fields: `affiliation`, `proposalPdfUrl`, `posterUrl`, `presentationUrl`, `primaryCoordName`, `primaryCoordIdCard`, `primaryCoordPhone`, `primaryCoordEmail`, `secondaryCoordName`, `secondaryCoordIdCard`, `secondaryCoordPhone`, `secondaryCoordEmail`, `round1Status`, `round2Status`, `round3Status`, `round3Result`
  - `TeamMember` model field: `idCard`

- [ ] **Step 1: Add `RoundStatus` enum and new Dossier fields to `server/prisma/schema.prisma`**

Add `enum RoundStatus`:
```prisma
enum RoundStatus {
  PENDING
  PASSED
  FAILED
}
```
Add fields to `model Submission`:
```prisma
  affiliation               String?                  @default("")
  proposalPdfUrl            String?                  @default("")
  posterUrl                 String?                  @default("")
  presentationUrl           String?                  @default("")
  primaryCoordName          String?                  @default("")
  primaryCoordIdCard        String?                  @default("")
  primaryCoordPhone         String?                  @default("")
  primaryCoordEmail         String?                  @default("")
  secondaryCoordName        String?                  @default("")
  secondaryCoordIdCard      String?                  @default("")
  secondaryCoordPhone       String?                  @default("")
  secondaryCoordEmail       String?                  @default("")
  round1Status              RoundStatus              @default(PENDING)
  round2Status              RoundStatus              @default(PENDING)
  round3Status              RoundStatus              @default(PENDING)
  round3Result              String?                  @default("")
```
Add `idCard String? @default("")` to `model TeamMember`.

- [ ] **Step 2: Push schema to PostgreSQL and regenerate Prisma Client**

Run: `bunx --cwd server prisma db push`
Expected: `Your database is now in sync with your Prisma schema` and `Generated Prisma Client`.

- [ ] **Step 3: Enrich `server/prisma/seed.ts` with real dossier fields for 2569 winners (including `KMUTNB-2569-0002` Wattana Kaewmanee record)**

Update `winnersData` and the `submission.create` / `submission.update` blocks in `server/prisma/seed.ts` so:
- All 2569 winners set `round1Status: RoundStatus.PASSED`, `round2Status: RoundStatus.PASSED`, `round3Status: RoundStatus.PASSED`, `round3Result: win.awardNameTh`, `affiliation: win.institution`, `posterUrl: win.coverImage`, `proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf'`, `presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'`.
- `KMUTNB-2569-0002` specifically seeds:
  - `members`: `[{ fullName: 'ผศ.ดร.วัฒนา แก้วมณี', role: 'หัวหน้าทีม', idCard: '5-1601-00029-58-2' }]`
  - `primaryCoordName: 'ผศ.ดร.วัฒนา แก้วมณี'`, `primaryCoordIdCard: '5-1601-00029-58-2'`, `primaryCoordPhone: '064-274-9888'`, `primaryCoordEmail: 'wattana.k@fte.kmutnb.ac.th'`
  - `secondaryCoordName: 'ผศ.ดร.วัฒนา แก้วมณี'`, `secondaryCoordIdCard: '5-1601-00029-58-2'`, `secondaryCoordPhone: '064-274-9888'`, `secondaryCoordEmail: 'wattana.kaewmanee@gmail.com'`

- [ ] **Step 4: Run seed and verify existing test suites pass**

Run: `bun --cwd server run seed && bun test --cwd server`
Expected: Seed completes and all 23 existing tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add server/prisma/schema.prisma server/prisma/seed.ts
git commit -m "feat(db): add submission dossier, coordinator, artifact, and multi-round fields to Prisma schema"
```

---

### Task 2: PDPA Masking Helpers & Backend Submissions API (`/api/submissions`)

**Files:**
- Create: `server/src/modules/submissions/dossier-utils.ts`
- Modify: `server/src/modules/submissions/submissions.schema.ts`
- Modify: `server/src/modules/submissions/submissions.controller.ts`
- Modify: `server/tests/submissions.test.ts`

**Interfaces:**
- Consumes: Prisma `Submission`, `TeamMember`, `RoundStatus` from Task 1.
- Produces:
  - `maskIdCard(raw: string | null | undefined): string`
  - `maskPhone(raw: string | null | undefined): string`
  - `maskEmail(raw: string | null | undefined): string`
  - `normalizeMembersInput(members: unknown, fallbackName: string): Array<{ fullName: string; role: string; idCard: string }>`
  - `formatDossierResponse(submission: any, isOwnerOrAdmin: boolean): Record<string, any>`
  - `POST /api/submissions` accepting full dossier payload
  - `GET /api/submissions/status/:trackingCode` returning full dossier with PDPA masking for non-owners and unmasked PII for owner/admin
  - `PATCH /api/submissions/tracking/:trackingCode/artifacts` allowing post-submission updates to `posterUrl`, `presentationUrl`, `proposalPdfUrl`, `videoUrl`, `coverImage`

- [ ] **Step 1: Write failing tests in `server/tests/submissions.test.ts` covering all new dossier capabilities and Review Focus cases**

Add tests to `server/tests/submissions.test.ts`:
```typescript
  test("POST /api/submissions creates full dossier with affiliation, object members, coordinators, and sanitizes round statuses", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบอัจฉริยะ",
          titleEn: "Smart HDPE Pipe Welding Controller",
          category: "others",
          educationLevel: "higher_and_above",
          teamName: "เขาชื่ออะไร",
          affiliation: "คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
          advisorName: "ผศ.ดร.วัฒนา แก้วมณี",
          abstractTh: "ระบบควบคุมและบันทึกข้อมูลการเชื่อมท่อ HDPE แบบ Butt Fusion",
          members: [
            { fullName: "ผศ.ดร.วัฒนา แก้วมณี", role: "หัวหน้าทีม", idCard: "5-1601-00029-58-2" },
            { fullName: "นาย นวัตกร วิจัยดี", role: "สมาชิก", idCard: "1100100234567" },
          ],
          primaryCoordinator: {
            name: "ผศ.ดร.วัฒนา แก้วมณี",
            idCard: "5-1601-00029-58-2",
            phone: "064-274-9888",
            email: "wattana.k@fte.kmutnb.ac.th",
          },
          secondaryCoordinator: {
            name: "ผศ.ดร.วัฒนา แก้วมณี",
            idCard: "AA9876543",
            phone: "064-274-9888",
            email: "wattana.kaewmanee@gmail.com",
          },
          files: {
            proposalPdfUrl: "https://drive.google.com/proposal.pdf",
            videoUrl: "https://youtube.com/watch?v=hdpe123",
            imageUrl: "/hdpe-poster.jpg",
            posterUrl: "",
            presentationUrl: "",
          },
          // Attempt privilege escalation (must be ignored by server)
          round1Status: "PASSED",
          round2Status: "PASSED",
          round3Status: "PASSED",
          round3Result: "รางวัลชนะเลิศ",
          isDraft: false,
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.affiliation).toContain("คณะครุศาสตร์อุตสาหกรรม");
    expect(json.data.round1Status).toBe("PENDING");
    expect(json.data.round2Status).toBe("PENDING");
    expect(json.data.round3Status).toBe("PENDING");
    expect(json.data.round3Result).toBe("");
    expect(json.data.members[0].idCard).toBe("5-1601-00029-58-2");
    createdTrackingCode = json.data.trackingCode;
  });

  test("GET /api/submissions/status/:trackingCode masks PII for unauthenticated requests and unmasks for owner", async () => {
    const publicRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${createdTrackingCode}`)
    );
    expect(publicRes.status).toBe(200);
    const pubJson = await publicRes.json();
    expect(pubJson.data.primaryCoordinator.idCard).toBe("5-1601-XXXXX-XX-X");
    expect(pubJson.data.primaryCoordinator.phone).toBe("064-XXX-9888");
    expect(pubJson.data.primaryCoordinator.email).toBe("w***@fte.kmutnb.ac.th");
    expect(pubJson.data.memberDetails[0].idCard).toBe("5-1601-XXXXX-XX-X");
    expect(pubJson.data.memberDetails[1].idCard).toBe("1-1001-XXXXX-XX-X");
    expect(pubJson.data.secondaryCoordinator.idCard).toBe("AAXXXXX43");

    const ownerRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${createdTrackingCode}`, {
        headers: { Authorization: `Bearer ${contestantToken}` },
      })
    );
    const ownerJson = await ownerRes.json();
    expect(ownerJson.data.primaryCoordinator.idCard).toBe("5-1601-00029-58-2");
    expect(ownerJson.data.primaryCoordinator.phone).toBe("064-274-9888");
    expect(ownerJson.data.primaryCoordinator.email).toBe("wattana.k@fte.kmutnb.ac.th");
  });

  test("PATCH /api/submissions/tracking/:trackingCode/artifacts allows attaching Poster and Presentation later", async () => {
    const patchRes = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${createdTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/poster-round2.pdf",
          presentationUrl: "https://drive.google.com/slides-round3.pdf",
        }),
      })
    );
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.success).toBe(true);
    expect(patchJson.data.artifacts.posterUrl).toBe("https://drive.google.com/poster-round2.pdf");
    expect(patchJson.data.artifacts.presentationUrl).toBe("https://drive.google.com/slides-round3.pdf");
    expect(patchJson.data.artifacts.proposalPdfUrl).toBe("https://drive.google.com/proposal.pdf");
  });
```

- [ ] **Step 2: Run `bun test --cwd server` to verify the new tests fail**

Run: `bun test --cwd server tests/submissions.test.ts`
Expected: FAIL on missing fields/routes.

- [ ] **Step 3: Create `server/src/modules/submissions/dossier-utils.ts` and update `submissions.schema.ts` & `submissions.controller.ts`**

Implement in `server/src/modules/submissions/dossier-utils.ts`:
- `maskIdCard(raw)`: If digits after stripping hyphens are 13 digits, format as `D-DDDD-XXXXX-XX-X` (showing first 5 digits and masking last 8 digits as `XXXXX-XX-X`); if alphanumeric/other length >= 4, keep first 2 and last 2 chars with `X` in between; otherwise return `""`.
- `maskPhone(raw)`: Format 10-digit Thai phone numbers `064-274-9888` or `0642749888` as `064-XXX-9888`.
- `maskEmail(raw)`: Mask local part before `@` as `<firstChar>***@<domain>`.
- `normalizeMembersInput(members, fallbackName)`: Accept string array, comma-separated string, or object array `Array<{ fullName: string, role?: string, idCard?: string }>`, defaulting role of index 0 to `'หัวหน้าทีม'` and subsequent items to `'สมาชิก'`.
- `formatDossierResponse(found, isOwnerOrAdmin)`: Return backwards-compatible fields (`members: string[]`, `coverImage`, `videoUrl`, `documentUrl`) alongside new structured dossier fields (`affiliation`, `memberDetails`, `primaryCoordinator`, `secondaryCoordinator`, `rounds`, `artifacts`).

Update `submissions.schema.ts` and `submissions.controller.ts`:
- Support `category: "others"` by upserting `{ code: 'others', nameTh: 'อื่นๆ (Others)', nameEn: 'Others', isActive: false, orderIndex: 6 }` if not found in `Category`.
- Strip any `round1Status`, `round2Status`, `round3Status`, `round3Result` from contestant `POST /api/submissions`.
- Add `PATCH /api/submissions/tracking/:trackingCode/artifacts` to update non-empty artifact URLs (`proposalPdfUrl`, `videoUrl`, `posterUrl`, `coverImage`, `presentationUrl`).
- Add `PATCH /api/submissions/:id/status` for Admin/Judge to update `status`, `round1Status`, `round2Status`, `round3Status`, `round3Result`, and `feedback`.

- [ ] **Step 4: Run `bun test --cwd server` to verify all backend tests pass**

Run: `bun test --cwd server`
Expected: All tests pass (`0 fail`).

- [ ] **Step 5: Commit Task 2**

```bash
git add server/src/modules/submissions/dossier-utils.ts server/src/modules/submissions/submissions.schema.ts server/src/modules/submissions/submissions.controller.ts server/tests/submissions.test.ts
git commit -m "feat(api): implement full dossier submission, PDPA masking, and artifact update endpoints"
```

---

### Task 3: Frontend Dossier Normalization & Validation Helpers

**Files:**
- Create: `client/src/components/submissionDossierUtils.js`
- Create: `client/src/components/submissionDossierUtils.test.mjs`

**Interfaces:**
- Produces:
  - `createInitialSubmissionForm(): Object`
  - `validateSubmissionStep(form: Object, step: number, isDraft: boolean): string`
  - `buildSubmissionApiPayload(form: Object, isDraft: boolean, userId: string): Object`
  - `normalizeStatusDossier(raw: Object): Object`
  - `formatCitizenIdInput(value: string): string`

- [ ] **Step 1: Write failing unit tests in `client/src/components/submissionDossierUtils.test.mjs`**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSubmissionForm,
  validateSubmissionStep,
  buildSubmissionApiPayload,
  normalizeStatusDossier,
  formatCitizenIdInput
} from './submissionDossierUtils.js';

test('formatCitizenIdInput formats 13 Thai digits as X-XXXX-XXXXX-XX-X and preserves passport strings', () => {
  assert.equal(formatCitizenIdInput('5160100029582'), '5-1601-00029-58-2');
  assert.equal(formatCitizenIdInput('AA1234567'), 'AA1234567');
});

test('validateSubmissionStep requires Proposal PDF, Video, and Image on final submit but allows empty Poster and Presentation', () => {
  const form = {
    ...createInitialSubmissionForm(),
    titleTh: 'เครื่องควบคุมการเชื่อมท่อ HDPE',
    teamName: 'เขาชื่ออะไร',
    affiliation: 'คณะครุศาสตร์อุตสาหกรรม มจพ.',
    abstractTh: 'รายละเอียดผลงานครบถ้วน',
    members: [{ fullName: 'ผศ.ดร.วัฒนา แก้วมณี', role: 'หัวหน้าทีม', idCard: '5-1601-00029-58-2' }],
    primaryCoordinator: {
      name: 'ผศ.ดร.วัฒนา แก้วมณี',
      idCard: '5-1601-00029-58-2',
      phone: '064-274-9888',
      email: 'wattana.k@fte.kmutnb.ac.th'
    },
    proposalPdfUrl: 'https://drive.google.com/proposal.pdf',
    videoUrl: 'https://youtube.com/watch?v=123',
    coverImage: '/hdpe-poster.jpg',
    posterUrl: '',
    presentationUrl: ''
  };
  assert.equal(validateSubmissionStep(form, 1, false), '');
  assert.equal(validateSubmissionStep(form, 2, false), '');
  assert.equal(validateSubmissionStep(form, 3, false), '');
});

test('normalizeStatusDossier produces complete 3-round, coordinator, member, and 5-artifact structure for KMUTNB-2569-0002 fallback', () => {
  const dossier = normalizeStatusDossier({ trackingCode: 'KMUTNB-2569-0002' });
  assert.equal(dossier.teamName, 'เขาชื่ออะไร');
  assert.equal(dossier.rounds.round2.status, 'PASSED');
  assert.equal(dossier.rounds.round3.status, 'PASSED');
  assert.equal(dossier.rounds.round3.result, 'รางวัลรองชนะเลิศอันดับ 1');
  assert.equal(dossier.primaryCoordinator.name, 'ผศ.ดร.วัฒนา แก้วมณี');
});
```

- [ ] **Step 2: Run node test to verify it fails**

Run: `node --test client/src/components/submissionDossierUtils.test.mjs`
Expected: FAIL (`Cannot find module './submissionDossierUtils.js'`).

- [ ] **Step 3: Implement `client/src/components/submissionDossierUtils.js`**

Implement the 5 exported functions in `client/src/components/submissionDossierUtils.js`:
- `createInitialSubmissionForm()` returning default fields for Step 1 (`titleTh`, `titleEn`, `category`, `educationLevel`, `teamName`, `affiliation`, `advisorName`, `abstractTh`), Step 2 (`members: [{ fullName: '', role: 'หัวหน้าทีม', idCard: '' }]`, `primaryCoordinator: { name: '', idCard: '', phone: '', email: '' }`, `secondaryCoordinator: { name: '', idCard: '', phone: '', email: '' }`), and Step 3 (`proposalPdfUrl`, `videoUrl`, `posterUrl`, `coverImage`, `presentationUrl`, `documentUrl`).
- `formatCitizenIdInput(value)` formatting 13-digit numbers into `X-XXXX-XXXXX-XX-X`.
- `validateSubmissionStep(form, step, isDraft)` checking Step 1 (titleTh, teamName, affiliation, abstractTh), Step 2 (at least 1 member with fullName, primaryCoordinator name/phone/email), and Step 3 (proposalPdfUrl/documentUrl, videoUrl, coverImage required on final submit; posterUrl & presentationUrl optional).
- `buildSubmissionApiPayload(form, isDraft, userId)` assembling the exact API payload for `POST /api/submissions`.
- `normalizeStatusDossier(raw)` normalizing API responses, `localStorage` records, and built-in 2569 fallback records (including `KMUTNB-2569-0001` through `KMUTNB-2569-0006`, with `KMUTNB-2569-0002` populated with Asst. Prof. Dr. Wattana Kaewmanee's full example data).

- [ ] **Step 4: Run node tests to verify they pass**

Run: `node --test client/src/components/submissionDossierUtils.test.mjs client/src/components/domainCatalog.test.mjs client/src/components/heroThreeStageConfig.test.mjs`
Expected: PASS (all tests pass).

- [ ] **Step 5: Commit Task 3**

```bash
git add client/src/components/submissionDossierUtils.js client/src/components/submissionDossierUtils.test.mjs
git commit -m "feat(client): add submission dossier state, validation, and normalization utilities"
```

---

### Task 4: Frontend 3-Step Submission Portal & Official Submission Dossier Modal

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/index.css`

**Interfaces:**
- Consumes: `createInitialSubmissionForm`, `validateSubmissionStep`, `buildSubmissionApiPayload`, `normalizeStatusDossier`, `formatCitizenIdInput` from `client/src/components/submissionDossierUtils.js`.
- Produces:
  - 3-Step Submission Form inside `showPortalModal` (`portalTab === 'submission'`)
  - Official Submission Dossier view + post-submission Poster & Presentation attachment updater inside `showStatusModal`

- [ ] **Step 1: Wire `submissionDossierUtils.js` into `client/src/App.jsx` and upgrade `portalTab === 'submission'` to the 3-step form**

In `client/src/App.jsx`:
- Import helpers from `./components/submissionDossierUtils`.
- Add `submissionStep` state (`1 | 2 | 3`) with clickable step pills:
  1. `1. ข้อมูลผลงานและสังกัด` (ชื่อผลงานไทย/อังกฤษ, หมวดหมู่, ระดับการแข่งขัน, ชื่อทีม, สังกัด คณะ/หน่วยงาน, อาจารย์ที่ปรึกษา, รายละเอียดผลงาน)
  2. `2. สมาชิกและผู้ประสานงาน` (รายการสมาชิกทีมพร้อมปุ่ม `+ เพิ่มสมาชิก` และลบรายคน, ช่องกรอกชื่อ/บทบาท/เลขบัตรประชาชนหรือพาสปอร์ต, ปุ่มลัดคัดลอกข้อมูลหัวหน้าทีมไปยังผู้ประสานงานหลัก, ฟอร์มผู้ประสานงานหลัก และฟอร์มผู้ประสานงานรอง)
  3. `3. ไฟล์ประกอบผลงาน (5 รายการ)` (Proposal PDF `[จำเป็น]`, คลิป VDO `[จำเป็น]`, รูปภาพผลงาน Image `[จำเป็น]`, โปสเตอร์ Poster `[แนบเพิ่มเติมทีหลังได้]`, สไลด์นำเสนอ Presentation `[แนบเพิ่มเติมทีหลังได้]`)
- Preserve `บันทึกแบบร่าง` and `ส่งผลงานฉบับสมบูรณ์` across all steps.

- [ ] **Step 2: Upgrade `showStatusModal` in `client/src/App.jsx` to render the Official Submission Dossier & Post-Submission Deliverable Updater**

In `showStatusModal`:
- Add quick-demo lookup chips (`KMUTNB-2569-0002`, `KMUTNB-2569-0001`) so users can test the full dossier with one click.
- Render the Dossier Card displaying:
  - **ข้อมูลหลัก:** รหัสผลงาน, วันที่สมัคร, ชื่อทีม, หมวดหมู่, สังกัด, ชื่อผลงาน (ไทย), ชื่อผลงาน (อังกฤษ), รายละเอียดผลงาน
  - **สมาชิกทีม:** ลำดับ, ชื่อ-นามสกุล (บทบาท), เลขบัตรประชาชน / พาสปอร์ต
  - **ผู้ประสานงานหลัก & ผู้ประสานงานรอง:** ชื่อ, เลขบัตรประชาชน / พาสปอร์ต, โทร, อีเมล
  - **ผลการคัดเลือกรายรอบ:**
    - ผ่านเข้ารอบที่ 2 (รอบการประกวดออนไลน์) : `ผ่าน` / `ไม่ผ่าน` / `รอประกาศผล`
    - ผ่านเข้ารอบที่ 3 (รอบตัดสิน) : `ผ่าน` / `ไม่ผ่าน` / `รอประกาศผล`
    - ผลลัพธ์การแข่งขันรอบ 3 : เช่น `รางวัลรองชนะเลิศอันดับ 1`
  - **ไฟล์ประกอบผลงานครบ 5 รายการ:**
    1. ไฟล์ PDF แบบฟอร์มเสนอผลงานประกวดสิ่งประดิษฐ์และนวัตกรรม
    2. คลิป VDO นำเสนอผลงาน
    3. Poster
    4. Image
    5. Presentation
  - **ปุ่ม "แนบ/อัปเดตไฟล์เพิ่มเติม (Poster & Presentation)":** Toggles an inline form calling `PATCH /api/submissions/tracking/:trackingCode/artifacts` (and syncing `localStorage`) so contestants can attach Poster and Presentation URLs later.

- [ ] **Step 3: Add responsive CSS classes for the 3-step stepper, member cards, and dossier layout in `client/src/index.css`**

Add `.submission-stepper`, `.dossier-card`, `.dossier-grid`, `.dossier-rounds-box`, `.dossier-artifact-list` in `client/src/index.css` with touch targets >= 44px and mobile-first responsive breakpoints.

- [ ] **Step 4: Run client lint, unit tests, production build, and backend tests**

Run: `npm --prefix client run lint && node --test client/src/components/*.test.mjs && npm --prefix client run build && bun test --cwd server`
Expected: `0 errors`, all frontend and backend tests pass, and Vite build succeeds cleanly.

- [ ] **Step 5: Commit Task 4**

```bash
git add client/src/App.jsx client/src/index.css
git commit -m "feat(ui): implement 3-step submission form, full submission dossier view, and late artifact updater"
```
