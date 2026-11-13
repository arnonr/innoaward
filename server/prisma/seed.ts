import {
  PrismaClient,
  Role,
  SubmissionStatus,
  RoundStatus,
  AwardTier,
  CompetitionStatus,
  AnnouncementType,
} from '@prisma/client';
import {
  LEVELS_2570_DEFAULTS,
  LEVELS_2569_DEFAULTS,
  CATEGORIES_2570_DEFAULTS,
  CATEGORIES_2569_LEGACY,
} from '../src/modules/config/competition-defaults';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Education Levels
  console.log('  -> Seeding Education Levels...');
  const generalPublicSpec = LEVELS_2570_DEFAULTS.find((l) => l.code === 'general_public')!;
  const higherEdSpec = LEVELS_2570_DEFAULTS.find((l) => l.code === 'higher_education')!;

  const levelGeneralPublic = await prisma.educationLevel.upsert({
    where: { code: 'general_public' },
    update: {
      nameTh: generalPublicSpec.nameTh,
      nameEn: generalPublicSpec.nameEn,
      eligibleTh: generalPublicSpec.eligibleTh,
      eligibleEn: generalPublicSpec.eligibleEn,
      orderIndex: 1,
      isActive: true,
    },
    create: {
      code: 'general_public',
      nameTh: generalPublicSpec.nameTh,
      nameEn: generalPublicSpec.nameEn,
      eligibleTh: generalPublicSpec.eligibleTh,
      eligibleEn: generalPublicSpec.eligibleEn,
      orderIndex: 1,
      isActive: true,
    },
  });

  const levelHigherEducation = await prisma.educationLevel.upsert({
    where: { code: 'higher_education' },
    update: {
      nameTh: higherEdSpec.nameTh,
      nameEn: higherEdSpec.nameEn,
      eligibleTh: higherEdSpec.eligibleTh,
      eligibleEn: higherEdSpec.eligibleEn,
      orderIndex: 2,
      isActive: true,
    },
    create: {
      code: 'higher_education',
      nameTh: higherEdSpec.nameTh,
      nameEn: higherEdSpec.nameEn,
      eligibleTh: higherEdSpec.eligibleTh,
      eligibleEn: higherEdSpec.eligibleEn,
      orderIndex: 2,
      isActive: true,
    },
  });

  const levelBelow = await prisma.educationLevel.upsert({
    where: { code: 'below_higher' },
    update: {
      nameTh: 'ระดับต่ำกว่าอุดมศึกษา',
      nameEn: 'Below Higher Education',
      eligibleTh: 'นักเรียนระดับมัธยมศึกษา, ปวช., ปวส. หรือเทียบเท่า',
      eligibleEn: 'High school and vocational students (Voc. Cert. / High Voc. Cert. or equivalent)',
      orderIndex: 3,
      isActive: true,
    },
    create: {
      code: 'below_higher',
      nameTh: 'ระดับต่ำกว่าอุดมศึกษา',
      nameEn: 'Below Higher Education',
      eligibleTh: 'นักเรียนระดับมัธยมศึกษา, ปวช., ปวส. หรือเทียบเท่า',
      eligibleEn: 'High school and vocational students (Voc. Cert. / High Voc. Cert. or equivalent)',
      orderIndex: 3,
      isActive: true,
    },
  });

  const levelHigherLegacy = await prisma.educationLevel.upsert({
    where: { code: 'higher_and_above' },
    update: {
      nameTh: 'ระดับอุดมศึกษาและบุคคลทั่วไป',
      nameEn: 'Higher Education & General Public',
      eligibleTh: 'นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, ผู้ประกอบการ และประชาชนทั่วไป',
      eligibleEn: 'Undergraduate, graduate students, researchers, startups, and general public',
      orderIndex: 4,
      isActive: false,
    },
    create: {
      code: 'higher_and_above',
      nameTh: 'ระดับอุดมศึกษาและบุคคลทั่วไป',
      nameEn: 'Higher Education & General Public',
      eligibleTh: 'นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, ผู้ประกอบการ และประชาชนทั่วไป',
      eligibleEn: 'Undergraduate, graduate students, researchers, startups, and general public',
      orderIndex: 4,
      isActive: false,
    },
  });

  const levelMap = new Map<string, any>([
    ['general_public', levelGeneralPublic],
    ['higher_education', levelHigherEducation],
    ['below_higher', levelBelow],
    ['higher_and_above', levelHigherLegacy],
  ]);

  // 2. Seed Categories (Master Catalog: 5 active 2570 categories + 5 legacy 2569 categories)
  console.log('  -> Seeding Categories...');
  const categoryMap = new Map<string, any>();

  for (const cat of CATEGORIES_2570_DEFAULTS) {
    const created = await prisma.category.upsert({
      where: { code: cat.code },
      update: {
        ...cat,
        isActive: true,
      },
      create: {
        ...cat,
        isActive: true,
      },
    });
    categoryMap.set(cat.code, created);
  }

  for (const cat of CATEGORIES_2569_LEGACY) {
    const created = await prisma.category.upsert({
      where: { code: cat.code },
      update: {
        ...cat,
        isActive: false,
      },
      create: {
        ...cat,
        isActive: false,
      },
    });
    categoryMap.set(cat.code, created);
  }

  // 3. Seed Competition Years, CompetitionYearCategories, and CompetitionYearLevels
  console.log('  -> Seeding Competition Years, Categories & Levels...');
  const yearsData = [
    {
      year: 2570,
      yearAd: 2027,
      titleTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2570',
      titleEn: 'KMUTNB Innovation Awards 2027',
      themeTh: 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน (Innovations for Sustainable Economy & Society)',
      submissionStart: new Date('2026-11-01T00:00:00+07:00'),
      submissionEnd: new Date('2027-02-28T23:59:59+07:00'),
      announcementDate: new Date('2027-05-15T09:00:00+07:00'),
      eventDate: new Date('2027-06-25T08:30:00+07:00'),
      isCurrent: true,
      status: CompetitionStatus.OPEN_FOR_SUBMISSION,
    },
    {
      year: 2569,
      yearAd: 2026,
      titleTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569',
      titleEn: 'KMUTNB Innovation Awards 2026',
      themeTh: 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน (Innovations for Sustainable Economy & Society)',
      submissionStart: new Date('2026-03-01T00:00:00+07:00'),
      submissionEnd: new Date('2026-04-15T23:59:59+07:00'),
      announcementDate: new Date('2026-05-15T09:00:00+07:00'),
      eventDate: new Date('2026-06-26T08:30:00+07:00'),
      isCurrent: false,
      status: CompetitionStatus.COMPLETED,
    },
    {
      year: 2568,
      yearAd: 2025,
      titleTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2568',
      titleEn: 'KMUTNB Innovation Awards 2025',
      eventDate: new Date('2025-06-26T08:30:00Z'),
      isCurrent: false,
      status: CompetitionStatus.COMPLETED,
    },
    {
      year: 2567,
      yearAd: 2024,
      titleTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2567',
      titleEn: 'KMUTNB Innovation Awards 2024',
      eventDate: new Date('2024-06-28T08:30:00Z'),
      isCurrent: false,
      status: CompetitionStatus.COMPLETED,
    },
    {
      year: 2566,
      yearAd: 2023,
      titleTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2566',
      titleEn: 'KMUTNB Innovation Awards 2023',
      eventDate: new Date('2023-06-25T08:30:00Z'),
      isCurrent: false,
      status: CompetitionStatus.COMPLETED,
    },
  ];

  const active2570CategoryIds = CATEGORIES_2570_DEFAULTS.map((c) => categoryMap.get(c.code).id);
  const legacyCategoryIds = CATEGORIES_2569_LEGACY.map((c) => categoryMap.get(c.code).id);
  const active2570LevelIds = LEVELS_2570_DEFAULTS.map((l) => levelMap.get(l.code).id);
  const legacyLevelIds = LEVELS_2569_DEFAULTS.map((l) => levelMap.get(l.code).id);

  const yearMap = new Map<number, any>();
  for (const y of yearsData) {
    const createdYear = await prisma.competitionYear.upsert({
      where: { year: y.year },
      update: y,
      create: y,
    });
    yearMap.set(y.year, createdYear);

    if (y.year === 2570) {
      const prizeSummary2570 =
        'ชิงถ้วยพระราชทานฯ และถ้วยรางวัล มจพ. เงินรางวัลรวม 255,000 บาท พร้อมเกียรติบัตร';

      for (const catSpec of CATEGORIES_2570_DEFAULTS) {
        const cat = categoryMap.get(catSpec.code);
        await prisma.competitionYearCategory.upsert({
          where: {
            competitionYearId_categoryId: {
              competitionYearId: createdYear.id,
              categoryId: cat.id,
            },
          },
          update: {
            customNameTh: null,
            customDescription: null,
            prizeSummary: prizeSummary2570,
            isActive: true,
            orderIndex: catSpec.orderIndex,
          },
          create: {
            competitionYearId: createdYear.id,
            categoryId: cat.id,
            prizeSummary: prizeSummary2570,
            isActive: true,
            orderIndex: catSpec.orderIndex,
          },
        });
      }

      await prisma.competitionYearCategory.updateMany({
        where: {
          competitionYearId: createdYear.id,
          categoryId: { notIn: active2570CategoryIds },
        },
        data: { isActive: false },
      });

      for (const lvlSpec of LEVELS_2570_DEFAULTS) {
        const lvl = levelMap.get(lvlSpec.code);
        await prisma.competitionYearLevel.upsert({
          where: {
            competitionYearId_educationLevelId: {
              competitionYearId: createdYear.id,
              educationLevelId: lvl.id,
            },
          },
          update: {
            customNameTh: lvlSpec.nameTh,
            customNameEn: lvlSpec.nameEn,
            customEligibleTh: lvlSpec.eligibleTh,
            trophyTitleTh: lvlSpec.trophyTitleTh,
            trophyShortTh: lvlSpec.trophyShortTh,
            isRoyalTrophy: lvlSpec.isRoyalTrophy,
            totalPrizeAmount: lvlSpec.totalPrizeAmount,
            prizeBreakdown: lvlSpec.prizeBreakdown as any,
            requiresPrototype: lvlSpec.requiresPrototype,
            prototypeRuleTh: lvlSpec.prototypeRuleTh,
            isActive: true,
            orderIndex: lvlSpec.orderIndex,
          },
          create: {
            competitionYearId: createdYear.id,
            educationLevelId: lvl.id,
            customNameTh: lvlSpec.nameTh,
            customNameEn: lvlSpec.nameEn,
            customEligibleTh: lvlSpec.eligibleTh,
            trophyTitleTh: lvlSpec.trophyTitleTh,
            trophyShortTh: lvlSpec.trophyShortTh,
            isRoyalTrophy: lvlSpec.isRoyalTrophy,
            totalPrizeAmount: lvlSpec.totalPrizeAmount,
            prizeBreakdown: lvlSpec.prizeBreakdown as any,
            requiresPrototype: lvlSpec.requiresPrototype,
            prototypeRuleTh: lvlSpec.prototypeRuleTh,
            isActive: true,
            orderIndex: lvlSpec.orderIndex,
          },
        });
      }

      await prisma.competitionYearLevel.updateMany({
        where: {
          competitionYearId: createdYear.id,
          educationLevelId: { notIn: active2570LevelIds },
        },
        data: { isActive: false },
      });
    } else {
      const prizeSummaryLegacy =
        'ชิงถ้วยพระราชทานฯ (สำหรับรางวัลชนะเลิศ) เงินรางวัลรวม 180,000 บาท และเกียรติบัตร';

      for (const catSpec of CATEGORIES_2569_LEGACY) {
        const cat = categoryMap.get(catSpec.code);
        await prisma.competitionYearCategory.upsert({
          where: {
            competitionYearId_categoryId: {
              competitionYearId: createdYear.id,
              categoryId: cat.id,
            },
          },
          update: {
            prizeSummary: prizeSummaryLegacy,
            isActive: true,
            orderIndex: catSpec.orderIndex,
          },
          create: {
            competitionYearId: createdYear.id,
            categoryId: cat.id,
            prizeSummary: prizeSummaryLegacy,
            isActive: true,
            orderIndex: catSpec.orderIndex,
          },
        });
      }

      await prisma.competitionYearCategory.updateMany({
        where: {
          competitionYearId: createdYear.id,
          categoryId: { notIn: legacyCategoryIds },
        },
        data: { isActive: false },
      });

      for (const lvlSpec of LEVELS_2569_DEFAULTS) {
        const lvl = levelMap.get(lvlSpec.code);
        await prisma.competitionYearLevel.upsert({
          where: {
            competitionYearId_educationLevelId: {
              competitionYearId: createdYear.id,
              educationLevelId: lvl.id,
            },
          },
          update: {
            customNameTh: lvlSpec.nameTh,
            customNameEn: lvlSpec.nameEn,
            customEligibleTh: lvlSpec.eligibleTh,
            trophyTitleTh: lvlSpec.trophyTitleTh,
            trophyShortTh: lvlSpec.trophyShortTh,
            isRoyalTrophy: lvlSpec.isRoyalTrophy,
            totalPrizeAmount: lvlSpec.totalPrizeAmount,
            prizeBreakdown: lvlSpec.prizeBreakdown as any,
            requiresPrototype: lvlSpec.requiresPrototype,
            prototypeRuleTh: lvlSpec.prototypeRuleTh,
            isActive: true,
            orderIndex: lvlSpec.orderIndex,
          },
          create: {
            competitionYearId: createdYear.id,
            educationLevelId: lvl.id,
            customNameTh: lvlSpec.nameTh,
            customNameEn: lvlSpec.nameEn,
            customEligibleTh: lvlSpec.eligibleTh,
            trophyTitleTh: lvlSpec.trophyTitleTh,
            trophyShortTh: lvlSpec.trophyShortTh,
            isRoyalTrophy: lvlSpec.isRoyalTrophy,
            totalPrizeAmount: lvlSpec.totalPrizeAmount,
            prizeBreakdown: lvlSpec.prizeBreakdown as any,
            requiresPrototype: lvlSpec.requiresPrototype,
            prototypeRuleTh: lvlSpec.prototypeRuleTh,
            isActive: true,
            orderIndex: lvlSpec.orderIndex,
          },
        });
      }

      await prisma.competitionYearLevel.updateMany({
        where: {
          competitionYearId: createdYear.id,
          educationLevelId: { notIn: legacyLevelIds },
        },
        data: { isActive: false },
      });
    }
  }

  // 4. Seed Default Users
  console.log('  -> Seeding Users...');
  const adminPasswordHash = await Bun.password.hash('AdminPassword2026!', { algorithm: 'argon2id' });
  const judgePasswordHash = await Bun.password.hash('JudgePassword2026!', { algorithm: 'argon2id' });
  const contestantPasswordHash = await Bun.password.hash('Contestant2026!', { algorithm: 'argon2id' });

  await prisma.user.upsert({
    where: { email: 'admin@kmutnb.ac.th' },
    update: {
      educationLevelId: levelGeneralPublic.id,
    },
    create: {
      email: 'admin@kmutnb.ac.th',
      passwordHash: adminPasswordHash,
      fullName: 'ผู้ดูแลระบบ อุทยานเทคโนโลยี มจพ.',
      phone: '02-555-2000 ต่อ 2999',
      institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      educationLevelId: levelGeneralPublic.id,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'judge@kmutnb.ac.th' },
    update: {
      educationLevelId: levelGeneralPublic.id,
    },
    create: {
      email: 'judge@kmutnb.ac.th',
      passwordHash: judgePasswordHash,
      fullName: 'คณะกรรมการผู้ทรงคุณวุฒิ มจพ.',
      phone: '02-555-2000 ต่อ 2998',
      institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      educationLevelId: levelGeneralPublic.id,
      role: Role.JUDGE,
    },
  });

  const contestantUser = await prisma.user.upsert({
    where: { email: 'contestant@kmutnb.ac.th' },
    update: {
      educationLevelId: levelGeneralPublic.id,
    },
    create: {
      email: 'contestant@kmutnb.ac.th',
      passwordHash: contestantPasswordHash,
      fullName: 'สมชาย นวัตกรรม',
      phone: '081-234-5678',
      institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      educationLevelId: levelGeneralPublic.id,
      role: Role.CONTESTANT,
    },
  });

  // 5. Seed Historical Awarded Submissions (Hall of Fame)
  console.log('  -> Seeding Historical Award Winners (Hall of Fame)...');
  const winnersData = [
    // 2569 (KMUTNB Innovation Awards 2026)
    {
      trackingCode: 'KMUTNB-2569-0001',
      year: 2569,
      categoryCode: 'medical_device',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.GRAND_WINNER,
      awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
      awardNameEn: 'Grand Prize - Royal Trophy',
      awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
      prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมเกียรติบัตร และเงินรางวัล 40,000 บาท',
      titleTh: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก',
      titleEn: '3D-Printed Titanium Coated with Bioactive Hyaluronic Acid Hydrogel for Orthopedic Applications',
      teamName: 'OsseBioMix',
      institution: 'คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'คณะวิทยาศาสตร์ประยุกต์ มจพ.',
      members: ['ทีม OsseBioMix'],
      abstractTh: 'นวัตกรรมวัสดุการแพทย์ขั้นสูง ไทเทเนียมที่ผ่านกระบวนการพิมพ์ 3 มิติร่วมกับการเคลือบไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ ช่วยเร่งการยึดติดของเซลล์กระดูกและลดการอักเสบติดเชื้อสำหรับการผ่าตัดทางศัลยกรรมกระดูก',
      abstractEn: 'Advanced biomedical implant utilizing 3D-printed titanium coated with bioactive hyaluronic acid hydrogel to enhance osseointegration and reduce infection risks.',
      coverImage: '/osbi-poster.jpg',
      image: '/osbi-poster.jpg',
      videoUrl: '/Osbi_ver2.mp4',
      submittedAt: new Date('2026-04-10T10:00:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2569-0002',
      year: 2569,
      categoryCode: 'energy_environment',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.RUNNER_UP_1,
      awardNameTh: 'รางวัลรองชนะเลิศอันดับ 1',
      awardNameEn: '1st Runner-Up',
      awardBadgeText: 'รองชนะเลิศอันดับ 1',
      prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 30,000 บาท',
      titleTh: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion',
      titleEn: 'Automatic HDPE Pipe Butt Fusion Welding Controller and Data Logger',
      teamName: 'เขาชื่ออะไร',
      institution: 'คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'ผศ.ดร.วัฒนา แก้วมณี',
      members: [{ fullName: 'ผศ.ดร.วัฒนา แก้วมณี', role: 'หัวหน้าทีม', idCard: '5-1601-00029-58-2' }],
      primaryCoordName: 'ผศ.ดร.วัฒนา แก้วมณี',
      primaryCoordIdCard: '5-1601-00029-58-2',
      primaryCoordPhone: '064-274-9888',
      primaryCoordEmail: 'wattana.k@fte.kmutnb.ac.th',
      secondaryCoordName: 'ผศ.ดร.วัฒนา แก้วมณี',
      secondaryCoordIdCard: '5-1601-00029-58-2',
      secondaryCoordPhone: '064-274-9888',
      secondaryCoordEmail: 'wattana.kaewmanee@gmail.com',
      abstractTh: 'อุปกรณ์ควบคุมและบันทึกข้อมูลการเชื่อมท่อพอลิเอทิลีนความหนาแน่นสูง (HDPE) แบบหลอมชนอัตโนมัติ เพื่อเพิ่มความแม่นยำ มาตรฐานความปลอดภัย และตรวจสอบย้อนกลับของคุณภาพแนวเชื่อมในงานวิศวกรรมระบบท่อ',
      abstractEn: 'An automated control and logging system for HDPE butt fusion pipe welding to enhance engineering accuracy, safety, and traceability.',
      coverImage: '/hdpe-poster.jpg',
      image: '/hdpe-poster.jpg',
      videoUrl: '/hdpe-welding.mp4',
      submittedAt: new Date('2026-04-12T09:15:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2569-0003',
      year: 2569,
      categoryCode: 'food_agriculture',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.RUNNER_UP_2,
      awardNameTh: 'รางวัลรองชนะเลิศอันดับ 2',
      awardNameEn: '2nd Runner-Up',
      awardBadgeText: 'รองชนะเลิศอันดับ 2',
      prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 20,000 บาท',
      titleTh: 'Growell: สารจับใบชีวภาพเพื่อเพิ่มประสิทธิภาพการใช้สารทางเกษตร',
      titleEn: 'Growell: Bio-Adjuvant for Agricultural Spraying Efficiency Enhancement',
      teamName: 'Lucyne Innovia Lab',
      institution: 'มหาวิทยาลัยเกษตรศาสตร์',
      advisorName: 'มหาวิทยาลัยเกษตรศาสตร์',
      members: ['ทีม Lucyne Innovia Lab'],
      abstractTh: 'นวัตกรรมสารเสริมประสิทธิภาพการฉีดพ่นทางการเกษตร (Bio-adjuvant) จากสารสกัดชีวภาพ ช่วยเพิ่มการกระจายตัว ยึดเกาะ และการดูดซึมสารอาหารบนใบพืช ลดการชะล้างและเป็นมิตรต่อสิ่งแวดล้อม',
      abstractEn: 'Bio-based agricultural spraying adjuvant formulated to enhance droplet spreading, retention, and nutrient absorption on plant foliage while reducing chemical runoff.',
      coverImage: '/growell-poster.jpg',
      image: '/growell-poster.jpg',
      videoUrl: '/Growell.mp4',
      submittedAt: new Date('2026-04-14T11:00:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2569-0004',
      year: 2569,
      categoryCode: 'social_economy',
      levelCode: 'below_higher',
      awardTier: AwardTier.HONORABLE_MENTION,
      awardNameTh: 'รางวัลชมเชย',
      awardNameEn: 'Honorable Mention',
      awardBadgeText: 'รางวัลชมเชย',
      prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 5,000 บาท',
      titleTh: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ความเสียหายและประมาณการค่าซ่อมถนนคอนกรีต',
      titleEn: 'Vehicle-Mounted AI Vision System and Web Application for Concrete Road Damage Detection and Repair Cost Estimation',
      teamName: 'ROAD AI',
      institution: 'โรงเรียนวารีเชียงใหม่',
      advisorName: 'โรงเรียนวารีเชียงใหม่',
      members: ['ทีม ROAD AI'],
      abstractTh: 'ระบบตรวจจับและประเมินสภาพความเสียหายของพื้นผิวถนนคอนกรีตแบบอัตโนมัติด้วยกล้องติดยานพาหนะร่วมกับโมเดล Deep Learning พร้อมเว็บแอปพลิเคชันประมาณการงบประมาณค่าซ่อมบำรุงแบบเรียลไทม์',
      abstractEn: 'Vehicle-mounted computer vision system integrated with deep learning models and a web platform for automated road crack detection and real-time maintenance cost budgeting.',
      coverImage: '/road-ai-poster.jpg',
      image: '/road-ai-poster.jpg',
      videoUrl: '/road-ai.mp4',
      submittedAt: new Date('2026-04-15T08:30:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2569-0005',
      year: 2569,
      categoryCode: 'material',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.HONORABLE_MENTION,
      awardNameTh: 'รางวัลชมเชย',
      awardNameEn: 'Honorable Mention',
      awardBadgeText: 'รางวัลชมเชย',
      prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 5,000 บาท',
      titleTh: 'แผ่นรองหลังแนวเชื่อมจีโอโพลิเมอร์ทนความร้อนสูงจากวัสดุเหลือทิ้งอุตสาหกรรม',
      titleEn: 'High-Temperature Resistant Geopolymer Backing Ceramic for Welding from Industrial By-products',
      teamName: 'GeoWeld',
      institution: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มจพ.',
      members: ['ทีม GeoWeld'],
      abstractTh: 'นวัตกรรมแผ่นรองหลังแนวเชื่อมทนความร้อนสูงที่พัฒนาจากเถ้าลอยและกากของเสียอุตสาหกรรมด้วยกระบวนการจีโอโพลิเมอร์ ช่วยลดต้นทุนการนำเข้าวัสดุทนไฟจากต่างประเทศ และส่งเสริมเศรษฐกิจหมุนเวียน (Circular Economy)',
      abstractEn: 'Eco-friendly high-temperature resistant welding backing material developed from industrial fly ash via geopolymerization to substitute imported ceramic backings.',
      coverImage: '/geoweld-poster.jpg',
      image: '/geoweld-poster.jpg',
      videoUrl: '/geoweld.mp4',
      submittedAt: new Date('2026-04-15T10:20:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2569-0006',
      year: 2569,
      categoryCode: 'medical_device',
      levelCode: 'below_higher',
      awardTier: AwardTier.HONORABLE_MENTION,
      awardNameTh: 'รางวัลชมเชย',
      awardNameEn: 'Honorable Mention',
      awardBadgeText: 'รางวัลชมเชย',
      prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 5,000 บาท',
      titleTh: 'ระบบการตรวจคัดกรองโรคมะเร็งตับผ่านการวิเคราะห์สารประกอบอินทรีย์ระเหยง่ายในลมหายใจด้วยระบบปัญญาประดิษฐ์',
      titleEn: 'AI-Powered Non-Invasive Liver Cancer Screening System via Breath Volatile Organic Compounds (VOCs) Analysis',
      teamName: 'CLARA',
      institution: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
      advisorName: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
      members: ['ทีม CLARA'],
      abstractTh: 'เครื่องตรวจคัดกรองความเสี่ยงโรคมะเร็งตับเบื้องต้นแบบไม่เจ็บตัว (Non-invasive) โดยการตรวจจับและวิเคราะห์รูปแบบของสารประกอบอินทรีย์ระเหยง่าย (VOCs) ในลมหายใจด้วยเซนเซอร์และอัลกอริทึม AI ที่แม่นยำสูง',
      abstractEn: 'Non-invasive breathalyzer screening device for early-stage liver cancer detection utilizing metal-oxide gas sensor array and machine learning VOC pattern recognition.',
      coverImage: '/clara-poster.jpg',
      image: '/clara-poster.jpg',
      videoUrl: '/clara.mp4',
      submittedAt: new Date('2026-04-15T14:45:00Z'),
    },
  ];

  // Remove obsolete tracking codes (2568 migrated to 2569, plus removed 2566/2567 sample entries)
  await prisma.submission.deleteMany({
    where: {
      trackingCode: {
        in: [
          'KMUTNB-2568-0001',
          'KMUTNB-2568-0002',
          'KMUTNB-2568-0003',
          'KMUTNB-2568-0004',
          'KMUTNB-2568-0005',
          'KMUTNB-2568-0006',
          'KMUTNB-2567-0001',
          'KMUTNB-2566-0001',
        ],
      },
    },
  });

  for (const win of winnersData) {
    const compYear = yearMap.get(win.year);
    const cat = categoryMap.get(win.categoryCode);
    const level = levelMap.get(win.levelCode)!;

    const yearCat = await prisma.competitionYearCategory.findUnique({
      where: {
        competitionYearId_categoryId: {
          competitionYearId: compYear.id,
          categoryId: cat.id,
        },
      },
    });

    const yearLevel = await prisma.competitionYearLevel.findUnique({
      where: {
        competitionYearId_educationLevelId: {
          competitionYearId: compYear.id,
          educationLevelId: level.id,
        },
      },
    });

    const existingSub = await prisma.submission.findUnique({
      where: { trackingCode: win.trackingCode },
    });

    const winAny = win as any;
    const commonDossierData = {
      competitionYearId: compYear.id,
      categoryId: cat.id,
      competitionYearCategoryId: yearCat?.id,
      educationLevelId: level.id,
      competitionYearLevelId: yearLevel?.id,
      affiliation: win.institution,
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      documentUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      posterUrl: win.coverImage,
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf',
      primaryCoordName: winAny.primaryCoordName || win.advisorName || win.teamName,
      primaryCoordIdCard: winAny.primaryCoordIdCard || '1-1001-00001-01-1',
      primaryCoordPhone: winAny.primaryCoordPhone || '02-555-2000',
      primaryCoordEmail: winAny.primaryCoordEmail || 'contact@kmutnb.ac.th',
      secondaryCoordName: winAny.secondaryCoordName || '',
      secondaryCoordIdCard: winAny.secondaryCoordIdCard || '',
      secondaryCoordPhone: winAny.secondaryCoordPhone || '',
      secondaryCoordEmail: winAny.secondaryCoordEmail || '',
      round1Status: RoundStatus.PASSED,
      round2Status: RoundStatus.PASSED,
      round3Status: RoundStatus.PASSED,
      round3Result: win.awardNameTh,
    };

    if (!existingSub) {
      const sub = await prisma.submission.create({
        data: {
          trackingCode: win.trackingCode,
          userId: contestantUser.id,
          titleTh: win.titleTh,
          titleEn: win.titleEn,
          teamName: win.teamName,
          institution: win.institution,
          advisorName: win.advisorName,
          abstractTh: win.abstractTh,
          abstractEn: win.abstractEn,
          status: SubmissionStatus.AWARDED,
          awardTier: win.awardTier,
          awardNameTh: win.awardNameTh,
          awardNameEn: win.awardNameEn,
          awardBadgeText: win.awardBadgeText,
          prizeDetails: win.prizeDetails,
          coverImage: win.coverImage,
          image: win.image,
          videoUrl: win.videoUrl,
          submittedAt: win.submittedAt,
          ...commonDossierData,
        },
      });

      for (let i = 0; i < win.members.length; i++) {
        const m = win.members[i] as any;
        await prisma.teamMember.create({
          data: {
            submissionId: sub.id,
            fullName: typeof m === 'string' ? m : m.fullName,
            role: typeof m === 'string' ? (i === 0 ? 'หัวหน้าทีม' : 'สมาชิก') : (m.role || 'หัวหน้าทีม'),
            idCard: typeof m === 'string' ? '' : (m.idCard || ''),
            orderIndex: i + 1,
          },
        });
      }
    } else {
      await prisma.submission.update({
        where: { id: existingSub.id },
        data: {
          awardTier: win.awardTier,
          awardNameTh: win.awardNameTh,
          awardNameEn: win.awardNameEn,
          awardBadgeText: win.awardBadgeText,
          prizeDetails: win.prizeDetails,
          coverImage: win.coverImage,
          image: win.image,
          videoUrl: win.videoUrl,
          advisorName: win.advisorName,
          ...commonDossierData,
        },
      });

      await prisma.teamMember.deleteMany({ where: { submissionId: existingSub.id } });
      for (let i = 0; i < win.members.length; i++) {
        const m = win.members[i] as any;
        await prisma.teamMember.create({
          data: {
            submissionId: existingSub.id,
            fullName: typeof m === 'string' ? m : m.fullName,
            role: typeof m === 'string' ? (i === 0 ? 'หัวหน้าทีม' : 'สมาชิก') : (m.role || 'หัวหน้าทีม'),
            idCard: typeof m === 'string' ? '' : (m.idCard || ''),
            orderIndex: i + 1,
          },
        });
      }
    }
  }

  // 6. Seed Announcements
  console.log('  -> Seeding Announcements...');
  const year2570 = yearMap.get(2570);
  const year2569 = yearMap.get(2569);

  await prisma.announcementRoster.deleteMany({});
  await prisma.announcement.deleteMany({});

  await prisma.announcement.create({
    data: {
      competitionYearId: year2570.id,
      type: AnnouncementType.GENERAL,
      badgeText: 'ข่าวสารโครงการ',
      badgeClass: 'announcement-badge-general',
      dateStr: '1 พฤศจิกายน 2569',
      title: 'เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2027 (ประจำปี 2570) ชิงถ้วยพระราชทานฯ และถ้วยรางวัล มจพ.',
      abstract:
        'ขอเชิญชวนนักเรียน นิสิต นักศึกษา นักวิจัย ผู้ประกอบการ และประชาชนทั่วไป ส่งผลงานสิ่งประดิษฐ์และนวัตกรรมที่มีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำ เข้าร่วมประกวดใน 3 ประเภทการแข่งขัน ครอบคลุม 5 หมวดหมู่ ชิงถ้วยพระราชทานฯ ถ้วยรางวัล มจพ. และเงินรางวัลรวม 255,000 บาท เปิดรับสมัครตั้งแต่บัดนี้ – 28 ก.พ. 2570',
      pdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      isPublished: true,
      publishedAt: new Date('2026-11-01T09:00:00+07:00'),
    },
  });

  await prisma.announcement.create({
    data: {
      competitionYearId: year2570.id,
      type: AnnouncementType.FINALISTS,
      badgeText: 'ประกาศผลรอบคัดเลือก',
      badgeClass: 'announcement-badge-finalists',
      dateStr: 'มีนาคม 2570 (ตัวอย่างการแสดงผล)',
      title: 'ประกาศรายชื่อผลงานที่ผ่านรอบคัดเลือก 60 ทีม เข้าสู่รอบจัดส่งโปสเตอร์',
      abstract: 'คณะกรรมการผู้ทรงคุณวุฒิได้ดำเนินการประเมินข้อเสนอโครงการและคลิปวิดีโอเรียบร้อยแล้ว ขอแสดงความยินดีกับทั้ง 60 ทีมที่ผ่านรอบคัดเลือก และขอให้จัดทำโปสเตอร์ (Poster) ส่งภายในเดือนเมษายน 2570',
      pdfUrl: '#',
      isPublished: false,
      publishedAt: new Date('2027-03-25T09:00:00+07:00'),
      roster: {
        create: [
          {
            code: 'KMUTNB-2570-5502',
            title: 'ระบบตรวจวัดการเจริญเติบโตพืชไฮโดรโปนิกส์ด้วย IoT',
            team: 'AgriSmart High Team',
            level: 'ต่ำกว่าอุดมศึกษา',
            orderIndex: 1,
          },
        ],
      },
    },
  });

  await prisma.announcement.create({
    data: {
      competitionYearId: year2569.id,
      type: AnnouncementType.WINNERS,
      badgeText: 'ประกาศผลรางวัลชนะเลิศ',
      badgeClass: 'announcement-badge-winners',
      dateStr: 'มิถุนายน 2569',
      title: 'ประกาศผลการตัดสินรางวัลชนะเลิศ KMUTNB Innovation Awards 2026 (ประจำปี 2569) ครองถ้วยพระราชทานฯ',
      abstract: 'สรุปรายชื่อผลงานที่ได้รับรางวัลชนะเลิศ ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี และรางวัลเกียรติยศตามระดับการแข่งขัน ประจำปี 2569 (KMUTNB Innovation Awards 2026)',
      pdfUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf',
      isPublished: true,
      publishedAt: new Date('2026-06-26T09:00:00+07:00'),
      roster: {
        create: [
          {
            code: 'KMUTNB-2569-0001',
            title: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก',
            team: 'OsseBioMix',
            level: 'รางวัลชนะเลิศ • อุดมศึกษาและบุคคลทั่วไป',
            orderIndex: 1,
          },
          {
            code: 'KMUTNB-2569-0002',
            title: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion',
            team: 'เขาชื่ออะไร',
            level: 'รองชนะเลิศอันดับ 1 • อุดมศึกษาและบุคคลทั่วไป',
            orderIndex: 2,
          },
          {
            code: 'KMUTNB-2569-0003',
            title: 'Growell: สารจับใบชีวภาพเพื่อเพิ่มประสิทธิภาพการใช้สารทางเกษตร',
            team: 'Lucyne Innovia Lab',
            level: 'รองชนะเลิศอันดับ 2 • อุดมศึกษาและบุคคลทั่วไป',
            orderIndex: 3,
          },
          {
            code: 'KMUTNB-2569-0004',
            title: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ความเสียหายและประมาณการค่าซ่อมถนนคอนกรีต',
            team: 'ROAD AI',
            level: 'รางวัลชมเชย • ต่ำกว่าอุดมศึกษา',
            orderIndex: 4,
          },
          {
            code: 'KMUTNB-2569-0005',
            title: 'แผ่นรองหลังแนวเชื่อมจีโอโพลิเมอร์ทนความร้อนสูงจากวัสดุเหลือทิ้งอุตสาหกรรม',
            team: 'GeoWeld',
            level: 'รางวัลชมเชย • อุดมศึกษาและบุคคลทั่วไป',
            orderIndex: 5,
          },
          {
            code: 'KMUTNB-2569-0006',
            title: 'ระบบการตรวจคัดกรองโรคมะเร็งตับผ่านการวิเคราะห์สารประกอบอินทรีย์ระเหยง่ายในลมหายใจด้วยระบบปัญญาประดิษฐ์',
            team: 'CLARA',
            level: 'รางวัลชมเชย • ต่ำกว่าอุดมศึกษา',
            orderIndex: 6,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
