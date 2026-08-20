-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CONTESTANT', 'JUDGE', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PASSED_FIRST_ROUND', 'FINALIST', 'AWARDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AwardTier" AS ENUM ('GRAND_WINNER', 'RUNNER_UP_1', 'RUNNER_UP_2', 'HONORABLE_MENTION');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('UPCOMING', 'OPEN_FOR_SUBMISSION', 'REVIEWING', 'FINALIST_ANNOUNCED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'FINALISTS', 'WINNERS');

-- CreateTable
CREATE TABLE "competition_years" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "yearAd" INTEGER NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "themeTh" TEXT DEFAULT '',
    "grandPrize" TEXT DEFAULT 'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
    "submissionStart" TIMESTAMP(3),
    "submissionEnd" TIMESTAMP(3),
    "announcementDate" TIMESTAMP(3),
    "eventDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'OPEN_FOR_SUBMISSION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionTh" TEXT,
    "descriptionEn" TEXT,
    "icon" TEXT DEFAULT 'Zap',
    "color" TEXT DEFAULT '#059669',
    "bgImage" TEXT DEFAULT '/domain-energy.jpg',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_year_categories" (
    "id" TEXT NOT NULL,
    "competitionYearId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "customNameTh" TEXT,
    "customDescription" TEXT,
    "prizeSummary" TEXT DEFAULT 'เงินรางวัลชนะเลิศ 30,000 - 50,000 บาท พร้อมโล่รางวัลและเกียรติบัตร',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_year_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "eligibleTh" TEXT,
    "eligibleEn" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT DEFAULT '',
    "institution" TEXT DEFAULT 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    "educationLevelId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONTESTANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competitionYearId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "competitionYearCategoryId" TEXT,
    "educationLevelId" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT DEFAULT '',
    "teamName" TEXT NOT NULL DEFAULT 'ทีมสร้างสรรค์นวัตกรรม',
    "advisorName" TEXT DEFAULT '',
    "abstractTh" TEXT NOT NULL,
    "abstractEn" TEXT DEFAULT '',
    "coverImage" TEXT DEFAULT '',
    "videoUrl" TEXT DEFAULT '',
    "documentUrl" TEXT DEFAULT '',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "feedback" TEXT DEFAULT '',
    "institution" TEXT DEFAULT '',
    "awardTier" "AwardTier",
    "awardNameTh" TEXT DEFAULT '',
    "awardNameEn" TEXT DEFAULT '',
    "awardBadgeText" TEXT DEFAULT '',
    "prizeDetails" TEXT DEFAULT '',
    "image" TEXT DEFAULT '',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'สมาชิก',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "competitionYearId" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "badgeText" TEXT NOT NULL,
    "badgeClass" TEXT DEFAULT 'announcement-badge-general',
    "dateStr" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "content" TEXT,
    "pdfUrl" TEXT DEFAULT '#',
    "coverImage" TEXT DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_rosters" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "submissionId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "institution" TEXT DEFAULT '',
    "level" TEXT NOT NULL,
    "categoryName" TEXT DEFAULT '',
    "awardTierText" TEXT DEFAULT '',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "announcement_rosters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competition_years_year_key" ON "competition_years"("year");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "competition_year_categories_competitionYearId_categoryId_key" ON "competition_year_categories"("competitionYearId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "education_levels_code_key" ON "education_levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_trackingCode_key" ON "submissions"("trackingCode");

-- CreateIndex
CREATE INDEX "submissions_categoryId_idx" ON "submissions"("categoryId");

-- CreateIndex
CREATE INDEX "submissions_educationLevelId_idx" ON "submissions"("educationLevelId");

-- CreateIndex
CREATE INDEX "submissions_competitionYearId_idx" ON "submissions"("competitionYearId");

-- CreateIndex
CREATE INDEX "submissions_competitionYearCategoryId_idx" ON "submissions"("competitionYearCategoryId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "announcements_competitionYearId_idx" ON "announcements"("competitionYearId");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_isPublished_idx" ON "announcements"("isPublished");

-- CreateIndex
CREATE INDEX "announcement_rosters_announcementId_idx" ON "announcement_rosters"("announcementId");

-- AddForeignKey
ALTER TABLE "competition_year_categories" ADD CONSTRAINT "competition_year_categories_competitionYearId_fkey" FOREIGN KEY ("competitionYearId") REFERENCES "competition_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_year_categories" ADD CONSTRAINT "competition_year_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_competitionYearId_fkey" FOREIGN KEY ("competitionYearId") REFERENCES "competition_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_competitionYearCategoryId_fkey" FOREIGN KEY ("competitionYearCategoryId") REFERENCES "competition_year_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_competitionYearId_fkey" FOREIGN KEY ("competitionYearId") REFERENCES "competition_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_rosters" ADD CONSTRAINT "announcement_rosters_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
