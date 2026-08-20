import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { SubmissionStatus } from '@prisma/client';

export const winnersController = new Elysia({ prefix: '/api/winners' })
  // Get Public Winners Gallery (Hall of Fame)
  .get(
    '/',
    async ({ query }) => {
      const { category, level, year, search } = query;

      const whereClause: any = {
        status: SubmissionStatus.AWARDED,
      };

      if (year && year !== 'all') {
        const yearInt = parseInt(year, 10);
        if (!isNaN(yearInt)) {
          whereClause.competitionYear = { year: yearInt };
        }
      }

      if (category && category !== 'all') {
        whereClause.category = {
          OR: [{ code: category }, { id: category }],
        };
      }

      if (level && level !== 'all') {
        whereClause.educationLevel = {
          OR: [{ code: level }, { id: level }],
        };
      }

      if (search && search.trim()) {
        const q = search.trim();
        whereClause.OR = [
          { titleTh: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
          { teamName: { contains: q, mode: 'insensitive' } },
          { institution: { contains: q, mode: 'insensitive' } },
          { trackingCode: { contains: q, mode: 'insensitive' } },
        ];
      }

      const winners = await prisma.submission.findMany({
        where: whereClause,
        include: {
          category: true,
          educationLevel: true,
          competitionYear: true,
          members: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: [{ competitionYear: { year: 'desc' } }, { createdAt: 'asc' }],
      });

      const formatted = winners.map((w) => ({
        id: w.id,
        trackingCode: w.trackingCode,
        year: w.competitionYear.year,
        awardTier: w.awardTier?.toLowerCase() || 'honorable_mention',
        awardNameTh: w.awardNameTh || 'รางวัลชมเชย',
        awardNameEn: w.awardNameEn || 'Honorable Mention',
        awardBadgeText: w.awardBadgeText || w.awardNameTh || 'รางวัลชมเชย',
        prizeDetails: w.prizeDetails,
        titleTh: w.titleTh,
        titleEn: w.titleEn,
        category: w.category.code,
        categoryNameTh: w.category.nameTh,
        categoryNameEn: w.category.nameEn,
        educationLevel: w.educationLevel.code,
        educationLevelNameTh: w.educationLevel.nameTh,
        teamName: w.teamName,
        institution: w.institution || 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
        advisorName: w.advisorName,
        members: w.members.map((m) => m.fullName),
        abstractTh: w.abstractTh,
        abstractEn: w.abstractEn,
        coverImage: w.coverImage || w.image,
        image: w.image || w.coverImage,
        videoUrl: w.videoUrl,
        submittedAt: w.submittedAt?.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      }));

      return {
        success: true,
        data: formatted,
      };
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        level: t.Optional(t.String()),
        year: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  );
