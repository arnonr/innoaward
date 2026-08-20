# KMUTNB Innovation Awards 2026 — PostgreSQL & Prisma Backend Architecture Spec

**Date:** 2026-08-20  
**Status:** Approved by User (Updated with Year-Scoped Categories and `coverImage` field in Submissions)  
**Author:** AI Agent (Antigravity) & Arnon  
**Target Stack:** Bun, Elysia.js, Prisma ORM, PostgreSQL 18, @elysiajs/jwt, @elysiajs/cors, @elysiajs/swagger

---

## 1. Executive Summary & Goals

This specification defines the production-ready backend architecture for the **KMUTNB Innovation Awards 2026** web platform, transitioning from an in-memory mock backend to a fully normalized **PostgreSQL 18** database managed via **Prisma ORM**.

### Key Objectives
1. **Year-Scoped Categories & Normalized Masters**: 
   - **`Category`** (Global catalog of innovation domains).
   - **`CompetitionYear`** (Annual competition editions e.g. 2566–2569).
   - **`CompetitionYearCategory`** (Junction table binding which categories are active in which competition year, allowing adding/removing categories per year and setting year-specific prize details).
   - **`EducationLevel`** (Academic level groups e.g. Below Higher, Higher and Above).
   - **`User`**, **`Submission`** (including `coverImage` for project showcase), **`TeamMember`**, and **`Announcement`** tables with strict foreign keys and cascade rules.
2. **Robust Security & Authentication**: Modern JWT token authentication with Argon2id password hashing via `Bun.password` and Role-Based Access Control (`CONTESTANT`, `JUDGE`, `ADMIN`).
3. **Modular Codebase**: Restructure `server/` into clean, maintainable domain modules (`auth`, `submissions`, `winners`, `announcements`, `config`, `masters`).
4. **Seamless Frontend Integration**: Full backward-compatibility with the existing React Vite frontend while exposing new features such as contestant submission management, cover image attachments, and admin review endpoints.
5. **Rich Seed & Migration Pipeline**: Seed historical award winners (2566–2568), royal trophy records, official announcements, Master categories per year, education levels, and default admin/judge accounts out-of-the-box.
6. **Self-Contained HTML Manual**: Provide an interactive, responsive HTML documentation guide (`docs/backend-guide.html`) detailing the system architecture, normalized ERD with year-category bindings, API specifications, and operational workflows.

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

### 2.2 Models & Relational Schema (With Year-Scoped Categories & Cover Image)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// Master Tables & Year Bindings
// ----------------------------------------------------

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
  
  // Relations
  categories       CompetitionYearCategory[]
  submissions      Submission[]
  
  createdAt        DateTime                  @default(now())
  updatedAt        DateTime                  @updatedAt

  @@map("competition_years")
}

model Category {
  id             String                    @id @default(cuid())
  code           String                    @unique // energy_environment, food_agriculture, social_economy, medical_device, material
  nameTh         String                    // พลังงานและสิ่งแวดล้อม
  nameEn         String                    // Energy & Environment
  descriptionTh  String?                   @db.Text
  descriptionEn  String?                   @db.Text
  icon           String?                   @default("Zap") // Zap, Leaf, Users, Activity, Box
  color          String?                   @default("#059669")
  bgImage        String?                   @default("/domain-energy.jpg")
  orderIndex     Int                       @default(0)
  isActive       Boolean                   @default(true)
  
  // Relations
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
  
  // Year-specific overrides & prize details
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
  id                        String                   @id @default(cuid())
  trackingCode              String                   @unique // e.g. KMUTNB-2569-1234
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
  
  // Media & Attachments
  coverImage                String?                  @default("") // รูปภาพหน้าปกผลงาน / โปสเตอร์ผลงาน
  videoUrl                  String?                  @default("") // ลิงก์คลิปวิดีโอนำเสนอ 2-3 นาที
  documentUrl               String?                  @default("") // ลิงก์เอกสารข้อเสนอโครงการ PDF (Google Drive/OneDrive)
  
  status                    SubmissionStatus         @default(DRAFT)
  feedback                  String?                  @db.Text @default("")
  
  // Award & Hall of Fame Data
  institution               String?                  @default("")
  awardTier                 AwardTier?
  awardNameTh               String?                  @default("")
  awardNameEn               String?                  @default("")
  awardBadgeText            String?                  @default("")
  prizeDetails              String?                  @db.Text @default("")
  image                     String?                  @default("") // Alias / รูปภาพในคลังรางวัล Hall of Fame

  // Relational Members
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
│   ├── schema.prisma             # Normalized Prisma Schema Definition with Year Categories & Cover Image
│   ├── migrations/               # PostgreSQL Migration History
│   └── seed.ts                   # Seed Script (Years, Categories, Year-Category Bindings, Seed Data)
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
│   │   ├── masters/              # Years, Categories, YearCategories, EducationLevels
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

## 4. API Endpoints Specification (With `coverImage`)

### 4.1 Submissions API
#### `POST /api/submissions`
- **Request Body**:
  ```json
  {
    "titleTh": "หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะ AI",
    "titleEn": "Autonomous AI Search & Rescue Robot",
    "category": "energy_environment",
    "educationLevel": "higher_and_above",
    "teamName": "KMUTNB Robotics Lab",
    "advisorName": "รศ.ดร. นวัตกรรม พระจอมเกล้า",
    "members": ["นาย สมชาย นวัตกรรม", "นาย สมศักดิ์ เทคโนโลยี"],
    "abstractTh": "รายละเอียดบทคัดย่อภาษาไทย...",
    "abstractEn": "English abstract details...",
    "coverImage": "/photo_candidates/robotics_engineer.jpg",
    "videoUrl": "https://youtu.be/example",
    "documentUrl": "https://drive.google.com/example-proposal.pdf",
    "isDraft": false
  }
  ```
- **Response (200)**: ส่งผลงานสำเร็จ พร้อมคืนข้อมูล `coverImage`, `trackingCode`, และข้อมูลที่ Join กับ Master Tables

---

## 5. Seed Pipeline (`prisma/seed.ts`)

สคริปต์ `prisma/seed.ts` นำเข้าข้อมูลรูปภาพหน้าปก (`coverImage`) และรูปผลงาน (`image`) ของผู้ได้รับรางวัลปี 2568, 2567, 2566 ครบถ้วน เพื่อให้ Hall of Fame และหน้ารายละเอียดแสดงภาพได้อย่างสมบูรณ์
