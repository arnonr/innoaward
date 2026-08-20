import { PrismaClient, Role, SubmissionStatus, AwardTier, CompetitionStatus, AnnouncementType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Education Levels
  console.log('  -> Seeding Education Levels...');
  const levelBelow = await prisma.educationLevel.upsert({
    where: { code: 'below_higher' },
    update: {},
    create: {
      code: 'below_higher',
      nameTh: 'ระดับต่ำกว่าอุดมศึกษา',
      nameEn: 'Below Higher Education',
      eligibleTh: 'นักเรียนระดับมัธยมศึกษา, ปวช., ปวส. หรือเทียบเท่า',
      eligibleEn: 'High school and vocational students (Voc. Cert. / High Voc. Cert. or equivalent)',
      orderIndex: 1,
      isActive: true,
    },
  });

  const levelHigher = await prisma.educationLevel.upsert({
    where: { code: 'higher_and_above' },
    update: {},
    create: {
      code: 'higher_and_above',
      nameTh: 'ระดับตั้งแต่อุดมศึกษาขึ้นไป',
      nameEn: 'Higher Education & Above',
      eligibleTh: 'นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, ผู้ประกอบการ และประชาชนทั่วไป',
      eligibleEn: 'Undergraduate, graduate students, researchers, startups, and general public',
      orderIndex: 2,
      isActive: true,
    },
  });

  // 2. Seed Categories (Master Catalog)
  console.log('  -> Seeding Categories...');
  const categoriesData = [
    {
      code: 'energy_environment',
      nameTh: 'Energy & Environment (พลังงานและสิ่งแวดล้อม)',
      nameEn: 'Energy & Environment',
      descriptionTh: 'นวัตกรรมด้านพลังงานทดแทน การจัดการสิ่งแวดล้อม เทคโนโลยีสีเขียว และการลดการปล่อยคาร์บอน',
      descriptionEn: 'Renewable energy, environmental management, green technology, and carbon reduction innovations.',
      icon: 'Zap',
      color: '#059669',
      bgImage: '/domain-energy.jpg',
      orderIndex: 1,
    },
    {
      code: 'food_agriculture',
      nameTh: 'Food & Agriculture (เกษตรและอาหารแปรรูป)',
      nameEn: 'Food & Agriculture',
      descriptionTh: 'นวัตกรรมเกษตรอัจฉริยะ (AgriTech) อาหารแห่งอนาคต การแปรรูปผลิตผล และความมั่นคงทางอาหาร',
      descriptionEn: 'Smart agricultural technology (AgriTech), future food, food processing, and food security.',
      icon: 'Leaf',
      color: '#16A34A',
      bgImage: '/domain-food.jpg',
      orderIndex: 2,
    },
    {
      code: 'social_economy',
      nameTh: 'Social & Economy (เศรษฐกิจและสังคมดิจิทัล)',
      nameEn: 'Social & Economy',
      descriptionTh: 'นวัตกรรมเพื่อการพัฒนาสังคม เศรษฐกิจดิจิทัล เทคโนโลยีการศึกษา และการยกระดับคุณภาพชีวิตชุมชน',
      descriptionEn: 'Digital economy, educational technology, social development, and community quality of life enhancement.',
      icon: 'Users',
      color: '#06B6D4',
      bgImage: '/domain-social.jpg',
      orderIndex: 3,
    },
    {
      code: 'medical_device',
      nameTh: 'Medical Device (เครื่องมือแพทย์และสาธารณสุข)',
      nameEn: 'Medical Device',
      descriptionTh: 'อุปกรณ์และเครื่องมือทางการแพทย์ เทคโนโลยีสุขภาพ (HealthTech) ชีวการแพทย์ และอุปกรณ์ช่วยดูแลสุขภาพ',
      descriptionEn: 'Medical devices, healthcare technology (HealthTech), biomedical engineering, and assistive health tools.',
      icon: 'Activity',
      color: '#E11D48',
      bgImage: '/domain-medical.jpg',
      orderIndex: 4,
    },
    {
      code: 'material',
      nameTh: 'Material (วัสดุศาสตร์และเทคโนโลยีก้าวหน้า)',
      nameEn: 'Material',
      descriptionTh: 'นวัตกรรมด้านวัสดุศาสตร์ คอมโพสิต โพลีเมอร์ สารเคลือบผิว นาโนเทคโนโลยี และวัสดุก้าวหน้า',
      descriptionEn: 'Materials science, composites, polymers, functional coatings, nanotechnology, and advanced materials.',
      icon: 'Box',
      color: '#D97706',
      bgImage: '/domain-material.jpg',
      orderIndex: 5,
    },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { code: cat.code },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.code, created);
  }

  // 3. Seed Competition Years
  console.log('  -> Seeding Competition Years...');
  const yearsData = [
    {
      year: 2569,
      yearAd: 2026,
      titleTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569',
      titleEn: 'KMUTNB Innovation Awards 2026',
      themeTh: 'นวัตกรรมขับเคลื่อนเศรษฐกิจและสังคมที่ยั่งยืน (Innovations for Sustainable Economy & Society)',
      submissionStart: new Date('2026-09-01T00:00:00Z'),
      submissionEnd: new Date('2026-11-15T23:59:59Z'),
      announcementDate: new Date('2026-12-10T09:00:00Z'),
      eventDate: new Date('2027-01-26T08:30:00Z'),
      isCurrent: true,
      status: CompetitionStatus.OPEN_FOR_SUBMISSION,
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

  const yearMap = new Map<number, any>();
  for (const y of yearsData) {
    const createdYear = await prisma.competitionYear.upsert({
      where: { year: y.year },
      update: y,
      create: y,
    });
    yearMap.set(y.year, createdYear);

    // Bind 5 categories to each competition year
    for (const [code, cat] of categoryMap.entries()) {
      await prisma.competitionYearCategory.upsert({
        where: {
          competitionYearId_categoryId: {
            competitionYearId: createdYear.id,
            categoryId: cat.id,
          },
        },
        update: {},
        create: {
          competitionYearId: createdYear.id,
          categoryId: cat.id,
          prizeSummary: 'เงินรางวัลชนะเลิศแต่ละหมวด 20,000 - 50,000 บาท พร้อมโล่รางวัลและเกียรติบัตร',
          isActive: true,
          orderIndex: cat.orderIndex,
        },
      });
    }
  }

  // 4. Seed Default Users
  console.log('  -> Seeding Users...');
  const adminPasswordHash = await Bun.password.hash('AdminPassword2026!', { algorithm: 'argon2id' });
  const judgePasswordHash = await Bun.password.hash('JudgePassword2026!', { algorithm: 'argon2id' });
  const contestantPasswordHash = await Bun.password.hash('Contestant2026!', { algorithm: 'argon2id' });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kmutnb.ac.th' },
    update: {},
    create: {
      email: 'admin@kmutnb.ac.th',
      passwordHash: adminPasswordHash,
      fullName: 'ผู้ดูแลระบบ อุทยานเทคโนโลยี มจพ.',
      phone: '02-555-2000 ต่อ 2999',
      institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      educationLevelId: levelHigher.id,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'judge@kmutnb.ac.th' },
    update: {},
    create: {
      email: 'judge@kmutnb.ac.th',
      passwordHash: judgePasswordHash,
      fullName: 'คณะกรรมการผู้ทรงคุณวุฒิ มจพ.',
      phone: '02-555-2000 ต่อ 2998',
      institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      educationLevelId: levelHigher.id,
      role: Role.JUDGE,
    },
  });

  const contestantUser = await prisma.user.upsert({
    where: { email: 'contestant@kmutnb.ac.th' },
    update: {},
    create: {
      email: 'contestant@kmutnb.ac.th',
      passwordHash: contestantPasswordHash,
      fullName: 'สมชาย นวัตกรรม',
      phone: '081-234-5678',
      institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      educationLevelId: levelHigher.id,
      role: Role.CONTESTANT,
    },
  });

  // 5. Seed Historical Awarded Submissions (Hall of Fame)
  console.log('  -> Seeding Historical Award Winners (Hall of Fame)...');
  const winnersData = [
    // 2568
    {
      trackingCode: 'KMUTNB-2568-0001',
      year: 2568,
      categoryCode: 'medical_device',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.GRAND_WINNER,
      awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
      awardNameEn: 'Grand Prize - Royal Trophy',
      awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
      prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมโล่รางวัล เกียรติบัตร และเงินรางวัล 40,000 บาท',
      titleTh: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก',
      titleEn: '3D-Printed Titanium Coated with Bioactive Hyaluronic Acid Hydrogel for Orthopedic Applications',
      teamName: 'OsseBioMix',
      institution: 'คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'คณะวิทยาศาสตร์ประยุกต์ มจพ.',
      members: ['ทีม OsseBioMix'],
      abstractTh: 'นวัตกรรมวัสดุการแพทย์ขั้นสูง ไทเทเนียมที่ผ่านกระบวนการพิมพ์ 3 มิติร่วมกับการเคลือบไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ ช่วยเร่งการยึดติดของเซลล์กระดูกและลดการอักเสบติดเชื้อสำหรับการผ่าตัดทางศัลยกรรมกระดูก',
      abstractEn: 'Advanced biomedical implant utilizing 3D-printed titanium coated with bioactive hyaluronic acid hydrogel to enhance osseointegration and reduce infection risks.',
      coverImage: '/photo_candidates/science_lab.jpg',
      image: '/photo_candidates/science_lab.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2025-05-10T10:00:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2568-0002',
      year: 2568,
      categoryCode: 'energy_environment',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.RUNNER_UP_1,
      awardNameTh: 'รางวัลรองชนะเลิศอันดับ 1',
      awardNameEn: '1st Runner-Up',
      awardBadgeText: 'รองชนะเลิศอันดับ 1 • ถ้วยคิดเป็น ทำเป็น',
      prizeDetails: 'ได้รับถ้วยรางวัล "คิดเป็น ทำเป็น" พร้อมเกียรติบัตร และเงินรางวัล 30,000 บาท',
      titleTh: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion',
      titleEn: 'Automatic HDPE Pipe Butt Fusion Welding Controller and Data Logger',
      teamName: 'เขาชื่ออะไร',
      institution: 'คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'คณะครุศาสตร์อุตสาหกรรม มจพ.',
      members: ['ทีม เขาชื่ออะไร'],
      abstractTh: 'อุปกรณ์ควบคุมและบันทึกข้อมูลการเชื่อมท่อพอลิเอทิลีนความหนาแน่นสูง (HDPE) แบบหลอมชนอัตโนมัติ เพื่อเพิ่มความแม่นยำ มาตรฐานความปลอดภัย และตรวจสอบย้อนกลับของคุณภาพแนวเชื่อมในงานวิศวกรรมระบบท่อ',
      abstractEn: 'An automated control and logging system for HDPE butt fusion pipe welding to enhance engineering accuracy, safety, and traceability.',
      coverImage: '/photo_candidates/robotics_engineer.jpg',
      image: '/photo_candidates/robotics_engineer.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2025-05-12T09:15:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2568-0003',
      year: 2568,
      categoryCode: 'food_agriculture',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.RUNNER_UP_2,
      awardNameTh: 'รางวัลรองชนะเลิศอันดับ 2',
      awardNameEn: '2nd Runner-Up',
      awardBadgeText: 'รองชนะเลิศอันดับ 2 • ถ้วยคิดเป็น ทำเป็น',
      prizeDetails: 'ได้รับถ้วยรางวัล "คิดเป็น ทำเป็น" พร้อมเกียรติบัตร และเงินรางวัล 20,000 บาท',
      titleTh: 'Growell: สารจับใบชีวภาพเพื่อเพิ่มประสิทธิภาพการใช้สารทางเกษตร',
      titleEn: 'Growell: Bio-Adjuvant for Agricultural Spraying Efficiency Enhancement',
      teamName: 'Lucyne Innovia Lab',
      institution: 'มหาวิทยาลัยเกษตรศาสตร์',
      advisorName: 'มหาวิทยาลัยเกษตรศาสตร์',
      members: ['ทีม Lucyne Innovia Lab'],
      abstractTh: 'นวัตกรรมสารเสริมประสิทธิภาพการฉีดพ่นทางการเกษตร (Bio-adjuvant) จากสารสกัดชีวภาพ ช่วยเพิ่มการกระจายตัว ยึดเกาะ และการดูดซึมสารอาหารบนใบพืช ลดการชะล้างและเป็นมิตรต่อสิ่งแวดล้อม',
      abstractEn: 'Bio-based agricultural spraying adjuvant formulated to enhance droplet spreading, retention, and nutrient absorption on plant foliage while reducing chemical runoff.',
      coverImage: '/domain-food.jpg',
      image: '/domain-food.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2025-05-14T11:00:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2568-0004',
      year: 2568,
      categoryCode: 'social_economy',
      levelCode: 'below_higher',
      awardTier: AwardTier.HONORABLE_MENTION,
      awardNameTh: 'รางวัลชมเชย',
      awardNameEn: 'Honorable Mention',
      awardBadgeText: 'รางวัลชมเชย',
      prizeDetails: 'ได้รับโล่รางวัล เกียรติบัตร และเงินรางวัล 5,000 บาท',
      titleTh: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ความเสียหายและประมาณการค่าซ่อมถนนคอนกรีต',
      titleEn: 'Vehicle-Mounted AI Vision System and Web Application for Concrete Road Damage Detection and Repair Cost Estimation',
      teamName: 'ROAD AI',
      institution: 'โรงเรียนวารีเชียงใหม่',
      advisorName: 'โรงเรียนวารีเชียงใหม่',
      members: ['ทีม ROAD AI'],
      abstractTh: 'ระบบตรวจจับและประเมินสภาพความเสียหายของพื้นผิวถนนคอนกรีตแบบอัตโนมัติด้วยกล้องติดยานพาหนะร่วมกับโมเดล Deep Learning พร้อมเว็บแอปพลิเคชันประมาณการงบประมาณค่าซ่อมบำรุงแบบเรียลไทม์',
      abstractEn: 'Vehicle-mounted computer vision system integrated with deep learning models and a web platform for automated road crack detection and real-time maintenance cost budgeting.',
      coverImage: '/photo_candidates/young_team_workshop.jpg',
      image: '/photo_candidates/young_team_workshop.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2025-05-15T08:30:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2568-0005',
      year: 2568,
      categoryCode: 'material',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.HONORABLE_MENTION,
      awardNameTh: 'รางวัลชมเชย',
      awardNameEn: 'Honorable Mention',
      awardBadgeText: 'รางวัลชมเชย',
      prizeDetails: 'ได้รับโล่รางวัล เกียรติบัตร และเงินรางวัล 5,000 บาท',
      titleTh: 'แผ่นรองหลังแนวเชื่อมจีโอโพลิเมอร์ทนความร้อนสูงจากวัสดุเหลือทิ้งอุตสาหกรรม',
      titleEn: 'High-Temperature Resistant Geopolymer Backing Ceramic for Welding from Industrial By-products',
      teamName: 'GeoWeld',
      institution: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มจพ.',
      members: ['ทีม GeoWeld'],
      abstractTh: 'นวัตกรรมแผ่นรองหลังแนวเชื่อมทนความร้อนสูงที่พัฒนาจากเถ้าลอยและกากของเสียอุตสาหกรรมด้วยกระบวนการจีโอโพลิเมอร์ ช่วยลดต้นทุนการนำเข้าวัสดุทนไฟจากต่างประเทศ และส่งเสริมเศรษฐกิจหมุนเวียน (Circular Economy)',
      abstractEn: 'Eco-friendly high-temperature resistant welding backing material developed from industrial fly ash via geopolymerization to substitute imported ceramic backings.',
      coverImage: '/domain-material.jpg',
      image: '/domain-material.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2025-05-15T10:20:00Z'),
    },
    {
      trackingCode: 'KMUTNB-2568-0006',
      year: 2568,
      categoryCode: 'medical_device',
      levelCode: 'below_higher',
      awardTier: AwardTier.HONORABLE_MENTION,
      awardNameTh: 'รางวัลชมเชย',
      awardNameEn: 'Honorable Mention',
      awardBadgeText: 'รางวัลชมเชย',
      prizeDetails: 'ได้รับโล่รางวัล เกียรติบัตร และเงินรางวัล 5,000 บาท',
      titleTh: 'ระบบการตรวจคัดกรองโรคมะเร็งตับผ่านการวิเคราะห์สารประกอบอินทรีย์ระเหยง่ายในลมหายใจด้วยระบบปัญญาประดิษฐ์',
      titleEn: 'AI-Powered Non-Invasive Liver Cancer Screening System via Breath Volatile Organic Compounds (VOCs) Analysis',
      teamName: 'CLARA',
      institution: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
      advisorName: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
      members: ['ทีม CLARA'],
      abstractTh: 'เครื่องตรวจคัดกรองความเสี่ยงโรคมะเร็งตับเบื้องต้นแบบไม่เจ็บตัว (Non-invasive) โดยการตรวจจับและวิเคราะห์รูปแบบของสารประกอบอินทรีย์ระเหยง่าย (VOCs) ในลมหายใจด้วยเซนเซอร์และอัลกอริทึม AI ที่แม่นยำสูง',
      abstractEn: 'Non-invasive breathalyzer screening device for early-stage liver cancer detection utilizing metal-oxide gas sensor array and machine learning VOC pattern recognition.',
      coverImage: '/photo_candidates/tech_creators.jpg',
      image: '/photo_candidates/tech_creators.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2025-05-15T14:45:00Z'),
    },
    // 2567
    {
      trackingCode: 'KMUTNB-2567-0001',
      year: 2567,
      categoryCode: 'energy_environment',
      levelCode: 'higher_and_above',
      awardTier: AwardTier.GRAND_WINNER,
      awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
      awardNameEn: 'Grand Prize - Royal Trophy',
      awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
      prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมโล่รางวัล เกียรติบัตร และเงินรางวัล 40,000 บาท',
      titleTh: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI สำหรับพื้นที่ภัยพิบัติขั้นวิกฤต',
      titleEn: 'Autonomous AI-Powered Rescue & Search Robot for Extreme Disaster Zones',
      teamName: 'KMUTNB Robotics Lab',
      institution: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
      advisorName: 'คณะวิศวกรรมศาสตร์ มจพ.',
      members: ['ทีม KMUTNB Robotics Lab'],
      abstractTh: 'หุ่นยนต์กู้ภัยที่สามารถเคลื่อนที่ในพื้นที่ซากปรักหักพัง มีระบบตรวจจับสัญญาณชีพด้วยอินฟราเรดและ AI คอมพิวเตอร์วิสัยทัศน์ พร้อมสร้างแผนที่ 3 มิติแบบเรียลไทม์',
      abstractEn: 'High-mobility rescue robot equipped with infrared vital sign sensors and AI mapping technology for hazardous disaster response.',
      coverImage: '/winner-robot.jpg',
      image: '/winner-robot.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2024-05-10T10:00:00Z'),
    },
    // 2566
    {
      trackingCode: 'KMUTNB-2566-0001',
      year: 2566,
      categoryCode: 'food_agriculture',
      levelCode: 'below_higher',
      awardTier: AwardTier.GRAND_WINNER,
      awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
      awardNameEn: 'Grand Prize - Royal Trophy',
      awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
      prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมโล่รางวัล เกียรติบัตร และเงินรางวัล 40,000 บาท',
      titleTh: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส',
      titleEn: 'Bio-Nanocellulose Enhanced Rice Straw Sustainable Packaging',
      teamName: 'EcoInno High School Team',
      institution: 'โรงเรียนสาธิต มจพ.',
      advisorName: 'อาจารย์ที่ปรึกษา สาธิต มจพ.',
      members: ['ทีม EcoInno'],
      abstractTh: 'แนวคิดการแปรรูปเศษวัสดุเหลือทิ้งทางการเกษตรเป็นบรรจุภัณฑ์ทนความร้อน ทนน้ำ และย่อยสลายได้ในธรรมชาติภายใน 45 วัน เพื่อทดแทนพลาสติก',
      abstractEn: 'Innovative eco-friendly biodegradable packaging synthesized from agricultural rice straw waste.',
      coverImage: '/winner-eco.jpg',
      image: '/winner-eco.jpg',
      videoUrl: 'https://youtube.com',
      submittedAt: new Date('2023-05-12T09:15:00Z'),
    },
  ];

  for (const win of winnersData) {
    const compYear = yearMap.get(win.year);
    const cat = categoryMap.get(win.categoryCode);
    const level = win.levelCode === 'below_higher' ? levelBelow : levelHigher;

    const existingSub = await prisma.submission.findUnique({
      where: { trackingCode: win.trackingCode },
    });

    if (!existingSub) {
      const yearCat = await prisma.competitionYearCategory.findUnique({
        where: {
          competitionYearId_categoryId: {
            competitionYearId: compYear.id,
            categoryId: cat.id,
          },
        },
      });

      const sub = await prisma.submission.create({
        data: {
          trackingCode: win.trackingCode,
          userId: contestantUser.id,
          competitionYearId: compYear.id,
          categoryId: cat.id,
          competitionYearCategoryId: yearCat?.id,
          educationLevelId: level.id,
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
        },
      });

      for (let i = 0; i < win.members.length; i++) {
        await prisma.teamMember.create({
          data: {
            submissionId: sub.id,
            fullName: win.members[i],
            role: i === 0 ? 'หัวหน้าทีม' : 'สมาชิก',
            orderIndex: i + 1,
          },
        });
      }
    }
  }

  // 6. Seed Announcements
  console.log('  -> Seeding Announcements...');
  const year2569 = yearMap.get(2569);
  const year2568 = yearMap.get(2568);

  const ann1 = await prisma.announcement.create({
    data: {
      competitionYearId: year2569.id,
      type: AnnouncementType.GENERAL,
      badgeText: 'ข่าวสารโครงการ',
      badgeClass: 'announcement-badge-general',
      dateStr: '1 กันยายน 2569',
      title: 'เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2026 ชิงถ้วยพระราชทานฯ',
      abstract: 'ขอเชิญชวนนักเรียน นักศึกษา นักวิจัย และประชาชนทั่วไป ส่งผลงานสิ่งประดิษฐ์และนวัตกรรมเข้าร่วมประกวด 5 สาขาเป้าหมาย ชิงเงินรางวัลรวมกว่า 300,000 บาท หมดเขต 15 พ.ย. 2569',
      pdfUrl: '#',
      isPublished: true,
    },
  });

  const ann2 = await prisma.announcement.create({
    data: {
      competitionYearId: year2569.id,
      type: AnnouncementType.FINALISTS,
      badgeText: 'ประกาศผลรอบคัดเลือก',
      badgeClass: 'announcement-badge-finalists',
      dateStr: '10 ธันวาคม 2569 (ตัวอย่างการแสดงผล)',
      title: 'ประกาศรายชื่อผลงานที่ผ่านการคัดเลือกรอบแรก (Finalists) เข้าสู่รอบ Pitching',
      abstract: 'คณะกรรมการผู้ทรงคุณวุฒิได้ดำเนินการประเมินข้อเสนอโครงการและคลิปวิดีโอเรียบร้อยแล้ว ขอแสดงความยินดีกับทีมที่ผ่านการคัดเลือกเข้าสู่รอบสุดท้าย ณ อาคารอุทยานเทคโนโลยี มจพ.',
      pdfUrl: '#',
      isPublished: true,
      roster: {
        create: [
          {
            code: 'KMUTNB-2026-8821',
            title: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI',
            team: 'KMUTNB Robotics Lab',
            level: 'ตั้งแต่อุดมศึกษาขึ้นไป',
            orderIndex: 1,
          },
          {
            code: 'KMUTNB-2026-4109',
            title: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส',
            team: 'EcoInno Team',
            level: 'ต่ำกว่าอุดมศึกษา',
            orderIndex: 2,
          },
          {
            code: 'KMUTNB-2026-5502',
            title: 'ระบบตรวจวัดการเจริญเติบโตพืชไฮโดรโปนิกส์ด้วย IoT',
            team: 'AgriSmart High Team',
            level: 'ต่ำกว่าอุดมศึกษา',
            orderIndex: 3,
          },
        ],
      },
    },
  });

  const ann3 = await prisma.announcement.create({
    data: {
      competitionYearId: year2568.id,
      type: AnnouncementType.WINNERS,
      badgeText: 'ประกาศผลรางวัลชนะเลิศ',
      badgeClass: 'announcement-badge-winners',
      dateStr: '26 มกราคม 2568',
      title: 'ประกาศผลการตัดสินรางวัลชนะเลิศ KMUTNB Innovation Awards 2568 ครองถ้วยพระราชทานฯ',
      abstract: 'สรุปรายชื่อผลงานที่ได้รับรางวัลชนะเลิศ Grand Prize ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี และรางวัลตามระดับการศึกษา ประจำปี 2568',
      pdfUrl: '#',
      isPublished: true,
      roster: {
        create: [
          {
            code: 'KMUTNB-2568-0001',
            title: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ',
            team: 'OsseBioMix',
            level: 'Grand Prize ชนะเลิศอุดมศึกษา',
            orderIndex: 1,
          },
          {
            code: 'KMUTNB-2568-0004',
            title: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ถนน',
            team: 'ROAD AI',
            level: 'ชมเชยระดับต่ำกว่าอุดมศึกษา',
            orderIndex: 2,
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
