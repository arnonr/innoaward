export interface PrizeBreakdownItem {
  tier: 'GRAND_WINNER' | 'RUNNER_UP_1' | 'RUNNER_UP_2' | 'HONORABLE_MENTION';
  labelTh: string;
  count: number;
  amountEach: number;
  totalAmount: number;
  honorTextTh: string;
}

export interface YearLevelSeedSpec {
  code: string;
  nameTh: string;
  nameEn: string;
  eligibleTh: string;
  eligibleEn: string;
  trophyTitleTh: string;
  trophyShortTh: string;
  isRoyalTrophy: boolean;
  totalPrizeAmount: number;
  requiresPrototype: boolean;
  prototypeRuleTh: string;
  orderIndex: number;
  prizeBreakdown: PrizeBreakdownItem[];
}

export interface CategorySeedSpec {
  code: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  icon: string;
  color: string;
  bgImage: string;
  orderIndex: number;
}

export const PROTOTYPE_RULE_TH =
  'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)';

export const ROYAL_TROPHY_TITLE_TH =
  'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี';
export const ROYAL_TROPHY_SHORT_TH = 'ถ้วยพระราชทานฯ';
export const KMUTNB_TROPHY_TITLE_TH = 'ถ้วยรางวัล มจพ.';
export const KMUTNB_TROPHY_SHORT_TH = 'ถ้วยรางวัล มจพ.';

function createStandardPrizeBreakdown(
  amounts: [number, number, number, number],
  championTrophyShortTh: string
): PrizeBreakdownItem[] {
  const [grand, firstRunnerUp, secondRunnerUp, honorableEach] = amounts;
  return [
    {
      tier: 'GRAND_WINNER',
      labelTh: 'ชนะเลิศ',
      count: 1,
      amountEach: grand,
      totalAmount: grand,
      honorTextTh: `${championTrophyShortTh} + เกียรติบัตร`,
    },
    {
      tier: 'RUNNER_UP_1',
      labelTh: 'รองชนะเลิศอันดับ 1',
      count: 1,
      amountEach: firstRunnerUp,
      totalAmount: firstRunnerUp,
      honorTextTh: 'เกียรติบัตร',
    },
    {
      tier: 'RUNNER_UP_2',
      labelTh: 'รองชนะเลิศอันดับ 2',
      count: 1,
      amountEach: secondRunnerUp,
      totalAmount: secondRunnerUp,
      honorTextTh: 'เกียรติบัตร',
    },
    {
      tier: 'HONORABLE_MENTION',
      labelTh: 'ชมเชย',
      count: 3,
      amountEach: honorableEach,
      totalAmount: honorableEach * 3,
      honorTextTh: 'เกียรติบัตร',
    },
  ];
}

export const LEVELS_2570_DEFAULTS: YearLevelSeedSpec[] = [
  {
    code: 'general_public',
    nameTh: 'บุคคลทั่วไป',
    nameEn: 'General Public',
    eligibleTh:
      'อาจารย์, นักวิจัย, ผู้ประกอบการ, วิสาหกิจเริ่มต้น (Startup) และประชาชนทั่วไป (ส่งเดี่ยวหรือทีม 3–5 คน)',
    eligibleEn:
      'Faculty members, researchers, entrepreneurs, startups, and general public (individual or 3–5 members)',
    trophyTitleTh: ROYAL_TROPHY_TITLE_TH,
    trophyShortTh: ROYAL_TROPHY_SHORT_TH,
    isRoyalTrophy: true,
    totalPrizeAmount: 105000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH,
    orderIndex: 1,
    prizeBreakdown: createStandardPrizeBreakdown([40000, 30000, 20000, 5000], ROYAL_TROPHY_SHORT_TH),
  },
  {
    code: 'higher_education',
    nameTh: 'อุดมศึกษา',
    nameEn: 'Higher Education',
    eligibleTh:
      'นิสิต นักศึกษาระดับปริญญาตรี ปริญญาโท และปริญญาเอก ทุกสถาบัน (ส่งเดี่ยวหรือทีม 3–5 คน)',
    eligibleEn:
      'Undergraduate, master’s, and doctoral students from all institutions (individual or 3–5 members)',
    trophyTitleTh: KMUTNB_TROPHY_TITLE_TH,
    trophyShortTh: KMUTNB_TROPHY_SHORT_TH,
    isRoyalTrophy: false,
    totalPrizeAmount: 75000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH,
    orderIndex: 2,
    prizeBreakdown: createStandardPrizeBreakdown([30000, 20000, 10000, 5000], KMUTNB_TROPHY_SHORT_TH),
  },
  {
    code: 'below_higher',
    nameTh: 'ต่ำกว่าอุดมศึกษา (มัธยมศึกษา/อาชีวศึกษา)',
    nameEn: 'Below Higher Education (Secondary / Vocational)',
    eligibleTh:
      'นักเรียนระดับมัธยมศึกษา และนักเรียน/นักศึกษาสายอาชีวศึกษา (ปวช. / ปวส. หรือเทียบเท่า) ต้องมีอาจารย์ที่ปรึกษารับรองอย่างน้อย 1 ท่าน',
    eligibleEn:
      'Secondary school and vocational students (Voc. Cert. / High Voc. Cert. or equivalent) with at least 1 certifying advisor',
    trophyTitleTh: KMUTNB_TROPHY_TITLE_TH,
    trophyShortTh: KMUTNB_TROPHY_SHORT_TH,
    isRoyalTrophy: false,
    totalPrizeAmount: 75000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH,
    orderIndex: 3,
    prizeBreakdown: createStandardPrizeBreakdown([30000, 20000, 10000, 5000], KMUTNB_TROPHY_SHORT_TH),
  },
];

