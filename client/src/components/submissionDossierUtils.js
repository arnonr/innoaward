export const CATEGORY_LABELS_TH = {
  // 2570 Official 5 Innovation Domains
  agri_food: 'ด้านการเกษตรและอุตสาหกรรมอาหาร',
  health_medtech: 'ด้านการสาธารณสุข สุขภาพ และเทคโนโลยีทางการแพทย์',
  engineering_ai: 'ด้านวิศวกรรมศาสตร์ เทคโนโลยีปัญญาประดิษฐ์และอุปกรณ์อัจฉริยะ',
  energy_env_material_bcg: 'ด้านพลังงาน สิ่งแวดล้อม เทคโนโลยีวัสดุ และ BCG Economy Model',
  quality_of_life_soft_power: 'ด้านคุณภาพชีวิต และ Soft Power',
  // 2569 Historical Categories (Archive Compatibility)
  energy_environment: 'Energy & Environment (พลังงานและสิ่งแวดล้อม)',
  food_agriculture: 'Food & Agriculture (เกษตรและอาหารแปรรูป)',
  social_economy: 'Social & Economy (เศรษฐกิจและสังคมดิจิทัล)',
  medical_device: 'Medical Device (เครื่องมือแพทย์และสาธารณสุข)',
  material: 'Material (วัสดุศาสตร์และเทคโนโลยีก้าวหน้า)',
  others: 'อื่นๆ (Others) — สิ่งประดิษฐ์และนวัตกรรมทั่วไป'
};

export const LEVEL_LABELS_TH = {
  general_public: 'บุคคลทั่วไป',
  higher_education: 'อุดมศึกษา',
  below_higher: 'ต่ำกว่าอุดมศึกษา (มัธยมศึกษา/อาชีวศึกษา)',
  higher_and_above: 'ระดับอุดมศึกษาและบุคคลทั่วไป'
};

const PROTOTYPE_RULE_TH_2570 =
  'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)';
const ROYAL_TROPHY_TITLE_TH_2570 =
  'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี';
const ROYAL_TROPHY_SHORT_TH_2570 = 'ถ้วยพระราชทานฯ';
const KMUTNB_TROPHY_TITLE_TH_2570 = 'ถ้วยรางวัล มจพ.';
export const KMUTNB_TROPHY_SHORT_TH_2570 = 'ถ้วยรางวัล มจพ.';

function buildStandardPrizeBreakdown(amounts, championTrophyShortTh) {
  const [grand, runnerUp1, runnerUp2, honorableEach] = amounts;
  return [
    {
      tier: 'GRAND_WINNER',
      labelTh: 'ชนะเลิศ',
      count: 1,
      amountEach: grand,
      totalAmount: grand,
      honorTextTh: `${championTrophyShortTh} + เกียรติบัตร`
    },
    {
      tier: 'RUNNER_UP_1',
      labelTh: 'รองชนะเลิศอันดับ 1',
      count: 1,
      amountEach: runnerUp1,
      totalAmount: runnerUp1,
      honorTextTh: 'เกียรติบัตร'
    },
    {
      tier: 'RUNNER_UP_2',
      labelTh: 'รองชนะเลิศอันดับ 2',
      count: 1,
      amountEach: runnerUp2,
      totalAmount: runnerUp2,
      honorTextTh: 'เกียรติบัตร'
    },
    {
      tier: 'HONORABLE_MENTION',
      labelTh: 'ชมเชย',
      count: 3,
      amountEach: honorableEach,
      totalAmount: honorableEach * 3,
      honorTextTh: 'เกียรติบัตร'
    }
  ];
}

export const DEFAULT_COMPETITION_LEVELS_2570 = [
  {
    id: 'general_public',
    code: 'general_public',
    educationLevelId: 'general_public',
    nameTh: 'บุคคลทั่วไป',
    nameEn: 'General Public',
    eligible:
      'อาจารย์, นักวิจัย, ผู้ประกอบการ, วิสาหกิจเริ่มต้น (Startup) และประชาชนทั่วไป (ส่งเดี่ยวหรือทีม 3–5 คน)',
    trophyTitleTh: ROYAL_TROPHY_TITLE_TH_2570,
    trophyShortTh: ROYAL_TROPHY_SHORT_TH_2570,
    isRoyalTrophy: true,
    totalPrizeAmount: 105000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH_2570,
    prizeBreakdown: buildStandardPrizeBreakdown([40000, 30000, 20000, 5000], ROYAL_TROPHY_SHORT_TH_2570)
  },
  {
    id: 'higher_education',
    code: 'higher_education',
    educationLevelId: 'higher_education',
    nameTh: 'อุดมศึกษา',
    nameEn: 'Higher Education',
    eligible:
      'นิสิต นักศึกษาระดับปริญญาตรี ปริญญาโท และปริญญาเอก ทุกสถาบัน (ส่งเดี่ยวหรือทีม 3–5 คน)',
    trophyTitleTh: KMUTNB_TROPHY_TITLE_TH_2570,
    trophyShortTh: KMUTNB_TROPHY_SHORT_TH_2570,
    isRoyalTrophy: false,
    totalPrizeAmount: 75000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH_2570,
    prizeBreakdown: buildStandardPrizeBreakdown([30000, 20000, 10000, 5000], KMUTNB_TROPHY_SHORT_TH_2570)
  },
  {
    id: 'below_higher',
    code: 'below_higher',
    educationLevelId: 'below_higher',
    nameTh: 'ต่ำกว่าอุดมศึกษา (มัธยมศึกษา/อาชีวศึกษา)',
    nameEn: 'Below Higher Education (Secondary / Vocational)',
    eligible:
      'นักเรียนระดับมัธยมศึกษา และนักเรียน/นักศึกษาสายอาชีวศึกษา (ปวช. / ปวส. หรือเทียบเท่า) ต้องมีอาจารย์ที่ปรึกษารับรองอย่างน้อย 1 ท่าน',
    trophyTitleTh: KMUTNB_TROPHY_TITLE_TH_2570,
    trophyShortTh: KMUTNB_TROPHY_SHORT_TH_2570,
    isRoyalTrophy: false,
    totalPrizeAmount: 75000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH_2570,
    prizeBreakdown: buildStandardPrizeBreakdown([30000, 20000, 10000, 5000], KMUTNB_TROPHY_SHORT_TH_2570)
  }
];

