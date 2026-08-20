import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

// Mock Database Storage
interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  institution: string;
  educationLevel: 'below_higher' | 'higher_and_above';
  role: 'contestant' | 'judge' | 'admin';
  createdAt: string;
}

interface Submission {
  id: string;
  trackingCode: string;
  userId: string;
  titleTh: string;
  titleEn: string;
  category: 'energy_environment' | 'food_agriculture' | 'social_economy' | 'medical_device' | 'material';
  educationLevel: 'below_higher' | 'higher_and_above';
  teamName: string;
  advisorName?: string;
  members: string[];
  abstractTh: string;
  abstractEn: string;
  videoUrl?: string;
  documentUrl?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'passed_first_round' | 'finalist' | 'awarded';
  year?: number | string;
  institution?: string;
  awardTier?: string;
  awardNameTh?: string;
  awardNameEn?: string;
  awardBadgeText?: string;
  prizeDetails?: string;
  image?: string;
  feedback?: string;
  submittedAt?: string;
  updatedAt: string;
}

// In-Memory Collections
const users = new Map<string, User>();
const submissions = new Map<string, Submission>();

// Initial Seed Data: ผลการตัดสินรางวัล KMUTNB Innovation Awards (ปี 2568, 2567, 2566)
const winnersSeed: Submission[] = [
  // --- ปี 2568 (2025) ---
  {
    id: 'sub-2025-01',
    trackingCode: 'KMUTNB-2568-0001',
    userId: 'user-winner-1',
    year: 2568,
    awardTier: 'grand_winner',
    awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
    awardNameEn: 'Grand Prize - Royal Trophy',
    awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
    prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมโล่รางวัล เกียรติบัตร และเงินรางวัล 40,000 บาท',
    titleTh: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก',
    titleEn: '3D-Printed Titanium Coated with Bioactive Hyaluronic Acid Hydrogel for Orthopedic Applications',
    category: 'medical_device',
    educationLevel: 'higher_and_above',
    teamName: 'OsseBioMix',
    institution: 'คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'คณะวิทยาศาสตร์ประยุกต์ มจพ.',
    members: ['ทีม OsseBioMix'],
    abstractTh: 'นวัตกรรมวัสดุการแพทย์ขั้นสูง ไทเทเนียมที่ผ่านกระบวนการพิมพ์ 3 มิติร่วมกับการเคลือบไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ ช่วยเร่งการยึดติดของเซลล์กระดูกและลดการอักเสบติดเชื้อสำหรับการผ่าตัดทางศัลยกรรมกระดูก',
    abstractEn: 'Advanced biomedical implant utilizing 3D-printed titanium coated with bioactive hyaluronic acid hydrogel to enhance osseointegration and reduce infection risks.',
    status: 'awarded',
    image: '/photo_candidates/science_lab.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2025-05-10T10:00:00Z',
    updatedAt: '2025-06-26T14:30:00Z'
  },
  {
    id: 'sub-2025-02',
    trackingCode: 'KMUTNB-2568-0002',
    userId: 'user-winner-2',
    year: 2568,
    awardTier: 'runner_up_1',
    awardNameTh: 'รางวัลรองชนะเลิศอันดับ 1',
    awardNameEn: '1st Runner-Up',
    awardBadgeText: 'รองชนะเลิศอันดับ 1 • ถ้วยคิดเป็น ทำเป็น',
    prizeDetails: 'ได้รับถ้วยรางวัล "คิดเป็น ทำเป็น" พร้อมเกียรติบัตร และเงินรางวัล 30,000 บาท',
    titleTh: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion',
    titleEn: 'Automatic HDPE Pipe Butt Fusion Welding Controller and Data Logger',
    category: 'energy_environment',
    educationLevel: 'higher_and_above',
    teamName: 'เขาชื่ออะไร',
    institution: 'คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'คณะครุศาสตร์อุตสาหกรรม มจพ.',
    members: ['ทีม เขาชื่ออะไร'],
    abstractTh: 'อุปกรณ์ควบคุมและบันทึกข้อมูลการเชื่อมท่อพอลิเอทิลีนความหนาแน่นสูง (HDPE) แบบหลอมชนอัตโนมัติ เพื่อเพิ่มความแม่นยำ มาตรฐานความปลอดภัย และตรวจสอบย้อนกลับของคุณภาพแนวเชื่อมในงานวิศวกรรมระบบท่อ',
    abstractEn: 'An automated control and logging system for HDPE butt fusion pipe welding to enhance engineering accuracy, safety, and traceability.',
    status: 'awarded',
    image: '/photo_candidates/robotics_engineer.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2025-05-12T09:15:00Z',
    updatedAt: '2025-06-26T15:00:00Z'
  },
  {
    id: 'sub-2025-03',
    trackingCode: 'KMUTNB-2568-0003',
    userId: 'user-winner-3',
    year: 2568,
    awardTier: 'runner_up_2',
    awardNameTh: 'รางวัลรองชนะเลิศอันดับ 2',
    awardNameEn: '2nd Runner-Up',
    awardBadgeText: 'รองชนะเลิศอันดับ 2 • ถ้วยคิดเป็น ทำเป็น',
    prizeDetails: 'ได้รับถ้วยรางวัล "คิดเป็น ทำเป็น" พร้อมเกียรติบัตร และเงินรางวัล 20,000 บาท',
    titleTh: 'Growell: สารจับใบชีวภาพเพื่อเพิ่มประสิทธิภาพการใช้สารทางเกษตร',
    titleEn: 'Growell: Bio-Adjuvant for Agricultural Spraying Efficiency Enhancement',
    category: 'food_agriculture',
    educationLevel: 'higher_and_above',
    teamName: 'Lucyne Innovia Lab',
    institution: 'มหาวิทยาลัยเกษตรศาสตร์',
    advisorName: 'มหาวิทยาลัยเกษตรศาสตร์',
    members: ['ทีม Lucyne Innovia Lab'],
    abstractTh: 'นวัตกรรมสารเสริมประสิทธิภาพการฉีดพ่นทางการเกษตร (Bio-adjuvant) จากสารสกัดชีวภาพ ช่วยเพิ่มการกระจายตัว ยึดเกาะ และการดูดซึมสารอาหารบนใบพืช ลดการชะล้างและเป็นมิตรต่อสิ่งแวดล้อม',
    abstractEn: 'Bio-based agricultural spraying adjuvant formulated to enhance droplet spreading, retention, and nutrient absorption on plant foliage while reducing chemical runoff.',
    status: 'awarded',
    image: '/domain-food.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2025-05-14T11:00:00Z',
    updatedAt: '2025-06-26T15:30:00Z'
  },
  {
    id: 'sub-2025-04',
    trackingCode: 'KMUTNB-2568-0004',
    userId: 'user-winner-4',
    year: 2568,
    awardTier: 'honorable_mention',
    awardNameTh: 'รางวัลชมเชย',
    awardNameEn: 'Honorable Mention',
    awardBadgeText: 'รางวัลชมเชย',
    prizeDetails: 'ได้รับโล่รางวัล เกียรติบัตร และเงินรางวัล 5,000 บาท',
    titleTh: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ความเสียหายและประมาณการค่าซ่อมถนนคอนกรีต',
    titleEn: 'Vehicle-Mounted AI Vision System and Web Application for Concrete Road Damage Detection and Repair Cost Estimation',
    category: 'social_economy',
    educationLevel: 'below_higher',
    teamName: 'ROAD AI',
    institution: 'โรงเรียนวารีเชียงใหม่',
    advisorName: 'โรงเรียนวารีเชียงใหม่',
    members: ['ทีม ROAD AI'],
    abstractTh: 'ระบบตรวจจับและประเมินสภาพความเสียหายของพื้นผิวถนนคอนกรีตแบบอัตโนมัติด้วยกล้องติดยานพาหนะร่วมกับโมเดล Deep Learning พร้อมเว็บแอปพลิเคชันประมาณการงบประมาณค่าซ่อมบำรุงแบบเรียลไทม์',
    abstractEn: 'Vehicle-mounted computer vision system integrated with deep learning models and a web platform for automated road crack detection and real-time maintenance cost budgeting.',
    status: 'awarded',
    image: '/photo_candidates/young_team_workshop.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2025-05-15T08:30:00Z',
    updatedAt: '2025-06-26T16:00:00Z'
  },
  {
    id: 'sub-2025-05',
    trackingCode: 'KMUTNB-2568-0005',
    userId: 'user-winner-5',
    year: 2568,
    awardTier: 'honorable_mention',
    awardNameTh: 'รางวัลชมเชย',
    awardNameEn: 'Honorable Mention',
    awardBadgeText: 'รางวัลชมเชย',
    prizeDetails: 'ได้รับโล่รางวัล เกียรติบัตร และเงินรางวัล 5,000 บาท',
    titleTh: 'แผ่นรองหลังแนวเชื่อมจีโอโพลิเมอร์ทนความร้อนสูงจากวัสดุเหลือทิ้งอุตสาหกรรม',
    titleEn: 'High-Temperature Resistant Geopolymer Backing Ceramic for Welding from Industrial By-products',
    category: 'material',
    educationLevel: 'higher_and_above',
    teamName: 'GeoWeld',
    institution: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มจพ.',
    members: ['ทีม GeoWeld'],
    abstractTh: 'นวัตกรรมแผ่นรองหลังแนวเชื่อมทนความร้อนสูงที่พัฒนาจากเถ้าลอยและกากของเสียอุตสาหกรรมด้วยกระบวนการจีโอโพลิเมอร์ ช่วยลดต้นทุนการนำเข้าวัสดุทนไฟจากต่างประเทศ และส่งเสริมเศรษฐกิจหมุนเวียน (Circular Economy)',
    abstractEn: 'Eco-friendly high-temperature resistant welding backing material developed from industrial fly ash via geopolymerization to substitute imported ceramic backings.',
    status: 'awarded',
    image: '/domain-material.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2025-05-15T10:20:00Z',
    updatedAt: '2025-06-26T16:15:00Z'
  },
  {
    id: 'sub-2025-06',
    trackingCode: 'KMUTNB-2568-0006',
    userId: 'user-winner-6',
    year: 2568,
    awardTier: 'honorable_mention',
    awardNameTh: 'รางวัลชมเชย',
    awardNameEn: 'Honorable Mention',
    awardBadgeText: 'รางวัลชมเชย',
    prizeDetails: 'ได้รับโล่รางวัล เกียรติบัตร และเงินรางวัล 5,000 บาท',
    titleTh: 'ระบบการตรวจคัดกรองโรคมะเร็งตับผ่านการวิเคราะห์สารประกอบอินทรีย์ระเหยง่ายในลมหายใจด้วยระบบปัญญาประดิษฐ์',
    titleEn: 'AI-Powered Non-Invasive Liver Cancer Screening System via Breath Volatile Organic Compounds (VOCs) Analysis',
    category: 'medical_device',
    educationLevel: 'below_higher',
    teamName: 'CLARA',
    institution: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
    advisorName: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
    members: ['ทีม CLARA'],
    abstractTh: 'เครื่องตรวจคัดกรองความเสี่ยงโรคมะเร็งตับเบื้องต้นแบบไม่เจ็บตัว (Non-invasive) โดยการตรวจจับและวิเคราะห์รูปแบบของสารประกอบอินทรีย์ระเหยง่าย (VOCs) ในลมหายใจด้วยเซนเซอร์และอัลกอริทึม AI ที่แม่นยำสูง',
    abstractEn: 'Non-invasive breathalyzer screening device for early-stage liver cancer detection utilizing metal-oxide gas sensor array and machine learning VOC pattern recognition.',
    status: 'awarded',
    image: '/photo_candidates/tech_creators.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2025-05-15T14:45:00Z',
    updatedAt: '2025-06-26T16:30:00Z'
  },

  // --- ปี 2567 (2024) ---
  {
    id: 'sub-2024-01',
    trackingCode: 'KMUTNB-2567-0001',
    userId: 'user-winner-2024-1',
    year: 2567,
    awardTier: 'grand_winner',
    awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
    awardNameEn: 'Grand Prize - Royal Trophy',
    awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
    prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมโล่รางวัล เกียรติบัตร และเงินรางวัล 40,000 บาท',
    titleTh: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI สำหรับพื้นที่ภัยพิบัติขั้นวิกฤต',
    titleEn: 'Autonomous AI-Powered Rescue & Search Robot for Extreme Disaster Zones',
    category: 'energy_environment',
    educationLevel: 'higher_and_above',
    teamName: 'KMUTNB Robotics Lab',
    institution: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'คณะวิศวกรรมศาสตร์ มจพ.',
    members: ['ทีม KMUTNB Robotics Lab'],
    abstractTh: 'หุ่นยนต์กู้ภัยที่สามารถเคลื่อนที่ในพื้นที่ซากปรักหักพัง มีระบบตรวจจับสัญญาณชีพด้วยอินฟราเรดและ AI คอมพิวเตอร์วิสัยทัศน์ พร้อมสร้างแผนที่ 3 มิติแบบเรียลไทม์',
    abstractEn: 'High-mobility rescue robot equipped with infrared vital sign sensors and AI mapping technology for hazardous disaster response.',
    status: 'awarded',
    image: '/winner-robot.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2024-05-10T10:00:00Z',
    updatedAt: '2024-06-28T14:30:00Z'
  },

  // --- ปี 2566 (2023) ---
  {
    id: 'sub-2023-01',
    trackingCode: 'KMUTNB-2566-0001',
    userId: 'user-winner-2023-1',
    year: 2566,
    awardTier: 'grand_winner',
    awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
    awardNameEn: 'Grand Prize - Royal Trophy',
    awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
    prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมโล่รางวัล เกียรติบัตร และเงินรางวัล 40,000 บาท',
    titleTh: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส',
    titleEn: 'Bio-Nanocellulose Enhanced Rice Straw Sustainable Packaging',
    category: 'food_agriculture',
    educationLevel: 'below_higher',
    teamName: 'EcoInno High School Team',
    institution: 'โรงเรียนสาธิต มจพ.',
    advisorName: 'อาจารย์ที่ปรึกษา สาธิต มจพ.',
    members: ['ทีม EcoInno'],
    abstractTh: 'แนวคิดการแปรรูปเศษวัสดุเหลือทิ้งทางการเกษตรเป็นบรรจุภัณฑ์ทนความร้อน ทนน้ำ และย่อยสลายได้ในธรรมชาติภายใน 45 วัน เพื่อทดแทนพลาสติก',
    abstractEn: 'Innovative eco-friendly biodegradable packaging synthesized from agricultural rice straw waste.',
    status: 'awarded',
    image: '/winner-eco.jpg',
    videoUrl: 'https://youtube.com',
    submittedAt: '2023-05-12T09:15:00Z',
    updatedAt: '2023-06-25T15:00:00Z'
  }
];