export const LEVELS_2569_DEFAULTS: YearLevelSeedSpec[] = [
  {
    code: 'higher_and_above',
    nameTh: 'ระดับอุดมศึกษาและบุคคลทั่วไป',
    nameEn: 'Higher Education & General Public',
    eligibleTh:
      'นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, ผู้ประกอบการ และประชาชนทั่วไป',
    eligibleEn:
      'Undergraduate, graduate students, researchers, startups, and general public',
    trophyTitleTh: ROYAL_TROPHY_TITLE_TH,
    trophyShortTh: ROYAL_TROPHY_SHORT_TH,
    isRoyalTrophy: true,
    totalPrizeAmount: 105000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH,
    orderIndex: 1,
    prizeBreakdown: createStandardPrizeBreakdown([40000, 30000, 20000, 5000], ROYAL_TROPHY_SHORT_TH),
  },
  {
    code: 'below_higher',
    nameTh: 'ระดับต่ำกว่าอุดมศึกษา',
    nameEn: 'Below Higher Education',
    eligibleTh: 'นักเรียนระดับมัธยมศึกษา, ปวช., ปวส. หรือเทียบเท่า',
    eligibleEn:
      'High school and vocational students (Voc. Cert. / High Voc. Cert. or equivalent)',
    trophyTitleTh: ROYAL_TROPHY_TITLE_TH,
    trophyShortTh: ROYAL_TROPHY_SHORT_TH,
    isRoyalTrophy: true,
    totalPrizeAmount: 75000,
    requiresPrototype: true,
    prototypeRuleTh: PROTOTYPE_RULE_TH,
    orderIndex: 2,
    prizeBreakdown: createStandardPrizeBreakdown([30000, 20000, 10000, 5000], ROYAL_TROPHY_SHORT_TH),
  },
];