const FALLBACK_DOSSIERS = {
  'KMUTNB-2569-0001': {
    trackingCode: 'KMUTNB-2569-0001',
    submittedAt: '10 เมษายน 2569',
    teamName: 'OsseBioMix',
    category: 'medical_device',
    categoryNameTh: CATEGORY_LABELS_TH.medical_device,
    educationLevel: 'higher_and_above',
    educationLevelNameTh: LEVEL_LABELS_TH.higher_and_above,
    affiliation: 'คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    titleTh: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก',
    titleEn: '3D-Printed Titanium Coated with Bioactive Hyaluronic Acid Hydrogel for Orthopedic Applications',
    abstractTh: 'นวัตกรรมวัสดุการแพทย์ขั้นสูง ไทเทเนียมที่ผ่านกระบวนการพิมพ์ 3 มิติร่วมกับการเคลือบไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ ช่วยเร่งการยึดติดของเซลล์กระดูกและลดการอักเสบติดเชื้อสำหรับการผ่าตัดทางศัลยกรรมกระดูก',
    memberDetails: [
      { orderIndex: 1, fullName: 'ทีมวิจัย OsseBioMix', role: 'หัวหน้าทีม', idCard: '1-1001-XXXXX-XX-X' }
    ],
    primaryCoordinator: {
      name: 'หัวหน้าโครงการ OsseBioMix',
      idCard: '1-1001-XXXXX-XX-X',
      phone: '02-555-2000',
      email: 'ossebiomix@sci.kmutnb.ac.th'
    },
    secondaryCoordinator: {
      name: '',
      idCard: '',
      phone: '',
      email: ''
    },
    rounds: {
      round1: { label: 'รอบคัดเลือกเอกสาร', status: 'PASSED' },
      round2: { label: 'รอบการประกวดออนไลน์', status: 'PASSED' },
      round3: { label: 'รอบตัดสิน', status: 'PASSED', result: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)' }
    },
    artifacts: {
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      videoUrl: '/Osbi_ver2.mp4',
      posterUrl: '/osbi-poster.jpg',
      imageUrl: '/osbi-poster.jpg',
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'
    },
    status: 'AWARDED',
    feedback: 'ได้รับรางวัลชนะเลิศประจำปี 2569 พร้อมถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี'
  },
  'KMUTNB-2569-0002': {
    trackingCode: 'KMUTNB-2569-0002',
    submittedAt: '12 เมษายน 2569',
    teamName: 'เขาชื่ออะไร',
    category: 'energy_environment',
    categoryNameTh: CATEGORY_LABELS_TH.energy_environment,
    educationLevel: 'higher_and_above',
    educationLevelNameTh: LEVEL_LABELS_TH.higher_and_above,
    affiliation: 'คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    titleTh: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion',
    titleEn: 'Automatic HDPE Pipe Butt Fusion Welding Controller and Data Logger',
    abstractTh: 'อุปกรณ์ควบคุมและบันทึกข้อมูลการเชื่อมท่อพอลิเอทิลีนความหนาแน่นสูง (HDPE) แบบหลอมชนอัตโนมัติ เพื่อเพิ่มความแม่นยำ มาตรฐานความปลอดภัย และตรวจสอบย้อนกลับของคุณภาพแนวเชื่อมในงานวิศวกรรมระบบท่อ',
    memberDetails: [
      { orderIndex: 1, fullName: 'ผศ.ดร.วัฒนา แก้วมณี', role: 'หัวหน้าทีม', idCard: '5-1601-XXXXX-XX-X' }
    ],
    primaryCoordinator: {
      name: 'ผศ.ดร.วัฒนา แก้วมณี',
      idCard: '5-1601-XXXXX-XX-X',
      phone: '064-XXX-9888',
      email: 'w***@fte.kmutnb.ac.th'
    },
    secondaryCoordinator: {
      name: 'ผศ.ดร.วัฒนา แก้วมณี',
      idCard: '5-1601-XXXXX-XX-X',
      phone: '064-XXX-9888',
      email: 'w***@gmail.com'
    },
    rounds: {
      round1: { label: 'รอบคัดเลือกเอกสาร', status: 'PASSED' },
      round2: { label: 'รอบการประกวดออนไลน์', status: 'PASSED' },
      round3: { label: 'รอบตัดสิน', status: 'PASSED', result: 'รางวัลรองชนะเลิศอันดับ 1' }
    },
    artifacts: {
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      videoUrl: '/hdpe-welding.mp4',
      posterUrl: '/hdpe-poster.jpg',
      imageUrl: '/hdpe-poster.jpg',
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'
    },
    status: 'AWARDED',
    feedback: 'ผ่านการพิจารณาทั้งรอบประกวดออนไลน์และรอบตัดสิน ได้รับรางวัลรองชนะเลิศอันดับ 1 ประจำปี 2569'
  },
  'KMUTNB-2569-0003': {
    trackingCode: 'KMUTNB-2569-0003',
    submittedAt: '14 เมษายน 2569',
    teamName: 'Growell',
    category: 'medical_device',
    categoryNameTh: CATEGORY_LABELS_TH.medical_device,
    educationLevel: 'higher_and_above',
    educationLevelNameTh: LEVEL_LABELS_TH.higher_and_above,
    affiliation: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    titleTh: 'นวัตกรรมด้ามจับฝึกการทรงตัวพร้อมระบบเซนเซอร์และปัญญาประดิษฐ์ (Growell)',
    titleEn: 'Growell: Smart Balance Training Handle with Sensor Array and AI Analytics',
    abstractTh: 'นวัตกรรมอุปกรณ์ฟื้นฟูสมรรถภาพและการฝึกการทรงตัวอัจฉริยะ ผสานเซนเซอร์ตรวจจับแรงกดและระบบปัญญาประดิษฐ์เพื่อวิเคราะห์สมดุลร่างกายแบบเรียลไทม์สำหรับผู้สูงอายุและผู้ป่วยกายภาพบำบัด',
    memberDetails: [
      { orderIndex: 1, fullName: 'หัวหน้าทีม Growell', role: 'หัวหน้าทีม', idCard: '1-1002-XXXXX-XX-X' }
    ],
    primaryCoordinator: {
      name: 'หัวหน้าทีม Growell',
      idCard: '1-1002-XXXXX-XX-X',
      phone: '02-XXX-2000',
      email: 'g***@eng.kmutnb.ac.th'
    },
    secondaryCoordinator: { name: '', idCard: '', phone: '', email: '' },
    rounds: {
      round1: { label: 'รอบคัดเลือกเอกสาร', status: 'PASSED' },
      round2: { label: 'รอบการประกวดออนไลน์', status: 'PASSED' },
      round3: { label: 'รอบตัดสิน', status: 'PASSED', result: 'รางวัลรองชนะเลิศอันดับ 2' }
    },
    artifacts: {
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      videoUrl: '/Growell.mp4',
      posterUrl: '/growell-poster.jpg',
      imageUrl: '/growell-poster.jpg',
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'
    },
    status: 'AWARDED',
    feedback: 'ผ่านการพิจารณาทั้งรอบประกวดออนไลน์และรอบตัดสิน ได้รับรางวัลรองชนะเลิศอันดับ 2 ประจำปี 2569'
  },
  'KMUTNB-2569-0004': {
    trackingCode: 'KMUTNB-2569-0004',
    submittedAt: '15 เมษายน 2569',
    teamName: 'C.L.A.R.A',
    category: 'social_economy',
    categoryNameTh: CATEGORY_LABELS_TH.social_economy,
    educationLevel: 'below_higher',
    educationLevelNameTh: 'ระดับต่ำกว่าอุดมศึกษา',
    affiliation: 'โรงเรียนสาธิตแห่งมหาวิทยาลัยเกษตรศาสตร์ โครงการการศึกษาพหุภาษา ศูนย์วิจัยและพัฒนาการศึกษา',
    titleTh: 'C.L.A.R.A — ระบบปัญญาประดิษฐ์ช่วยเหลือและวิเคราะห์การเรียนรู้เชิงโต้ตอบอัจฉริยะ',
    titleEn: 'C.L.A.R.A: Cognitive Learning & Adaptive Response Assistant',
    abstractTh: 'แพลตฟอร์มผู้ช่วยอัจฉริยะด้านการศึกษาและการเรียนรู้เชิงโต้ตอบ พัฒนาโดยเยาวชนระดับมัธยมศึกษาเพื่อยกระดับการเข้าถึงองค์ความรู้และวิเคราะห์พัฒนาการของผู้เรียนรายบุคคลด้วยเทคโนโลยี AI',
    memberDetails: [
      { orderIndex: 1, fullName: 'หัวหน้าทีม C.L.A.R.A', role: 'หัวหน้าทีม', idCard: '1-2001-XXXXX-XX-X' }
    ],
    primaryCoordinator: {
      name: 'ผู้ประสานงานทีม C.L.A.R.A',
      idCard: '1-2001-XXXXX-XX-X',
      phone: '038-XXX-200',
      email: 'c***@kus.ac.th'
    },
    secondaryCoordinator: { name: '', idCard: '', phone: '', email: '' },
    rounds: {
      round1: { label: 'รอบคัดเลือกเอกสาร', status: 'PASSED' },
      round2: { label: 'รอบการประกวดออนไลน์', status: 'PASSED' },
      round3: { label: 'รอบตัดสิน', status: 'PASSED', result: 'รางวัลชมเชย' }
    },
    artifacts: {
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      videoUrl: '/clara.mp4',
      posterUrl: '/clara-poster.jpg',
      imageUrl: '/clara-poster.jpg',
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'
    },
    status: 'AWARDED',
    feedback: 'ผ่านการพิจารณาทั้งรอบประกวดออนไลน์และรอบตัดสิน ได้รับรางวัลชมเชย ประจำปี 2569'
  },
  'KMUTNB-2569-0005': {
    trackingCode: 'KMUTNB-2569-0005',
    submittedAt: '16 เมษายน 2569',
    teamName: 'PIONEER V',
    category: 'social_economy',
    categoryNameTh: CATEGORY_LABELS_TH.social_economy,
    educationLevel: 'below_higher',
    educationLevelNameTh: 'ระดับต่ำกว่าอุดมศึกษา',
    affiliation: 'โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย ปทุมธานี',
    titleTh: 'ระบบตรวจจับความผิดปกติของถนนแบบเรียลไทม์ด้วยเทคโนโลยีปัญญาประดิษฐ์และการสร้างแผนที่อัจฉริยะ',
    titleEn: 'Real-Time Road Anomaly Detection and Smart Mapping System Using AI',
    abstractTh: 'ระบบตรวจจับหลุมบ่อและความชำรุดของพื้นผิวจราจรแบบเรียลไทม์ด้วยคอมพิวเตอร์วิทัศน์ (Computer Vision) เชื่อมต่อพิกัดแผนที่อัจฉริยะเพื่อแจ้งเตือนหน่วยงานซ่อมบำรุงและเพิ่มความปลอดภัยบนท้องถนน',
    memberDetails: [
      { orderIndex: 1, fullName: 'หัวหน้าทีม PIONEER V', role: 'หัวหน้าทีม', idCard: '1-1301-XXXXX-XX-X' }
    ],
    primaryCoordinator: {
      name: 'ผู้ประสานงานทีม PIONEER V',
      idCard: '1-1301-XXXXX-XX-X',
      phone: '02-XXX-8288',
      email: 'p***@pccpt.ac.th'
    },
    secondaryCoordinator: { name: '', idCard: '', phone: '', email: '' },
    rounds: {
      round1: { label: 'รอบคัดเลือกเอกสาร', status: 'PASSED' },
      round2: { label: 'รอบการประกวดออนไลน์', status: 'PASSED' },
      round3: { label: 'รอบตัดสิน', status: 'PASSED', result: 'รางวัลชมเชย' }
    },
    artifacts: {
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      videoUrl: '/road-ai.mp4',
      posterUrl: '/road-ai-poster.jpg',
      imageUrl: '/road-ai-poster.jpg',
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'
    },
    status: 'AWARDED',
    feedback: 'ผ่านการพิจารณาทั้งรอบประกวดออนไลน์และรอบตัดสิน ได้รับรางวัลชมเชย ประจำปี 2569'
  },
  'KMUTNB-2569-0006': {
    trackingCode: 'KMUTNB-2569-0006',
    submittedAt: '17 เมษายน 2569',
    teamName: 'GeoWeld',
    category: 'material',
    categoryNameTh: CATEGORY_LABELS_TH.material,
    educationLevel: 'higher_and_above',
    educationLevelNameTh: LEVEL_LABELS_TH.higher_and_above,
    affiliation: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    titleTh: 'ชุดหัวเชื่อมและอุปกรณ์จับยึดสำหรับการเชื่อมแผ่นธรณีสังเคราะห์ (Geomembrane)',
    titleEn: 'Specialized Welding Nozzle and Clamping Fixture for Geomembrane Liners',
    abstractTh: 'นวัตกรรมชุดหัวเชื่อมความร้อนและอุปกรณ์จับยึดแผ่นธรณีสังเคราะห์ (Geomembrane) ที่ออกแบบตามหลักวิศวกรรมวัสดุศาสตร์ ช่วยให้รอยเชื่อมสม่ำเสมอ ลดการรั่วซึมในบ่อกักเก็บน้ำและงานวิศวกรรมสิ่งแวดล้อม',
    memberDetails: [
      { orderIndex: 1, fullName: 'หัวหน้าทีม GeoWeld', role: 'หัวหน้าทีม', idCard: '1-1005-XXXXX-XX-X' }
    ],
    primaryCoordinator: {
      name: 'หัวหน้าทีม GeoWeld',
      idCard: '1-1005-XXXXX-XX-X',
      phone: '02-XXX-2000',
      email: 'g***@cit.kmutnb.ac.th'
    },
    secondaryCoordinator: { name: '', idCard: '', phone: '', email: '' },
    rounds: {
      round1: { label: 'รอบคัดเลือกเอกสาร', status: 'PASSED' },
      round2: { label: 'รอบการประกวดออนไลน์', status: 'PASSED' },
      round3: { label: 'รอบตัดสิน', status: 'PASSED', result: 'รางวัลชมเชย' }
    },
    artifacts: {
      proposalPdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
      videoUrl: '/geoweld.mp4',
      posterUrl: '/geoweld-poster.jpg',
      imageUrl: '/geoweld-poster.jpg',
      presentationUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf'
    },
    status: 'AWARDED',
    feedback: 'ผ่านการพิจารณาทั้งรอบประกวดออนไลน์และรอบตัดสิน ได้รับรางวัลชมเชย ประจำปี 2569'
  }
};

