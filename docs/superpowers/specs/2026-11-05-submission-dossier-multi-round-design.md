# KMUTNB Innovation Awards 2027 — Full-Integrated Submission Dossier & Multi-Round Tracking System

**Date:** 2026-11-05  
**Status:** In Review / Design Spec  
**Size:** Project (Full written design covering database schema, backend API, frontend submission form, and submission dossier view)

---

## 1. Intent & Why

The user provided an official real-world submission profile structure used in the KMUTNB Innovation Awards:
- **ผลงานและสังกัด:** รหัสผลงาน, วันที่สมัคร, ชื่อทีม, หมวดหมู่, สังกัด (Faculty/Affiliation), ชื่อผลงาน (ไทย-อังกฤษ), รายละเอียดผลงาน
- **สมาชิกทีม:** ชื่อ, บทบาท (เช่น หัวหน้าทีม), เลขประจำตัวประชาชน / พาสปอร์ต (เช่น `5-1601-00029-58-2`)
- **ผู้ประสานงานหลัก:** ชื่อ, เลขบัตรประชาชน/พาสปอร์ต, เบอร์โทรศัพท์, อีเมล
- **ผู้ประสานงานรอง:** ชื่อ, เลขบัตรประชาชน/พาสปอร์ต, เบอร์โทรศัพท์, อีเมล
- **ผลการแข่งขันตามรอบ:**
  - ผ่านเข้ารอบที่ 2 (รอบการประกวดออนไลน์): ผ่าน / ไม่ผ่าน / รอผล
  - ผ่านเข้ารอบที่ 3 (รอบตัดสิน): ผ่าน / ไม่ผ่าน / รอผล
  - ผลลัพธ์การแข่งขันรอบ 3: รางวัลรองชนะเลิศอันดับ 1 (หรือชนะเลิศ/ชมเชย)
- **ไฟล์ประกอบผลงาน 5 รายการ:**
  1. ไฟล์ PDF แบบฟอร์มเสนอผลงานประกวดสิ่งประดิษฐ์และนวัตกรรม (`proposalPdfUrl`)
  2. คลิป VDO นำเสนอผลงาน (`videoUrl`)
  3. Poster (`posterUrl`)
  4. Image (`imageUrl` / `coverImage`)
  5. Presentation (`presentationUrl`)

Currently, the web platform in `innoaward` has basic submission fields (titleTh, titleEn, category, educationLevel, teamName, advisorName, abstractTh, videoUrl, coverImage, documentUrl) but lacks:
1. Affiliation (สังกัด/คณะ) separated from team name.
2. Dynamic team members list with citizen/passport ID.
3. Primary and secondary coordinator data fields.
4. Dedicated inputs for all 5 submission artifacts (specifically Poster and Presentation).
5. Explicit multi-round progression tracking (`round2Status`, `round3Status`, `round3Result`).
6. An official, prestigious **Submission Dossier (บัตรประวัติผลงาน)** view in the status checking modal.

Implementing this upgrade aligns the digital platform with the actual operational standard of the KMUTNB Innovation Awards 2027 under royal patronage.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Prisma Database Model (`server/prisma/schema.prisma`):**
  - Add to `Submission`:
    - `affiliation`: String (สังกัด เช่น คณะครุศาสตร์อุตสาหกรรม มจพ.)
    - `primaryCoordName`: String
    - `primaryCoordIdCard`: String
    - `primaryCoordPhone`: String
    - `primaryCoordEmail`: String
    - `secondaryCoordName`: String?
    - `secondaryCoordIdCard`: String?
    - `secondaryCoordPhone`: String?
    - `secondaryCoordEmail`: String?
    - `round2Status`: Enum `RoundStatus` (`PENDING`, `PASSED`, `FAILED`) default `PENDING`
    - `round3Status`: Enum `RoundStatus` (`PENDING`, `PASSED`, `FAILED`) default `PENDING`
    - `round3Result`: String? (e.g. "รางวัลรองชนะเลิศอันดับ 1")
    - `proposalPdfUrl`: String?
    - `posterUrl`: String?
    - `presentationUrl`: String?
  - Update `TeamMember`:
    - Add `idCard`: String? (เลขบัตรประชาชน / พาสปอร์ต)