export const CATEGORIES_2570_DEFAULTS: CategorySeedSpec[] = [
  {
    code: 'agri_food',
    nameTh: 'ด้านการเกษตรและอุตสาหกรรมอาหาร',
    nameEn: 'Agriculture & Food Industry',
    descriptionTh:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ต่อการผลิตผลทางการเกษตร พืช ประมง ปศุสัตว์ ป่าไม้ แมลงเศรษฐกิจ สาหร่าย เทคโนโลยีการเกษตร เกษตรอัจฉริยะ การอนุรักษ์ดิน น้ำ และสิ่งแวดล้อมในระบบนิเวศเกษตร วิศวกรรมและเครื่องจักรกลการเกษตร ธุรกิจการเกษตร อุตสาหกรรมเกษตร เทคโนโลยีในกระบวนการผลิตแปรรูปอาหาร อาหารฟังก์ชัน (Functional Foods) บรรจุภัณฑ์ และจัดจำหน่ายไปยังผู้บริโภค ตลอดจนการใช้ประโยชน์จากผลพลอยได้ทางการเกษตร กากของเหลือหรือวัสดุเหลือทิ้งจากภาคการเกษตร และอื่น ๆ ที่เกี่ยวข้อง',
    descriptionEn:
      'Innovations in crop, fishery, livestock, forestry, economic insects, algae, smart agriculture, agricultural machinery, food processing, functional foods, packaging, and agricultural by-product valorization.',
    icon: 'Leaf',
    color: '#16A34A',
    bgImage: '/domain-food.jpg',
    orderIndex: 1,
  },
  {
    code: 'health_medtech',
    nameTh: 'ด้านการสาธารณสุข สุขภาพ และเทคโนโลยีทางการแพทย์',
    nameEn: 'Public Health, Healthcare & Medical Technology',
    descriptionTh:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านส่งเสริมสุขภาพ ป้องกัน ดูแล รักษา บำบัดโรค ตรวจสอบและวินิจฉัยโรค อุปกรณ์ทางการแพทย์ อุปกรณ์กายภาพบำบัด สมุนไพร เทคโนโลยีสุขภาพ (Healthtech) เทคโนโลยีการแพทย์ (Medtech) เครื่องสำอาง ผลิตภัณฑ์สุขภาพ ผลิตภัณฑ์จากธรรมชาติ (Natural Products) ผลิตภัณฑ์เสริมอาหาร (Supplementary Products) การดูแลสุขภาพอย่างชาญฉลาด (Smart Healthcare) และการสร้างเสริมสุขภาพและคุณภาพชีวิตของผู้ป่วยและประชากร และอื่น ๆ ที่เกี่ยวข้อง',
    descriptionEn:
      'Innovations for health promotion, disease prevention, diagnostics, medical and rehabilitation devices, herbal and natural products, Healthtech, Medtech, and Smart Healthcare.',
    icon: 'Activity',
    color: '#E11D48',
    bgImage: '/domain-medical.jpg',
    orderIndex: 2,
  },
  {
    code: 'engineering_ai',
    nameTh: 'ด้านวิศวกรรมศาสตร์ เทคโนโลยีปัญญาประดิษฐ์และอุปกรณ์อัจฉริยะ',
    nameEn: 'Engineering, AI & Smart Devices',
    descriptionTh:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านวิศวกรรมศาสตร์ วิทยาศาสตร์ และอุตสาหกรรม เป็นผลงานทั้งประเภท Software และ Hardware การออกแบบและปรับปรุงกระบวนการผลิตและสภาวะแวดล้อม เช่น เทคโนโลยีหุ่นยนต์ (Robotics) เทคโนโลยีระบบราง เทคโนโลยีด้านการเงิน (Fintech) ธุรกิจพาณิชย์อิเล็กทรอนิกส์ (e-Commerce) อุปกรณ์เชื่อมต่อผ่านระบบอินเทอร์เน็ต (IoT) เทคโนโลยีการศึกษา (Edtech) Big Data ระบบอัตโนมัติ (Automation) Machine Learning ระบบควบคุมและเครื่องมือวัด (Control System and Instrument) ระบบเทคโนโลยีเสมือนจริง (Virtual Reality) และอื่น ๆ ที่เกี่ยวข้อง',
    descriptionEn:
      'Software and hardware innovations in engineering, science, industry, Robotics, rail technology, Fintech, e-Commerce, IoT, Edtech, Big Data, Automation, Machine Learning, control systems, and Virtual Reality.',
    icon: 'Cpu',
    color: '#06B6D4',
    bgImage: '/domain-engineering.jpg',
    orderIndex: 3,
  },
  {
    code: 'energy_env_material_bcg',
    nameTh: 'ด้านพลังงาน สิ่งแวดล้อม เทคโนโลยีวัสดุ และ BCG Economy Model',
    nameEn: 'Energy, Environment, Materials & BCG Economy',
    descriptionTh:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านพลังงานและสิ่งแวดล้อม การแก้ไข ฟื้นฟู บำรุงรักษา ปรับปรุงคุณภาพ ตรวจวิเคราะห์ทางพลังงานและสิ่งแวดล้อม การอนุรักษ์พลังงาน นวัตกรรมเพื่อการประหยัดพลังงาน พลังงานรูปแบบใหม่ เทคโนโลยียานยนต์ไฟฟ้า เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน การพัฒนาระบบพลังงานทางเลือก เช่น การผลิตพลังงานจากธรรมชาติ โซล่าเซลล์ พลังงานจากขยะ เป็นต้น เทคโนโลยีเพื่อสิ่งแวดล้อม เช่น การจัดการขยะ มลพิษทางอากาศ และน้ำเสีย เป็นต้น เซ็นเซอร์ทางสิ่งแวดล้อมและพลังงาน เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน เทคโนโลยีวัสดุ รวมถึงการพัฒนาเศรษฐกิจที่คำนึงถึงความยั่งยืนของทรัพยากรและสิ่งแวดล้อม (BCG Economy Model) ทั้งเศรษฐกิจชีวภาพ (Bio Economy) เศรษฐกิจหมุนเวียน (Circular Economy) และเศรษฐกิจสีเขียว (Green Economy) และอื่น ๆ ที่เกี่ยวข้อง',
    descriptionEn:
      'Innovations in clean energy, EVs, batteries and energy materials, waste/air/water management, environmental sensors, advanced materials, and BCG Economy Model (Bio, Circular, and Green Economy).',
    icon: 'Zap',
    color: '#059669',
    bgImage: '/domain-energy.jpg',
    orderIndex: 4,
  },
  {
    code: 'quality_of_life_soft_power',
    nameTh: 'ด้านคุณภาพชีวิต และ Soft Power',
    nameEn: 'Quality of Life & Soft Power',
    descriptionTh:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์และการสร้างมูลค่าจากการออกแบบ ความคิดสร้างสรรค์ ศิลปะ วัฒนธรรม และภูมิปัญญาท้องถิ่น เช่น การออกแบบสถาปัตยกรรม ออกแบบภายใน การออกแบบผลิตภัณฑ์หรือบรรจุภัณฑ์ การออกแบบเครื่องแต่งกาย ออกแบบเครื่องประดับ สื่อมัลติมีเดีย สื่อการเรียนการสอนและสื่อการเรียนรู้ การออกแบบศิลปะ การแสดง และงานศิลป์อื่น ๆ ธุรกิจไลฟ์สไตล์ (Lifestyle Business) เทคโนโลยีการท่องเที่ยว (Traveltech) รูปแบบการท่องเที่ยว การเพิ่มประสิทธิภาพการบริการ (Service Enhancing) โดยเฉพาะผลงานที่ทำให้เกิดผลผลิตที่เป็นนวัตกรรมที่เกี่ยวข้องกับอุตสาหกรรมสร้างสรรค์ 11 สาขา (อาหาร กีฬา งานเทศกาล ท่องเที่ยว ดนตรี หนังสือ ภาพยนตร์ เกม ศิลปะ การออกแบบ และแฟชั่น) ซึ่งจะนำไปสู่การพัฒนา Soft Power',
    descriptionEn:
      'Value-creating innovations from design, creativity, arts, culture, local wisdom, architecture, product/fashion design, multimedia, Traveltech, service enhancement, and the 11 creative industries driving Soft Power.',
    icon: 'Sparkles',
    color: '#D97706',
    bgImage: '/domain-softpower.jpg',
    orderIndex: 5,
  },
];

