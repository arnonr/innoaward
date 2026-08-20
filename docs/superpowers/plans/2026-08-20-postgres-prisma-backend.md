# PostgreSQL & Prisma Backend Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and migrate the KMUTNB Innovation Awards 2026 backend to a production-ready, fully-normalized PostgreSQL 18 database with Prisma ORM and modular Elysia.js on Bun, including JWT authentication (Argon2id), Year-Scoped Categories, and automated integration tests.

**Architecture:** Modular Domain-Driven architecture in `server/src/modules/` (`auth`, `submissions`, `winners`, `announcements`, `masters`, `config`) backed by Prisma ORM connected to local PostgreSQL 18 (`innoaward_dev`), with native `Bun.password` hashing, `@elysiajs/jwt`, and TypeBox schema validation.

**Tech Stack:** Bun runtime, Elysia.js 1.4+, Prisma ORM 5/6+, PostgreSQL 18, @elysiajs/cors, @elysiajs/swagger, @elysiajs/jwt.

## Global Constraints

- Runtime: Bun (`bun run`, `bun test`, `bunx`)
- Database: PostgreSQL 18 on `localhost:5432` (`innoaward_dev`)
- Hashing: `Bun.password.hash(password, { algorithm: "argon2id" })`
- Tracking Code format: `KMUTNB-YYYY-XXXX` (e.g. `KMUTNB-2569-8821`)
- API Prefix: `/api/*` (100% backward compatible with existing React Vite frontend)

---

### Task 1: Environment Setup & Prisma Schema Initialization

**Files:**
- Create: `server/.env`
- Modify: `server/package.json`
- Create: `server/prisma/schema.prisma`

**Interfaces:**
- Consumes: PostgreSQL connection string on `localhost:5432`
- Produces: Normalized Prisma models (`CompetitionYear`, `Category`, `CompetitionYearCategory`, `EducationLevel`, `User`, `Submission`, `TeamMember`, `Announcement`, `AnnouncementRoster`)

- [ ] **Step 1: Install Prisma and Dependencies**

```bash
cd server
bun add @prisma/client @elysiajs/jwt
bun add -d prisma
```

- [ ] **Step 2: Create PostgreSQL Database and .env configuration**

```bash
createdb innoaward_dev || true
```

Create `server/.env`:
```env
DATABASE_URL="postgresql://macbook-arnon@localhost:5432/innoaward_dev?schema=public"
JWT_SECRET="kmutnb_innoaward_super_secret_jwt_key_2026"
PORT=3001
NODE_ENV=development
```

- [ ] **Step 3: Write Normalized Prisma Schema (`server/prisma/schema.prisma`)**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CONTESTANT
  JUDGE
  ADMIN
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  PASSED_FIRST_ROUND
  FINALIST
  AWARDED
  REJECTED
}

enum AwardTier {
  GRAND_WINNER
  RUNNER_UP_1
  RUNNER_UP_2
  HONORABLE_MENTION
}

enum CompetitionStatus {
  UPCOMING
  OPEN_FOR_SUBMISSION
  REVIEWING
  FINALIST_ANNOUNCED
  COMPLETED
}

enum AnnouncementType {
  GENERAL
  FINALISTS
  WINNERS
}

model CompetitionYear {
  id               String                    @id @default(cuid())
  year             Int                       @unique // 2569, 2568, 2567, 2566
  yearAd           Int                       // 2026, 2025, 2024, 2023
  titleTh          String
  titleEn          String
  themeTh          String?                   @default("")
  grandPrize       String?                   @default("ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี")
  submissionStart  DateTime?
  submissionEnd    DateTime?
  announcementDate DateTime?
  eventDate        DateTime?
  isCurrent        Boolean                   @default(false)
  status           CompetitionStatus         @default(OPEN_FOR_SUBMISSION)
  
  categories       CompetitionYearCategory[]
  submissions      Submission[]
  announcements    Announcement[]
  
  createdAt        DateTime                  @default(now())
  updatedAt        DateTime                  @updatedAt

  @@map("competition_years")
}

model Category {
  id             String                    @id @default(cuid())
  code           String                    @unique // energy_environment, food_agriculture, social_economy, medical_device, material
  nameTh         String
  nameEn         String
  descriptionTh  String?                   @db.Text
  descriptionEn  String?                   @db.Text
  icon           String?                   @default("Zap")
  color          String?                   @default("#059669")
  bgImage        String?                   @default("/domain-energy.jpg")
  orderIndex     Int                       @default(0)
  isActive       Boolean                   @default(true)
  
  yearCategories CompetitionYearCategory[]
  submissions    Submission[]
  
  createdAt      DateTime                  @default(now())
  updatedAt      DateTime                  @updatedAt

  @@map("categories")
}