export const MAX_PROJECTS_PER_ACCOUNT = 2;

const KNOWN_CATEGORY_PATTERNS = [
  { code: 'agri_food', keywords: ['agri_food', 'อุตสาหกรรมอาหาร', 'ด้านการเกษตร', 'agriculture & food'] },
  { code: 'health_medtech', keywords: ['health_medtech', 'เทคโนโลยีทางการแพทย์', 'ด้านการสาธารณสุข', 'medtech', 'healthtech'] },
  { code: 'engineering_ai', keywords: ['engineering_ai', 'ปัญญาประดิษฐ์', 'อุปกรณ์อัจฉริยะ', 'ด้านวิศวกรรมศาสตร์', 'smart devices'] },
  { code: 'energy_env_material_bcg', keywords: ['energy_env_material_bcg', 'bcg economy', 'เทคโนโลยีวัสดุ', 'ด้านพลังงาน'] },
  { code: 'quality_of_life_soft_power', keywords: ['quality_of_life_soft_power', 'soft power', 'ด้านคุณภาพชีวิต'] },
  { code: 'energy_environment', keywords: ['energy_environment', 'energy & environment', 'พลังงานและสิ่งแวดล้อม'] },
  { code: 'food_agriculture', keywords: ['food_agriculture', 'food & agriculture', 'เกษตรและอาหารแปรรูป'] },
  { code: 'social_economy', keywords: ['social_economy', 'social & economy', 'เศรษฐกิจและสังคมดิจิทัล'] },
  { code: 'medical_device', keywords: ['medical_device', 'medical device', 'เครื่องมือแพทย์และสาธารณสุข'] },
  { code: 'material', keywords: ['material', 'วัสดุศาสตร์และเทคโนโลยีก้าวหน้า'] },
  { code: 'others', keywords: ['others', 'อื่นๆ'] },
];

