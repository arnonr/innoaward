import { Elysia } from 'elysia';
import { prisma } from '../../lib/prisma';

export const configController = new Elysia()
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
      service: 'KMUTNB Innovation Awards 2026 API Engine',
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
        nameTh: currentYear?.titleTh || 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569',
        nameEn: currentYear?.titleEn || 'KMUTNB Innovation Awards 2026',
        themeTh: currentYear?.themeTh || 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน',
        grandPrize: currentYear?.grandPrize || 'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
        eventDate: currentYear?.eventDate?.toISOString() || '2027-01-26T08:30:00Z',
        submissionStart: currentYear?.submissionStart?.toISOString() || '2026-09-01T00:00:00Z',
        submissionDeadline: currentYear?.submissionEnd?.toISOString() || '2026-11-15T23:59:59Z',
        organizer: 'อุทยานเทคโนโลยี มจพ.',
      },
      categories: categoriesFormatted,
      educationLevels: levelsFormatted,
      prizes: [
        { rank: 'Grand Prize', title: 'ถ้วยพระราชทานฯ + เงินรางวัล 100,000 บาท + โล่รางวัล + เกียรติบัตร' },
        { rank: 'ระดับอุดมศึกษาขึ้นไป', title: 'เงินรางวัลชนะเลิศแต่ละหมวด 30,000 - 50,000 บาท + โล่รางวัล + เกียรติบัตร' },
        { rank: 'ระดับต่ำกว่าอุดมศึกษา', title: 'เงินรางวัลชนะเลิศแต่ละหมวด 20,000 - 30,000 บาท + โล่รางวัล + เกียรติบัตร' },
      ],
    };
  });