model CompetitionYearCategory {
  id                String          @id @default(cuid())
  competitionYearId String
  competitionYear   CompetitionYear @relation(fields: [competitionYearId], references: [id], onDelete: Cascade)
  categoryId        String
  category          Category        @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  customNameTh      String?
  customDescription String?         @db.Text
  prizeSummary      String?         @default("เงินรางวัลชนะเลิศ 30,000 - 50,000 บาท พร้อมโล่รางวัลและเกียรติบัตร")
  isActive          Boolean         @default(true)
  orderIndex        Int             @default(0)
  
  submissions       Submission[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([competitionYearId, categoryId])
  @@map("competition_year_categories")
}

model EducationLevel {
  id          String       @id @default(cuid())
  code        String       @unique // below_higher, higher_and_above
  nameTh      String
  nameEn      String
  eligibleTh  String?      @db.Text
  eligibleEn  String?      @db.Text
  orderIndex  Int          @default(0)
  isActive    Boolean      @default(true)
  users       User[]
  submissions Submission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("education_levels")
}

model User {
  id               String         @id @default(cuid())
  email            String         @unique
  passwordHash     String
  fullName         String
  phone            String?        @default("")
  institution      String?        @default("มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ")
  educationLevelId String
  educationLevel   EducationLevel @relation(fields: [educationLevelId], references: [id])
  role             Role           @default(CONTESTANT)
  submissions      Submission[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@map("users")
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
  advisorName               String?                  @default("")
  abstractTh                String                   @db.Text
  abstractEn                String?                  @db.Text @default("")
  
  coverImage                String?                  @default("")
  videoUrl                  String?                  @default("")
  documentUrl               String?                  @default("")
  
  status                    SubmissionStatus         @default(DRAFT)
  feedback                  String?                  @db.Text @default("")
  
  // Award & Hall of Fame
  institution               String?                  @default("")
  awardTier                 AwardTier?
  awardNameTh               String?                  @default("")
  awardNameEn               String?                  @default("")
  awardBadgeText            String?                  @default("")
  prizeDetails              String?                  @db.Text @default("")
  image                     String?                  @default("")

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
  role         String     @default("สมาชิก")
  orderIndex   Int        @default(0)
  createdAt    DateTime   @default(now())

  @@map("team_members")
}

model Announcement {
  id                String               @id @default(cuid())
  competitionYearId String
  competitionYear   CompetitionYear      @relation(fields: [competitionYearId], references: [id])
  type              AnnouncementType     @default(GENERAL)
  badgeText         String
  badgeClass        String?              @default("announcement-badge-general")
  dateStr           String
  title             String
  abstract          String               @db.Text
  content           String?              @db.Text
  pdfUrl            String?              @default("#")
  coverImage        String?              @default("")
  isPublished       Boolean              @default(true)
  roster            AnnouncementRoster[]
  publishedAt       DateTime             @default(now())
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  @@index([competitionYearId])
  @@index([type])
  @@index([isPublished])
  @@map("announcements")
}

model AnnouncementRoster {
  id             String        @id @default(cuid())
  announcementId String
  announcement   Announcement  @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  submissionId   String?
  code           String
  title          String
  team           String
  institution    String?       @default("")
  level          String
  categoryName   String?       @default("")
  awardTierText  String?       @default("")
  orderIndex     Int           @default(0)

  @@index([announcementId])
  @@map("announcement_rosters")
}
```

- [ ] **Step 4: Run Initial Prisma Migration**

```bash
cd server
bunx prisma migrate dev --name init_innoaward_normalized_schema
```
Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 5: Commit**

```bash
git add server/package.json server/prisma/schema.prisma server/.env server/prisma/migrations/
git commit -m "chore(server): setup prisma schema and initial migration for postgresql"
```

---

### Task 2: Database Seeding (`prisma/seed.ts`)

**Files:**
- Create: `server/prisma/seed.ts`
- Modify: `server/package.json` (add prisma.seed config)

**Interfaces:**
- Produces: Initial database data with Master Years, 5 Categories, 2 Education Levels, User accounts, 8 Historical Awarded Submissions (2566–2568), and 3 Announcements with Rosters.

- [ ] **Step 1: Write `server/prisma/seed.ts`**

Implement complete seed logic in `server/prisma/seed.ts` using `@prisma/client` and `Bun.password` to hash passwords. Include:
1. `EducationLevel`: `below_higher`, `higher_and_above`
2. `Category`: `energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`
3. `CompetitionYear`: 2569 (`isCurrent: true`), 2568, 2567, 2566
4. `CompetitionYearCategory`: Bind 5 categories to each year
5. `User`: `admin@kmutnb.ac.th` (ADMIN), `judge@kmutnb.ac.th` (JUDGE), `contestant@kmutnb.ac.th` (CONTESTANT)
6. `Submission` + `TeamMember`: 6 winners of year 2568, 1 of year 2567, 1 of year 2566
7. `Announcement` + `AnnouncementRoster`: Launch announcement, Finalists announcement, Winners announcement

- [ ] **Step 2: Run Seed Script**

```bash
cd server
bun run prisma/seed.ts
```
Expected output: `🌱 Seeding finished successfully.`

- [ ] **Step 3: Commit**

```bash
git add server/prisma/seed.ts server/package.json
git commit -m "feat(server): add comprehensive database seed script"
```

---

### Task 3: Core Utilities & Middleware

**Files:**
- Create: `server/src/lib/prisma.ts`
- Create: `server/src/lib/auth-utils.ts`
- Create: `server/src/lib/tracking.ts`
- Create: `server/src/middlewares/auth.middleware.ts`
- Test: `server/tests/auth-utils.test.ts`

**Interfaces:**
- `prisma`: PrismaClient singleton
- `hashPassword(password: string)`: Promise<string>
- `verifyPassword(password: string, hash: string)`: Promise<boolean>
- `generateTrackingCode(year?: number)`: string
- `authGuardPlugin`: Elysia plugin verifying JWT token and role

- [ ] **Step 1: Write Unit Test for Auth Utilities (`server/tests/auth-utils.test.ts`)**

```ts
import { test, expect } from "bun:test";
import { hashPassword, verifyPassword } from "../src/lib/auth-utils";
import { generateTrackingCode } from "../src/lib/tracking";

test("hashPassword and verifyPassword work correctly with Argon2id", async () => {
  const password = "SuperSecretPassword123!";
  const hash = await hashPassword(password);
  expect(hash).toBeString();
  expect(hash).not.toBe(password);
  
  const isValid = await verifyPassword(password, hash);
  expect(isValid).toBe(true);
  
  const isInvalid = await verifyPassword("WrongPassword", hash);
  expect(isInvalid).toBe(false);
});

test("generateTrackingCode generates valid format", () => {
  const code = generateTrackingCode(2569);
  expect(code).toMatch(/^KMUTNB-2569-\d{4}$/);
});
```

- [ ] **Step 2: Run Test to Verify Failure**

```bash
cd server && bun test tests/auth-utils.test.ts
```
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement Utilities and Auth Middleware**

Create:
- `server/src/lib/prisma.ts` (PrismaClient singleton)
- `server/src/lib/auth-utils.ts` (`Bun.password.hash` and `Bun.password.verify`)
- `server/src/lib/tracking.ts` (Generates random 4-digit code)
- `server/src/middlewares/auth.middleware.ts` (JWT extraction & Role validation)

- [ ] **Step 4: Run Test to Verify Pass**

```bash
cd server && bun test tests/auth-utils.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/ server/src/middlewares/ server/tests/auth-utils.test.ts
git commit -m "feat(server): add core utilities and auth middleware"
```

---

### Task 4: Master Data & Config Modules

**Files:**
- Create: `server/src/modules/masters/masters.controller.ts`
- Create: `server/src/modules/config/config.controller.ts`
- Test: `server/tests/masters.test.ts`

**Interfaces:**
- `GET /api/masters/years`: Returns list of `CompetitionYear`
- `GET /api/masters/years/:year/categories`: Returns categories bound to `:year`
- `GET /api/masters/categories`: Returns master `Category` catalog
- `GET /api/masters/education-levels`: Returns master `EducationLevel` list
- `GET /api/config`: Returns combined competition configuration for frontend

- [ ] **Step 1: Write Test for Masters & Config API (`server/tests/masters.test.ts`)**
- [ ] **Step 2: Run Test to Verify Failure**
- [ ] **Step 3: Implement Masters and Config Controllers**
- [ ] **Step 4: Run Test to Verify Pass**
- [ ] **Step 5: Commit**

```bash
git add server/src/modules/masters/ server/src/modules/config/ server/tests/masters.test.ts
git commit -m "feat(server): add masters and config modules with database queries"
```

---

### Task 5: Authentication Module (`/api/auth`)

**Files:**
- Create: `server/src/modules/auth/auth.schema.ts`
- Create: `server/src/modules/auth/auth.controller.ts`
- Test: `server/tests/auth.test.ts`

**Interfaces:**
- `POST /api/auth/register`: Creates new user with Argon2id hash, binds `EducationLevel`, returns JWT & user profile
- `POST /api/auth/login`: Validates credentials, returns JWT token & user profile with relations
- `GET /api/auth/me`: Authenticated endpoint returning user profile with `educationLevel`

- [ ] **Step 1: Write Test for Auth Endpoints (`server/tests/auth.test.ts`)**
- [ ] **Step 2: Run Test to Verify Failure**
- [ ] **Step 3: Implement Auth Schema & Controller**
- [ ] **Step 4: Run Test to Verify Pass**
- [ ] **Step 5: Commit**

```bash
git add server/src/modules/auth/ server/tests/auth.test.ts
git commit -m "feat(server): implement secure auth module with JWT and Argon2id"
```

---

### Task 6: Submissions & Status Tracking Module (`/api/submissions`)

**Files:**
- Create: `server/src/modules/submissions/submissions.schema.ts`
- Create: `server/src/modules/submissions/submissions.controller.ts`
- Test: `server/tests/submissions.test.ts`

**Interfaces:**
- `POST /api/submissions`: Create or update submission, supporting `coverImage`, `isDraft`, `members[]`, auto-linking `CompetitionYearCategory` and `EducationLevel`
- `GET /api/submissions/status/:trackingCode`: Real-time status lookup by tracking code with all joins
- `GET /api/submissions/my`: Get current logged-in contestant's submissions
- `GET /api/admin/submissions`: Admin list all submissions with filters
- `PATCH /api/admin/submissions/:id/status`: Admin update submission status & feedback

- [ ] **Step 1: Write Test for Submissions Module (`server/tests/submissions.test.ts`)**
- [ ] **Step 2: Run Test to Verify Failure**
- [ ] **Step 3: Implement Submissions Schema & Controller**
- [ ] **Step 4: Run Test to Verify Pass**
- [ ] **Step 5: Commit**

```bash
git add server/src/modules/submissions/ server/tests/submissions.test.ts
git commit -m "feat(server): implement submissions module with joins, coverImage, and tracking"
```

---

### Task 7: Winners Hall of Fame & Announcements Modules

**Files:**
- Create: `server/src/modules/winners/winners.controller.ts`
- Create: `server/src/modules/announcements/announcements.controller.ts`
- Test: `server/tests/winners-announcements.test.ts`

**Interfaces:**
- `GET /api/winners`: Returns awarded submissions with full relations (Category, EducationLevel, Year, Members), supports query params `?year=&category=&level=&search=`
- `GET /api/announcements` / `GET /api/news`: Returns announcements with `AnnouncementRoster[]`
- `GET /api/announcements/:id`: Returns single announcement with full roster
- `POST /api/admin/announcements`: Admin create announcement
- `DELETE /api/admin/announcements/:id`: Admin delete announcement

- [ ] **Step 1: Write Test for Winners & Announcements (`server/tests/winners-announcements.test.ts`)**
- [ ] **Step 2: Run Test to Verify Failure**
- [ ] **Step 3: Implement Winners & Announcements Controllers**
- [ ] **Step 4: Run Test to Verify Pass**
- [ ] **Step 5: Commit**

```bash
git add server/src/modules/winners/ server/src/modules/announcements/ server/tests/winners-announcements.test.ts
git commit -m "feat(server): implement winners Hall of Fame and announcements modules"
```

---

### Task 8: Server Assembly & End-to-End Verification

**Files:**
- Modify: `server/src/index.ts`
- Test: All test files (`bun test`)

**Interfaces:**
- Main entrypoint combining all Elysia modules, CORS, Swagger at `/swagger`, Global Error Handler, and listening on Port 3001.

- [ ] **Step 1: Assemble `server/src/index.ts`**
- [ ] **Step 2: Run full test suite**

```bash
cd server
bun test
```
Expected: All tests PASS.

- [ ] **Step 3: Start backend server and test healthcheck & Swagger UI**

```bash
curl http://localhost:3001/api/health
```
Expected: `{"status":"ok","database":"connected",...}`

- [ ] **Step 4: Commit**

```bash
git add server/src/index.ts
git commit -m "feat(server): assemble modular backend server with full swagger and error handling"
```