export function normalizeCategoryCode(rawCategory) {
  if (!rawCategory) return 'agri_food';
  if (typeof rawCategory === 'object') {
    return normalizeCategoryCode(rawCategory.code || rawCategory.id || rawCategory.nameTh || rawCategory.nameEn || '');
  }
  const str = String(rawCategory).trim();
  if (!str) return 'agri_food';
  const lower = str.toLowerCase();
  for (const item of KNOWN_CATEGORY_PATTERNS) {
    if (lower === item.code) return item.code;
  }
  for (const item of KNOWN_CATEGORY_PATTERNS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.code;
    }
  }
  return str;
}

export function createInitialSubmissionForm() {
  return {
    id: '',
    trackingCode: '',
    status: 'DRAFT',
    titleTh: '',
    titleEn: '',
    category: 'agri_food',
    educationLevel: 'general_public',
    hasPrototypeConfirmed: false,
    teamName: '',
    affiliation: '',
    advisorName: '',
    abstractTh: '',
    members: [
      { fullName: '', role: 'หัวหน้าทีม', idCard: '' }
    ],
    primaryCoordinator: {
      name: '',
      idCard: '',
      phone: '',
      email: ''
    },
    secondaryCoordinator: {
      name: '',
      idCard: '',
      phone: '',
      email: ''
    },
    proposalPdfUrl: '',
    videoUrl: '',
    posterUrl: '',
    coverImage: '',
    presentationUrl: '',
    documentUrl: ''
  };
}