winnersSeed.forEach(w => submissions.set(w.id, w));

// Elysia Application Setup
const app = new Elysia()
  .use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'KMUTNB Innovation Awards 2026 API',
        version: '1.0.0',
        description: 'Elysia.js Backend API for KMUTNB Innovation Awards 2026 Web Platform'
      }
    }
  }))
  
  // Healthcheck & Config
  .get('/api/health', () => ({
    status: 'ok',
    service: 'KMUTNB Innovation Awards 2026 API Engine',
    timestamp: new Date().toISOString(),
    engine: 'Elysia.js on Bun'
  }))
  
  .get('/api/config', () => ({
    event: {
      nameTh: 'โครงการประกวดสิ่งประดิษฐ์ และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569',
      nameEn: 'KMUTNB Innovation Awards 2026',
      grandPrize: 'ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
      eventDate: '2026-06-26T08:30:00Z',
      submissionDeadline: '2026-05-15T23:59:59Z',
      organizer: 'อุทยานเทคโนโลยี มจพ.'
    },
    categories: [
      {
        id: 'energy_environment',
        nameTh: 'Energy & Environment',
        nameEn: 'Energy & Environment',
        descriptionTh: 'นวัตกรรมด้านพลังงานทดแทน การจัดการสิ่งแวดล้อม เทคโนโลยีสีเขียว และการลดคาร์บอน',
        icon: 'Zap'
      },
      {
        id: 'food_agriculture',
        nameTh: 'Food & Agriculture',
        nameEn: 'Food & Agriculture',
        descriptionTh: 'นวัตกรรมเกษตรอัจฉริยะ อาหารแห่งอนาคต การแปรรูปผลิตผล และความมั่นคงทางอาหาร',
        icon: 'Leaf'
      },
      {
        id: 'social_economy',
        nameTh: 'Social & Economy',
        nameEn: 'Social & Economy',
        descriptionTh: 'นวัตกรรมเพื่อการพัฒนาสังคม เศรษฐกิจดิจิทัล เทคโนโลยีการศึกษา และคุณภาพชีวิตชุมชน',
        icon: 'Users'
      },
      {
        id: 'medical_device',
        nameTh: 'Medical Device',
        nameEn: 'Medical Device',
        descriptionTh: 'อุปกรณ์และเครื่องมือทางการแพทย์ เทคโนโลยีสุขภาพ (HealthTech) และชีวการแพทย์',
        icon: 'Activity'
      },
      {
        id: 'material',
        nameTh: 'Material',
        nameEn: 'Material',
        descriptionTh: 'นวัตกรรมด้านวัสดุศาสตร์ วัสดุคอมโพสิต โพลีเมอร์ นาโนเทคโนโลยี และวัสดุก้าวหน้า',
        icon: 'Box'
      }
    ],
    educationLevels: [
      {
        id: 'below_higher',
        nameTh: 'ระดับต่ำกว่าอุดมศึกษา',
        nameEn: 'Below Higher Education',
        eligible: 'นักเรียนระดับมัธยมศึกษา, ปวช., ปวส. หรือเทียบเท่า'
      },
      {
        id: 'higher_and_above',
        nameTh: 'ระดับตั้งแต่อุดมศึกษาขึ้นไป',
        nameEn: 'Higher Education & Above',
        eligible: 'นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, ผู้ประกอบการ และประชาชนทั่วไป'
      }
    ],
    prizes: [
      { rank: 'Grand Prize', title: 'ถ้วยพระราชทานฯ + เงินรางวัล 100,000 บาท + เกียรติบัตร' },
      { rank: 'ระดับอุดมศึกษาขึ้นไป', title: 'เงินรางวัลชนะเลิศแต่ละหมวด 30,000 - 50,000 บาท + โล่รางวัล + เกียรติบัตร' },
      { rank: 'ระดับต่ำกว่าอุดมศึกษา', title: 'เงินรางวัลชนะเลิศแต่ละหมวด 20,000 - 30,000 บาท + โล่รางวัล + เกียรติบัตร' }
    ]
  }))

  // Public Winners Gallery (Hall of Fame)
  .get('/api/winners', ({ query }) => {
    const category = query.category;
    const level = query.level;
    const year = query.year;

    let result = Array.from(submissions.values()).filter(s => s.status === 'awarded');

    if (year && year !== 'all') {
      result = result.filter(s => String(s.year) === String(year));
    }
    if (category && category !== 'all') {
      result = result.filter(s => s.category === category);
    }
    if (level && level !== 'all') {
      result = result.filter(s => s.educationLevel === level);
    }

    return {
      success: true,
      data: result
    };
  })

  // Quick Status Check by Tracking Code
  .get('/api/submissions/status/:trackingCode', ({ params, set }) => {
    const code = params.trackingCode.toUpperCase().trim();
    const found = Array.from(submissions.values()).find(s => s.trackingCode === code);

    if (!found) {
      set.status = 404;
      return {
        success: false,
        message: 'ไม่พบรหัสติดตามผลงานนี้ในระบบ โปรดตรวจสอบรหัส KMUTNB-XXXX-XXXX อีกครั้ง'
      };
    }

    return {
      success: true,
      data: {
        trackingCode: found.trackingCode,
        titleTh: found.titleTh,
        titleEn: found.titleEn,
        category: found.category,
        educationLevel: found.educationLevel,
        teamName: found.teamName,
        status: found.status,
        submittedAt: found.submittedAt,
        updatedAt: found.updatedAt,
        feedback: found.feedback || 'เอกสารเรียบร้อย อยู่ระหว่างการพิจารณาจากคณะกรรมการ'
      }
    };
  })

  // Authentication API
  .post('/api/auth/register', ({ body, set }) => {
    const { email, password, fullName, phone, institution, educationLevel } = body as any;

    if (!email || !fullName) {
      set.status = 400;
      return { success: false, message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' };
    }

    const existing = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      set.status = 400;
      return { success: false, message: 'อีเมลนี้มีอยู่ในระบบแล้ว โปรดเข้าสู่ระบบ' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      phone: phone || '',
      institution: institution || 'มจพ. / KMUTNB',
      educationLevel: educationLevel || 'higher_and_above',
      role: 'contestant',
      createdAt: new Date().toISOString()
    };

    users.set(newUser.id, newUser);

    return {
      success: true,
      message: 'ลงทะเบียนสำเร็จเข้าสู่ระบบเรียบร้อย',
      token: `token-mock-${newUser.id}`,
      user: newUser
    };
  })

  .post('/api/auth/login', ({ body, set }) => {
    const { email } = body as any;

    let user = Array.from(users.values()).find(u => u.email.toLowerCase() === email?.toLowerCase());
    
    // Auto demo account creator if email not found for seamless testing
    if (!user && email) {
      user = {
        id: `user-demo-${Date.now()}`,
        email,
        fullName: 'นักนวัตกรรม พระจอมเกล้าฯ',
        phone: '081-234-5678',
        institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
        educationLevel: 'higher_and_above',
        role: 'contestant',
        createdAt: new Date().toISOString()
      };
      users.set(user.id, user);
    }

    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: `token-mock-${user?.id}`,
      user
    };
  })

  // Submissions Management (Create / Update / Draft)
  .post('/api/submissions', ({ body, set }) => {
    const payload = body as any;
    
    if (!payload.titleTh || !payload.category || !payload.educationLevel) {
      set.status = 400;
      return { success: false, message: 'กรุณากรอกชื่อผลงาน หมวดหมู่การแข่งขัน และระดับการศึกษา' };
    }

    const isDraft = payload.isDraft === true;
    const randomCodeNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = payload.id ? (submissions.get(payload.id)?.trackingCode || `KMUTNB-2026-${randomCodeNum}`) : `KMUTNB-2026-${randomCodeNum}`;
    
    const subId = payload.id || `sub-${Date.now()}`;
    const newSubmission: Submission = {
      id: subId,
      trackingCode,
      userId: payload.userId || 'user-demo-1',
      titleTh: payload.titleTh,
      titleEn: payload.titleEn || '',
      category: payload.category,
      educationLevel: payload.educationLevel,
      teamName: payload.teamName || 'ทีมสร้างสรรค์นวัตกรรม',
      advisorName: payload.advisorName || '',
      members: Array.isArray(payload.members) ? payload.members : [payload.authorName || 'หัวหน้าทีม'],
      abstractTh: payload.abstractTh || '',
      abstractEn: payload.abstractEn || '',
      videoUrl: payload.videoUrl || '',
      documentUrl: payload.documentUrl || '',
      status: isDraft ? 'draft' : 'submitted',
      submittedAt: isDraft ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      feedback: isDraft ? 'ฉบับร่าง (ยังไม่ได้ส่งผลงานฉบับสมบูรณ์)' : 'ยื่นผลงานเรียบร้อยแล้ว อยู่ระหว่างตรวจสอบเอกสาร'
    };

    submissions.set(newSubmission.id, newSubmission);

    return {
      success: true,
      message: isDraft ? 'บันทึกร่างผลงานเรียบร้อยแล้ว' : 'ส่งผลงานเข้าประกวดสำเร็จเรียบร้อย!',
      data: newSubmission
    };
  })

  // Downloads & Timeline Info
  .get('/api/news', () => ({
    success: true,
    data: [
      {
        id: 'news-1',
        title: 'เปิดรับสมัครผลงานสิ่งประดิษฐ์และนวัตกรรม KMUTNB Innovation Awards 2026',
        date: '10 มีนาคม 2569',
        category: 'ประกาศรับสมัคร',
        summary: 'ขอเชิญนักเรียน นักศึกษา อาจารย์ นักวิจัย และบุคคลทั่วไป ส่งผลงานชิงถ้วยพระราชทานฯ และเงินรางวัลรวมกว่า 300,000 บาท'
      },
      {
        id: 'news-2',
        title: 'กำหนดการจัดงานพิธีมอบรางวัล ณ อาคารอุทยานเทคโนโลยี มจพ.',
        date: '26 มิถุนายน 2569',
        category: 'กำหนดการ',
        summary: 'ขอเชิญผู้ผ่านเข้ารอบสุดท้ายร่วมแสดงผลงาน Pitching และจัดแสดงนิทรรศการนวัตกรรม'
      }
    ]
  }))

  .listen(3001);

console.log(`🚀 KMUTNB Innovation Awards 2026 Elysia API Server is running at http://${app.server?.hostname}:${app.server?.port}`);
