# KMUTNB Innovation Awards 2026 — PostgreSQL & Prisma Backend Architecture Spec

**Date:** 2026-08-20  
**Status:** Approved by User  
**Author:** AI Agent (Antigravity) & Arnon  
**Target Stack:** Bun, Elysia.js, Prisma ORM, PostgreSQL 18, @elysiajs/jwt, @elysiajs/cors, @elysiajs/swagger

---

## 1. Executive Summary & Goals

This specification defines the production-ready backend architecture for the **KMUTNB Innovation Awards 2026** web platform, transitioning from an in-memory mock backend to a persistent **PostgreSQL 18** database managed via **Prisma ORM**.

### Key Objectives
1. **Persistent Relational Database**: Store users, submissions, team members, announcements, and award winners with strict data integrity and relational constraints.
2. **Robust Security & Authentication**: Modern JWT token authentication with Argon2id password hashing via `Bun.password` and Role-Based Access Control (`CONTESTANT`, `JUDGE`, `ADMIN`).
3. **Modular Codebase**: Restructure `server/` into clean, maintainable domain modules (`auth`, `submissions`, `winners`, `announcements`, `config`).
4. **Seamless Frontend Integration**: Full backward-compatibility with the existing React Vite frontend while exposing new features such as contestant submission management and admin review endpoints.
5. **Rich Seed & Migration Pipeline**: Seed historical award winners (2566–2568), royal trophy records, official announcements, and default admin/judge accounts out-of-the-box.
6. **Self-Contained HTML Manual**: Provide an interactive, responsive HTML documentation guide (`docs/backend-guide.html`) detailing the system architecture, API specifications, and operational workflows.

---

## 2. Database Design (Prisma Schema & PostgreSQL)

### 2.1 Enums

```prisma
enum Role {
  CONTESTANT
  JUDGE
  ADMIN
}

enum EducationLevel {
  BELOW_HIGHER       // ระดับต่ำกว่าอุดมศึกษา (ม.ปลาย, ปวช., ปวส.)
  HIGHER_AND_ABOVE   // ระดับตั้งแต่อุดมศึกษาขึ้นไป (ป.ตรี-โท-เอก, นักวิจัย, ประชาชน)
}

enum Category {
  ENERGY_ENVIRONMENT // พลังงานและสิ่งแวดล้อม
  FOOD_AGRICULTURE   // เกษตรและอาหารแปรรูป
  SOCIAL_ECONOMY     // เศรษฐกิจและสังคมดิจิทัล
  MEDICAL_DEVICE     // เครื่องมือแพทย์และสาธารณสุข
  MATERIAL           // วัสดุศาสตร์และเทคโนโลยีก้าวหน้า
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
```

### 2.2 Models & Relational Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String         @id @default(cuid())
  email          String         @unique
  passwordHash   String
  fullName       String
  phone          String?        @default("")
  institution    String?        @default("มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ")
  educationLevel EducationLevel @default(HIGHER_AND_ABOVE)
  role           Role           @default(CONTESTANT)
  submissions    Submission[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@map("users")
}

model Submission {
  id             String           @id @default(cuid())
  trackingCode   String           @unique // e.g. KMUTNB-2569-1234
  userId         String
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  titleTh        String
  titleEn        String?          @default("")
  category       Category
  educationLevel EducationLevel
  teamName       String           @default("ทีมสร้างสรรค์นวัตกรรม")
  advisorName    String?          @default("")
  abstractTh     String           @db.Text
  abstractEn     String?          @db.Text @default("")
  videoUrl       String?          @default("")
  documentUrl    String?          @default("")
  status         SubmissionStatus @default(DRAFT)
  feedback       String?          @db.Text @default("")
  
  // Award & Hall of Fame Data
  year           Int?             @default(2569)
  institution    String?          @default("")
  awardTier      AwardTier?
  awardNameTh    String?          @default("")
  awardNameEn    String?          @default("")
  awardBadgeText String?          @default("")
  prizeDetails   String?          @db.Text @default("")
  image          String?          @default("")

  // Relational Members
  members        TeamMember[]

  submittedAt    DateTime?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@index([category])
  @@index([educationLevel])
  @@index([status])
  @@index([year])
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
│   ├── schema.prisma             # Prisma Schema Definition
│   ├── migrations/               # PostgreSQL Migration History
│   └── seed.ts                   # Initial Seed (Admin, Historical Winners, Announcements)
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
│   │   └── config/
│   │       ├── config.controller.ts
│   │       └── config.schema.ts
│   └── index.ts                  # Server Entrypoint (Elysia App Assembly)
├── tests/
│   ├── auth.test.ts              # Unit & Integration Tests for Auth
│   ├── submissions.test.ts       # Submissions & Tracking Tests
│   └── winners.test.ts           # Hall of Fame Query Tests
├── .env                          # Local Environment Configuration
├── package.json
└── tsconfig.json
```

---

## 4. API Endpoints Specification

### 4.1 Authentication (`/api/auth`)

#### `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "innovator@kmutnb.ac.th",
    "password": "SecurePassword123!",
    "fullName": "สมชาย นวัตกรรม",
    "phone": "081-234-5678",
    "institution": "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    "educationLevel": "higher_and_above"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "ลงทะเบียนสำเร็จเข้าสู่ระบบเรียบร้อย",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cuid...",
      "email": "innovator@kmutnb.ac.th",
      "fullName": "สมชาย นวัตกรรม",
      "role": "contestant"
    }
  }
  ```

#### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "innovator@kmutnb.ac.th",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "เข้าสู่ระบบสำเร็จ",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
  ```