- **Backend API & Controller (`server/src/modules/submissions`):**
  - Update `submissions.schema.ts` with validation for new fields, supporting structured `members` array with `{ fullName, role, idCard }`.
  - Update `submissions.controller.ts`:
    - POST `/api/submissions`: Persist all new fields, handle both draft and full submission, create/update team members with `idCard`.
    - GET `/api/submissions/status/:trackingCode`: Return full dossier payload including rounds, coordinators (with masked citizen IDs for PDPA privacy on unauthenticated lookups, unmasked for owner), and the 5 artifact URLs.
- **Frontend Submission Portal (`client/src/App.jsx`):**
  - Structure the submission form into 3 manageable steps / tabbed sections:
    1. *ข้อมูลผลงานและสังกัด:* ชื่อผลงาน (ไทย-อังกฤษ), หมวดหมู่ (รวม `others`), ระดับการศึกษา, ชื่อทีม, สังกัด (คณะ/สถาบัน), อาจารย์ที่ปรึกษา, รายละเอียด/บทคัดย่อ
    2. *สมาชิกทีมและผู้ประสานงาน:*
       - ตัวจัดการสมาชิกทีม: เพิ่ม/ลบ สมาชิก ระบุชื่อ บทบาท และเลขบัตรประชาชน/พาสปอร์ต
       - ข้อมูลผู้ประสานงานหลัก (จำเป็น)
       - ข้อมูลผู้ประสานงานรอง (ตัวเลือก)
    3. *ไฟล์ประกอบผลงาน 5 รายการ:* ช่องระบุ URL (Google Drive, OneDrive, YouTube, Cloud storage) พร้อมไอคอน คำแนะนำ และสถานะการแนบ
  - Preserve draft saving (`isDraft`) without losing any fields.
- **Frontend Status Tracking & Dossier View:**
  - Redesign `showStatusModal` to display an **Official Submission Dossier (บัตรประวัติและรายละเอียดผลงาน)**:
    - Tracking Code, Submission Date, Category badge, Affiliation
    - 3-Round Progression Stepper (รอบ 1 คัดกรอง -> รอบ 2 ประกวดออนไลน์ -> รอบ 3 รอบตัดสิน & รางวัล)
    - Full project details & abstract
    - Roster of team members + citizen ID
    - Primary & Secondary coordinator contact cards
    - 5 Artifact access buttons (Proposal PDF, VDO, Poster, Image, Slides)
    - Judges feedback block
- **Testing & Quality Assurance:**
  - Add backend tests for new fields in `server/tests/submissions.test.ts`.
  - Ensure all 23+ tests pass and `npm run build` in `client` succeeds.

### Non-Goals
- Hosting an internal binary file storage server or handling multi-gigabyte direct file uploads; contestants provide verified external cloud URLs (Google Drive / OneDrive / YouTube / Cloud storage) with share permissions, matching the contest guidelines.
- Unmasked public exposure of Thai ID numbers (masked as `X-XXXX-XXXXX-XX-X` on public status lookup for PDPA compliance).

### Anti-Goals
- A single 30-field unorganized scrollable form that creates high cognitive load and causes abandonment on mobile devices.
- Breaking existing submission records in seed data or stored `localStorage` submissions history.

---

## 3. Constraints

- **Stack:** React 19 + Vite (Frontend), Bun + Elysia.js + Prisma ORM + PostgreSQL (Backend).
- **Design System:** KMUTNB Luminous Sapphire (Navy `#0A1628`, Cyan `#00F5D4`, Gold `#F59E0B`, Emerald `#10B981`).
- **Accessibility:** Touch targets >= 44px, WCAG AA color contrast, accessible form labels, escape key modal closure.
- **Data Integrity:** Graceful fallback to `localStorage` when backend is offline or unreachable.

---

## 4. Approaches Considered

