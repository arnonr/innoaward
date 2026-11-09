import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { authPlugin } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  DEFAULT_RUBRIC_CONFIG,
  normalizeRubricConfig,
  validateRubricCriteriaInput,
} from '../judging/rubric-utils';

export const configController = new Elysia()
  .use(authPlugin)
  // Healthcheck with Database Ping
  .get('/api/health', async () => {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      service: 'KMUTNB Innovation Awards 2027 API Engine',
      timestamp: new Date().toISOString(),
      engine: 'Elysia.js on Bun',
      database: dbStatus,
    };
  })

  // Dynamic Competition Config (supports optional ?year=2570)
  .get(
    '/api/config',
    async ({ query }) => {
      const requestedYear = query.year ? parseInt(query.year, 10) : NaN;
      let targetYear = !Number.isNaN(requestedYear)
        ? await prisma.competitionYear.findUnique({
            where: { year: requestedYear },
            include: {
              categories: {
                where: { isActive: true },
                include: { category: true },
                orderBy: { orderIndex: 'asc' },
              },
            },
          })
        : null;

      if (!targetYear) {
        targetYear = await prisma.competitionYear.findFirst({
          where: { isCurrent: true },
          include: {
            categories: {
              where: { isActive: true },
              include: { category: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        });
      }

      const allYears = await prisma.competitionYear.findMany({
        orderBy: { year: 'desc' },
      });

      const educationLevels = await prisma.educationLevel.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      });

      const categoriesFormatted = (targetYear?.categories || []).map((yc) => ({
        id: yc.category.code,
        code: yc.category.code,
        categoryId: yc.category.id,
        nameTh: yc.customNameTh || yc.category.nameTh,
        nameEn: yc.category.nameEn,
        descriptionTh: yc.customDescription || yc.category.descriptionTh,
        icon: yc.category.icon,
        color: yc.category.color,
        bgImage: yc.category.bgImage,
        isActive: yc.isActive,
      }));

      const levelsFormatted = educationLevels.map((lvl) => ({
        id: lvl.code,
        nameTh: lvl.nameTh,
        nameEn: lvl.nameEn,
        eligible: lvl.eligibleTh,
      }));

      const rubricConfig = normalizeRubricConfig(targetYear?.rubricConfig);

      return {
        event: {
          year: targetYear?.year || 2570,
          yearAd: targetYear?.yearAd || 2027,
          status: targetYear?.status || 'OPEN_FOR_SUBMISSION',
          nameTh:
            targetYear?.titleTh ||
            'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2570',
          nameEn: targetYear?.titleEn || 'KMUTNB Innovation Awards 2027',
          themeTh: targetYear?.themeTh || 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน',
          grandPrize:
            targetYear?.grandPrize ||
            'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
          eventDate: targetYear?.eventDate?.toISOString() || '2027-06-25T01:30:00.000Z',
          submissionStart: targetYear?.submissionStart?.toISOString() || '2026-10-31T17:00:00.000Z',
          submissionDeadline:
            targetYear?.submissionEnd?.toISOString() ||
            process.env.SUBMISSION_DEADLINE ||
            '2027-02-28T16:59:59.000Z',
          organizer: 'อุทยานเทคโนโลยี มจพ.',
        },
        rubricConfig,
        years: allYears.map((y) => ({
          id: y.id,
          year: y.year,
          yearAd: y.yearAd,
          titleTh: y.titleTh,
          titleEn: y.titleEn,
          isCurrent: y.isCurrent,
          status: y.status,
          submissionDeadline: y.submissionEnd?.toISOString() || null,
        })),
        categories: categoriesFormatted,
        educationLevels: levelsFormatted,
        totalPrizePool: 180000,
        prizes: [
          {
            rank: 'ระดับอุดมศึกษาและบุคคลทั่วไป',
            title:
              'ชนะเลิศ (1 รางวัล) 40,000 บาท + ถ้วยพระราชทานฯ + เกียรติบัตร | รองชนะเลิศอันดับ 1 (1 รางวัล) 30,000 บาท + เกียรติบัตร | รองชนะเลิศอันดับ 2 (1 รางวัล) 20,000 บาท + เกียรติบัตร | ชมเชย (3 รางวัล) รางวัลละ 5,000 บาท (รวม 15,000 บาท) + เกียรติบัตร',
          },
          {
            rank: 'ระดับต่ำกว่าอุดมศึกษา',
            title:
              'ชนะเลิศ (1 รางวัล) 30,000 บาท + ถ้วยพระราชทานฯ + เกียรติบัตร | รองชนะเลิศอันดับ 1 (1 รางวัล) 20,000 บาท + เกียรติบัตร | รองชนะเลิศอันดับ 2 (1 รางวัล) 10,000 บาท + เกียรติบัตร | ชมเชย (3 รางวัล) รางวัลละ 5,000 บาท (รวม 15,000 บาท) + เกียรติบัตร',
          },
        ],
      };
    },
    {
      query: t.Object({
        year: t.Optional(t.String()),
      }),
    }
  )

  // Update Submission Deadline (Admin Only)
  .patch(
    '/api/config/deadline',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถแก้ไขวันปิดรับสมัครได้',
        };
      }

      const parsedDate = new Date(body.submissionDeadline);
      if (Number.isNaN(parsedDate.getTime())) {
        set.status = 400;
        return { success: false, message: 'รูปแบบวันที่ไม่ถูกต้อง (กรุณาระบุเป็น ISO 8601)' };
      }

      const targetYear = body.year
        ? await prisma.competitionYear.findUnique({ where: { year: body.year } })
        : await prisma.competitionYear.findFirst({ where: { isCurrent: true } });

      if (!targetYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขันที่ระบุ' };
      }

      const updated = await prisma.competitionYear.update({
        where: { id: targetYear.id },
        data: { submissionEnd: parsedDate },
      });

      return {
        success: true,
        message: 'อัปเดตวันปิดรับสมัครเรียบร้อยแล้ว',
        submissionDeadline: updated.submissionEnd?.toISOString() || parsedDate.toISOString(),
      };
    },
    {
      body: t.Object({
        year: t.Optional(t.Number()),
        submissionDeadline: t.String({ minLength: 4 }),
      }),
    }
  )

  // Update Weighted Rubric Configuration per Competition Year (Admin Only)
  .patch(
    '/api/config/rubric',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถตั้งค่าเกณฑ์การให้คะแนนได้',
        };
      }

      const validation = validateRubricCriteriaInput(body.criteria);
      if (!validation.valid || !validation.criteria) {
        set.status = 400;
        return { success: false, message: validation.message };
      }

      const targetYear = body.year
        ? await prisma.competitionYear.findUnique({ where: { year: body.year } })
        : await prisma.competitionYear.findFirst({ where: { isCurrent: true } });

      if (!targetYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขันที่ระบุ' };
      }

      await prisma.competitionYear.update({
        where: { id: targetYear.id },
        data: { rubricConfig: validation.criteria as any },
      });

      return {
        success: true,
        message: 'บันทึกเกณฑ์และค่าน้ำหนักคะแนนเรียบร้อยแล้ว',
        rubricConfig: validation.criteria,
      };
    },
    {
      body: t.Object({
        year: t.Optional(t.Number()),
        criteria: t.Array(t.Any()),
      }),
    }
  )

  // Add or Update Dynamic Innovation Category for a Competition Year (Admin Only)
  .post(
    '/api/config/categories',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถจัดการกลุ่มนวัตกรรมได้',
        };
      }

      const cleanCode = body.code
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_');
      if (!cleanCode || !body.nameTh.trim()) {
        set.status = 400;
        return { success: false, message: 'กรุณาระบุรหัสและชื่อกลุ่มนวัตกรรม' };
      }

      const targetYear = body.year
        ? await prisma.competitionYear.findUnique({ where: { year: body.year } })
        : await prisma.competitionYear.findFirst({ where: { isCurrent: true } });

      if (!targetYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขันที่ระบุ' };
      }

      const existingCount = await prisma.category.count();
      const cat = await prisma.category.upsert({
        where: { code: cleanCode },
        update: {
          nameTh: body.nameTh.trim(),
          nameEn: body.nameEn?.trim() || body.nameTh.trim(),
          descriptionTh: body.descriptionTh?.trim() || '',
          color: body.color || '#06B6D4',
          isActive: true,
        },
        create: {
          code: cleanCode,
          nameTh: body.nameTh.trim(),
          nameEn: body.nameEn?.trim() || body.nameTh.trim(),
          descriptionTh: body.descriptionTh?.trim() || '',
          color: body.color || '#06B6D4',
          orderIndex: existingCount + 1,
          isActive: true,
        },
      });

      const isActive = body.isActive !== undefined ? body.isActive : true;
      const yearCat = await prisma.competitionYearCategory.upsert({
        where: {
          competitionYearId_categoryId: {
            competitionYearId: targetYear.id,
            categoryId: cat.id,
          },
        },
        update: {
          customNameTh: body.nameTh.trim(),
          customDescription: body.descriptionTh?.trim() || cat.descriptionTh || '',
          isActive,
        },
        create: {
          competitionYearId: targetYear.id,
          categoryId: cat.id,
          customNameTh: body.nameTh.trim(),
          customDescription: body.descriptionTh?.trim() || cat.descriptionTh || '',
          isActive,
          orderIndex: cat.orderIndex,
        },
      });

      return {
        success: true,
        message: 'อัปเดตกลุ่มนวัตกรรมประจำปีเรียบร้อยแล้ว',
        data: {
          id: cat.code,
          categoryId: cat.id,
          nameTh: yearCat.customNameTh || cat.nameTh,
          nameEn: cat.nameEn,
          descriptionTh: yearCat.customDescription || cat.descriptionTh,
          color: cat.color,
          isActive: yearCat.isActive,
        },
      };
    },
    {
      body: t.Object({
        year: t.Optional(t.Number()),
        code: t.String({ minLength: 2 }),
        nameTh: t.String({ minLength: 2 }),
        nameEn: t.Optional(t.String()),
        descriptionTh: t.Optional(t.String()),
        color: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )

  // Create or Activate Competition Year (Multi-Year Rollover, Admin Only)
  .post(
    '/api/config/years',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถจัดการปีการแข่งขันได้',
        };
      }

      const yearNum = Number(body.year);
      if (!Number.isInteger(yearNum) || yearNum < 2500 || yearNum > 2700) {
        set.status = 400;
        return { success: false, message: 'กรุณาระบุปี พ.ศ. ให้ถูกต้อง (เช่น 2571)' };
      }

      const yearAd = body.yearAd || yearNum - 543;
      const previousCurrent = await prisma.competitionYear.findFirst({
        where: { isCurrent: true },
        include: {
          categories: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      const clonedRubric = previousCurrent?.rubricConfig
        ? normalizeRubricConfig(previousCurrent.rubricConfig)
        : DEFAULT_RUBRIC_CONFIG;

      const setAsCurrent = body.setAsCurrent !== undefined ? body.setAsCurrent : true;
      if (setAsCurrent) {
        await prisma.competitionYear.updateMany({
          where: { isCurrent: true },
          data: { isCurrent: false },
        });
      }

      const submissionEnd = body.submissionDeadline
        ? new Date(body.submissionDeadline)
        : new Date(`${yearAd}-02-28T16:59:59.000Z`);

      const createdYear = await prisma.competitionYear.upsert({
        where: { year: yearNum },
        update: {
          yearAd,
          titleTh:
            body.titleTh ||
            `โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี ${yearNum}`,
          titleEn: body.titleEn || `KMUTNB Innovation Awards ${yearAd}`,
          submissionEnd: !Number.isNaN(submissionEnd.getTime()) ? submissionEnd : undefined,
          isCurrent: setAsCurrent,
        },
        create: {
          year: yearNum,
          yearAd,
          titleTh:
            body.titleTh ||
            `โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี ${yearNum}`,
          titleEn: body.titleEn || `KMUTNB Innovation Awards ${yearAd}`,
          themeTh: 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน',
          submissionEnd: !Number.isNaN(submissionEnd.getTime()) ? submissionEnd : undefined,
          isCurrent: setAsCurrent,
          rubricConfig: clonedRubric as any,
        },
      });

      // Clone active categories from previous current year (or bind all active master categories)
      const sourceCategories =
        previousCurrent && previousCurrent.categories.length > 0
          ? previousCurrent.categories
          : (await prisma.category.findMany({ where: { isActive: true } })).map((c) => ({
              categoryId: c.id,
              customNameTh: null,
              customDescription: null,
              prizeSummary:
                'ชิงถ้วยพระราชทานฯ (สำหรับรางวัลชนะเลิศ) เงินรางวัลรวม 180,000 บาท และเกียรติบัตร',
              isActive: true,
              orderIndex: c.orderIndex,
            }));

      for (const sc of sourceCategories) {
        await prisma.competitionYearCategory.upsert({
          where: {
            competitionYearId_categoryId: {
              competitionYearId: createdYear.id,
              categoryId: sc.categoryId,
            },
          },
          update: { isActive: true },
          create: {
            competitionYearId: createdYear.id,
            categoryId: sc.categoryId,
            customNameTh: sc.customNameTh,
            customDescription: sc.customDescription,
            prizeSummary: sc.prizeSummary,
            isActive: true,
            orderIndex: sc.orderIndex,
          },
        });
      }

      return {
        success: true,
        message: `บันทึกปีการแข่งขัน ${yearNum} เรียบร้อยแล้ว`,
        data: createdYear,
      };
    },
    {
      body: t.Object({
        year: t.Number(),
        yearAd: t.Optional(t.Number()),
        titleTh: t.Optional(t.String()),
        titleEn: t.Optional(t.String()),
        submissionDeadline: t.Optional(t.String()),
        setAsCurrent: t.Optional(t.Boolean()),
      }),
    }
  );
