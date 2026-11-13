import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { SubmissionStatus } from '@prisma/client';
import {
  KMUTNB_TROPHY_SHORT_TH,
  ROYAL_TROPHY_SHORT_TH,
} from '../config/competition-defaults';

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
          competitionYearCategory: true,
          competitionYearLevel: true,
          members: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: [{ competitionYear: { year: 'desc' } }, { createdAt: 'asc' }],
      });

      const formatted = winners.map((w) => {
        const yearNum = w.competitionYear.year;
        const isRoyalTrophy = Boolean(
          w.competitionYearLevel?.isRoyalTrophy ??
            (yearNum <= 2569 ||
              w.educationLevel.code === 'general_public' ||
              w.educationLevel.code === 'higher_and_above')
        );
        const trophyShortTh =
          w.competitionYearLevel?.trophyShortTh?.trim() ||
          (isRoyalTrophy ? ROYAL_TROPHY_SHORT_TH : KMUTNB_TROPHY_SHORT_TH);

        return {
          id: w.id,
          trackingCode: w.trackingCode,
          year: yearNum,
          awardTier: w.awardTier?.toLowerCase() || 'honorable_mention',
          awardNameTh: w.awardNameTh || 'รางวัลชมเชย',
          awardNameEn: w.awardNameEn || 'Honorable Mention',
          awardBadgeText: w.awardBadgeText || w.awardNameTh || 'รางวัลชมเชย',
          prizeDetails: w.prizeDetails,
          isRoyalTrophy,
          trophyShortTh,
          titleTh: w.titleTh,
          titleEn: w.titleEn,
          category: w.category.code,
          categoryNameTh: w.competitionYearCategory?.customNameTh || w.category.nameTh,
          categoryNameEn: w.category.nameEn,
          educationLevel: w.educationLevel.code,
          educationLevelNameTh:
            w.competitionYearLevel?.customNameTh || w.educationLevel.nameTh,
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
        };
      });

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