1. **Approach 1 (Selected): Full-Integrated Dossier & Multi-Round System**
   - *Architecture:* Extend PostgreSQL Prisma schema, Elysia validation schemas, controller, and App.jsx frontend.
   - *Trade-off:* Requires database migration and controller updates, but guarantees 100% data fidelity, type safety, and direct support for contest operations throughout the 2027 season.
   - *Decision:* User explicitly selected Approach 1.

2. **Approach 2: Two-Phase Submission Flow**
   - *Trade-off:* Separates preliminary submission (Proposal + VDO) from finalist deliverables (Poster + Slides), reducing initial applicant effort. However, requires an additional phase-2 notification and edit workflow. Can be phased in later using the database fields created in Approach 1.

3. **Approach 3: Single-Page Dynamic Form & Quick View**
   - *Trade-off:* Fast to code by putting JSON in text columns, but lacks schema-level validation, searchability, and creates an overly long modal form. Rejected.

---

## 5. Detailed Design Specifications

### 5.1 Database Schema Additions (`server/prisma/schema.prisma`)

```prisma
enum RoundStatus {
  PENDING
  PASSED
  FAILED
}

model Submission {
  id                        String                   @id @default(cuid())
  trackingCode              String                   @unique
  userId                    String
  user                      User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  competitionYearId         String
  competitionYear           CompetitionYear          @relation(fields: [competitionYearId], references: [id])
  categoryId                String
  category                  Category                 @relation(fields: [categoryId], references: [id])
  competitionYearCategoryId String?
  competitionYearCategory   CompetitionYearCategory? @relation(fields: [competitionYearCategoryId], references: [id])
  educationLevelId          String
  educationLevel            EducationLevel           @relation(fields: [educationLevelId], references: [id])
  
  titleTh                   String
  titleEn                   String?                  @default("")
  teamName                  String                   @default("ทีมสร้างสรรค์นวัตกรรม")
  affiliation               String?                  @default("") // สังกัด / คณะ / หน่วยงาน
  advisorName               String?                  @default("")
  abstractTh                String                   @db.Text
  abstractEn                String?                  @db.Text @default("")
  
  // 5 Deliverable Artifacts
  proposalPdfUrl            String?                  @default("") // 1. ไฟล์ PDF แบบฟอร์มเสนอผลงาน
  videoUrl                  String?                  @default("") // 2. คลิป VDO นำเสนอผลงาน (2-3 นาที)
  posterUrl                 String?                  @default("") // 3. Poster นำเสนอผลงาน
  coverImage                String?                  @default("") // 4. Image รูปถ่ายผลงาน (หรือภาพปก)
  presentationUrl           String?                  @default("") // 5. Presentation สไลด์นำเสนอ
  documentUrl               String?                  @default("") // Legacy alias for proposalPdfUrl
  image                     String?                  @default("") // Legacy alias for coverImage

  // Primary Coordinator
  primaryCoordName          String?                  @default("")
  primaryCoordIdCard        String?                  @default("")
  primaryCoordPhone         String?                  @default("")
  primaryCoordEmail         String?                  @default("")

  // Secondary Coordinator
  secondaryCoordName        String?                  @default("")
  secondaryCoordIdCard      String?                  @default("")
  secondaryCoordPhone       String?                  @default("")
  secondaryCoordEmail       String?                  @default("")

  // Multi-Round Progress & Results
  status                    SubmissionStatus         @default(DRAFT)
  round1Status              RoundStatus              @default(PENDING) // รอบที่ 1 (รอบคัดเลือกเอกสาร)
  round2Status              RoundStatus              @default(PENDING) // รอบที่ 2 (รอบการประกวดออนไลน์)
  round3Status              RoundStatus              @default(PENDING) // รอบที่ 3 (รอบตัดสิน)
  round3Result              String?                  @default("")     // ผลลัพธ์การแข่งขันรอบ 3 (เช่น "รางวัลรองชนะเลิศอันดับ 1")
  feedback                  String?                  @db.Text @default("")
  
  // Award & Hall of Fame
  institution               String?                  @default("")
  awardTier                 AwardTier?
  awardNameTh               String?                  @default("")
  awardNameEn               String?                  @default("")
  awardBadgeText            String?                  @default("")
  prizeDetails              String?                  @db.Text @default("")

  members                   TeamMember[]

  submittedAt               DateTime?
  createdAt                 DateTime                 @default(now())
  updatedAt                 DateTime                 @updatedAt

  @@index([categoryId])
  @@index([educationLevelId])
  @@index([competitionYearId])
  @@index([competitionYearCategoryId])
  @@index([status])
  @@map("submissions")
}

model TeamMember {
  id           String     @id @default(cuid())
  submissionId String
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  fullName     String
  role         String     @default("สมาชิก") // หัวหน้าทีม / สมาชิก
  idCard       String?    @default("")      // เลขประจำตัวประชาชน / พาสปอร์ต
  orderIndex   Int        @default(0)
  createdAt    DateTime   @default(now())

  @@map("team_members")
}
```