export const CATEGORIES_2569_LEGACY: CategorySeedSpec[] = [
  {
    code: 'energy_environment',
    nameTh: 'Energy & Environment (พลังงานและสิ่งแวดล้อม)',
    nameEn: 'Energy & Environment',
    descriptionTh:
      'นวัตกรรมด้านพลังงานทดแทน การจัดการสิ่งแวดล้อม เทคโนโลยีสีเขียว และการลดการปล่อยคาร์บอน',
    descriptionEn:
      'Renewable energy, environmental management, green technology, and carbon reduction innovations.',
    icon: 'Zap',
    color: '#059669',
    bgImage: '/domain-energy.jpg',
    orderIndex: 1,
  },
  {
    code: 'food_agriculture',
    nameTh: 'Food & Agriculture (เกษตรและอาหารแปรรูป)',
    nameEn: 'Food & Agriculture',
    descriptionTh:
      'นวัตกรรมเกษตรอัจฉริยะ (AgriTech) อาหารแห่งอนาคต การแปรรูปผลิตผล และความมั่นคงทางอาหาร',
    descriptionEn:
      'Smart agricultural technology (AgriTech), future food, food processing, and food security.',
    icon: 'Leaf',
    color: '#16A34A',
    bgImage: '/domain-food.jpg',
    orderIndex: 2,
  },
  {
    code: 'social_economy',
    nameTh: 'Social & Economy (เศรษฐกิจและสังคมดิจิทัล)',
    nameEn: 'Social & Economy',
    descriptionTh:
      'นวัตกรรมเพื่อการพัฒนาสังคม เศรษฐกิจดิจิทัล เทคโนโลยีการศึกษา และการยกระดับคุณภาพชีวิตชุมชน',
    descriptionEn:
      'Digital economy, educational technology, social development, and community quality of life enhancement.',
    icon: 'Users',
    color: '#06B6D4',
    bgImage: '/domain-social.jpg',
    orderIndex: 3,
  },
  {
    code: 'medical_device',
    nameTh: 'Medical Device (เครื่องมือแพทย์และสาธารณสุข)',
    nameEn: 'Medical Device',
    descriptionTh:
      'อุปกรณ์และเครื่องมือทางการแพทย์ เทคโนโลยีสุขภาพ (HealthTech) ชีวการแพทย์ และอุปกรณ์ช่วยดูแลสุขภาพ',
    descriptionEn:
      'Medical devices, healthcare technology (HealthTech), biomedical engineering, and assistive health tools.',
    icon: 'Activity',
    color: '#E11D48',
    bgImage: '/domain-medical.jpg',
    orderIndex: 4,
  },
  {
    code: 'material',
    nameTh: 'Material (วัสดุศาสตร์และเทคโนโลยีก้าวหน้า)',
    nameEn: 'Material',
    descriptionTh:
      'นวัตกรรมด้านวัสดุศาสตร์ คอมโพสิต โพลีเมอร์ สารเคลือบผิว นาโนเทคโนโลยี และวัสดุก้าวหน้า',
    descriptionEn:
      'Materials science, composites, polymers, functional coatings, nanotechnology, and advanced materials.',
    icon: 'Box',
    color: '#D97706',
    bgImage: '/domain-material.jpg',
    orderIndex: 5,
  },
];

