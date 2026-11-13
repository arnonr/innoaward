import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { authPlugin } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  DEFAULT_RUBRIC_CONFIG,
  normalizeRubricConfig,
  validateRubricCriteriaInput,
} from '../judging/rubric-utils';
import {
  CATEGORIES_2570_DEFAULTS,
  KMUTNB_TROPHY_SHORT_TH,
  KMUTNB_TROPHY_TITLE_TH,
  LEVELS_2570_DEFAULTS,
  PROTOTYPE_RULE_TH,
  ROYAL_TROPHY_SHORT_TH,
  ROYAL_TROPHY_TITLE_TH,
  formatLevelPrizeSummaryLine,
} from './competition-defaults';

function sanitizePrizeBreakdown(rawBreakdown: unknown): Record<string, unknown>[] {
  if (!Array.isArray(rawBreakdown)) return [];
  return rawBreakdown.filter(
    (raw): raw is Record<string, unknown> =>
      Boolean(raw && typeof raw === 'object' && !Array.isArray(raw))
  );
}

const yearConfigInclude = {
  categories: {
    where: { isActive: true },
    include: { category: true },
    orderBy: { orderIndex: 'asc' as const },
  },
  levels: {
    where: { isActive: true },
    include: { educationLevel: true },
    orderBy: { orderIndex: 'asc' as const },
  },
};

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
            include: yearConfigInclude,
          })
        : null;

      if (!targetYear) {
        targetYear = await prisma.competitionYear.findFirst({
          where: { isCurrent: true },
          include: yearConfigInclude,
        });
      }

      const allYears = await prisma.competitionYear.findMany({
        orderBy: { year: 'desc' },
      });

      const categoriesFormatted = targetYear
        ? targetYear.categories.map((yc) => ({
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
          }))
        : CATEGORIES_2570_DEFAULTS.map((spec) => ({
            id: spec.code,
            code: spec.code,
            categoryId: spec.code,
            nameTh: spec.nameTh,
            nameEn: spec.nameEn,
            descriptionTh: spec.descriptionTh,
            icon: spec.icon,
            color: spec.color,
            bgImage: spec.bgImage,
            isActive: true,
          }));

      const levelsFormatted = targetYear
        ? targetYear.levels.map((yl) => {
            const breakdown = sanitizePrizeBreakdown(yl.prizeBreakdown);
            const trophyShortTh =
              (typeof yl.trophyShortTh === 'string' && yl.trophyShortTh.trim()) ||
              (yl.isRoyalTrophy ? ROYAL_TROPHY_SHORT_TH : KMUTNB_TROPHY_SHORT_TH);
            const trophyTitleTh =
              (typeof yl.trophyTitleTh === 'string' && yl.trophyTitleTh.trim()) ||
              (yl.isRoyalTrophy ? ROYAL_TROPHY_TITLE_TH : KMUTNB_TROPHY_TITLE_TH);

            return {
              id: yl.educationLevel.code,
              code: yl.educationLevel.code,
              educationLevelId: yl.educationLevelId,
              nameTh: yl.customNameTh || yl.educationLevel.nameTh,
              nameEn: yl.customNameEn || yl.educationLevel.nameEn,
              eligible: yl.customEligibleTh || yl.educationLevel.eligibleTh || '',
              trophyTitleTh,
              trophyShortTh,
              isRoyalTrophy: yl.isRoyalTrophy,
              totalPrizeAmount: yl.totalPrizeAmount,
              requiresPrototype: yl.requiresPrototype,
              prototypeRuleTh: yl.prototypeRuleTh || PROTOTYPE_RULE_TH,
              prizeBreakdown: breakdown,
            };
          })
        : LEVELS_2570_DEFAULTS.map((spec) => ({
            id: spec.code,
            code: spec.code,
            educationLevelId: spec.code,
            nameTh: spec.nameTh,
            nameEn: spec.nameEn,
            eligible: spec.eligibleTh,
            trophyTitleTh: spec.trophyTitleTh,
            trophyShortTh: spec.trophyShortTh,
            isRoyalTrophy: spec.isRoyalTrophy,
            totalPrizeAmount: spec.totalPrizeAmount,
            requiresPrototype: spec.requiresPrototype,
            prototypeRuleTh: spec.prototypeRuleTh,
            prizeBreakdown: spec.prizeBreakdown,
          }));

      const totalPrizePool = levelsFormatted.reduce((sum, l) => sum + l.totalPrizeAmount, 0);
      const totalAwardCount = levelsFormatted.reduce((sum, l) => {
        if (l.prizeBreakdown.length === 0) return sum + 6;
        const levelAwards = l.prizeBreakdown.reduce((acc, item: any) => {
          const count = Number(item.count) > 0 ? Number(item.count) : 1;
          return acc + count;
        }, 0);
        return sum + levelAwards;
      }, 0);

      const prizes = levelsFormatted.map((l) => ({
        rank: l.nameTh,
        title: formatLevelPrizeSummaryLine(l),
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
            ROYAL_TROPHY_TITLE_TH,
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
        totalPrizePool,
        totalAwardCount,
        prizes,
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
        ? await prisma.competitionYear.findUnique({
            where: { year: body.year },
            include: { levels: { where: { isActive: true } } },
          })
        : await prisma.competitionYear.findFirst({
            where: { isCurrent: true },
            include: { levels: { where: { isActive: true } } },
          });

      if (!targetYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขันที่ระบุ' };
      }

      const activeYearPool = targetYear.levels.reduce(
        (sum, lvl) => sum + (Number(lvl.totalPrizeAmount) || 0),
        0
      );
      const hasRoyalLevel = targetYear.levels.some((lvl) => lvl.isRoyalTrophy);
      const hasKmutnbLevel = targetYear.levels.some((lvl) => !lvl.isRoyalTrophy);
      const trophyClause =
        hasRoyalLevel && hasKmutnbLevel
          ? `ชิง${ROYAL_TROPHY_SHORT_TH} ${KMUTNB_TROPHY_SHORT_TH}`
          : hasRoyalLevel
            ? `ชิง${ROYAL_TROPHY_SHORT_TH}`
            : `ชิง${KMUTNB_TROPHY_SHORT_TH}`;
      const categoryPrizeSummary =
        activeYearPool > 0
          ? `${trophyClause} เงินรางวัลรวม ${activeYearPool.toLocaleString('en-US')} บาท และเกียรติบัตร`
          : `ชิง${ROYAL_TROPHY_SHORT_TH} ${KMUTNB_TROPHY_SHORT_TH} เงินรางวัลรวม 255,000 บาท และเกียรติบัตร`;

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
          prizeSummary: categoryPrizeSummary,
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

  // Add or Update Dynamic Competition Level for a Competition Year (Admin Only)
  .post(
    '/api/config/levels',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถจัดการประเภทการแข่งขันได้',
        };
      }

      const cleanCode = body.code
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_');
      if (!cleanCode || !body.nameTh.trim()) {
        set.status = 400;
        return { success: false, message: 'กรุณาระบุรหัสและชื่อประเภทการแข่งขัน' };
      }

      const targetYear = body.year
        ? await prisma.competitionYear.findUnique({ where: { year: body.year } })
        : await prisma.competitionYear.findFirst({ where: { isCurrent: true } });

      if (!targetYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขันที่ระบุ' };
      }

      let eduLevel = await prisma.educationLevel.findUnique({
        where: { code: cleanCode },
      });

      if (!eduLevel) {
        const existingCount = await prisma.educationLevel.count();
        eduLevel = await prisma.educationLevel.create({
          data: {
            code: cleanCode,
            nameTh: body.nameTh.trim(),
            nameEn: body.nameEn?.trim() || body.nameTh.trim(),
            eligibleTh: body.eligibleTh?.trim() || '',
            eligibleEn: '',
            orderIndex: body.orderIndex ?? existingCount + 1,
            isActive: targetYear.isCurrent ? (body.isActive ?? true) : false,
          },
        });
      } else if (
        targetYear.isCurrent &&
        body.isActive !== undefined &&
        eduLevel.isActive !== body.isActive
      ) {
        eduLevel = await prisma.educationLevel.update({
          where: { id: eduLevel.id },
          data: { isActive: body.isActive },
        });
      }

      const existingYearLevel = await prisma.competitionYearLevel.findUnique({
        where: {
          competitionYearId_educationLevelId: {
            competitionYearId: targetYear.id,
            educationLevelId: eduLevel.id,
          },
        },
      });

      const resolvedIsRoyal =
        body.isRoyalTrophy !== undefined
          ? body.isRoyalTrophy
          : (existingYearLevel?.isRoyalTrophy ?? false);

      const resolvedTrophyTitleTh =
        (typeof body.trophyTitleTh === 'string' && body.trophyTitleTh.trim()) ||
        (existingYearLevel &&
        (body.isRoyalTrophy === undefined ||
          body.isRoyalTrophy === existingYearLevel.isRoyalTrophy) &&
        existingYearLevel.trophyTitleTh.trim()
          ? existingYearLevel.trophyTitleTh.trim()
          : resolvedIsRoyal
            ? ROYAL_TROPHY_TITLE_TH
            : KMUTNB_TROPHY_TITLE_TH);

      const resolvedTrophyShortTh =
        (typeof body.trophyShortTh === 'string' && body.trophyShortTh.trim()) ||
        (existingYearLevel &&
        (body.isRoyalTrophy === undefined ||
          body.isRoyalTrophy === existingYearLevel.isRoyalTrophy) &&
        existingYearLevel.trophyShortTh.trim()
          ? existingYearLevel.trophyShortTh.trim()
          : resolvedIsRoyal
            ? ROYAL_TROPHY_SHORT_TH
            : KMUTNB_TROPHY_SHORT_TH);

      const resolvedTotalPrizeAmount =
        body.totalPrizeAmount !== undefined && Number.isFinite(body.totalPrizeAmount)
          ? Math.max(0, Math.round(body.totalPrizeAmount))
          : (existingYearLevel?.totalPrizeAmount ?? 75000);

      const resolvedPrizeBreakdown =
        body.prizeBreakdown !== undefined
          ? sanitizePrizeBreakdown(body.prizeBreakdown)
          : existingYearLevel?.prizeBreakdown != null
            ? sanitizePrizeBreakdown(existingYearLevel.prizeBreakdown)
            : undefined;

      const resolvedRequiresPrototype =
        body.requiresPrototype !== undefined
          ? body.requiresPrototype
          : (existingYearLevel?.requiresPrototype ?? true);

      const resolvedIsActive =
        body.isActive !== undefined ? body.isActive : (existingYearLevel?.isActive ?? true);

      const resolvedOrderIndex =
        body.orderIndex !== undefined
          ? body.orderIndex
          : (existingYearLevel?.orderIndex ?? eduLevel.orderIndex);

      const yearLevel = await prisma.competitionYearLevel.upsert({
        where: {
          competitionYearId_educationLevelId: {
            competitionYearId: targetYear.id,
            educationLevelId: eduLevel.id,
          },
        },
        update: {
          customNameTh: body.nameTh.trim(),
          customNameEn:
            body.nameEn !== undefined
              ? body.nameEn.trim() || body.nameTh.trim()
              : existingYearLevel?.customNameEn,
          customEligibleTh:
            body.eligibleTh !== undefined
              ? body.eligibleTh.trim()
              : existingYearLevel?.customEligibleTh,
          trophyTitleTh: resolvedTrophyTitleTh,
          trophyShortTh: resolvedTrophyShortTh,
          isRoyalTrophy: resolvedIsRoyal,
          totalPrizeAmount: resolvedTotalPrizeAmount,
          prizeBreakdown: resolvedPrizeBreakdown as any,
          requiresPrototype: resolvedRequiresPrototype,
          prototypeRuleTh: existingYearLevel?.prototypeRuleTh || PROTOTYPE_RULE_TH,
          isActive: resolvedIsActive,
          orderIndex: resolvedOrderIndex,
        },
        create: {
          competitionYearId: targetYear.id,
          educationLevelId: eduLevel.id,
          customNameTh: body.nameTh.trim(),
          customNameEn: body.nameEn?.trim() || eduLevel.nameEn || body.nameTh.trim(),
          customEligibleTh: body.eligibleTh?.trim() ?? eduLevel.eligibleTh ?? '',
          trophyTitleTh: resolvedTrophyTitleTh,
          trophyShortTh: resolvedTrophyShortTh,
          isRoyalTrophy: resolvedIsRoyal,
          totalPrizeAmount: resolvedTotalPrizeAmount,
          prizeBreakdown: resolvedPrizeBreakdown as any,
          requiresPrototype: resolvedRequiresPrototype,
          prototypeRuleTh: PROTOTYPE_RULE_TH,
          isActive: resolvedIsActive,
          orderIndex: resolvedOrderIndex,
        },
      });

      const responseBreakdown = sanitizePrizeBreakdown(yearLevel.prizeBreakdown);

      return {
        success: true,
        message: 'อัปเดตประเภทการแข่งขันประจำปีเรียบร้อยแล้ว',
        data: {
          id: eduLevel.code,
          code: eduLevel.code,
          educationLevelId: eduLevel.id,
          nameTh: yearLevel.customNameTh || eduLevel.nameTh,
          nameEn: yearLevel.customNameEn || eduLevel.nameEn,
          eligible: yearLevel.customEligibleTh || eduLevel.eligibleTh || '',
          trophyTitleTh: yearLevel.trophyTitleTh,
          trophyShortTh: yearLevel.trophyShortTh,
          isRoyalTrophy: yearLevel.isRoyalTrophy,
          totalPrizeAmount: yearLevel.totalPrizeAmount,
          requiresPrototype: yearLevel.requiresPrototype,
          prototypeRuleTh: yearLevel.prototypeRuleTh || PROTOTYPE_RULE_TH,
          prizeBreakdown: responseBreakdown,
          prizeSummary: formatLevelPrizeSummaryLine({
            prizeBreakdown: responseBreakdown,
            trophyShortTh: yearLevel.trophyShortTh,
            totalPrizeAmount: yearLevel.totalPrizeAmount,
          }),
          isActive: yearLevel.isActive,
          orderIndex: yearLevel.orderIndex,
        },
      };
    },
    {
      body: t.Object({
        year: t.Optional(t.Number()),
        code: t.String({ minLength: 2 }),
        nameTh: t.String({ minLength: 2 }),
        nameEn: t.Optional(t.String()),
        eligibleTh: t.Optional(t.String()),
        trophyTitleTh: t.Optional(t.String()),
        trophyShortTh: t.Optional(t.String()),
        isRoyalTrophy: t.Optional(t.Boolean()),
        totalPrizeAmount: t.Optional(t.Number()),
        prizeBreakdown: t.Optional(t.Array(t.Any())),
        requiresPrototype: t.Optional(t.Boolean()),
        isActive: t.Optional(t.Boolean()),
        orderIndex: t.Optional(t.Number()),
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
      const requestedCloneYear =
        body.cloneFromYear && Number.isInteger(Number(body.cloneFromYear))
          ? await prisma.competitionYear.findUnique({
              where: { year: Number(body.cloneFromYear) },
              include: yearConfigInclude,
            })
          : null;
      const previousCurrent =
        requestedCloneYear ||
        (await prisma.competitionYear.findFirst({
          where: { isCurrent: true },
          include: yearConfigInclude,
        }));

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

      const defaultPrizeSummary =
        'ชิงถ้วยพระราชทานฯ และถ้วยรางวัล มจพ. เงินรางวัลรวม 255,000 บาท พร้อมเกียรติบัตร';

      const existingYearCategoriesCount = await prisma.competitionYearCategory.count({
        where: { competitionYearId: createdYear.id },
      });

      if (existingYearCategoriesCount === 0) {
        // Clone active categories from previous current year (or fallback to CATEGORIES_2570_DEFAULTS)
        let sourceCategories: Array<{
          categoryId: string;
          customNameTh: string | null;
          customDescription: string | null;
          prizeSummary: string | null;
          orderIndex: number;
        }> = [];

        if (previousCurrent && previousCurrent.categories.length > 0) {
          sourceCategories = previousCurrent.categories.map((yc) => ({
            categoryId: yc.categoryId,
            customNameTh: yc.customNameTh,
            customDescription: yc.customDescription,
            prizeSummary: yc.prizeSummary,
            orderIndex: yc.orderIndex,
          }));
        } else {
          for (const catSpec of CATEGORIES_2570_DEFAULTS) {
            const cat = await prisma.category.upsert({
              where: { code: catSpec.code },
              update: {},
              create: {
                ...catSpec,
                isActive: true,
              },
            });
            sourceCategories.push({
              categoryId: cat.id,
              customNameTh: null,
              customDescription: null,
              prizeSummary: defaultPrizeSummary,
              orderIndex: catSpec.orderIndex,
            });
          }
        }

        for (const sc of sourceCategories) {
          await prisma.competitionYearCategory.upsert({
            where: {
              competitionYearId_categoryId: {
                competitionYearId: createdYear.id,
                categoryId: sc.categoryId,
              },
            },
            update: {
              customNameTh: sc.customNameTh,
              customDescription: sc.customDescription,
              prizeSummary: sc.prizeSummary,
              isActive: true,
              orderIndex: sc.orderIndex,
            },
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
      }

      const existingYearLevelsCount = await prisma.competitionYearLevel.count({
        where: { competitionYearId: createdYear.id },
      });

      if (existingYearLevelsCount === 0) {
        // Clone active CompetitionYearLevels from previous current year (or fallback to LEVELS_2570_DEFAULTS)
        let sourceLevels: Array<{
          educationLevelId: string;
          customNameTh: string | null;
          customNameEn: string | null;
          customEligibleTh: string | null;
          trophyTitleTh: string;
          trophyShortTh: string;
          isRoyalTrophy: boolean;
          totalPrizeAmount: number;
          prizeBreakdown: unknown;
          requiresPrototype: boolean;
          prototypeRuleTh: string | null;
          orderIndex: number;
        }> = [];

        if (previousCurrent && previousCurrent.levels.length > 0) {
          sourceLevels = previousCurrent.levels.map((yl) => ({
            educationLevelId: yl.educationLevelId,
            customNameTh: yl.customNameTh,
            customNameEn: yl.customNameEn,
            customEligibleTh: yl.customEligibleTh,
            trophyTitleTh: yl.trophyTitleTh,
            trophyShortTh: yl.trophyShortTh,
            isRoyalTrophy: yl.isRoyalTrophy,
            totalPrizeAmount: yl.totalPrizeAmount,
            prizeBreakdown: yl.prizeBreakdown,
            requiresPrototype: yl.requiresPrototype,
            prototypeRuleTh: yl.prototypeRuleTh,
            orderIndex: yl.orderIndex,
          }));
        } else {
          for (const lvlSpec of LEVELS_2570_DEFAULTS) {
            const eduLevel = await prisma.educationLevel.upsert({
              where: { code: lvlSpec.code },
              update: {},
              create: {
                code: lvlSpec.code,
                nameTh: lvlSpec.nameTh,
                nameEn: lvlSpec.nameEn,
                eligibleTh: lvlSpec.eligibleTh,
                eligibleEn: lvlSpec.eligibleEn,
                orderIndex: lvlSpec.orderIndex,
                isActive: true,
              },
            });
            sourceLevels.push({
              educationLevelId: eduLevel.id,
              customNameTh: lvlSpec.nameTh,
              customNameEn: lvlSpec.nameEn,
              customEligibleTh: lvlSpec.eligibleTh,
              trophyTitleTh: lvlSpec.trophyTitleTh,
              trophyShortTh: lvlSpec.trophyShortTh,
              isRoyalTrophy: lvlSpec.isRoyalTrophy,
              totalPrizeAmount: lvlSpec.totalPrizeAmount,
              prizeBreakdown: lvlSpec.prizeBreakdown,
              requiresPrototype: lvlSpec.requiresPrototype,
              prototypeRuleTh: lvlSpec.prototypeRuleTh,
              orderIndex: lvlSpec.orderIndex,
            });
          }
        }

        for (const sl of sourceLevels) {
          const sanitizedBreakdown =
            sl.prizeBreakdown != null ? sanitizePrizeBreakdown(sl.prizeBreakdown) : undefined;
          await prisma.competitionYearLevel.upsert({
            where: {
              competitionYearId_educationLevelId: {
                competitionYearId: createdYear.id,
                educationLevelId: sl.educationLevelId,
              },
            },
            update: {
              customNameTh: sl.customNameTh,
              customNameEn: sl.customNameEn,
              customEligibleTh: sl.customEligibleTh,
              trophyTitleTh: sl.trophyTitleTh,
              trophyShortTh: sl.trophyShortTh,
              isRoyalTrophy: sl.isRoyalTrophy,
              totalPrizeAmount: sl.totalPrizeAmount,
              prizeBreakdown: sanitizedBreakdown as any,
              requiresPrototype: sl.requiresPrototype,
              prototypeRuleTh: sl.prototypeRuleTh || PROTOTYPE_RULE_TH,
              isActive: true,
              orderIndex: sl.orderIndex,
            },
            create: {
              competitionYearId: createdYear.id,
              educationLevelId: sl.educationLevelId,
              customNameTh: sl.customNameTh,
              customNameEn: sl.customNameEn,
              customEligibleTh: sl.customEligibleTh,
              trophyTitleTh: sl.trophyTitleTh,
              trophyShortTh: sl.trophyShortTh,
              isRoyalTrophy: sl.isRoyalTrophy,
              totalPrizeAmount: sl.totalPrizeAmount,
              prizeBreakdown: sanitizedBreakdown as any,
              requiresPrototype: sl.requiresPrototype,
              prototypeRuleTh: sl.prototypeRuleTh || PROTOTYPE_RULE_TH,
              isActive: true,
              orderIndex: sl.orderIndex,
            },
          });
        }
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
        cloneFromYear: t.Optional(t.Number()),
        setAsCurrent: t.Optional(t.Boolean()),
      }),
    }
  );