### 5.2 API Contracts

#### POST `/api/submissions`
Payload accepts:
- `titleTh`, `titleEn`, `category`, `educationLevel`, `teamName`, `affiliation`, `advisorName`, `abstractTh`, `abstractEn`
- `members`: Array of `{ fullName: string, role?: string, idCard?: string }`
- `primaryCoordinator`: `{ name: string, idCard: string, phone: string, email: string }`
- `secondaryCoordinator`: `{ name?: string, idCard?: string, phone?: string, email?: string }`
- `files`: `{ proposalPdfUrl?: string, videoUrl?: string, posterUrl?: string, imageUrl?: string, presentationUrl?: string }`
- `isDraft`: boolean

> **Security & Privilege Policy:** Contestants cannot set `round1Status`, `round2Status`, `round3Status`, or `round3Result`. The controller will sanitize and discard these fields from contestant payloads. Initial non-draft submissions automatically set `status: SUBMITTED` and `round1Status: PENDING`. Advancing rounds and setting awards is restricted to admin/judges via `PATCH /api/submissions/:id/status`.

#### GET `/api/submissions/status/:trackingCode`
Returns structured dossier.
> **PDPA Privacy Policy:** If the request is unauthenticated (or authenticated user is not the owner or admin), sensitive personal data is masked:
> - Citizen ID masked: `5-1601-XXXXX-XX-X`
> - Phone number masked: `064-XXX-9888`
> - Email masked: `w***@kmutnb.ac.th`
> If the authenticated user is the submission owner (`currentUser.id === submission.userId`) or an Admin, full unmasked values are returned.
```json
{
  "success": true,
  "data": {
    "trackingCode": "KMUTNB-2570-0012",
    "submittedAt": "2026-11-05T09:00:00.000Z",
    "titleTh": "ไทเทเนียมที่พิมพ์ 3 มิติ...",
    "titleEn": "3D-Printed Titanium...",
    "teamName": "OsseBioMix",
    "affiliation": "คณะครุศาสตร์อุตสาหกรรม มจพ.",
    "category": "medical_device",
    "categoryNameTh": "ด้านอุปกรณ์การแพทย์และสุขภาพ",
    "educationLevel": "higher_and_above",
    "educationLevelNameTh": "ระดับอุดมศึกษาและบุคคลทั่วไป",
    "abstractTh": "...",
    "members": [
      { "fullName": "ผศ.ดร.วัฒนา แก้วมณี", "role": "หัวหน้าทีม", "idCard": "5-1601-XXXXX-XX-X" }
    ],
    "primaryCoordinator": {
      "name": "ผศ.ดร.วัฒนา แก้วมณี",
      "idCard": "5-1601-XXXXX-XX-X",
      "phone": "064-274-9888",
      "email": "wattana.k@fte.kmutnb.ac.th"
    },
    "secondaryCoordinator": {
      "name": "ผศ.ดร.วัฒนา แก้วมณี",
      "idCard": "5-1601-XXXXX-XX-X",
      "phone": "064-274-9888",
      "email": "wattana.kaewmanee@gmail.com"
    },
    "rounds": {
      "round1": { "label": "รอบคัดเลือกเอกสาร", "status": "PASSED" },
      "round2": { "label": "รอบการประกวดออนไลน์", "status": "PASSED" },
      "round3": { "label": "รอบตัดสิน", "status": "PASSED", "result": "รางวัลรองชนะเลิศอันดับ 1" }
    },
    "artifacts": {
      "proposalPdfUrl": "https://...",
      "videoUrl": "https://...",
      "posterUrl": "https://...",
      "imageUrl": "https://...",
      "presentationUrl": "https://..."
    },
    "status": "AWARDED",
    "feedback": "..."
  }
}
```

