import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { authPlugin } from '../../middlewares/auth.middleware';
import {
  Role,
  SubmissionStatus,
  EvaluationRound,
  AnnouncementType,
  CompetitionStatus,
} from '@prisma/client';
import { hashPassword } from '../../lib/auth-utils';
import { formatDossierResponse } from '../submissions/dossier-utils';
import { normalizeRubricConfig, computeWeightedRubricTotal } from './rubric-utils';

async function resolveCompetitionYear(yearParam?: string | number) {
  const yearNum = yearParam !== undefined ? Number(yearParam) : NaN;
  if (Number.isInteger(yearNum) && yearNum > 2000) {
    const found = await prisma.competitionYear.findUnique({ where: { year: yearNum } });
    if (found) return found;
  }
  return prisma.competitionYear.findFirst({ where: { isCurrent: true } });
}

export const judgingController = new Elysia({ prefix: '/api/judging' })
  .use(authPlugin)

  // List Judges and their assigned categories for a competition year (ADMIN only)
  .get(
    '/judges',
    async ({ query, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return { success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น' };
      }

      const compYear = await resolveCompetitionYear(query.year);
      if (!compYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขัน' };
      }

      const judges = await prisma.user.findMany({
        where: { role: Role.JUDGE },
        include: {
          judgeAssignments: {
            where: { competitionYearId: compYear.id },
            include: { category: true },
          },
          evaluations: {
            where: {
              submission: { competitionYearId: compYear.id },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return {
        success: true,
        year: compYear.year,
        data: judges.map((j) => ({
          id: j.id,
          email: j.email,
          fullName: j.fullName,
          phone: j.phone || '',
          institution: j.institution || '',
          assignedCategories: j.judgeAssignments.map((a) => a.category.code),
          evaluationsCount: j.evaluations.length,
        })),
      };
    },
    {
      query: t.Object({
        year: t.Optional(t.String()),
      }),
    }
  )

  // Create or Update Judge Account + Category Assignments for a Competition Year (ADMIN only)
  .post(
    '/judges',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return { success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น' };
      }

      const compYear = await resolveCompetitionYear(body.year);
      if (!compYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขัน' };
      }

      const emailLower = body.email.trim().toLowerCase();
      let eduLevel = await prisma.educationLevel.findUnique({
        where: { code: 'general_public' },
      });
      if (!eduLevel) {
        eduLevel =
          (await prisma.educationLevel.findFirst({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
          })) ?? (await prisma.educationLevel.findFirst());
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      let judgeUser;
      if (existingUser) {
        const updateData: any = {
          fullName: body.fullName.trim() || existingUser.fullName,
          phone: body.phone !== undefined ? body.phone : existingUser.phone,
          institution:
            body.institution !== undefined ? body.institution : existingUser.institution,
          role: Role.JUDGE,
        };
        if (body.password && body.password.trim().length >= 6) {
          updateData.passwordHash = await hashPassword(body.password.trim());
        }
        judgeUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
      } else {
        const rawPassword =
          body.password && body.password.trim().length >= 6
            ? body.password.trim()
            : 'JudgePassword2027!';
        const passwordHash = await hashPassword(rawPassword);
        judgeUser = await prisma.user.create({
          data: {
            email: emailLower,
            passwordHash,
            fullName: body.fullName.trim(),
            phone: body.phone || '',
            institution:
              body.institution || 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
            educationLevelId: eduLevel!.id,
            role: Role.JUDGE,
          },
        });
      }

      // Resolve requested category codes
      const categoryCodes = Array.isArray(body.categories) ? body.categories : [];
      const categories = await prisma.category.findMany({
        where: {
          OR: [{ code: { in: categoryCodes } }, { id: { in: categoryCodes } }],
        },
      });

      await prisma.judgeCategoryAssignment.deleteMany({
        where: {
          competitionYearId: compYear.id,
          judgeId: judgeUser.id,
        },
      });

      for (const cat of categories) {
        await prisma.judgeCategoryAssignment.create({
          data: {
            competitionYearId: compYear.id,
            judgeId: judgeUser.id,
            categoryId: cat.id,
          },
        });
      }

      return {
        success: true,
        message: 'บันทึกข้อมูลกรรมการและกลุ่มนวัตกรรมที่รับผิดชอบเรียบร้อยแล้ว',
        data: {
          id: judgeUser.id,
          email: judgeUser.email,
          fullName: judgeUser.fullName,
          phone: judgeUser.phone || '',
          institution: judgeUser.institution || '',
          assignedCategories: categories.map((c) => c.code),
        },
      };
    },
    {
      body: t.Object({
        email: t.String({ minLength: 3 }),
        password: t.Optional(t.String()),
        fullName: t.String({ minLength: 2 }),
        phone: t.Optional(t.String()),
        institution: t.Optional(t.String()),
        categories: t.Array(t.String()),
        year: t.Optional(t.Number()),
      }),
    }
  )

  // Update Judge's Category Assignments for a Competition Year (ADMIN only)
  .put(
    '/judges/:judgeId/categories',
    async ({ params, body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return { success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น' };
      }

      const compYear = await resolveCompetitionYear(body.year);
      if (!compYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขัน' };
      }

      const categories = await prisma.category.findMany({
        where: {
          OR: [{ code: { in: body.categories } }, { id: { in: body.categories } }],
        },
      });

      await prisma.judgeCategoryAssignment.deleteMany({
        where: {
          competitionYearId: compYear.id,
          judgeId: params.judgeId,
        },
      });

      for (const cat of categories) {
        await prisma.judgeCategoryAssignment.create({
          data: {
            competitionYearId: compYear.id,
            judgeId: params.judgeId,
            categoryId: cat.id,
          },
        });
      }

      return {
        success: true,
        message: 'อัปเดตกลุ่มนวัตกรรมของกรรมการเรียบร้อยแล้ว',
        assignedCategories: categories.map((c) => c.code),
      };
    },
    {
      body: t.Object({
        categories: t.Array(t.String()),
        year: t.Optional(t.Number()),
      }),
    }
  )

  // List Submissions for Judging & Screening Queue (ADMIN or JUDGE)
  .get(
    '/submissions',
    async ({ query, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.JUDGE) {
        set.status = 403;
        return { success: false, message: 'เฉพาะผู้ดูแลระบบหรือคณะกรรมการเท่านั้น' };
      }

      const compYear = await resolveCompetitionYear(query.year);
      if (!compYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขัน' };
      }

      let assignedCategoryIds: string[] = [];
      let assignedCategoryCodes: string[] = [];

      if (currentUser.role === Role.JUDGE) {
        const assignments = await prisma.judgeCategoryAssignment.findMany({
          where: {
            competitionYearId: compYear.id,
            judgeId: currentUser.id,
          },
          include: { category: true },
        });
        assignedCategoryIds = assignments.map((a) => a.categoryId);
        assignedCategoryCodes = assignments.map((a) => a.category.code);
      } else {
        const yearCats = await prisma.competitionYearCategory.findMany({
          where: { competitionYearId: compYear.id, isActive: true },
          include: { category: true },
        });
        assignedCategoryIds = yearCats.map((yc) => yc.categoryId);
        assignedCategoryCodes = yearCats.map((yc) => yc.category.code);
      }

      const whereClause: any = {
        competitionYearId: compYear.id,
        status: { not: SubmissionStatus.DRAFT },
      };

      if (currentUser.role === Role.JUDGE) {
        whereClause.categoryId = { in: assignedCategoryIds };
      }

      if (query.category && query.category !== 'all') {
        const filterCat = await prisma.category.findFirst({
          where: { OR: [{ code: query.category }, { id: query.category }] },
        });
        if (filterCat) {
          if (
            currentUser.role === Role.JUDGE &&
            !assignedCategoryIds.includes(filterCat.id)
          ) {
            whereClause.categoryId = '__none__';
          } else {
            whereClause.categoryId = filterCat.id;
          }
        }
      }

      if (query.educationLevel && query.educationLevel !== 'all') {
        whereClause.educationLevel = {
          OR: [{ code: query.educationLevel }, { id: query.educationLevel }],
        };
      }

      const submissions = await prisma.submission.findMany({
        where: whereClause,
        include: {
          category: true,
          competitionYearCategory: true,
          educationLevel: true,
          competitionYearLevel: true,
          competitionYear: true,
          members: { orderBy: { orderIndex: 'asc' } },
          evaluations: {
            include: {
              judge: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      const rounds: EvaluationRound[] = [
        EvaluationRound.ROUND_1,
        EvaluationRound.ROUND_2,
        EvaluationRound.ROUND_3,
      ];

      const formatted = submissions.map((s) => {
        const dossier = formatDossierResponse(s, true);
        const myEvaluations: Record<string, any> = {
          ROUND_1: null,
          ROUND_2: null,
          ROUND_3: null,
        };
        const roundSummaries: Record<string, any> = {};

        for (const r of rounds) {
          const evalsForRound = s.evaluations.filter((e) => e.round === r);
          const myEval = evalsForRound.find((e) => e.judgeId === currentUser.id) || null;
          myEvaluations[r] = myEval
            ? {
                id: myEval.id,
                round: myEval.round,
                scores: myEval.scores,
                weightedTotal: myEval.weightedTotal,
                comment: myEval.comment || '',
                updatedAt: myEval.updatedAt.toISOString(),
              }
            : null;

          const count = evalsForRound.length;
          const avgScore =
            count > 0
              ? Math.round(
                  (evalsForRound.reduce((acc, item) => acc + item.weightedTotal, 0) /
                    count) *
                    100
                ) / 100
              : null;

          roundSummaries[r] = {
            avgScore,
            count,
            evaluations: evalsForRound.map((ev) => ({
              id: ev.id,
              judgeId: ev.judgeId,
              judgeName: ev.judge.fullName,
              weightedTotal: ev.weightedTotal,
              scores: ev.scores,
              comment: ev.comment || '',
              updatedAt: ev.updatedAt.toISOString(),
            })),
          };
        }

        const posterUrl = (s.posterUrl || '').trim();
        const presentationUrl = (s.presentationUrl || '').trim();

        return {
          ...dossier,
          hasPoster: Boolean(posterUrl),
          hasPresentation: Boolean(presentationUrl),
          myEvaluations,
          roundSummaries,
        };
      });

      return {
        success: true,
        year: compYear.year,
        rubricConfig: normalizeRubricConfig(compYear.rubricConfig),
        assignedCategories: assignedCategoryCodes,
        data: formatted,
      };
    },
    {
      query: t.Object({
        year: t.Optional(t.String()),
        category: t.Optional(t.String()),
        educationLevel: t.Optional(t.String()),
      }),
    }
  )

  // Submit or Update Weighted 1..5 Rubric Evaluation for a Round (JUDGE or ADMIN)
  .post(
    '/submissions/:submissionId/evaluate',
    async ({ params, body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.JUDGE) {
        set.status = 403;
        return { success: false, message: 'เฉพาะผู้ดูแลระบบหรือคณะกรรมการเท่านั้น' };
      }

      const submission = await prisma.submission.findUnique({
        where: { id: params.submissionId },
        include: { competitionYear: true, category: true },
      });

      if (!submission) {
        set.status = 404;
        return { success: false, message: 'ไม่พบผลงานที่ระบุ' };
      }

      if (
        submission.status === SubmissionStatus.DRAFT ||
        submission.status === SubmissionStatus.REJECTED
      ) {
        set.status = 400;
        return {
          success: false,
          message: 'ไม่สามารถให้คะแนนผลงานที่เป็นแบบร่างหรือไม่ผ่านการคัดกรองเบื้องต้นได้',
        };
      }

      if (currentUser.role === Role.JUDGE) {
        const assignment = await prisma.judgeCategoryAssignment.findUnique({
          where: {
            competitionYearId_judgeId_categoryId: {
              competitionYearId: submission.competitionYearId,
              judgeId: currentUser.id,
              categoryId: submission.categoryId,
            },
          },
        });
        if (!assignment) {
          set.status = 403;
          return {
            success: false,
            message: `คุณไม่ได้รับมอบหมายให้ประเมินผลงานในกลุ่ม "${submission.category.nameTh}" ของปี ${submission.competitionYear.year}`,
          };
        }
      }

      const roundUpper = body.round.toUpperCase();
      if (
        roundUpper !== 'ROUND_1' &&
        roundUpper !== 'ROUND_2' &&
        roundUpper !== 'ROUND_3'
      ) {
        set.status = 400;
        return { success: false, message: 'รอบการประเมินไม่ถูกต้อง (ROUND_1, ROUND_2, ROUND_3)' };
      }
      const round = roundUpper as EvaluationRound;

      const rubric = normalizeRubricConfig(submission.competitionYear.rubricConfig);
      const calc = computeWeightedRubricTotal(body.scores, rubric);
      if (!calc.valid || calc.weightedTotal === undefined || !calc.normalizedScores) {
        set.status = 400;
        return { success: false, message: calc.message };
      }

      const saved = await prisma.submissionEvaluation.upsert({
        where: {
          submissionId_judgeId_round: {
            submissionId: submission.id,
            judgeId: currentUser.id,
            round,
          },
        },
        update: {
          scores: calc.normalizedScores as any,
          weightedTotal: calc.weightedTotal,
          comment: body.comment?.trim() || '',
        },
        create: {
          submissionId: submission.id,
          judgeId: currentUser.id,
          round,
          scores: calc.normalizedScores as any,
          weightedTotal: calc.weightedTotal,
          comment: body.comment?.trim() || '',
        },
      });

      return {
        success: true,
        message: `บันทึกคะแนนประเมิน ${round} เรียบร้อยแล้ว (${calc.weightedTotal} / 100 คะแนน)`,
        data: {
          id: saved.id,
          submissionId: saved.submissionId,
          judgeId: saved.judgeId,
          round: saved.round,
          scores: saved.scores,
          weightedTotal: saved.weightedTotal,
          comment: saved.comment || '',
          updatedAt: saved.updatedAt.toISOString(),
        },
      };
    },
    {
      body: t.Object({
        round: t.String(),
        scores: t.Record(t.String(), t.Number()),
        comment: t.Optional(t.String()),
      }),
    }
  )

  // Publish Official Results Announcement + Roster for a Round (ADMIN only)
  .post(
    '/publish-results',
    async ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' };
      }
      if (currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถประกาศผลอย่างเป็นทางการได้',
        };
      }

      const compYear = await resolveCompetitionYear(body.year);
      if (!compYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขัน' };
      }

      const stage = body.stage.toUpperCase();
      if (stage !== 'ROUND_1' && stage !== 'ROUND_2' && stage !== 'ROUND_3') {
        set.status = 400;
        return { success: false, message: 'กรุณาระบุรอบที่ต้องการประกาศผล (ROUND_1, ROUND_2, ROUND_3)' };
      }

      let whereQualifying: any = { competitionYearId: compYear.id };
      let annType: AnnouncementType = AnnouncementType.GENERAL;
      let badgeText = `ประกาศผลรอบที่ 1 • ${compYear.year}`;
      let badgeClass = 'announcement-badge-general';
      let defaultTitle = `ประกาศรายชื่อผลงานที่ผ่านการคัดเลือกรอบที่ 1 (รอบคัดเลือกเอกสาร) ประจำปี ${compYear.year}`;
      let defaultAbstract = `อุทยานเทคโนโลยี มจพ. ขอประกาศรายชื่อผลงานที่ผ่านการคัดเลือกรอบที่ 1 เพื่อเข้าสู่รอบการประกวดออนไลน์ (ผู้ผ่านเข้ารอบต้องส่งไฟล์ POSTER เพิ่มเติมในระบบ)`;
      let nextYearStatus: CompetitionStatus = CompetitionStatus.REVIEWING;

      if (stage === 'ROUND_1') {
        whereQualifying.OR = [
          { round1Status: 'PASSED' },
          {
            status: {
              in: [
                SubmissionStatus.PASSED_FIRST_ROUND,
                SubmissionStatus.FINALIST,
                SubmissionStatus.AWARDED,
              ],
            },
          },
        ];
      } else if (stage === 'ROUND_2') {
        annType = AnnouncementType.FINALISTS;
        badgeText = `ประกาศผู้เข้ารอบชิงชนะเลิศ • ${compYear.year}`;
        badgeClass = 'announcement-badge-finalist';
        defaultTitle = `ประกาศรายชื่อผลงานที่ผ่านเข้าสู่รอบชิงชนะเลิศ (Finalists) ประจำปี ${compYear.year}`;
        defaultAbstract = `ประกาศรายชื่อทีมผู้ผ่านการคัดเลือกรอบที่ 2 เข้าสู่รอบตัดสินชิงชนะเลิศ โครงการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี ${compYear.year}`;
        nextYearStatus = CompetitionStatus.FINALIST_ANNOUNCED;
        whereQualifying.OR = [
          { round2Status: 'PASSED' },
          { status: { in: [SubmissionStatus.FINALIST, SubmissionStatus.AWARDED] } },
        ];
      } else {
        annType = AnnouncementType.WINNERS;
        badgeText = `ประกาศผลผู้ชนะเลิศ • ${compYear.year}`;
        badgeClass = 'announcement-badge-winner';
        defaultTitle = `ประกาศผลการตัดสินรางวัลชนะเลิศ ถ้วยพระราชทานฯ และถ้วยรางวัล มจพ. ประจำปี ${compYear.year}`;
        defaultAbstract = `ประกาศผลการตัดสินรางวัลชนะเลิศ ถ้วยพระราชทานฯ และถ้วยรางวัล มจพ. รองชนะเลิศ และรางวัลชมเชย ประจำปี ${compYear.year}`;
        nextYearStatus = CompetitionStatus.COMPLETED;
        whereQualifying.status = SubmissionStatus.AWARDED;
      }

      const qualifying = await prisma.submission.findMany({
        where: whereQualifying,
        include: {
          category: true,
          competitionYearCategory: true,
          educationLevel: true,
          competitionYearLevel: true,
        },
        orderBy: [{ trackingCode: 'asc' }],
      });

      const dateStr = new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const existingAnn = await prisma.announcement.findFirst({
        where: {
          competitionYearId: compYear.id,
          badgeText,
        },
      });

      const legacyRound3Title = `ประกาศผลการตัดสินรางวัลชนะเลิศ ถ้วยพระราชทานฯ ประจำปี ${compYear.year}`;
      const legacyRound3Abstract = `ประกาศรายชื่อผลงานที่ได้รับรางวัลชนะเลิศถ้วยพระราชทานฯ รองชนะเลิศ และรางวัลชมเชย ประจำปี ${compYear.year}`;

      let announcement;
      if (existingAnn) {
        await prisma.announcementRoster.deleteMany({
          where: { announcementId: existingAnn.id },
        });
        const preservedTitle =
          stage === 'ROUND_3' && existingAnn.title === legacyRound3Title
            ? defaultTitle
            : existingAnn.title;
        const preservedAbstract =
          stage === 'ROUND_3' && existingAnn.abstract === legacyRound3Abstract
            ? defaultAbstract
            : existingAnn.abstract;
        announcement = await prisma.announcement.update({
          where: { id: existingAnn.id },
          data: {
            type: annType,
            title: body.title?.trim() || preservedTitle || defaultTitle,
            abstract: body.abstract?.trim() || preservedAbstract || defaultAbstract,
            dateStr,
            isPublished: true,
            publishedAt: new Date(),
          },
        });
      } else {
        announcement = await prisma.announcement.create({
          data: {
            competitionYearId: compYear.id,
            type: annType,
            badgeText,
            badgeClass,
            dateStr,
            title: body.title?.trim() || defaultTitle,
            abstract: body.abstract?.trim() || defaultAbstract,
            isPublished: true,
          },
        });
      }

      for (let i = 0; i < qualifying.length; i++) {
        const q = qualifying[i];
        if (!q) continue;
        await prisma.announcementRoster.create({
          data: {
            announcementId: announcement.id,
            submissionId: q.id,
            code: q.trackingCode,
            title: q.titleTh,
            team: q.teamName,
            institution: q.affiliation || q.institution || 'มจพ.',
            level: q.competitionYearLevel?.customNameTh || q.educationLevel.nameTh,
            categoryName: q.competitionYearCategory?.customNameTh || q.category.nameTh,
            awardTierText:
              stage === 'ROUND_3'
                ? q.awardNameTh || q.round3Result || 'รางวัลเกียรติยศ'
                : stage === 'ROUND_2'
                  ? 'ผ่านเข้ารอบชิงชนะเลิศ'
                  : 'ผ่านรอบคัดเลือกเอกสาร',
            orderIndex: i + 1,
          },
        });
      }

      await prisma.competitionYear.update({
        where: { id: compYear.id },
        data: { status: nextYearStatus },
      });

      return {
        success: true,
        message: `เผยแพร่ประกาศผล (${badgeText}) จำนวน ${qualifying.length} ผลงานขึ้นหน้าเว็บไซต์เรียบร้อยแล้ว`,
        data: {
          announcementId: announcement.id,
          stage,
          year: compYear.year,
          rosterCount: qualifying.length,
        },
      };
    },
    {
      body: t.Object({
        year: t.Optional(t.Number()),
        stage: t.String(),
        title: t.Optional(t.String()),
        abstract: t.Optional(t.String()),
      }),
    }
  );