#### `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Response (200)**:
  ```json
  {
    "success": true,
    "user": { ... }
  }
  ```

---

### 4.2 Submissions & Tracking (`/api/submissions`)

#### `POST /api/submissions`
- **Access**: Authenticated / Public Fallback
- **Request Body**:
  ```json
  {
    "id": "optional-id-for-update",
    "userId": "cuid-or-guest",
    "titleTh": "หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะ",
    "titleEn": "Autonomous Search & Rescue Robot",
    "category": "energy_environment",
    "educationLevel": "higher_and_above",
    "teamName": "Robotics KMUTNB",
    "advisorName": "รศ.ดร. นวัตกรรม",
    "members": ["นาย สมชาย", "นาย สมศักดิ์"],
    "abstractTh": "รายละเอียดบทคัดย่อ...",
    "abstractEn": "Abstract details...",
    "videoUrl": "https://youtu.be/...",
    "documentUrl": "https://drive.google.com/...",
    "isDraft": false
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "ส่งผลงานเข้าประกวดสำเร็จเรียบร้อย!",
    "data": {
      "id": "cuid...",
      "trackingCode": "KMUTNB-2569-8821",
      "status": "submitted",
      "submittedAt": "2026-08-20T10:00:00.000Z"
    }
  }
  ```

#### `GET /api/submissions/status/:trackingCode`
- **Access**: Public
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "trackingCode": "KMUTNB-2569-8821",
      "titleTh": "หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะ",
      "teamName": "Robotics KMUTNB",
      "category": "energy_environment",
      "educationLevel": "higher_and_above",
      "status": "submitted",
      "submittedAt": "2026-08-20T10:00:00.000Z",
      "updatedAt": "2026-08-20T10:00:00.000Z",
      "feedback": "ยื่นผลงานเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร"
    }
  }
  ```

#### `GET /api/submissions/my`
- **Access**: Authenticated (`Bearer <token>`)
- **Response (200)**: List of submissions created by the logged-in user.

#### `GET /api/admin/submissions`
- **Access**: Admin Role Only
- **Response (200)**: Full list of all submissions across all categories with full member details.

#### `PATCH /api/admin/submissions/:id/status`
- **Access**: Admin Role Only
- **Request Body**:
  ```json
  {
    "status": "passed_first_round",
    "feedback": "ผ่านการคัดเลือกรอบแรก ให้เตรียมตัวสำหรับการ Pitching",
    "awardTier": "grand_winner"
  }
  ```

---

### 4.3 Public Data & Hall of Fame

#### `GET /api/winners`
- **Access**: Public
- **Query Params**: `?year=2568&category=medical_device&level=higher_and_above`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "sub-2025-01",
        "trackingCode": "KMUTNB-2568-0001",
        "year": 2568,
        "awardTier": "grand_winner",
        "awardNameTh": "รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)",
        "titleTh": "ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจล...",
        "category": "medical_device",
        "educationLevel": "higher_and_above",
        "teamName": "OsseBioMix",
        "institution": "คณะวิทยาศาสตร์ประยุกต์ มจพ.",
        "image": "/photo_candidates/science_lab.jpg",
        "members": ["ทีม OsseBioMix"]
      }
    ]
  }
  ```

#### `GET /api/news` & `GET /api/announcements`
- **Access**: Public
- **Response (200)**: Official announcements list with rosters of finalist candidates and official winners.

#### `GET /api/config`
- **Access**: Public
- **Response (200)**: Competition guidelines, 5 innovation domains, eligibility criteria, and timeline dates.

#### `GET /api/health`
- **Access**: Public
- **Response (200)**: Health check status including PostgreSQL connection ping.

---

## 5. Security & Error Handling

1. **Password Hashing**: `Bun.password.hash(password, { algorithm: "argon2id", memoryCost: 65536, timeCost: 3 })`.
2. **JWT Signing & Verification**: Signed with secret key from `.env`, 7-day expiration.
3. **Global Exception Handling**:
   - `PrismaClientKnownRequestError` (`P2002` Duplicate key -> 400 Bad Request with user-friendly message).
   - `ValidationError` (TypeBox validation failure -> 422 Unprocessable Entity).
   - `AuthenticationError` (Invalid or missing JWT -> 401 Unauthorized).
   - `AuthorizationError` (Insufficient role -> 403 Forbidden).

---

## 6. Seed Pipeline (`prisma/seed.ts`)

The seed script initializes:
1. **Admin & Judge Accounts**:
   - `admin@kmutnb.ac.th` (Role: `ADMIN`)
   - `judge@kmutnb.ac.th` (Role: `JUDGE`)
   - `contestant@kmutnb.ac.th` (Role: `CONTESTANT`)
2. **Historical Awarded Submissions (Hall of Fame)**:
   - 2568: 6 award winners (Grand Prize Royal Trophy, 1st/2nd Runner-Ups, 3 Honorable Mentions)
   - 2567: 1 Grand Prize Royal Trophy winner
   - 2566: 1 Grand Prize Royal Trophy winner
3. **Official Announcements & Finalist Rosters**:
   - Launch announcement (1 Sep 2026)
   - Finalists roster announcement (10 Dec 2026)
   - Official winners summary announcement (26 Jan 2025)

---

## 7. Deliverables
1. Prisma Schema & Migration scripts (`server/prisma/*`)
2. Modular Elysia.js Backend (`server/src/*`)
3. Unit & Integration test suite (`server/tests/*`)
4. Comprehensive Interactive HTML Manual (`docs/backend-guide.html`)
