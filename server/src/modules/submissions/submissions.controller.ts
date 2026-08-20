import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { authPlugin, requireAuth } from '../../middlewares/auth.middleware';
import { generateTrackingCode } from '../../lib/tracking';
import { submissionPayloadSchema, updateStatusSchema } from './submissions.schema';
import { SubmissionStatus, AwardTier, Role } from '@prisma/client';

export const submissionsController = new Elysia({ prefix: '/api/submissions' })
  .use(authPlugin)

  // Create or Update Submission
  .post(
    '/',
    async ({ body, currentUser, set }) => {
      const payload = body;

      if (!payload.titleTh || !payload.category || !payload.educationLevel) {
        set.status = 400;
        return {
          success: false,
          message: 'กรุณากรอกชื่อผลงาน หมวดหมู่การแข่งขัน และระดับการศึกษาให้ครบถ้วน',
        };
      }

      // 1. Resolve Competition Year
      let compYear = await prisma.competitionYear.findFirst({
        where: payload.year ? { year: Number(payload.year) } : { isCurrent: true },
      });

      if (!compYear) {
        compYear = await prisma.competitionYear.findFirst({
          orderBy: { year: 'desc' },
        });
      }

      // 2. Resolve Category
      const category = await prisma.category.findFirst({
        where: {
          OR: [{ code: payload.category }, { id: payload.category }],
        },
      });

      if (!category) {
        set.status = 400;
        return { success: false, message: 'ไม่พบหมวดหมู่นวัตกรรมที่ระบุ' };
      }

      // 3. Resolve CompetitionYearCategory
      const yearCategory = await prisma.competitionYearCategory.findUnique({
        where: {
          competitionYearId_categoryId: {
            competitionYearId: compYear!.id,
            categoryId: category.id,
          },
        },
      });

      // 4. Resolve Education Level
      const educationLevel = await prisma.educationLevel.findFirst({
        where: {
          OR: [{ code: payload.educationLevel }, { id: payload.educationLevel }],
        },
      });

      if (!educationLevel) {
        set.status = 400;
        return { success: false, message: 'ไม่พบระดับการศึกษาที่ระบุ' };
      }

      // 5. Resolve User
      let targetUserId = currentUser?.id || payload.userId;
      if (!targetUserId || targetUserId === 'guest-user') {
        let defaultUser = await prisma.user.findFirst({
          where: { role: Role.CONTESTANT },
        });
        if (!defaultUser) {
          const passHash = await Bun.password.hash('Contestant2026!', { algorithm: 'argon2id' });
          defaultUser = await prisma.user.create({
            data: {
              email: 'guest@kmutnb.ac.th',
              passwordHash: passHash,
              fullName: payload.authorName || 'ผู้เข้าแข่งขัน (Guest)',
              educationLevelId: educationLevel.id,
              role: Role.CONTESTANT,
            },
          });
        }
        targetUserId = defaultUser.id;
      }

      const isDraft = payload.isDraft === true;
      const status = isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED;

      // Extract Members Array
      let rawMembers: string[] = [];
      if (Array.isArray(payload.members)) {
        rawMembers = payload.members.filter(Boolean);
      } else if (typeof payload.members === 'string') {
        rawMembers = payload.members.split(',').map((m) => m.trim()).filter(Boolean);
      }
      if (rawMembers.length === 0) {
        rawMembers = [payload.authorName || currentUser?.fullName || 'หัวหน้าทีม'];
      }

      // 6. Create or Update Submission
      let submission;
      if (payload.id) {
        const existing = await prisma.submission.findUnique({
          where: { id: payload.id },
        });

        if (existing) {
          submission = await prisma.submission.update({
            where: { id: payload.id },
            data: {
              competitionYearId: compYear!.id,
              categoryId: category.id,
              competitionYearCategoryId: yearCategory?.id,
              educationLevelId: educationLevel.id,
              titleTh: payload.titleTh,
              titleEn: payload.titleEn || '',
              teamName: payload.teamName || 'ทีมสร้างสรรค์นวัตกรรม',
              advisorName: payload.advisorName || '',
              abstractTh: payload.abstractTh || '',
              abstractEn: payload.abstractEn || '',
              coverImage: payload.coverImage || '',
              videoUrl: payload.videoUrl || '',
              documentUrl: payload.documentUrl || '',
              status,
              submittedAt: isDraft ? undefined : new Date(),
              feedback: isDraft
                ? 'ฉบับร่าง (ยังไม่ได้ส่งผลงานฉบับสมบูรณ์)'
                : 'ยื่นผลงานเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร',
            },
            include: {
              category: true,
              educationLevel: true,
              competitionYear: true,
              members: true,
            },
          });

          // Recreate members
          await prisma.teamMember.deleteMany({ where: { submissionId: submission.id } });
          for (let i = 0; i < rawMembers.length; i++) {
            await prisma.teamMember.create({
              data: {
                submissionId: submission.id,
                fullName: rawMembers[i],
                role: i === 0 ? 'หัวหน้าทีม' : 'สมาชิก',
                orderIndex: i + 1,
              },
            });
          }
        }
      }

      if (!submission) {
        const trackingCode = generateTrackingCode(compYear!.year);

        submission = await prisma.submission.create({
          data: {
            trackingCode,
            userId: targetUserId,
            competitionYearId: compYear!.id,
            categoryId: category.id,
            competitionYearCategoryId: yearCategory?.id,
            educationLevelId: educationLevel.id,
            titleTh: payload.titleTh,
            titleEn: payload.titleEn || '',
            teamName: payload.teamName || 'ทีมสร้างสรรค์นวัตกรรม',
            advisorName: payload.advisorName || '',
            abstractTh: payload.abstractTh || '',
            abstractEn: payload.abstractEn || '',
            coverImage: payload.coverImage || '',
            videoUrl: payload.videoUrl || '',
            documentUrl: payload.documentUrl || '',
            status,
            submittedAt: isDraft ? undefined : new Date(),
            feedback: isDraft
              ? 'ฉบับร่าง (ยังไม่ได้ส่งผลงานฉบับสมบูรณ์)'
              : 'ยื่นผลงานเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร',
            members: {
              create: rawMembers.map((m, idx) => ({
                fullName: m,
                role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก',
                orderIndex: idx + 1,
              })),
            },
          },
          include: {
            category: true,
            educationLevel: true,
            competitionYear: true,
            members: { orderBy: { orderIndex: 'asc' } },
          },
        });
      }

      // Re-fetch with fresh members list
      const fresh = await prisma.submission.findUnique({
        where: { id: submission.id },
        include: {
          category: true,
          educationLevel: true,
          competitionYear: true,
          members: { orderBy: { orderIndex: 'asc' } },
        },
      });

      return {
        success: true,
        message: isDraft ? 'บันทึกร่างผลงานเรียบร้อยแล้ว' : 'ส่งผลงานเข้าประกวดสำเร็จเรียบร้อย!',
        data: fresh,
      };
    },
    {
      body: submissionPayloadSchema,
    }
  )

  // Quick Status Check by Tracking Code
  .get('/status/:trackingCode', async ({ params, set }) => {
    const code = params.trackingCode.toUpperCase().trim();

    const found = await prisma.submission.findUnique({
      where: { trackingCode: code },
      include: {
        category: true,
        educationLevel: true,
        competitionYear: true,
        members: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!found) {
      set.status = 404;
      return {
        success: false,
        message: 'ไม่พบรหัสติดตามผลงานนี้ในระบบ โปรดตรวจสอบรหัส KMUTNB-XXXX-XXXX อีกครั้ง',
      };
    }

    return {
      success: true,
      data: {
        id: found.id,
        trackingCode: found.trackingCode,
        titleTh: found.titleTh,
        titleEn: found.titleEn,
        category: found.category.code,
        categoryNameTh: found.category.nameTh,
        categoryNameEn: found.category.nameEn,
        educationLevel: found.educationLevel.code,
        educationLevelNameTh: found.educationLevel.nameTh,
        teamName: found.teamName,
        advisorName: found.advisorName,
        status: found.status,
        coverImage: found.coverImage || found.image,
        videoUrl: found.videoUrl,
        documentUrl: found.documentUrl,
        submittedAt: found.submittedAt,
        updatedAt: found.updatedAt,
        year: found.competitionYear.year,
        members: found.members.map((m) => m.fullName),
        feedback: found.feedback || 'เอกสารเรียบร้อย อยู่ระหว่างการพิจารณาจากคณะกรรมการ',
      },
    };
  })

  // Get My Submissions for Logged-In Contestant
  .get('/my', async ({ currentUser, set }) => {
    if (!currentUser) {
      set.status = 401;
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ (Unauthorized)' };
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: currentUser.id },
      include: {
        category: true,
        educationLevel: true,
        competitionYear: true,
        members: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: submissions,
    };
  })

  // Get Single Submission by ID
  .get('/:id', async ({ params, set }) => {
    const found = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        educationLevel: true,
        competitionYear: true,
        members: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!found) {
      set.status = 404;
      return { success: false, message: 'ไม่พบผลงานที่ระบุ' };
    }

    return {
      success: true,
      data: found,
    };
  });
