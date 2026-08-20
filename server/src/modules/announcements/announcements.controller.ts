import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { AnnouncementType } from '@prisma/client';

export const announcementsController = new Elysia()
  // List Announcements
  .get(
    '/api/announcements',
    async ({ query }) => {
      const { category, type, year, search } = query;

      const whereClause: any = {
        isPublished: true,
      };

      const targetType = type || category;
      if (targetType && targetType !== 'all') {
        const typeUpper = targetType.toUpperCase();
        if (typeUpper === 'GENERAL' || typeUpper === 'FINALISTS' || typeUpper === 'WINNERS') {
          whereClause.type = typeUpper as AnnouncementType;
        }
      }

      if (year && year !== 'all') {
        const yearInt = parseInt(year, 10);
        if (!isNaN(yearInt)) {
          whereClause.competitionYear = { year: yearInt };
        }
      }

      if (search && search.trim()) {
        const q = search.trim();
        whereClause.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { abstract: { contains: q, mode: 'insensitive' } },
        ];
      }

      const list = await prisma.announcement.findMany({
        where: whereClause,
        include: {
          competitionYear: true,
          roster: {
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      });

      const formatted = list.map((a) => ({
        id: a.id,
        category: a.type.toLowerCase(),
        badgeText: a.badgeText,
        badgeClass: a.badgeClass || 'announcement-badge-general',
        date: a.dateStr,
        title: a.title,
        abstract: a.abstract,
        content: a.content,
        pdfUrl: a.pdfUrl || '#',
        coverImage: a.coverImage,
        year: a.competitionYear.year,
        roster: a.roster.map((r) => ({
          code: r.code,
          title: r.title,
          team: r.team,
          institution: r.institution,
          level: r.level,
          categoryName: r.categoryName,
          awardTierText: r.awardTierText,
        })),
      }));

      return {
        success: true,
        data: formatted,
      };
    },
    {
      query: t.Object({
        category: t.Optional(t.String()),
        type: t.Optional(t.String()),
        year: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    }
  )

  // Alias for /api/news to maintain 100% backward compatibility
  .get('/api/news', async () => {
    const list = await prisma.announcement.findMany({
      where: { isPublished: true },
      include: {
        competitionYear: true,
        roster: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { publishedAt: 'desc' },
    });

    const formatted = list.map((a) => ({
      id: a.id,
      title: a.title,
      date: a.dateStr,
      category: a.badgeText,
      summary: a.abstract,
      pdfUrl: a.pdfUrl,
      roster: a.roster,
    }));

    return {
      success: true,
      data: formatted,
    };
  })

  // Get Single Announcement by ID
  .get(
    '/api/announcements/:id',
    async ({ params, set }) => {
      const found = await prisma.announcement.findUnique({
        where: { id: params.id },
        include: {
          competitionYear: true,
          roster: { orderBy: { orderIndex: 'asc' } },
        },
      });

      if (!found) {
        set.status = 404;
        return { success: false, message: 'ไม่พบประกาศข่าวสารที่ระบุ' };
      }

      return {
        success: true,
        data: {
          id: found.id,
          category: found.type.toLowerCase(),
          badgeText: found.badgeText,
          badgeClass: found.badgeClass,
          date: found.dateStr,
          title: found.title,
          abstract: found.abstract,
          content: found.content,
          pdfUrl: found.pdfUrl,
          coverImage: found.coverImage,
          year: found.competitionYear.year,
          roster: found.roster,
        },
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
