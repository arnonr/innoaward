import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';

export const mastersController = new Elysia({ prefix: '/api/masters' })
  // Get all competition years
  .get('/years', async () => {
    const years = await prisma.competitionYear.findMany({
      orderBy: { year: 'desc' },
      include: {
        categories: {
          include: { category: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: years,
    };
  })

  // Get categories configured for a specific competition year (e.g. 2569)
  .get(
    '/years/:year/categories',
    async ({ params, set }) => {
      const yearInt = parseInt(params.year, 10);
      if (isNaN(yearInt)) {
        set.status = 400;
        return { success: false, message: 'ปีการแข่งขันไม่ถูกต้อง' };
      }

      const compYear = await prisma.competitionYear.findUnique({
        where: { year: yearInt },
      });

      if (!compYear) {
        set.status = 404;
        return { success: false, message: `ไม่พบข้อมูลปีการแข่งขัน ${yearInt}` };
      }

      const yearCategories = await prisma.competitionYearCategory.findMany({
        where: {
          competitionYearId: compYear.id,
          isActive: true,
        },
        include: {
          category: true,
        },
        orderBy: { orderIndex: 'asc' },
      });

      return {
        success: true,
        data: yearCategories,
      };
    },
    {
      params: t.Object({
        year: t.String(),
      }),
    }
  )

  // Get all canonical categories
  .get('/categories', async () => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      success: true,
      data: categories,
    };
  })

  // Get all education levels
  .get('/education-levels', async () => {
    const levels = await prisma.educationLevel.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      success: true,
      data: levels,
    };
  });