export function formatCitizenIdInput(value) {
  const raw = String(value || '').trim();
  const digitsOnly = raw.replace(/\D/g, '');
  if (/^[\d-]+$/.test(raw) && digitsOnly.length === 13) {
    return `${digitsOnly[0]}-${digitsOnly.slice(1, 5)}-${digitsOnly.slice(5, 10)}-${digitsOnly.slice(10, 12)}-${digitsOnly[12]}`;
  }
  return raw;
}

export function validateSubmissionStep(form, step, isDraft = false, options = {}) {
  const requiresPrototype = options?.requiresPrototype !== false;

  if (isDraft) {
    if (!String(form?.titleTh || '').trim()) {
      return 'กรุณาระบุชื่อผลงาน (ภาษาไทย) เป็นอย่างน้อยเพื่อบันทึกแบบร่าง';
    }
    return '';
  }

  if (!step || step === 1) {
    if (!String(form?.titleTh || '').trim()) {
      return 'กรุณาระบุชื่อผลงานสิ่งประดิษฐ์/นวัตกรรม (ภาษาไทย)';
    }
    if (!String(form?.teamName || '').trim()) {
      return 'กรุณาระบุชื่อทีม';
    }
    if (!String(form?.affiliation || '').trim()) {
      return 'กรุณาระบุสังกัด (คณะ / โรงเรียน / สถาบัน / หน่วยงาน)';
    }
    if (!String(form?.abstractTh || '').trim()) {
      return 'กรุณากรอกรายละเอียดผลงาน / บทคัดย่อ';
    }
  }

  if (!step || step === 2) {
    const validMembers = Array.isArray(form?.members)
      ? form.members.filter(m => String(typeof m === 'string' ? m : m?.fullName || '').trim())
      : [];
    if (validMembers.length === 0) {
      return 'กรุณาระบุชื่อสมาชิกทีมอย่างน้อย 1 ท่าน (หัวหน้าทีม)';
    }
    const pc = form?.primaryCoordinator || {};
    if (!String(pc.name || '').trim()) {
      return 'กรุณาระบุชื่อผู้ประสานงานหลัก';
    }
    if (!String(pc.phone || '').trim()) {
      return 'กรุณาระบุเบอร์โทรศัพท์ของผู้ประสานงานหลัก';
    }
    if (!String(pc.email || '').trim()) {
      return 'กรุณาระบุอีเมลของผู้ประสานงานหลัก';
    }
  }

  if (!step || step === 3) {
    const proposal = String(form?.proposalPdfUrl || form?.documentUrl || '').trim();
    if (!proposal) {
      return 'กรุณาระบุลิงก์ไฟล์ PDF แบบฟอร์มเสนอผลงานประกวดสิ่งประดิษฐ์และนวัตกรรม';
    }
    if (!String(form?.videoUrl || '').trim()) {
      return 'กรุณาระบุลิงก์คลิป VDO นำเสนอผลงาน';
    }
    if (!String(form?.coverImage || '').trim()) {
      return 'กรุณาระบุลิงก์รูปภาพผลงาน (Image) หรือเลือกภาพตัวอย่าง';
    }
    if (requiresPrototype && form?.hasPrototypeConfirmed !== true) {
      return 'กรุณายืนยันว่าผลงานมีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำตามเกณฑ์การแข่งขัน (ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด)';
    }
  }

  return '';
}