### 5.3 UI Flow & Components

1. **Step-by-Step Portal Form (Inside `showPortalModal`):**
   - Header step indicator:
     - `[1. ข้อมูลผลงานและสังกัด]` ➔ `[2. สมาชิกและผู้ประสานงาน]` ➔ `[3. แนบไฟล์ 5 รายการ]`
   - Users can jump back and forth freely without losing input state.
   - **Step 1:** Title TH & EN, Category dropdown, Education Level, Team Name, Affiliation (สังกัด), Advisor, Abstract.
   - **Step 2:**
     - Team Members list: Table or card list showing member name, role (หัวหน้าทีม/สมาชิก), citizen ID, with `+ เพิ่มสมาชิก` button and delete buttons.
     - Primary Coordinator: Name, Citizen ID, Phone, Email.
     - Secondary Coordinator (Collapsible / optional check): Name, Citizen ID, Phone, Email.
   - **Step 3: ไฟล์ประกอบผลงาน (5 Deliverables Policy):**
     - **จำเป็นในรอบแรก (Mandatory at Submit):**
       1. 📄 แบบฟอร์มเสนอผลงาน (Proposal PDF)
       2. 🎥 คลิป VDO นำเสนอ (2-3 นาที)
       3. 📸 รูปภาพผลงาน / ภาพหน้าปก (Image)
     - **แนบเพิ่มเติมภายหลังได้ (Optional Initially, Attachable Later):**
       4. 🖼️ โปสเตอร์ผลงาน (Poster)
       5. 📊 สไลด์นำเสนอ (Presentation)
     - มีป้ายกำกับชัดเจนว่า `(จำเป็น)` และ `(แนบเพิ่มเติมภายหลังได้เมื่อผ่านเข้ารอบ 2)`
   - Bottom bar with `บันทึกแบบร่าง (Save Draft)` and `ส่งผลงานฉบับสมบูรณ์ (Submit)`.
   - **Post-Submission Deliverable Update:** ในหน้าตรวจสถานะหรือหน้าผลงานของฉัน (My Submissions) เจ้าของผลงานสามารถกดปุ่ม **"อัปเดตไฟล์ Poster / Presentation เพิ่มเติม"** ได้ตลอดเวลา เพื่อส่งไฟล์เข้ารอบ 2 และรอบตัดสินได้โดยไม่ต้องกรอกข้อมูลเดิมใหม่

2. **Official Submission Dossier (Inside `showStatusModal`):**
   - Renders a formal, high-prestige certificate-style dossier view.
   - Top banner: Tracking code with copy button, submission timestamp, category badge, affiliation.
   - **Milestone Stepper:** 3 visual checkpoints (รอบ 1 ➔ รอบ 2 ➔ รอบ 3) with badges:
     - 🟢 ผ่านเข้ารอบที่ 2 (รอบการประกวดออนไลน์) : ผ่าน
     - 🟢 ผ่านเข้ารอบที่ 3 (รอบตัดสิน) : ผ่าน
     - 🏆 ผลลัพธ์การแข่งขันรอบ 3 : รางวัลรองชนะเลิศอันดับ 1
   - Accordion/Grid sections for:
     - รายละเอียดผลงาน
     - สมาชิกทีม
     - ผู้ประสานงานหลัก & ผู้ประสานงานรอง
     - ลิงก์เอกสารและไฟล์ทั้ง 5 รายการ (Clickable with external link icon)
     - ข้อความและข้อเสนอแนะจากคณะกรรมการ

---

## 6. Left to the Builder

- Exact layout spacing and responsive CSS utility classes for the member addition row in Step 2.
- Regex formatting helper for ID cards (`5-1601-00029-58-2`).
- Mock fallback data for instant demo search in case backend is offline.
