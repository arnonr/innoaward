import { Elysia, t } from 'elysia';
import { prisma } from '../../lib/prisma';
import { authPlugin } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

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

  // Dynamic Competition Config
  .get('/api/config', async () => {
    const currentYear = await prisma.competitionYear.findFirst({
      where: { isCurrent: true },
      include: {
        categories: {
          where: { isActive: true },
          include: { category: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    const educationLevels = await prisma.educationLevel.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    const categoriesFormatted = (currentYear?.categories || []).map((yc) => ({
      id: yc.category.code,
      nameTh: yc.customNameTh || yc.category.nameTh,
      nameEn: yc.category.nameEn,
      descriptionTh: yc.customDescription || yc.category.descriptionTh,
      icon: yc.category.icon,
      color: yc.category.color,
      bgImage: yc.category.bgImage,
    }));

    const levelsFormatted = educationLevels.map((lvl) => ({
      id: lvl.code,
      nameTh: lvl.nameTh,
      nameEn: lvl.nameEn,
      eligible: lvl.eligibleTh,
    }));

    return {
      event: {
        nameTh: currentYear?.titleTh || 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2570',
        nameEn: currentYear?.titleEn || 'KMUTNB Innovation Awards 2027',
        themeTh: currentYear?.themeTh || 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน',
        grandPrize: currentYear?.grandPrize || 'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
        eventDate: currentYear?.eventDate?.toISOString() || '2027-06-25T01:30:00.000Z',
        submissionStart: currentYear?.submissionStart?.toISOString() || '2026-10-31T17:00:00.000Z',
        submissionDeadline:
          currentYear?.submissionEnd?.toISOString() ||
          process.env.SUBMISSION_DEADLINE ||
          '2027-02-28T16:59:59.000Z',
        organizer: 'อุทยานเทคโนโลยี มจพ.',
      },
      categories: categoriesFormatted,
      educationLevels: levelsFormatted,
      totalPrizePool: 180000,
      prizes: [
        {
          rank: 'ระดับอุดมศึกษาและบุคคลทั่วไป',
          title: 'ชนะเลิศ (1 รางวัล) 40,000 บาท + ถ้วยพระราชทานฯ + เกียรติบัตร | รองชนะเลิศอันดับ 1 (1 รางวัล) 30,000 บาท + เกียรติบัตร | รองชนะเลิศอันดับ 2 (1 รางวัล) 20,000 บาท + เกียรติบัตร | ชมเชย (3 รางวัล) รางวัลละ 5,000 บาท (รวม 15,000 บาท) + เกียรติบัตร',
        },
        {
          rank: 'ระดับต่ำกว่าอุดมศึกษา',
          title: 'ชนะเลิศ (1 รางวัล) 30,000 บาท + ถ้วยพระราชทานฯ + เกียรติบัตร | รองชนะเลิศอันดับ 1 (1 รางวัล) 20,000 บาท + เกียรติบัตร | รองชนะเลิศอันดับ 2 (1 รางวัล) 10,000 บาท + เกียรติบัตร | ชมเชย (3 รางวัล) รางวัลละ 5,000 บาท (รวม 15,000 บาท) + เกียรติบัตร',
        },
      ],
    };
  })

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
        return { success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถแก้ไขวันปิดรับสมัครได้' };
      }

      const parsedDate = new Date(body.submissionDeadline);
      if (Number.isNaN(parsedDate.getTime())) {
        set.status = 400;
        return { success: false, message: 'รูปแบบวันที่ไม่ถูกต้อง (กรุณาระบุเป็น ISO 8601)' };
      }

      const currentYear = await prisma.competitionYear.findFirst({
        where: { isCurrent: true },
      });

      if (!currentYear) {
        set.status = 404;
        return { success: false, message: 'ไม่พบข้อมูลปีการแข่งขันปัจจุบัน' };
      }

      const updated = await prisma.competitionYear.update({
        where: { id: currentYear.id },
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
        submissionDeadline: t.String({ minLength: 4 }),
      }),
    }
  );
