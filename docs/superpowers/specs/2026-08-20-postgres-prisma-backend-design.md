# KMUTNB Innovation Awards 2026 — PostgreSQL & Prisma Backend Architecture Spec

**Date:** 2026-08-20  
**Status:** Approved by User (Updated with Normalized Master Tables: Category, EducationLevel, CompetitionYear)  
**Author:** AI Agent (Antigravity) & Arnon  
**Target Stack:** Bun, Elysia.js, Prisma ORM, PostgreSQL 18, @elysiajs/jwt, @elysiajs/cors, @elysiajs/swagger

---

## 1. Executive Summary & Goals

This specification defines the production-ready backend architecture for the **KMUTNB Innovation Awards 2026** web platform, transitioning from an in-memory mock backend to a fully normalized **PostgreSQL 18** database managed via **Prisma ORM**.

### Key Objectives
1. **Fully Normalized Relational Architecture**: 
   - Separate master tables for **Categories (`Category`)**, **Education Levels (`EducationLevel`)**, and **Competition Editions/Years (`CompetitionYear`)** linked via Foreign Keys and Joins.
   - Separate transactional tables for **Users (`User`)**, **Submissions (`Submission`)**, **Team Members (`TeamMember`)**, and **Announcements (`Announcement`, `AnnouncementRoster`)**.
2. **Robust Security & Authentication**: Modern JWT token authentication with Argon2id password hashing via `Bun.password` and Role-Based Access Control (`CONTESTANT`, `JUDGE`, `ADMIN`).
3. **Modular Codebase**: Restructure `server/` into clean, maintainable domain modules (`auth`, `submissions`, `winners`, `announcements`, `config`, `masters`).
4. **Seamless Frontend Integration**: Full backward-compatibility with the existing React Vite frontend while exposing new features such as contestant submission management and admin review endpoints.
5. **Rich Seed & Migration Pipeline**: Seed historical award winners (2566–2568), royal trophy records, official announcements, Master categories, education levels, and default admin/judge accounts out-of-the-box.
6. **Self-Contained HTML Manual**: Provide an interactive, responsive HTML documentation guide (`docs/backend-guide.html`) detailing the system architecture, normalized ERD, API specifications, and operational workflows.

---

## 2. Database Design (Prisma Schema & PostgreSQL)

### 2.1 Enums

```prisma
enum Role {
  CONTESTANT
  JUDGE
  ADMIN
}

enum SubmissionStatus {
  DRAFT              // บันทึกฉบับร่าง
  SUBMITTED          // ยื่นผลงานเรียบร้อยแล้ว
  UNDER_REVIEW       // อยู่ระหว่างการพิจารณาของคณะกรรมการ
  PASSED_FIRST_ROUND // ผ่านการคัดเลือกรอบแรก (Finalist)
  FINALIST           // ผู้เข้ารอบสุดท้าย
  AWARDED            // ได้รับรางวัล
  REJECTED           // ไม่ผ่านการพิจารณา
}

enum AwardTier {
  GRAND_WINNER       // รางวัลชนะเลิศ ถ้วยพระราชทานฯ
  RUNNER_UP_1        // รองชนะเลิศอันดับ 1 ถ้วยคิดเป็น ทำเป็น
  RUNNER_UP_2        // รองชนะเลิศอันดับ 2 ถ้วยคิดเป็น ทำเป็น
  HONORABLE_MENTION  // รางวัลชมเชย
}

enum CompetitionStatus {
  UPCOMING
  OPEN_FOR_SUBMISSION
  REVIEWING
  FINALIST_ANNOUNCED
  COMPLETED
}
```

### 2.2 Models & Relational Schema (Normalized)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// Master Tables
// ----------------------------------------------------