export function formatLevelPrizeSummaryLine(level: {
  prizeBreakdown?: unknown;
  trophyShortTh?: string;
  totalPrizeAmount?: number;
}): string {
  const trophy = (level.trophyShortTh || KMUTNB_TROPHY_SHORT_TH).trim();
  const rawItems = Array.isArray(level.prizeBreakdown) ? level.prizeBreakdown : [];

  if (rawItems.length > 0) {
    return rawItems
      .map((raw) => {
        const item = raw as Partial<PrizeBreakdownItem>;
        const labelTh = String(item.labelTh || 'รางวัล').trim();
        const count = Number(item.count) > 0 ? Number(item.count) : 1;
        const amountEach = Number(item.amountEach) >= 0 ? Number(item.amountEach) : 0;
        const totalAmount =
          Number(item.totalAmount) > 0 ? Number(item.totalAmount) : count * amountEach;
        const defaultHonor =
          item.tier === 'GRAND_WINNER' ? `${trophy} + เกียรติบัตร` : 'เกียรติบัตร';
        const honorTextTh = String(item.honorTextTh || defaultHonor).trim();

        if (count > 1) {
          return `${labelTh} (${count} รางวัล) รางวัลละ ${amountEach.toLocaleString('en-US')} บาท (รวม ${totalAmount.toLocaleString('en-US')} บาท) + ${honorTextTh}`;
        }
        return `${labelTh} (${count} รางวัล) ${amountEach.toLocaleString('en-US')} บาท + ${honorTextTh}`;
      })
      .join(' | ');
  }

  if (typeof level.totalPrizeAmount === 'number' && level.totalPrizeAmount > 0) {
    return `ชนะเลิศ ${trophy} พร้อมเกียรติบัตร และเงินรางวัลรวม ${level.totalPrizeAmount.toLocaleString('en-US')} บาท`;
  }
  return `ชนะเลิศ ${trophy} พร้อมเกียรติบัตร`;
}
