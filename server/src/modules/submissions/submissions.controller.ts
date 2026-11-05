import { Elysia } from 'elysia';
import { prisma } from '../../lib/prisma';
import { authPlugin } from '../../middlewares/auth.middleware';
import { generateTrackingCode } from '../../lib/tracking';
import {
  submissionPayloadSchema,
  updateArtifactsSchema,
  updateStatusSchema,
} from './submissions.schema';
import {
  formatDossierResponse,
  normalizeMembersInput,
} from './dossier-utils';
import { SubmissionStatus, RoundStatus, AwardTier, Role } from '@prisma/client';

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

      // Check configurable submission deadline for full-form create/update
      const deadlineDate = compYear?.submissionEnd
        ? compYear.submissionEnd
        : process.env.SUBMISSION_DEADLINE
        ? new Date(process.env.SUBMISSION_DEADLINE)
        : null;
      if (
        deadlineDate &&
        !Number.isNaN(deadlineDate.getTime()) &&
        Date.now() > deadlineDate.getTime() &&
        currentUser?.role !== Role.ADMIN
      ) {
        set.status = 403;
        return {
          success: false,
          message:
            'ปิดรับสมัครและสิ้นสุดเวลาแก้ไขข้อมูลใบสมัครแล้ว (หากต้องการแนบโปสเตอร์หรือสไลด์นำเสนอ กรุณาใช้เมนูแนบไฟล์เพิ่มเติม)',
        };
      }

      // 2. Resolve Category (support "others" without altering active 5-domain catalog)
      let category = await prisma.category.findFirst({
        where: {
          OR: [{ code: payload.category }, { id: payload.category }],
        },
      });

      if (!category && payload.category === 'others') {
        category = await prisma.category.upsert({
          where: { code: 'others' },
          update: {},
          create: {
            code: 'others',
            nameTh: 'อื่นๆ (Others) — สิ่งประดิษฐ์และนวัตกรรมทั่วไป',
            nameEn: 'Others',
            descriptionTh: 'สิ่งประดิษฐ์และนวัตกรรมสร้างสรรค์ทั่วไปนอกเหนือจาก 5 สาขาหลัก',
            descriptionEn: 'General creative inventions and innovations outside the 5 main domains.',
            icon: 'Box',
            color: '#06B6D4',
            bgImage: '/domain-material.jpg',
            orderIndex: 6,
            isActive: false,
          },
        });
      }

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

      // 5. Resolve User (only ADMIN may attribute a submission to an arbitrary payload.userId)
      let targetUserId =
        currentUser?.role === Role.ADMIN ? payload.userId || currentUser.id : currentUser?.id;
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

      // Normalize Members
      const normalizedMembers = normalizeMembersInput(
        payload.members,
        payload.authorName || currentUser?.fullName || 'หัวหน้าทีม'
      );

      // Extract Coordinator & File fields
      const affiliation = payload.affiliation || payload.institution || '';
      const proposalPdfUrl =
        payload.files?.proposalPdfUrl || payload.proposalPdfUrl || payload.documentUrl || '';
      const videoUrl = payload.files?.videoUrl || payload.videoUrl || '';
      const posterUrl = payload.files?.posterUrl || payload.posterUrl || '';
      const coverImage = payload.files?.imageUrl || payload.coverImage || '';
      const presentationUrl = payload.files?.presentationUrl || payload.presentationUrl || '';

      const primaryCoord = payload.primaryCoordinator || {};
      const secondaryCoord = payload.secondaryCoordinator || {};

      const commonData = {
        competitionYearId: compYear!.id,
        categoryId: category.id,
        competitionYearCategoryId: yearCategory?.id,
        educationLevelId: educationLevel.id,
        titleTh: payload.titleTh,
        titleEn: payload.titleEn || '',
        teamName: payload.teamName || 'ทีมสร้างสรรค์นวัตกรรม',
        affiliation,
        institution: affiliation,
        advisorName: payload.advisorName || '',
        abstractTh: payload.abstractTh || '',
        abstractEn: payload.abstractEn || '',
        proposalPdfUrl,
        documentUrl: proposalPdfUrl,
        coverImage,
        image: coverImage,
        videoUrl,
        posterUrl,
        presentationUrl,
        primaryCoordName: primaryCoord.name || '',
        primaryCoordIdCard: primaryCoord.idCard || '',
        primaryCoordPhone: primaryCoord.phone || '',
        primaryCoordEmail: primaryCoord.email || '',
        secondaryCoordName: secondaryCoord.name || '',
        secondaryCoordIdCard: secondaryCoord.idCard || '',
        secondaryCoordPhone: secondaryCoord.phone || '',
        secondaryCoordEmail: secondaryCoord.email || '',
        status,
        submittedAt: isDraft ? undefined : new Date(),
        feedback: isDraft
          ? 'ฉบับร่าง (ยังไม่ได้ส่งผลงานฉบับสมบูรณ์)'
          : 'ยื่นผลงานเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร',
      };

      // 6. Create or Update Submission (round1/2/3 statuses are never set by contestants)
      let submission;
      if (payload.id) {
        const existing = await prisma.submission.findUnique({
          where: { id: payload.id },
        });

        if (existing) {
          const canUpdateExisting = Boolean(
            currentUser &&
              (currentUser.id === existing.userId || currentUser.role === Role.ADMIN)
          );
          if (!canUpdateExisting) {
            set.status = 403;
            return {
              success: false,
              message: 'ไม่มีสิทธิ์แก้ไขผลงานของผู้ใช้อื่น',
            };
          }

          submission = await prisma.submission.update({
            where: { id: payload.id },
            data: commonData,
          });

          await prisma.teamMember.deleteMany({ where: { submissionId: submission.id } });
          for (let i = 0; i < normalizedMembers.length; i++) {
            await prisma.teamMember.create({
              data: {
                submissionId: submission.id,
                fullName: normalizedMembers[i].fullName,
                role: normalizedMembers[i].role,
                idCard: normalizedMembers[i].idCard,
                orderIndex: i + 1,
              },
            });
          }
        }
      }

      if (!submission) {
        if (currentUser?.role !== Role.ADMIN) {
          const existingCount = await prisma.submission.count({
            where: {
              userId: targetUserId,
              competitionYearId: compYear!.id,
            },
          });
          if (existingCount >= 2) {
            set.status = 400;
            return {
              success: false,
              message: 'บัญชีนี้สร้างผลงานครบโควตาสูงสุด 2 โครงการแล้ว',
            };
          }
        }

        const trackingCode = generateTrackingCode(compYear!.year);

        submission = await prisma.submission.create({
          data: {
            trackingCode,
            userId: targetUserId,
            ...commonData,
            round1Status: RoundStatus.PENDING,
            round2Status: RoundStatus.PENDING,
            round3Status: RoundStatus.PENDING,
            round3Result: '',
            members: {
              create: normalizedMembers.map((m, idx) => ({
                fullName: m.fullName,
                role: m.role,
                idCard: m.idCard,
                orderIndex: idx + 1,
              })),
            },
          },
        });
      }

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

  // Quick Status Check by Tracking Code (with PDPA masking for public lookup)
  .get('/status/:trackingCode', async ({ params, currentUser, set }) => {
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

    const isOwnerOrAdmin = Boolean(
      currentUser &&
        (currentUser.id === found.userId ||
          currentUser.role === Role.ADMIN ||
          currentUser.role === Role.JUDGE)
    );

    return {
      success: true,
      data: formatDossierResponse(found, isOwnerOrAdmin),
    };
  })

  // Post-Submission Artifact Update (Poster & Presentation can be attached later by owner or ADMIN)
  .patch(
    '/tracking/:trackingCode/artifacts',
    async ({ params, body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return {
          success: false,
          message: 'กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านก่อนแนบหรือแก้ไขไฟล์ประกอบผลงาน',
        };
      }

      const code = params.trackingCode.toUpperCase().trim();
      const found = await prisma.submission.findUnique({
        where: { trackingCode: code },
      });

      if (!found) {
        set.status = 404;
        return {
          success: false,
          message: 'ไม่พบรหัสติดตามผลงานนี้ในระบบ',
        };
      }

      if (currentUser.id !== found.userId && currentUser.role !== Role.ADMIN) {
        set.status = 403;
        return {
          success: false,
          message: 'ไม่มีสิทธิ์แก้ไขไฟล์ประกอบผลงานของผู้ใช้อื่น',
        };
      }

      const pickUrl = (val: string | undefined, prev: string | null) =>
        val && val.trim() ? val.trim() : prev || '';

      const nextProposalPdf = pickUrl(
        body.proposalPdfUrl !== undefined ? body.proposalPdfUrl : body.documentUrl,
        found.proposalPdfUrl || found.documentUrl
      );
      const nextImage = pickUrl(
        body.imageUrl !== undefined ? body.imageUrl : body.coverImage,
        found.coverImage || found.image
      );

      const updated = await prisma.submission.update({
        where: { id: found.id },
        data: {
          proposalPdfUrl: nextProposalPdf,
          documentUrl: nextProposalPdf,
          videoUrl: pickUrl(body.videoUrl, found.videoUrl),
          posterUrl: pickUrl(body.posterUrl, found.posterUrl),
          coverImage: nextImage,
          image: nextImage,
          presentationUrl: pickUrl(body.presentationUrl, found.presentationUrl),
        },
        include: {
          category: true,
          educationLevel: true,
          competitionYear: true,
          members: { orderBy: { orderIndex: 'asc' } },
        },
      });

      const isOwnerOrAdmin = Boolean(
        currentUser &&
          (currentUser.id === updated.userId ||
            currentUser.role === Role.ADMIN ||
            currentUser.role === Role.JUDGE)
      );

      return {
        success: true,
        message: 'อัปเดตไฟล์ประกอบผลงานเรียบร้อยแล้ว',
        data: formatDossierResponse(updated, isOwnerOrAdmin),
      };
    },
    {
      body: updateArtifactsSchema,
    }
  )

  // Admin / Judge Round & Status Update
  .patch(
    '/:id/status',
    async ({ params, body, currentUser, set }) => {
      if (!currentUser || (currentUser.role !== Role.ADMIN && currentUser.role !== Role.JUDGE)) {
        set.status = 403;
        return { success: false, message: 'เฉพาะผู้ดูแลระบบหรือคณะกรรมการเท่านั้น' };
      }

      const existing = await prisma.submission.findUnique({ where: { id: params.id } });
      if (!existing) {
        set.status = 404;
        return { success: false, message: 'ไม่พบผลงานที่ระบุ' };
      }

      const toRoundStatus = (val?: string) => {
        if (!val) return undefined;
        const u = val.toUpperCase();
        if (u === 'PASSED' || u === 'FAILED' || u === 'PENDING') {
          return u as RoundStatus;
        }
        return undefined;
      };

      const updated = await prisma.submission.update({
        where: { id: params.id },
        data: {
          status: body.status
            ? (body.status.toUpperCase() as SubmissionStatus)
            : existing.status,
          round1Status: toRoundStatus(body.round1Status) ?? existing.round1Status,
          round2Status: toRoundStatus(body.round2Status) ?? existing.round2Status,
          round3Status: toRoundStatus(body.round3Status) ?? existing.round3Status,
          round3Result: body.round3Result ?? existing.round3Result,
          feedback: body.feedback ?? existing.feedback,
          awardTier: body.awardTier
            ? (body.awardTier.toUpperCase() as AwardTier)
            : existing.awardTier,
          awardNameTh: body.awardNameTh ?? existing.awardNameTh,
          prizeDetails: body.prizeDetails ?? existing.prizeDetails,
        },
        include: {
          category: true,
          educationLevel: true,
          competitionYear: true,
          members: { orderBy: { orderIndex: 'asc' } },
        },
      });

      return {
        success: true,
        data: formatDossierResponse(updated, true),
      };
    },
    {
      body: updateStatusSchema,
    }
  )

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
      data: submissions.map((s) => ({ ...s, ...formatDossierResponse(s, true) })),
    };
  })

  // Get Single Submission by ID (with PDPA masking for public lookup)
  .get('/:id', async ({ params, currentUser, set }) => {
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

    const isOwnerOrAdmin = Boolean(
      currentUser &&
        (currentUser.id === found.userId ||
          currentUser.role === Role.ADMIN ||
          currentUser.role === Role.JUDGE)
    );

    return {
      success: true,
      data: formatDossierResponse(found, isOwnerOrAdmin),
    };
  });