model CompetitionYear {
  id               String            @id @default(cuid())
  year             Int               @unique // 2569, 2568, 2567, 2566
  yearAd           Int               // 2026, 2025, 2024, 2023
  titleTh          String
  titleEn          String
  themeTh          String?           @default("")
  grandPrize       String?           @default("ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี")
  submissionStart  DateTime?
  submissionEnd    DateTime?
  announcementDate DateTime?
  eventDate        DateTime?
  isCurrent        Boolean           @default(false)
  status           CompetitionStatus @default(OPEN_FOR_SUBMISSION)
  submissions      Submission[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@map("competition_years")
}

model Category {
  id            String       @id @default(cuid())
  code          String       @unique // energy_environment, food_agriculture, social_economy, medical_device, material
  nameTh        String       // พลังงานและสิ่งแวดล้อม
  nameEn        String       // Energy & Environment
  descriptionTh String?      @db.Text
  descriptionEn String?      @db.Text
  icon          String?      @default("Zap") // Zap, Leaf, Users, Activity, Box
  color         String?      @default("#059669")
  bgImage       String?      @default("/domain-energy.jpg")
  orderIndex    Int          @default(0)
  isActive      Boolean      @default(true)
  submissions   Submission[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@map("categories")
}

model EducationLevel {
  id          String       @id @default(cuid())
  code        String       @unique // below_higher, higher_and_above
  nameTh      String       // ระดับต่ำกว่าอุดมศึกษา, ระดับตั้งแต่อุดมศึกษาขึ้นไป
  nameEn      String       // Below Higher Education, Higher Education & Above
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

// ----------------------------------------------------
// User & Submission Relational Tables
// ----------------------------------------------------

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
  id                String           @id @default(cuid())
  trackingCode      String           @unique // e.g. KMUTNB-2569-1234
  userId            String
  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  competitionYearId String
  competitionYear   CompetitionYear  @relation(fields: [competitionYearId], references: [id])
  categoryId        String
  category          Category         @relation(fields: [categoryId], references: [id])
  educationLevelId  String
  educationLevel    EducationLevel   @relation(fields: [educationLevelId], references: [id])
  
  titleTh           String
  titleEn           String?          @default("")
  teamName          String           @default("ทีมสร้างสรรค์นวัตกรรม")
  advisorName       String?          @default("")
  abstractTh        String           @db.Text
  abstractEn        String?          @db.Text @default("")
  videoUrl          String?          @default("")
  documentUrl       String?          @default("")
  status            SubmissionStatus @default(DRAFT)
  feedback          String?          @db.Text @default("")
  
  // Award & Hall of Fame Data
  institution       String?          @default("")
  awardTier         AwardTier?
  awardNameTh       String?          @default("")
  awardNameEn       String?          @default("")
  awardBadgeText    String?          @default("")
  prizeDetails      String?          @db.Text @default("")
  image             String?          @default("")

  // Relational Members
  members           TeamMember[]

  submittedAt       DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  @@index([categoryId])
  @@index([educationLevelId])
  @@index([competitionYearId])
  @@index([status])
  @@map("submissions")
}

model TeamMember {
  id           String     @id @default(cuid())
  submissionId String
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  fullName     String
  role         String     @default("สมาชิก") // หัวหน้าทีม, สมาชิก, อาจารย์ที่ปรึกษา
  orderIndex   Int        @default(0)
  createdAt    DateTime   @default(now())

  @@map("team_members")
}

// ----------------------------------------------------
// Official Announcements & Rosters
// ----------------------------------------------------

model Announcement {
  id          String               @id @default(cuid())
  category    String               // general, finalists, winners
  badgeText   String               // ข่าวสารโครงการ, ประกาศผลรอบคัดเลือก, ประกาศผลรางวัลชนะเลิศ
  badgeClass  String               // announcement-badge-general, etc.
  dateStr     String               // "1 กันยายน 2569"
  title       String
  abstract    String               @db.Text
  pdfUrl      String?              @default("#")
  isPublished Boolean              @default(true)
  roster      AnnouncementRoster[]
  publishedAt DateTime             @default(now())
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  @@map("announcements")
}

model AnnouncementRoster {
  id             String       @id @default(cuid())
  announcementId String
  announcement   Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  code           String       // KMUTNB-2026-8821
  title          String
  team           String
  level          String
  orderIndex     Int          @default(0)

  @@map("announcement_rosters")
}
```

---

## 3. Modular Architecture & Directory Structure

```text
server/
├── prisma/
│   ├── schema.prisma             # Normalized Prisma Schema Definition
│   ├── migrations/               # PostgreSQL Migration History
│   └── seed.ts                   # Seed Script (Years 2566-2569, Categories, Levels, Admin, Hall of Fame)
├── src/
│   ├── lib/
│   │   ├── prisma.ts             # Prisma Client Singleton
│   │   ├── auth-utils.ts         # Argon2id password hashing & verification
│   │   └── tracking.ts           # Tracking code generator (KMUTNB-YYYY-XXXX)
│   ├── middlewares/
│   │   └── auth.middleware.ts    # JWT Authentication & Role Guard plugins
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.schema.ts
│   │   ├── submissions/
│   │   │   ├── submissions.controller.ts
│   │   │   └── submissions.schema.ts
│   │   ├── winners/
│   │   │   ├── winners.controller.ts
│   │   │   └── winners.schema.ts
│   │   ├── announcements/
│   │   │   ├── announcements.controller.ts
│   │   │   └── announcements.schema.ts
│   │   ├── masters/              # Categories, EducationLevels, CompetitionYears
│   │   │   ├── masters.controller.ts
│   │   │   └── masters.schema.ts
│   │   └── config/
│   │       ├── config.controller.ts
│   │       └── config.schema.ts
│   └── index.ts                  # Server Entrypoint (Elysia App Assembly)
├── tests/
│   ├── auth.test.ts              # Unit & Integration Tests for Auth
│   ├── submissions.test.ts       # Submissions, Tracking, & Joins Tests
│   └── winners.test.ts           # Hall of Fame Query & Filter Tests
├── .env                          # Local Environment Configuration
├── package.json
└── tsconfig.json
```

---

## 4. API Endpoints Specification (With Joins & Masters)

### 4.1 Authentication (`/api/auth`)
- `POST /api/auth/register`: รองรับ `educationLevelCode` หรือ `educationLevelId` เชื่อมไปยังตาราง `EducationLevel`.
- `POST /api/auth/login`: เข้าสู่ระบบและส่งกลับ User Profile พร้อม Join `EducationLevel`.
- `GET /api/auth/me`: ข้อมูลผู้ใช้ปัจจุบันพร้อม Join `EducationLevel` และประวัติการส่งผลงาน.

### 4.2 Submissions & Tracking (`/api/submissions`)
- `POST /api/submissions`: เชื่อมโยงผลงานเข้ากับ `Category` (ผ่าน `categoryId` หรือ `categoryCode`), `EducationLevel`, และ `CompetitionYear` ปีปัจจุบัน (2569) อัตโนมัติ พร้อมบันทึกสมาชิกในทีม `TeamMember[]`.
- `GET /api/submissions/status/:trackingCode`: ค้นหาผลงานพร้อม Join `Category`, `EducationLevel`, `CompetitionYear`, และ `TeamMember`.
- `GET /api/submissions/my`: ดึงรายการผลงานทั้งหมดของฉันพร้อม Join ครบทุกตาราง.
- `GET /api/admin/submissions`: Admin ดูรายการผลงานพร้อม Filter ตามปี, หมวดหมู่, ระดับการศึกษา.
- `PATCH /api/admin/submissions/:id/status`: อัปเดตสถานะ, ให้คะแนน/Feedback, และมอบรางวัล.

### 4.3 Master Data & Public Endpoints
- `GET /api/masters/years`: รายการปีการแข่งขันทั้งหมด (`CompetitionYear`) พร้อมสถานะ (`isCurrent`, `status`).
- `GET /api/masters/categories`: รายการ 5 หมวดหมู่นวัตกรรม (`Category`) พร้อมไอคอน สี และรูปภาพ.
- `GET /api/masters/education-levels`: รายการระดับการศึกษา (`EducationLevel`) และเกณฑ์คุณสมบัติ.
- `GET /api/winners`: คลังผลงาน Hall of Fame ที่ Join ข้อมูล `Category`, `EducationLevel`, `CompetitionYear` และ `TeamMember` กรองตาม `year`, `category`, `level`.
- `GET /api/announcements` (หรือ `/api/news`): ประกาศผลทางการพร้อม Join `AnnouncementRoster`.
- `GET /api/config`: ข้อมูลรวมการแข่งขันทั้งหมด ดึงตรงจากตาราง Master ในฐานข้อมูล PostgreSQL.
- `GET /api/health`: Healthcheck พร้อม Ping PostgreSQL DB.

---

## 5. Seed Pipeline (`prisma/seed.ts`)

สคริปต์ `prisma/seed.ts` จะสร้างข้อมูล Master Data และประวัติย้อนหลังตามลำดับ:
1. **Master Competition Years**: 2569 (Current), 2568, 2567, 2566
2. **Master Categories**: 5 หมวดนวัตกรรม (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`)
3. **Master Education Levels**: 2 ระดับ (`below_higher`, `higher_and_above`)
4. **Seed Users**:
   - `admin@kmutnb.ac.th` (Role: `ADMIN`)
   - `judge@kmutnb.ac.th` (Role: `JUDGE`)
   - `contestant@kmutnb.ac.th` (Role: `CONTESTANT`)
5. **Historical Awarded Submissions (Hall of Fame)**:
   - ผลงานปี 2568 (6 ผลงาน รวมถึงถ้วยพระราชทานฯ, รองชนะเลิศ, ชมเชย)
   - ผลงานปี 2567 (หุ่นยนต์กู้ภัย AI)
   - ผลงานปี 2566 (บรรจุภัณฑ์ชีวภาพฟางข้าว)
   - สมาชิกในทีมของแต่ละผลงาน (`team_members`)
6. **Official Announcements & Finalist Rosters**:
   - ข่าวสารเปิดรับสมัครปี 2569
   - ประกาศผลผู้เข้ารอบ Finalists ปี 2569 พร้อม Roster
   - ประกาศผลรางวัลชนะเลิศปี 2568 พร้อม Roster
