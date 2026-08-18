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
  feedback?: string;
  submittedAt?: string;
  updatedAt: string;
}

// In-Memory Collections
const users = new Map<string, User>();
const submissions = new Map<string, Submission>();

// Initial Seed Data (5 Domains)
const sampleWinner1: Submission = {
  id: 'sub-2025-01',
  trackingCode: 'KMUTNB-2025-8821',
  userId: 'user-winner-1',
  titleTh: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI สำหรับพื้นที่ภัยพิบัติ',
  titleEn: 'AI-Powered Disaster Rescue & Reconnaissance Robot',
  category: 'medical_device',
  educationLevel: 'higher_and_above',
  teamName: 'KMUTNB Robotics Lab',
  advisorName: 'รศ.ดร.สมชาย นวัตกรรม',
  members: ['นายพิพัทธ์ พัฒนาชัย', 'นางสาวณิชา เทคโนโลยี'],
  abstractTh: 'หุ่นยนต์กู้ภัยที่สามารถลุยพื้นที่เสี่ยงภัยพิบัติ มีระบบตรวจจับสัญญาณชีพด้วยเซ็นเซอร์อินฟราเรดและ AI คอมพิวเตอร์วิสัยทัศน์ พร้อมสร้างแผนที่ 3 มิติแบบ Real-time',
  abstractEn: 'An autonomous rescue robot equipped with vital sign detection infrared sensors, AI computer vision, and real-time 3D SLAM mapping for hazardous environments.',
  status: 'awarded',
  videoUrl: 'https://youtube.com/watch?v=rescue-robot-demo',
  documentUrl: 'https://kmutnb-innoaward.com/docs/2025/winner-robotics.pdf',
  submittedAt: '2025-05-10T10:00:00Z',
  updatedAt: '2025-06-26T14:30:00Z'
};

const sampleWinner2: Submission = {
  id: 'sub-2025-02',
  trackingCode: 'KMUTNB-2025-4109',
  userId: 'user-winner-2',
  titleTh: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส',
  titleEn: 'Bio-Nanocellulose Enhanced Rice Straw Sustainable Packaging',
  category: 'food_agriculture',
  educationLevel: 'below_higher',
  teamName: 'EcoInno High School Team',
  advisorName: 'อาจารย์อารีลักษณ์ ปัญญาดี',
  members: ['นายธนกฤต รักษ์โลก', 'นายกิตติภูมิ นวัตกรรม'],
  abstractTh: 'แนวคิดการแปรรูปเศษวัสดุเหลือทิ้งทางการเกษตรเป็นบรรจุภัณฑ์ทนความร้อน ทนน้ำ และย่อยสลายได้ในธรรมชาติภายใน 45 วัน เพื่อแทนที่พลาสติก',
  abstractEn: 'Innovative bio-packaging solution transforming agricultural waste into heat-resistant, waterproof, 100% biodegradable food containers.',
  status: 'awarded',
  videoUrl: 'https://youtube.com/watch?v=eco-packaging-demo',
  documentUrl: 'https://kmutnb-innoaward.com/docs/2025/winner-ecoinno.pdf',
  submittedAt: '2025-05-12T09:15:00Z',
  updatedAt: '2025-06-26T15:00:00Z'
};

submissions.set(sampleWinner1.id, sampleWinner1);
submissions.set(sampleWinner2.id, sampleWinner2);

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
      organizer: 'สำนักวิจัยวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (KMUTNB Techno Park)'
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

    let result = Array.from(submissions.values()).filter(s => s.status === 'awarded');

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