export function buildSubmissionApiPayload(form, isDraft = false, userId = 'guest-user') {
  const proposalPdfUrl = String(form?.proposalPdfUrl || form?.documentUrl || '').trim();
  const videoUrl = String(form?.videoUrl || '').trim();
  const posterUrl = String(form?.posterUrl || '').trim();
  const imageUrl = String(form?.coverImage || '').trim();
  const presentationUrl = String(form?.presentationUrl || '').trim();

  const members = (Array.isArray(form?.members) ? form.members : [])
    .map((m, idx) => {
      if (typeof m === 'string') {
        return { fullName: m.trim(), role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก', idCard: '' };
      }
      return {
        fullName: String(m?.fullName || '').trim(),
        role: String(m?.role || (idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก')).trim(),
        idCard: formatCitizenIdInput(m?.idCard || '')
      };
    })
    .filter(m => m.fullName);

  const primaryCoordinator = {
    name: String(form?.primaryCoordinator?.name || '').trim(),
    idCard: formatCitizenIdInput(form?.primaryCoordinator?.idCard || ''),
    phone: String(form?.primaryCoordinator?.phone || '').trim(),
    email: String(form?.primaryCoordinator?.email || '').trim()
  };

  const secondaryCoordinator = {
    name: String(form?.secondaryCoordinator?.name || '').trim(),
    idCard: formatCitizenIdInput(form?.secondaryCoordinator?.idCard || ''),
    phone: String(form?.secondaryCoordinator?.phone || '').trim(),
    email: String(form?.secondaryCoordinator?.email || '').trim()
  };

  const trimmedId = String(form?.id || '').trim();

  return {
    ...(trimmedId ? { id: trimmedId } : {}),
    titleTh: String(form?.titleTh || '').trim(),
    titleEn: String(form?.titleEn || '').trim(),
    category: normalizeCategoryCode(form?.category),
    educationLevel: form?.educationLevel || 'general_public',
    hasPrototypeConfirmed: Boolean(form?.hasPrototypeConfirmed),
    teamName: String(form?.teamName || '').trim(),
    affiliation: String(form?.affiliation || '').trim(),
    advisorName: String(form?.advisorName || '').trim(),
    abstractTh: String(form?.abstractTh || '').trim(),
    members,
    primaryCoordinator,
    secondaryCoordinator,
    files: {
      proposalPdfUrl,
      videoUrl,
      posterUrl,
      imageUrl,
      presentationUrl
    },
    proposalPdfUrl,
    documentUrl: proposalPdfUrl,
    videoUrl,
    posterUrl,
    coverImage: imageUrl,
    presentationUrl,
    isDraft: Boolean(isDraft),
    userId: userId || 'guest-user'
  };
}

export function hydrateSubmissionFormFromServer(record) {
  const base = createInitialSubmissionForm();
  if (!record || typeof record !== 'object') return base;

  const categoryCode = normalizeCategoryCode(record.category);

  const levelCode =
    typeof record.educationLevel === 'object' && record.educationLevel !== null
      ? record.educationLevel.code || 'general_public'
      : record.educationLevel || 'general_public';

  const hasPrototypeConfirmed = Boolean(
    record.hasPrototypeConfirmed ?? (record.status && record.status !== 'DRAFT')
  );

  const rawMembers =
    Array.isArray(record.memberDetails) && record.memberDetails.length > 0
      ? record.memberDetails
      : Array.isArray(record.members)
      ? record.members
      : [];

  const members =
    rawMembers.length > 0
      ? rawMembers.map((m, idx) => {
          if (typeof m === 'string') {
            return { fullName: m, role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก', idCard: '' };
          }
          return {
            fullName: String(m?.fullName || '').trim(),
            role: String(m?.role || (idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก')).trim(),
            idCard: formatCitizenIdInput(m?.idCard || '')
          };
        })
      : base.members;

  const proposalPdfUrl =
    record.artifacts?.proposalPdfUrl || record.proposalPdfUrl || record.documentUrl || '';
  const videoUrl = record.artifacts?.videoUrl || record.videoUrl || '';
  const posterUrl = record.artifacts?.posterUrl || record.posterUrl || '';
  const coverImage =
    record.artifacts?.imageUrl || record.coverImage || record.image || '';
  const presentationUrl =
    record.artifacts?.presentationUrl || record.presentationUrl || '';

  return {
    ...base,
    id: String(record.id || ''),
    trackingCode: String(record.trackingCode || ''),
    status: String(record.status || 'SUBMITTED'),
    titleTh: String(record.titleTh || ''),
    titleEn: String(record.titleEn || ''),
    category: categoryCode,
    educationLevel: levelCode,
    hasPrototypeConfirmed,
    teamName: String(record.teamName || ''),
    affiliation: String(record.affiliation || record.institution || ''),
    advisorName: String(record.advisorName || ''),
    abstractTh: String(record.abstractTh || ''),
    members,
    primaryCoordinator: {
      name: String(record.primaryCoordinator?.name || record.primaryCoordName || ''),
      idCard: formatCitizenIdInput(record.primaryCoordinator?.idCard || record.primaryCoordIdCard || ''),
      phone: String(record.primaryCoordinator?.phone || record.primaryCoordPhone || ''),
      email: String(record.primaryCoordinator?.email || record.primaryCoordEmail || '')
    },
    secondaryCoordinator: {
      name: String(record.secondaryCoordinator?.name || record.secondaryCoordName || ''),
      idCard: formatCitizenIdInput(record.secondaryCoordinator?.idCard || record.secondaryCoordIdCard || ''),
      phone: String(record.secondaryCoordinator?.phone || record.secondaryCoordPhone || ''),
      email: String(record.secondaryCoordinator?.email || record.secondaryCoordEmail || '')
    },
    proposalPdfUrl,
    documentUrl: proposalPdfUrl,
    videoUrl,
    posterUrl,
    coverImage,
    presentationUrl
  };
}

export function isSubmissionDeadlinePassed(deadlineIso, nowMs = Date.now()) {
  if (!deadlineIso) return false;
  const parsed = new Date(deadlineIso).getTime();
  if (Number.isNaN(parsed)) return false;
  return nowMs > parsed;
}

function pickNonEmptyString(...candidates) {
  for (const val of candidates) {
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return '';
}

export function normalizeStatusDossier(raw) {
  const code = String(raw?.trackingCode || '').toUpperCase().trim();
  const preset = FALLBACK_DOSSIERS[code] || {};
  const merged = { ...preset, ...(raw || {}) };

  const codeYearMatch = code.match(/^KMUTNB-(\d{4})-/);
  const resolvedYear =
    Number(merged.year) ||
    Number(merged.competitionYear?.year) ||
    (codeYearMatch ? Number(codeYearMatch[1]) : 0) ||
    2570;
  const isLegacy2569 = resolvedYear <= 2569 || code.includes('-2569-');

  const categoryCode = merged.category
    ? normalizeCategoryCode(merged.category)
    : isLegacy2569
    ? 'energy_environment'
    : 'agri_food';

  const rawLevelCode =
    typeof merged.educationLevel === 'object' && merged.educationLevel !== null
      ? merged.educationLevel.code || merged.educationLevel.id || ''
      : typeof merged.educationLevel === 'string'
      ? merged.educationLevel.trim()
      : '';
  const levelCode = rawLevelCode || (isLegacy2569 ? 'higher_and_above' : 'general_public');

  const isRoyalTrophy =
    typeof merged.isRoyalTrophy === 'boolean'
      ? merged.isRoyalTrophy
      : typeof merged.competitionYearLevel?.isRoyalTrophy === 'boolean'
      ? merged.competitionYearLevel.isRoyalTrophy
      : isLegacy2569 || levelCode === 'general_public' || levelCode === 'higher_and_above';

  const trophyShortTh =
    pickNonEmptyString(merged.trophyShortTh, merged.competitionYearLevel?.trophyShortTh) ||
    (isRoyalTrophy ? ROYAL_TROPHY_SHORT_TH_2570 : KMUTNB_TROPHY_SHORT_TH_2570);

  const categoryNameTh =
    pickNonEmptyString(
      merged.categoryNameTh,
      merged.competitionYearCategory?.customNameTh,
      typeof merged.category === 'object' && merged.category !== null
        ? merged.category.nameTh
        : '',
      CATEGORY_LABELS_TH[categoryCode],
      categoryCode
    ) || 'General Innovation';

  const legacy2569LevelLabel =
    isLegacy2569 && levelCode === 'below_higher'
      ? 'ระดับต่ำกว่าอุดมศึกษา'
      : isLegacy2569 && levelCode === 'higher_and_above'
      ? 'ระดับอุดมศึกษาและบุคคลทั่วไป'
      : '';

  const educationLevelNameTh =
    pickNonEmptyString(
      merged.educationLevelNameTh,
      merged.competitionYearLevel?.customNameTh,
      typeof merged.educationLevel === 'object' && merged.educationLevel !== null
        ? merged.educationLevel.nameTh
        : '',
      legacy2569LevelLabel,
      LEVEL_LABELS_TH[levelCode],
      levelCode
    ) || 'บุคคลทั่วไป';

  let formattedDate = merged.submittedAt || '4 พฤศจิกายน 2569';
  if (formattedDate && typeof formattedDate === 'string' && formattedDate.includes('T')) {
    try {
      formattedDate = new Date(formattedDate).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {}
  }

  let memberDetails = [];
  if (Array.isArray(merged.memberDetails) && merged.memberDetails.length > 0) {
    memberDetails = merged.memberDetails;
  } else if (Array.isArray(merged.members) && merged.members.length > 0) {
    memberDetails = merged.members.map((m, idx) => {
      if (typeof m === 'string') {
        return { orderIndex: idx + 1, fullName: m, role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก', idCard: '' };
      }
      return {
        orderIndex: idx + 1,
        fullName: m.fullName || '',
        role: m.role || (idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก'),
        idCard: m.idCard || ''
      };
    });
  } else if (preset.memberDetails) {
    memberDetails = preset.memberDetails;
  } else {
    memberDetails = [
      { orderIndex: 1, fullName: merged.teamName || 'หัวหน้าทีม', role: 'หัวหน้าทีม', idCard: '' }
    ];
  }

  const rounds = merged.rounds || {
    round1: {
      label: 'รอบคัดเลือกเอกสาร',
      status: merged.round1Status || (merged.status === 'AWARDED' ? 'PASSED' : 'PENDING')
    },
    round2: {
      label: 'รอบการประกวดออนไลน์',
      status: merged.round2Status || (merged.status === 'AWARDED' ? 'PASSED' : 'PENDING')
    },
    round3: {
      label: 'รอบตัดสิน',
      status: merged.round3Status || (merged.status === 'AWARDED' ? 'PASSED' : 'PENDING'),
      result: merged.round3Result || ''
    }
  };

  const artifacts = {
    proposalPdfUrl: merged.artifacts?.proposalPdfUrl || merged.proposalPdfUrl || merged.documentUrl || '',
    videoUrl: merged.artifacts?.videoUrl || merged.videoUrl || '',
    posterUrl: merged.artifacts?.posterUrl || merged.posterUrl || '',
    imageUrl: merged.artifacts?.imageUrl || merged.coverImage || merged.image || '',
    presentationUrl: merged.artifacts?.presentationUrl || merged.presentationUrl || ''
  };

  return {
    id: String(merged.id || ''),
    userId: String(merged.userId || ''),
    canEditArtifacts: Boolean(merged.canEditArtifacts),
    year: resolvedYear,
    trackingCode: code || 'KMUTNB-2570-0001',
    submittedAt: formattedDate,
    teamName: merged.teamName || 'ทีมสร้างสรรค์นวัตกรรม',
    category: categoryCode,
    categoryNameTh,
    educationLevel: levelCode,
    educationLevelNameTh,
    isRoyalTrophy,
    trophyShortTh,
    hasPrototypeConfirmed: Boolean(
      merged.hasPrototypeConfirmed ?? (merged.status !== 'DRAFT')
    ),
    affiliation: merged.affiliation || merged.institution || 'ไม่ระบุสังกัด',
    advisorName: merged.advisorName || '',
    titleTh: merged.titleTh || 'โครงงานสิ่งประดิษฐ์และนวัตกรรม',
    titleEn: merged.titleEn || '',
    abstractTh: merged.abstractTh || 'ไม่มีรายละเอียดเพิ่มเติม',
    memberDetails,
    primaryCoordinator: {
      name: merged.primaryCoordinator?.name || preset.primaryCoordinator?.name || '',
      idCard: merged.primaryCoordinator?.idCard || preset.primaryCoordinator?.idCard || '',
      phone: merged.primaryCoordinator?.phone || preset.primaryCoordinator?.phone || '',
      email: merged.primaryCoordinator?.email || preset.primaryCoordinator?.email || ''
    },
    secondaryCoordinator: {
      name: merged.secondaryCoordinator?.name || preset.secondaryCoordinator?.name || '',
      idCard: merged.secondaryCoordinator?.idCard || preset.secondaryCoordinator?.idCard || '',
      phone: merged.secondaryCoordinator?.phone || preset.secondaryCoordinator?.phone || '',
      email: merged.secondaryCoordinator?.email || preset.secondaryCoordinator?.email || ''
    },
    rounds,
    artifacts,
    status: merged.status || 'SUBMITTED',
    feedback: merged.feedback || 'เอกสารข้อเสนอโครงการได้รับการบันทึกในระบบเรียบร้อยแล้ว อยู่ระหว่างการพิจารณาจากคณะกรรมการ'
  };
}

export const DEFAULT_RUBRIC_CRITERIA = [
  {
    id: 'creativity',
    titleTh: 'ความคิดสร้างสรรค์และความใหม่ของนวัตกรรม',
    titleEn: 'Creativity & Novelty',
    weight: 25
  },
  {
    id: 'prototype',
    titleTh: 'ความสมบูรณ์และประสิทธิภาพของชิ้นงานต้นแบบ',
    titleEn: 'Prototype Readiness & Performance',
    weight: 25
  },
  {
    id: 'impact',
    titleTh: 'การนำไปใช้งานจริงและผลกระทบที่วัดผลได้',
    titleEn: 'Practical Application & Measurable Impact',
    weight: 20
  },
  {
    id: 'sustainability',
    titleTh: 'ศักยภาพเชิงพาณิชย์ สังคม และความยั่งยืน',
    titleEn: 'Commercial, Social & Sustainability Potential',
    weight: 15
  },
  {
    id: 'presentation',
    titleTh: 'ความชัดเจนของเอกสาร โปสเตอร์ และการนำเสนอ',
    titleEn: 'Clarity of Documentation, Poster & Presentation',
    weight: 15
  }
];

export const RUBRIC_SCORE_LEVELS = [
  { score: 5, label: 'ดีเยี่ยม' },
  { score: 4, label: 'ดีมาก' },
  { score: 3, label: 'ปานกลาง' },
  { score: 2, label: 'พอใช้' },
  { score: 1, label: 'ต้องปรับปรุง' }
];

export function calculateWeightedRubricScore(scores = {}, criteria = DEFAULT_RUBRIC_CRITERIA) {
  const list = Array.isArray(criteria) && criteria.length > 0 ? criteria : DEFAULT_RUBRIC_CRITERIA;
  let total = 0;
  for (const item of list) {
    const val = Number(scores?.[item.id]);
    const weight = Number(item.weight) || 0;
    if (Number.isFinite(val) && val >= 1 && val <= 5) {
      total += (val / 5) * weight;
    }
  }
  return Math.round(total * 100) / 100;
}

export function validateRubricWeights(criteria = []) {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return 'กรุณาระบุหัวข้อเกณฑ์การให้คะแนนอย่างน้อย 1 ข้อ';
  }
  let sum = 0;
  for (let i = 0; i < criteria.length; i++) {
    const item = criteria[i];
    if (!item || !String(item.titleTh || '').trim()) {
      return `กรุณาระบุชื่อเกณฑ์ข้อที่ ${i + 1}`;
    }
    const w = Number(item.weight);
    if (!Number.isFinite(w) || w <= 0) {
      return `ค่าน้ำหนักของ "${item.titleTh}" ต้องมากกว่า 0%`;
    }
    sum += w;
  }
  if (Math.round(sum * 100) / 100 !== 100) {
    return `ผลรวมค่าน้ำหนักของทุกเกณฑ์ต้องเท่ากับ 100% พอดี (ปัจจุบันรวมได้ ${sum}%)`;
  }
  return '';
}

export function formatCategoryOptionLabel(cat = {}) {
  const nameTh = String(cat?.nameTh || '').trim();
  const nameEn = String(cat?.nameEn || '').trim();
  if (!nameTh && !nameEn) return String(cat?.code || '');
  if (!nameEn) return nameTh;
  if (!nameTh) return nameEn;
  if (
    nameTh.toLowerCase().includes(nameEn.toLowerCase()) ||
    nameTh.includes('(')
  ) {
    return nameTh;
  }
  return `${nameTh} (${nameEn})`;
}


