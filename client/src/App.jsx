import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Award, Rocket, Search, CheckCircle2,
  FileText, Download, UserCheck, ShieldCheck, ChevronRight, 
  ExternalLink, X, LogIn, UserPlus, Send, Save,
  BookOpen, Layers, Calendar, MapPin, Phone, Mail, Globe,
  Zap, Leaf, Users, Activity, Box, GraduationCap, Building2, ArrowRight,
  CheckCircle, User, Video, ClipboardList, CheckSquare,
  BarChart3, FileCheck, Bell, Megaphone, Crown, Medal, Eye, Menu,
  Volume2, VolumeX
} from 'lucide-react';

// Official Brand Logos (Direct Official Image Assets)
const FacebookLogo = ({ size = 24, className = "" }) => (
  <img 
    src="/facebook.svg" 
    alt="Facebook" 
    width={size} 
    height={size} 
    className={className}
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      objectFit: 'contain', 
      flexShrink: 0, 
      display: 'inline-block', 
      verticalAlign: 'middle',
      borderRadius: '50%'
    }}
  />
);

const LineLogo = ({ size = 24, className = "" }) => (
  <img 
    src="/line.svg" 
    alt="LINE" 
    width={size} 
    height={size} 
    className={className}
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      objectFit: 'contain', 
      flexShrink: 0, 
      display: 'inline-block', 
      verticalAlign: 'middle',
      borderRadius: '4px'
    }}
  />
);

const API_BASE = 'http://localhost:3001/api';

// Domain Definitions with Custom Background Images
const DOMAINS = [
  {
    id: 'energy_environment',
    nameTh: 'Energy & Environment',
    nameEn: 'Energy & Environment',
    titleTh: 'พลังงานและสิ่งแวดล้อม',
    titleEn: 'Energy & Environment',
    desc: 'นวัตกรรมด้านพลังงานทดแทน การจัดการสิ่งแวดล้อม เทคโนโลยีสีเขียว และการลดการปล่อยคาร์บอน',
    icon: Zap,
    color: '#059669',
    bgImage: '/domain-energy.jpg'
  },
  {
    id: 'food_agriculture',
    nameTh: 'Food & Agriculture',
    nameEn: 'Food & Agriculture',
    titleTh: 'เกษตรและอาหารแปรรูป',
    titleEn: 'Food & Agriculture',
    desc: 'นวัตกรรมเกษตรอัจฉริยะ (AgriTech) อาหารแห่งอนาคต การแปรรูปผลิตผล และความมั่นคงทางอาหาร',
    icon: Leaf,
    color: '#16A34A',
    bgImage: '/domain-food.jpg'
  },
  {
    id: 'social_economy',
    nameTh: 'Social & Economy',
    nameEn: 'Social & Economy',
    titleTh: 'เศรษฐกิจและสังคมดิจิทัล',
    titleEn: 'Social & Economy',
    desc: 'นวัตกรรมเพื่อการพัฒนาสังคม เศรษฐกิจดิจิทัล เทคโนโลยีการศึกษา และการยกระดับคุณภาพชีวิตชุมชน',
    icon: Users,
    color: '#06B6D4',
    bgImage: '/domain-social.jpg'
  },
  {
    id: 'medical_device',
    nameTh: 'Medical Device',
    nameEn: 'Medical Device',
    titleTh: 'เครื่องมือแพทย์และสาธารณสุข',
    titleEn: 'Medical Device',
    desc: 'อุปกรณ์และเครื่องมือทางการแพทย์ เทคโนโลยีสุขภาพ (HealthTech) ชีวการแพทย์ และอุปกรณ์ช่วยดูแลสุขภาพ',
    icon: Activity,
    color: '#E11D48',
    bgImage: '/domain-medical.jpg'
  },
  {
    id: 'material',
    nameTh: 'Material',
    nameEn: 'Material',
    titleTh: 'วัสดุศาสตร์และเทคโนโลยีก้าวหน้า',
    titleEn: 'Material',
    desc: 'นวัตกรรมด้านวัสดุศาสตร์ คอมโพสิต โพลีเมอร์ สารเคลือบผิว นาโนเทคโนโลยี และวัสดุก้าวหน้า',
    icon: Box,
    color: '#D97706',
    bgImage: '/domain-material.jpg'
  }
];

// Project Images for Awarded Works
const WINNER_IMAGES = {
  'sub-2025-01': '/photo_candidates/science_lab.jpg',
  'sub-2025-02': '/photo_candidates/robotics_engineer.jpg',
  'sub-2025-03': '/domain-food.jpg',
  'sub-2025-04': '/photo_candidates/young_team_workshop.jpg',
  'sub-2025-05': '/domain-material.jpg',
  'sub-2025-06': '/photo_candidates/tech_creators.jpg',
  'sub-2024-01': '/winner-robot.jpg',
  'sub-2023-01': '/winner-eco.jpg'
};

// Official Seed / Fallback Data for Hall of Fame Winners
const FALLBACK_WINNERS = [
  // --- ประจำปี 2568 (2025) ---
  {
    id: 'sub-2025-01',
    trackingCode: 'KMUTNB-2568-0001',
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
    abstractTh: 'นวัตกรรมวัสดุการแพทย์ขั้นสูง ไทเทเนียมที่ผ่านกระบวนการพิมพ์ 3 มิติร่วมกับการเคลือบไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ ช่วยเร่งการยึดติดของเซลล์กระดูกและลดการอักเสบติดเชื้อสำหรับการผ่าตัดทางศัลยกรรมกระดูก',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'sub-2025-02',
    trackingCode: 'KMUTNB-2568-0002',
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
    abstractTh: 'อุปกรณ์ควบคุมและบันทึกข้อมูลการเชื่อมท่อพอลิเอทิลีนความหนาแน่นสูง (HDPE) แบบหลอมชนอัตโนมัติ เพื่อเพิ่มความแม่นยำ มาตรฐานความปลอดภัย และตรวจสอบย้อนกลับของคุณภาพแนวเชื่อมในงานวิศวกรรมระบบท่อ',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'sub-2025-03',
    trackingCode: 'KMUTNB-2568-0003',
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
    abstractTh: 'นวัตกรรมสารเสริมประสิทธิภาพการฉีดพ่นทางการเกษตร (Bio-adjuvant) จากสารสกัดชีวภาพ ช่วยเพิ่มการกระจายตัว ยึดเกาะ และการดูดซึมสารอาหารบนใบพืช ลดการชะล้างและเป็นมิตรต่อสิ่งแวดล้อม',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'sub-2025-04',
    trackingCode: 'KMUTNB-2568-0004',
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
    abstractTh: 'ระบบตรวจจับและประเมินสภาพความเสียหายของพื้นผิวถนนคอนกรีตแบบอัตโนมัติด้วยกล้องติดยานพาหนะร่วมกับโมเดล Deep Learning พร้อมเว็บแอปพลิเคชันประมาณการงบประมาณค่าซ่อมบำรุงแบบเรียลไทม์',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'sub-2025-05',
    trackingCode: 'KMUTNB-2568-0005',
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
    abstractTh: 'นวัตกรรมแผ่นรองหลังแนวเชื่อมทนความร้อนสูงที่พัฒนาจากเถ้าลอยและกากของเสียอุตสาหกรรมด้วยกระบวนการจีโอโพลิเมอร์ ช่วยลดต้นทุนการนำเข้าวัสดุทนไฟจากต่างประเทศ และส่งเสริมเศรษฐกิจหมุนเวียน (Circular Economy)',
    videoUrl: 'https://youtube.com'
  },
  {
    id: 'sub-2025-06',
    trackingCode: 'KMUTNB-2568-0006',
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
    abstractTh: 'เครื่องตรวจคัดกรองความเสี่ยงโรคมะเร็งตับเบื้องต้นแบบไม่เจ็บตัว (Non-invasive) โดยการตรวจจับและวิเคราะห์รูปแบบของสารประกอบอินทรีย์ระเหยง่าย (VOCs) ในลมหายใจด้วยเซนเซอร์และอัลกอริทึม AI ที่แม่นยำสูง',
    videoUrl: 'https://youtube.com'
  },

  // --- ประจำปี 2567 (2024) ---
  {
    id: 'sub-2024-01',
    trackingCode: 'KMUTNB-2567-0001',
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
    abstractTh: 'หุ่นยนต์กู้ภัยที่สามารถเคลื่อนที่ในพื้นที่ซากปรักหักพัง มีระบบตรวจจับสัญญาณชีพด้วยอินฟราเรดและ AI คอมพิวเตอร์วิสัยทัศน์ พร้อมสร้างแผนที่ 3 มิติแบบเรียลไทม์',
    videoUrl: 'https://youtube.com'
  },

  // --- ประจำปี 2566 (2023) ---
  {
    id: 'sub-2023-01',
    trackingCode: 'KMUTNB-2566-0001',
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
    abstractTh: 'แนวคิดการแปรรูปเศษวัสดุเหลือทิ้งทางการเกษตรเป็นบรรจุภัณฑ์ทนความร้อน ทนน้ำ และย่อยสลายได้ในธรรมชาติภายใน 45 วัน เพื่อทดแทนพลาสติก',
    videoUrl: 'https://youtube.com'
  }
];

const getCategoryNameTh = (cat) => {
  switch (cat) {
    case 'energy_environment': return 'Energy & Environment';
    case 'food_agriculture': return 'Food & Agriculture';
    case 'social_economy': return 'Social & Economy';
    case 'medical_device': return 'Medical Device';
    case 'material': return 'Material';
    default: return cat || 'General Innovation';
  }
};

const renderAwardBadge = (w) => {
  const tier = w.awardTier || (w.id === 'sub-2025-01' ? 'grand_winner' : (w.id === 'sub-2025-02' ? 'runner_up_1' : (w.id === 'sub-2025-03' ? 'runner_up_2' : 'honorable_mention')));
  if (tier === 'grand_winner') {
    return (
      <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.95), rgba(180, 83, 9, 0.9))', color: '#FEF3C7', border: '1px solid rgba(251, 191, 36, 0.8)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)' }}>
        <Crown className="w-3.5 h-3.5 text-amber-200" />
        <span>{w.awardBadgeText || 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ'}</span>
      </span>
    );
  }
  if (tier === 'runner_up_1') {
    return (
      <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.95), rgba(6, 78, 59, 0.9))', color: '#E0F2FE', border: '1px solid rgba(56, 189, 248, 0.8)' }}>
        <Medal className="w-3.5 h-3.5 text-cyan-200" />
        <span>{w.awardBadgeText || 'รองชนะเลิศอันดับ 1 • ถ้วยคิดเป็น ทำเป็น'}</span>
      </span>
    );
  }
  if (tier === 'runner_up_2') {
    return (
      <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.95), rgba(120, 53, 15, 0.9))', color: '#FEF3C7', border: '1px solid rgba(245, 158, 11, 0.7)' }}>
        <Medal className="w-3.5 h-3.5 text-amber-200" />
        <span>{w.awardBadgeText || 'รองชนะเลิศอันดับ 2 • ถ้วยคิดเป็น ทำเป็น'}</span>
      </span>
    );
  }
  return (
    <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'rgba(6, 78, 59, 0.92)', color: '#A7F3D0', border: '1px solid rgba(52, 211, 153, 0.6)' }}>
      <Award className="w-3.5 h-3.5 text-emerald-300" />
      <span>{w.awardBadgeText || 'รางวัลชมเชย'}</span>
    </span>
  );
};

// Official Announcements Data
const ANNOUNCEMENTS = [
  {
    id: 'ann-2026-01',
    category: 'general',
    badgeText: 'ข่าวสารโครงการ',
    badgeClass: 'announcement-badge-general',
    date: '1 กันยายน 2569',
    title: 'เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2026 ชิงถ้วยพระราชทานฯ',
    abstract: 'ขอเชิญชวนนักเรียน นักศึกษา นักวิจัย และประชาชนทั่วไป ส่งผลงานสิ่งประดิษฐ์และนวัตกรรมเข้าร่วมประกวด 5 สาขาเป้าหมาย ชิงเงินรางวัลรวมกว่า 300,000 บาท หมดเขต 15 พ.ย. 2569',
    pdfUrl: '#',
    roster: []
  },
  {
    id: 'ann-2026-02',
    category: 'finalists',
    badgeText: 'ประกาศผลรอบคัดเลือก',
    badgeClass: 'announcement-badge-finalists',
    date: '10 ธันวาคม 2569 (ตัวอย่างการแสดงผล)',
    title: 'ประกาศรายชื่อผลงานที่ผ่านการคัดเลือกรอบแรก (Finalists) เข้าสู่รอบ Pitching',
    abstract: 'คณะกรรมการผู้ทรงคุณวุฒิได้ดำเนินการประเมินข้อเสนอโครงการและคลิปวิดีโอเรียบร้อยแล้ว ขอแสดงความยินดีกับทีมที่ผ่านการคัดเลือกเข้าสู่รอบสุดท้าย ณ อาคารอุทยานเทคโนโลยี มจพ.',
    pdfUrl: '#',
    roster: [
      { code: 'KMUTNB-2026-8821', title: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI', team: 'KMUTNB Robotics Lab', level: 'ตั้งแต่อุดมศึกษาขึ้นไป' },
      { code: 'KMUTNB-2026-4109', title: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส', team: 'EcoInno Team', level: 'ต่ำกว่าอุดมศึกษา' },
      { code: 'KMUTNB-2026-5502', title: 'ระบบตรวจวัดการเจริญเติบโตพืชไฮโดรโปนิกส์ด้วย IoT', team: 'AgriSmart High Team', level: 'ต่ำกว่าอุดมศึกษา' }
    ]
  },
  {
    id: 'ann-2025-01',
    category: 'winners',
    badgeText: 'ประกาศผลรางวัลชนะเลิศ',
    badgeClass: 'announcement-badge-winners',
    date: '26 มกราคม 2568',
    title: 'ประกาศผลการตัดสินรางวัลชนะเลิศ KMUTNB Innovation Awards 2568 ครองถ้วยพระราชทานฯ',
    abstract: 'สรุปรายชื่อผลงานที่ได้รับรางวัลชนะเลิศ Grand Prize ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี และรางวัลตามระดับการศึกษา ประจำปี 2568',
    pdfUrl: '#',
    roster: [
      { code: 'KMUTNB-2025-8821', title: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI สำหรับพื้นที่ภัยพิบัติ', team: 'KMUTNB Robotics Lab', level: 'Grand Prize ชนะเลิศอุดมศึกษา' },
      { code: 'KMUTNB-2025-4109', title: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส', team: 'EcoInno High School Team', level: 'ชนะเลิศระดับต่ำกว่าอุดมศึกษา' }
    ]
  }
];

// Target deadline: 15 พฤศจิกายน 2569 เวลา 23:59:59 น.
const TARGET_DEADLINE = new Date('2026-11-15T23:59:59+07:00').getTime();

export default function App() {
  // Navigation & View Routing State
  const parseRoute = () => {
    const route = window.location.hash.replace(/^#\//, '');
    const [view] = route.split('#');
    if (['guidelines', 'schedule', 'announcements', 'halloffame', 'contact'].includes(view)) {
      return view;
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(parseRoute());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeGuidelineSection, setActiveGuidelineSection] = useState(() => {
    const section = window.location.hash.split('#')[2];
    return ['eligibility', 'domains', 'prizes', 'standards', 'criteria'].includes(section) ? section : 'eligibility';
  });

  // Announcement Filters
  const [annCategory, setAnnCategory] = useState('all');
  const [annSearch, setAnnSearch] = useState('');

  // App Data States
  const [winners, setWinners] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState(ANNOUNCEMENTS);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('innoaward_token') || '');

  // Hall of Fame Filters
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [winnerSearch, setWinnerSearch] = useState('');
  
  // Modals
  const [selectedWinnerModal, setSelectedWinnerModal] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [portalTab, setPortalTab] = useState('register'); // 'register' | 'login' | 'submission'

  // User & Forms
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('innoaward_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [trackingSearch, setTrackingSearch] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const [regForm, setRegForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    institution: '',
    educationLevel: 'higher_and_above'
  });

  const [subForm, setSubForm] = useState({
    titleTh: '',
    titleEn: '',
    category: 'energy_environment',
    educationLevel: 'higher_and_above',
    teamName: '',
    advisorName: '',
    abstractTh: '',
    coverImage: '',
    videoUrl: '',
    documentUrl: ''
  });

  const [subSuccess, setSubSuccess] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Navigate Helper
  const navigateTo = (view, subSection = null) => {
    setCurrentView(view);
    setMobileNavOpen(false);
    if (view === 'home') {
      window.location.hash = '#/';
    } else if (subSection) {
      window.location.hash = `#/${view}`;
      setTimeout(() => {
        const el = document.getElementById(subSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.location.hash = `#/${view}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Real-time Countdown Engine
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const diff = TARGET_DEADLINE - now;

    if (diff > 0) {
      return {
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
      };
    } else {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true };
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const heroVideoRef = useRef(null);
  const [heroVideoMuted, setHeroVideoMuted] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(parseRoute());
    };
    window.addEventListener('hashchange', handleHashChange);

    fetch(`${API_BASE}/winners`)
      .then(res => res.json())
      .then(data => setWinners(data.data || []))
      .catch(err => console.warn('Using local fallback for winners:', err));

    fetch(`${API_BASE}/announcements`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setAnnouncementsList(data.data);
        }
      })
      .catch(err => console.warn('Using local fallback for announcements:', err));

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const hasOpenModal = showPortalModal || showStatusModal || selectedWinnerModal;
    if (!hasOpenModal) return undefined;

    const modal = document.querySelector('[role="dialog"]');
    const focusable = modal
      ? Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      : [];
    focusable[0]?.focus();

    const handleModalKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowPortalModal(false);
        setShowStatusModal(false);
        setSelectedWinnerModal(null);
        return;
      }

      if (event.key !== 'Tab' || focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleModalKeyDown);
    return () => document.removeEventListener('keydown', handleModalKeyDown);
  }, [showPortalModal, showStatusModal, selectedWinnerModal]);

  useEffect(() => {
    if (currentView !== 'guidelines') return undefined;

    const sections = ['eligibility', 'domains', 'prizes', 'standards', 'criteria']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const sectionFromHash = window.location.hash.split('#')[2];
    if (sections.some(section => section.id === sectionFromHash)) {
      setActiveGuidelineSection(sectionFromHash);
      window.setTimeout(() => {
        document.getElementById(sectionFromHash)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 0);
    }

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveGuidelineSection(visible.target.id);
        }
      },
      { rootMargin: '-150px 0px -55% 0px', threshold: 0.01 }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [currentView]);

  const scrollToGuidelineSection = (sectionId) => {
    setActiveGuidelineSection(sectionId);
    window.location.hash = `#/guidelines#${sectionId}`;
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  // Filter Announcements
  const filteredAnnouncements = announcementsList.filter(a => {
    if (annCategory !== 'all' && a.category !== annCategory) return false;
    if (annSearch.trim()) {
      const q = annSearch.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchAbstract = a.abstract.toLowerCase().includes(q);
      const matchRoster = (a.roster || []).some(r => r.team.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
      if (!matchTitle && !matchAbstract && !matchRoster) return false;
    }
    return true;
  });

  // Filter Winners
  const filteredWinners = (winners.length > 0 ? winners : FALLBACK_WINNERS).filter(w => {
    if (selectedYear !== 'all' && String(w.year) !== String(selectedYear)) return false;
    if (selectedDomain !== 'all' && w.category !== selectedDomain) return false;
    if (selectedLevel !== 'all' && w.educationLevel !== selectedLevel) return false;
    if (winnerSearch.trim()) {
      const q = winnerSearch.toLowerCase();
      const matchTitleTh = (w.titleTh || '').toLowerCase().includes(q);
      const matchTitleEn = (w.titleEn || '').toLowerCase().includes(q);
      const matchTeam = (w.teamName || '').toLowerCase().includes(q);
      const matchInst = (w.institution || '').toLowerCase().includes(q);
      const matchCode = (w.trackingCode || '').toLowerCase().includes(q);
      if (!matchTitleTh && !matchTitleEn && !matchTeam && !matchInst && !matchCode) return false;
    }
    return true;
  });

  const handleAuthRegister = (e) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          if (data.token) {
            setAuthToken(data.token);
            localStorage.setItem('innoaward_token', data.token);
            localStorage.setItem('innoaward_user', JSON.stringify(data.user));
          }
          setPortalTab('submission');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      })
      .catch(() => {
        setUser({ fullName: regForm.fullName, email: regForm.email });
        setPortalTab('submission');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      })
      .finally(() => setAuthLoading(false));
  };

  const handleAuthLogin = (e) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regForm.email, password: regForm.password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          if (data.token) {
            setAuthToken(data.token);
            localStorage.setItem('innoaward_token', data.token);
            localStorage.setItem('innoaward_user', JSON.stringify(data.user));
          }
          setPortalTab('submission');
        }
      })
      .catch(() => {
        setUser({ fullName: 'ผู้เข้าแข่งขัน', email: regForm.email });
        setPortalTab('submission');
      })
      .finally(() => setAuthLoading(false));
  };

  const handleSubmission = (isDraft = false) => {
    if (submissionLoading) return;
    if (!subForm.titleTh) {
      alert('กรุณากรอกชื่อผลงาน (ภาษาไทย)');
      return;
    }

    setSubmissionLoading(true);
    fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        ...subForm,
        isDraft,
        userId: user?.id || 'guest-user'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubSuccess(data.data);
          if (!isDraft) {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
        }
      })
      .catch(() => {
        const mockCode = `KMUTNB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubSuccess({ trackingCode: mockCode });
        if (!isDraft) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      })
      .finally(() => setSubmissionLoading(false));
  };

  const handleStatusCheck = (e) => {
    e.preventDefault();
    if (!trackingSearch.trim()) return;

    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);

    fetch(`${API_BASE}/submissions/status/${trackingSearch.trim()}`)
      .then(res => res.json())
      .then(data => {
        setStatusLoading(false);
        if (data.success) {
          setStatusResult(data.data);
        } else {
          setStatusError(data.message || 'ไม่พบข้อมูลในระบบ');
        }
      })
      .catch(() => {
        setStatusLoading(false);
        if (trackingSearch.toUpperCase().includes('8821')) {
          setStatusResult({
            trackingCode: 'KMUTNB-2025-8821',
            titleTh: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI สำหรับพื้นที่ภัยพิบัติ',
            teamName: 'KMUTNB Robotics Lab',
            status: 'awarded',
            feedback: 'ได้รับรางวัล Grand Prize ชิงถ้วยพระราชทานฯ'
          });
        } else {
          setStatusError('ไม่พบรหัสติดตามผลงานนี้ในระบบ (ทดสอบกรอก KMUTNB-2025-8821)');
        }
      });
  };

  const openSubmissionWithDomain = (domainId) => {
    setSubForm(prev => ({ ...prev, category: domainId }));
    setShowPortalModal(true);
    if (user) setPortalTab('submission');
  };

  return (
    <div>
      
      {/* 1. ENTERPRISE NAVBAR (STREAMLINED + LOGOS) */}
      <header className="pro-header">
        <div className="pro-container">
          <div className="pro-header-inner">
            
            {/* Brand Logo & University Badges */}
            <button type="button" onClick={() => navigateTo('home')} className="pro-brand">
              <img className="pro-brand-logo" src="/logo-68.png" alt="KMUTNB Techno Park" />
            </button>

            {/* Streamlined Menu Links */}
            <nav className="pro-nav">
              <button 
                onClick={() => navigateTo('home')} 
                className={`pro-nav-link ${currentView === 'home' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                หน้าแรก
              </button>

              <button 
                onClick={() => navigateTo('guidelines')} 
                className={`pro-nav-link ${currentView === 'guidelines' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                รายละเอียดการแข่งขัน
              </button>

              <button 
                onClick={() => navigateTo('schedule')} 
                className={`pro-nav-link ${currentView === 'schedule' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                กำหนดการ
              </button>

              <button 
                onClick={() => navigateTo('announcements')} 
                className={`pro-nav-link ${currentView === 'announcements' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ประกาศผล
              </button>

              <button 
                onClick={() => navigateTo('halloffame')} 
                className={`pro-nav-link ${currentView === 'halloffame' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                คลังผลงาน
              </button>

              <button 
                onClick={() => navigateTo('contact')} 
                className={`pro-nav-link ${currentView === 'contact' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ติดต่อ
              </button>
            </nav>

            {/* Header Action Buttons */}
            <div className="pro-header-actions">
              {user ? (
                /* Logged In: User Profile Capsule */
                <div className="user-profile-pill">
                  <div className="user-avatar-badge">
                    <User className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <span className="user-name-label">{user.fullName || 'ผู้เข้าแข่งขัน'}</span>
                  <button 
                    onClick={() => {
                      setUser(null);
                      setPortalTab('register');
                    }}
                    title="ออกจากระบบ"
                    className="user-logout-btn"
                  >
                    <LogIn className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              ) : (
                /* Not Logged In: Subtle Glass Auth Button */
                <button
                  aria-label="เข้าสู่ระบบ"
                  onClick={() => {
                    setPortalTab('login');
                    setShowPortalModal(true);
                  }}
                  className="btn-ghost-auth header-btn-auth"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              )}

              <button 
                onClick={() => {
                  setShowPortalModal(true);
                  if (user) setPortalTab('submission');
                  else setPortalTab('register');
                }}
                className="btn-solid-primary header-btn-cta"
              >
                <Rocket className="w-4 h-4" />
                <span>{user ? 'ยื่นผลงาน' : 'สมัครประกวด'}</span>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button 
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="mobile-nav-toggle-btn"
                aria-label="เมนูหลัก"
              >
                {mobileNavOpen ? (
                  <X className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Menu className="w-5 h-5 text-emerald-400" />
                )}
              </button>
            </div>

          </div>

          {/* Mobile Navigation Drawer */}
          {mobileNavOpen && (
            <div className="mobile-nav-drawer">
              <div className="mobile-nav-links">
                <button
                  onClick={() => navigateTo('home')} 
                  className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
                >
                  <span>หน้าแรก</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button 
                  onClick={() => navigateTo('guidelines')} 
                  className={`mobile-nav-item ${currentView === 'guidelines' ? 'active' : ''}`}
                >
                  <span>รายละเอียดการแข่งขัน</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button 
                  onClick={() => navigateTo('schedule')} 
                  className={`mobile-nav-item ${currentView === 'schedule' ? 'active' : ''}`}
                >
                  <span>กำหนดการ</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button 
                  onClick={() => navigateTo('announcements')} 
                  className={`mobile-nav-item ${currentView === 'announcements' ? 'active' : ''}`}
                >
                  <span>ประกาศผล</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button 
                  onClick={() => navigateTo('halloffame')} 
                  className={`mobile-nav-item ${currentView === 'halloffame' ? 'active' : ''}`}
                >
                  <span>คลังผลงาน</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button 
                  onClick={() => navigateTo('contact')} 
                  className={`mobile-nav-item ${currentView === 'contact' ? 'active' : ''}`}
                >
                  <span>ติดต่อ</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

            </div>
          )}
        </div>
      </header>

      {/* ============================================================
          VIEW 1: หน้าแรก (HIGH-IMPACT SUMMARY & PORTAL GATE)
          ============================================================ */}
      {currentView === 'home' && (
        <main>
          {/* Hero Section */}
          <section className="hero-section hero-video-stage">
            <video
              ref={heroVideoRef}
              className="hero-background-video hero-youtube-background"
              src="/hero-highlight-2025.mp4"
              autoPlay
              muted={heroVideoMuted}
              loop
              playsInline
              aria-hidden="true"
            />
            <button
              type="button"
              className="hero-video-sound-toggle"
              aria-label={heroVideoMuted ? 'เปิดเสียงวิดีโอ' : 'ปิดเสียงวิดีโอ'}
              title={heroVideoMuted ? 'เปิดเสียงวิดีโอ' : 'ปิดเสียงวิดีโอ'}
              onClick={() => {
                const nextMuted = !heroVideoMuted;
                if (heroVideoRef.current) heroVideoRef.current.muted = nextMuted;
                setHeroVideoMuted(nextMuted);
              }}
            >
              {heroVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{heroVideoMuted ? 'เปิดเสียง' : 'ปิดเสียง'}</span>
            </button>
            <div className="hero-side-lockup" aria-hidden="true">
              <span className="hero-side-lockup-kicker">KMUTNB // 2026</span>
            </div>
            <div className="pro-container">
              <div className="hero-grid hero-cinematic-grid">
                
                {/* Left: Brand & Core Mission Content */}
                <div className="hero-text-content">
                  <div>
                    <div className="badge-royal hero-editorial-eyebrow hero-royal-honor">
                      <Crown className="w-4 h-4 text-orange-300 animate-pulse" />
                      <span>
                        <strong>ชิงถ้วยพระราชทาน</strong>
                        <span className="hero-royal-recipient">
                          สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ<br />
                          สยามบรมราชกุมารี
                        </span>
                      </span>
                    </div>
                  </div>

                  <h1 className="hero-title hero-editorial-title">
                    <span className="hero-brand-lead">KMUTNB</span>
                    <span className="hero-title-cyan">INNOVATION</span>
                    <span className="hero-title-gold">AWARDS 2026</span>
                  </h1>

                  <p className="hero-desc hero-editorial-desc">
                    เวทีประกวดสิ่งประดิษฐ์และนวัตกรรมระดับประเทศ เพื่อค้นหาแนวคิดที่จะขับเคลื่อนอนาคต<br />
                    ชิงถ้วยพระราชทานฯ และเงินรางวัลรวมกว่า 300,000+ บาท
                  </p>

                  {/* Countdown Bar (Mission Launch Glass HUD) */}
                  <div className="hero-mission-hud hero-editorial-hud" aria-live="polite">
                    <div className="hud-header">
                      <div className="hud-status-chip">
                        <span className="hud-dot" />
                        <span>LIVE // OPEN FOR SUBMISSIONS</span>
                      </div>
                      <span className="hud-title-label">T-MINUS TO DEADLINE</span>
                    </div>

                    {timeLeft.expired ? (
                      <div className="deadline-expired-message">ปิดรับสมัครแล้ว</div>
                    ) : (
                    <div className="hud-digits-row">
                      <div className="hud-digit-block">
                        <span className="hud-num">{timeLeft.days}</span>
                        <span className="hud-unit">DAYS</span>
                      </div>
                      <span className="hud-sep">:</span>
                      <div className="hud-digit-block">
                        <span className="hud-num">{timeLeft.hours}</span>
                        <span className="hud-unit">HOURS</span>
                      </div>
                      <span className="hud-sep">:</span>
                      <div className="hud-digit-block">
                        <span className="hud-num">{timeLeft.minutes}</span>
                        <span className="hud-unit">MINS</span>
                      </div>
                      <span className="hud-sep">:</span>
                      <div className="hud-digit-block accent">
                        <span className="hud-num">{timeLeft.seconds}</span>
                        <span className="hud-unit">SECS</span>
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="hero-actions">
                    <button 
                      onClick={() => {
                        setShowPortalModal(true);
                        if (user) setPortalTab('submission');
                      }}
                      className="btn-solid-primary hero-main-cta"
                      disabled={timeLeft.expired}
                    >
                      <Rocket className="w-5 h-5" />
                      <span>{timeLeft.expired ? 'ปิดรับสมัครแล้ว' : (user ? 'ยื่นผลงาน' : 'สมัครประกวด')}</span>
                    </button>

                    <button 
                      onClick={() => navigateTo('guidelines')}
                      className="btn-outline-cyan hero-sub-cta"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>ดูรายละเอียดการแข่งขัน</span>
                    </button>
                  </div>
                </div>

                {/* Right: Editorial Award Spotlight */}
                <div className="hero-showcase-column">
                  <div className="editorial-award-spotlight">
                    <div className="editorial-spotlight-orbit editorial-orbit-one" />
                    <div className="editorial-spotlight-orbit editorial-orbit-two" />
                    <div className="editorial-spotlight-crown">
                      <Crown className="w-12 h-12 text-orange-300" />
                    </div>
                    <span className="editorial-spotlight-kicker">THE ROYAL INNOVATION AWARD</span>
                    <h2>เวทีแห่งความคิด<br /><em>ที่เปลี่ยนอนาคต</em></h2>
                    <div className="editorial-spotlight-rule" />
                    <div className="editorial-spotlight-stats">
                      <div>
                        <span className="editorial-stat-label">TOTAL PRIZE</span>
                        <strong>300,000<span>+</span></strong>
                        <small>บาท</small>
                      </div>
                      <div>
                        <span className="editorial-stat-label">DEADLINE</span>
                        <strong>15.11</strong>
                        <small>2569</small>
                      </div>
                    </div>
                    <div className="editorial-spotlight-footer">
                      <Crown className="w-4 h-4 text-orange-300" />
                      <span>ชิงถ้วยพระราชทานฯ</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Editorial Category Navigation Strip */}
              <div className="editorial-category-strip">
                <div className="editorial-category-strip-label">EXPLORE<br />DOMAINS</div>
                <div className="editorial-category-list">
                  {DOMAINS.map((domain, idx) => {
                    const IconComponent = domain.icon;
                    return (
                      <button
                        key={domain.id}
                        onClick={() => {
                          setSelectedDomain(domain);
                          setShowDomainDetail(true);
                        }}
                        className="editorial-category-item"
                      >
                        <span className="editorial-category-index">0{idx + 1}</span>
                        <IconComponent className="w-4 h-4" />
                        <span>{domain.titleEn}</span>
                        </button>
                    );
                  })}
                  <button onClick={() => openSubmissionWithDomain('others')} className="editorial-category-item editorial-category-item-other">
                    <span className="editorial-category-index">06</span>
                    <Globe className="w-4 h-4" />
                    <span>Others</span>
                  </button>
                </div>
              </div>

              {/* Perfectly Centered Announcement Alert Banner */}
              <div className="hero-announcement-strip">
                <button
                  type="button"
                  onClick={() => navigateTo('announcements')}
                  className="hero-announcement-pill"
                >
                  <div className="announcement-pill-left">
                    <span className="announcement-pill-badge">
                      <Megaphone className="w-4 h-4 text-emerald-300 animate-pulse" />
                      <span>ข่าวล่าสุด</span>
                    </span>
                    <span className="announcement-pill-text">
                      เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2026 จนถึง 15 พ.ย. 2569
                    </span>
                  </div>
                  
                  <span className="announcement-pill-action">
                    <span>ดูประกาศผล & ข่าวทั้งหมด</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              </div>

            </div>
          </section>

          {/* 3-Pillar Highlights Grid */}
          <section className="section-wrapper" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
            <div className="pro-container">
              
              <div className="home-highlights-grid">
                
                {/* Highlight 1: 5 Domains */}
                <div className="home-highlight-card">
                  <div>
                    <div className="highlight-icon-wrap" style={{ background: 'rgba(34, 211, 238, 0.15)', color: 'var(--cyan-400)' }}>
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3>5 สาขานวัตกรรมเป้าหมาย</h3>
                    <p>ครอบคลุม Energy & Environment, Food & Agri, Social & Economy, Medical Device และ Material</p>
                  </div>
                  <button onClick={() => navigateTo('guidelines', 'domains')} className="highlight-action-btn">
                    <span>ดูหมวดหมู่และส่งผลงาน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Highlight 2: Prizes */}
                <div className="home-highlight-card" style={{ borderColor: 'var(--border-gold)' }}>
                  <div>
                    <div className="highlight-icon-wrap" style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--orange-400)' }}>
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 style={{ color: 'var(--gold-300)' }}>รางวัลรวม 300,000+ บาท</h3>
                    <p>ชิงถ้วยพระราชทานฯ อันทรงเกียรติ พร้อมโล่รางวัล เกียรติบัตร และการสนับสนุนต่อยอดเชิงพาณิชย์</p>
                  </div>
                  <button onClick={() => navigateTo('guidelines', 'prizes')} className="highlight-action-btn" style={{ color: 'var(--gold-300)' }}>
                    <span>ดูสัดส่วนเงินรางวัล</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Highlight 3: 2 Levels */}
                <div className="home-highlight-card">
                  <div>
                    <div className="highlight-icon-wrap" style={{ background: 'rgba(129, 140, 248, 0.15)', color: 'var(--blue-400)' }}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3>เปิดรับ 2 ระดับการศึกษา</h3>
                    <p>ระดับต่ำกว่าอุดมศึกษา (มัธยม/ปวช.) และระดับตั้งแต่อุดมศึกษาขึ้นไป (ป.ตรี-โท-เอก/ประชาชน)</p>
                  </div>
                  <button onClick={() => navigateTo('guidelines', 'eligibility')} className="highlight-action-btn">
                    <span>ตรวจสอบคุณสมบัติ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* 5 Innovation Domains Showcase on Home Page */}
              <div style={{ marginTop: '64px', marginBottom: '64px' }}>
                <div className="section-header" style={{ marginBottom: '36px' }}>
                  <div className="badge-tag">
                    <Layers className="w-4 h-4" />
                    <span>5 INNOVATION DOMAINS</span>
                  </div>
                  <h2>5 หมวดหมู่สาขานวัตกรรมเป้าหมาย</h2>
                  <p>
                    เลือกหมวดหมู่ที่สอดคล้องกับขอบเขตสิ่งประดิษฐ์หรืองานวิจัยของคุณเพื่อส่งเข้าประกวด
                  </p>
                </div>

                <div className="domains-grid">
                  {DOMAINS.map(domain => {
                    const IconComp = domain.icon;
                    return (
                      <div key={domain.id} className="domain-card">
                        <div 
                          className="domain-card-bg" 
                          style={{ backgroundImage: `url(${domain.bgImage})` }} 
                        />
                        <div className="domain-card-overlay" />
                        <div>
                          <div className="domain-icon-wrap" style={{ borderColor: `${domain.color}90`, color: domain.color }}>
                            <IconComp className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="domain-card-content">
                          <h4>{domain.nameTh}</h4>
                          <p>{domain.desc}</p>
                          <button 
                            onClick={() => openSubmissionWithDomain(domain.id)}
                            className="domain-card-btn"
                          >
                            <span>สมัครประกวด</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checklist Before Submit Banner */}
              <div id="checklist" className="prep-checklist-banner" style={{ marginTop: '0' }}>
                <div className="prep-checklist-header">
                  <div>
                    <span className="badge-checklist">CHECKLIST</span>
                    <h3 style={{ marginTop: '6px' }}>
                      <ClipboardList className="w-6 h-6 text-orange-400" />
                      <span>กรุณาเตรียมข้อมูลให้พร้อมก่อนสมัคร</span>
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                      setShowPortalModal(true);
                      if (user) setPortalTab('submission');
                    }}
                    className="btn-solid-primary"
                    style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', boxShadow: '0 4px 18px rgba(249,115,22,0.35)' }}
                  >
                    <span>สมัครประกวด</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="prep-checklist-grid">
                  <div className="prep-step-card">
                    <div className="prep-step-num">
                      <span>01</span>
                      <User className="w-4 h-4 text-orange-400" />
                    </div>
                    <h5>ข้อมูลส่วนตัวของผู้สมัคร และทีมงาน</h5>
                    <p>ชื่อ-นามสกุล, สังกัดสถาบันการศึกษา/องค์กร, เบอร์โทรศัพท์, อีเมล และชื่ออาจารย์ที่ปรึกษา</p>
                  </div>

                  <div className="prep-step-card">
                    <div className="prep-step-num">
                      <span>02</span>
                      <FileText className="w-4 h-4 text-orange-400" />
                    </div>
                    <h5>รายละเอียดผลงานโดยสังเขป</h5>
                    <p>ชื่อภาษาไทย-อังกฤษ, หมวดหมู่นวัตกรรม, บทคัดย่อ, ที่มา ปัญหา และหลักการทำงานของนวัตกรรม</p>
                  </div>

                  <div className="prep-step-card">
                    <div className="prep-step-num">
                      <span>03</span>
                      <Video className="w-4 h-4 text-orange-400" />
                    </div>
                    <h5>คลิป VDO นำเสนอผลงาน</h5>
                    <p>ความยาวเนื้อหา 2 - 3 นาที อัปโหลดบน YouTube หรือ Google Drive เพื่อให้คณะกรรมการรับชม</p>
                  </div>

                  <div className="prep-step-card">
                    <div className="prep-step-num">
                      <span>04</span>
                      <CheckSquare className="w-4 h-4 text-orange-400" />
                    </div>
                    <h5>แบบฟอร์มการสมัครเข้าร่วมโครงการ</h5>
                    <p>กรอกข้อมูลข้อเสนอโครงการผ่านระบบออนไลน์ หรือแนบไฟล์เอกสาร Proposal ตามแบบฟอร์มที่กำหนด</p>
                  </div>
                </div>
              </div>

              {/* Hall of Fame Teaser */}
              <div style={{ marginTop: '56px', textAlign: 'center' }}>
                <div className="badge-tag" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5em' }}>
                  <Trophy className="w-4 h-4" />
                  <span>PAST GRAND PRIZE WINNERS</span>
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '32px' }}>ตัวอย่างผลงานที่เคยได้รับรางวัลชนะเลิศ</h2>

                <div className="winner-grid" style={{ textAlign: 'left' }}>
                  {filteredWinners.slice(0, 3).map(w => (
                    <button type="button"
                      key={w.id}
                      onClick={() => setSelectedWinnerModal(w)}
                      className="winner-card"
                    >
                      <div className="winner-card-image-wrap">
                        <img 
                          src={WINNER_IMAGES[w.id] || w.image || '/winner-robot.jpg'} 
                          alt={w.titleTh} 
                          loading="lazy"
                          decoding="async"
                          className="winner-card-image"
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          {renderAwardBadge(w)}
                        </div>
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(7, 34, 26, 0.88)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--emerald-300)', border: '1px solid var(--border-subtle)' }}>
                          {w.trackingCode}
                        </div>
                      </div>

                      <div className="winner-card-body">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span className="badge-category" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.18)', borderColor: 'rgba(52, 211, 153, 0.4)', color: 'var(--emerald-300)' }}>
                              ปี {w.year || '2568'}
                            </span>
                            <span className="badge-category" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                              {getCategoryNameTh(w.category)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {w.educationLevel === 'below_higher' ? 'ต่ำกว่าอุดมศึกษา' : 'อุดมศึกษาขึ้นไป'}
                            </span>
                          </div>
                          <h4>{w.titleTh}</h4>
                          <div className="winner-card-en">{w.titleEn}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', fontWeight: 600, marginTop: '6px', marginBottom: '8px' }}>
                            ทีม {w.teamName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• {w.institution}</span>
                          </div>
                          <p>{w.abstractTh}</p>
                        </div>

                        <div className="winner-card-footer">
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {w.awardNameTh || 'ผลงานที่ได้รับรางวัล'}
                          </span>
                          <span className="winner-cta-link">
                            <span>อ่านสตอรี่ผลงาน</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '32px' }}>
                  <button onClick={() => navigateTo('halloffame')} className="btn-outline-cyan" style={{ padding: '10px 24px' }}>
                    <Layers className="w-4 h-4" />
                    <span>เข้าสู่คลังผลงานทั้งหมด (Hall of Fame)</span>
                  </button>
                </div>
              </div>

            </div>
          </section>
        </main>
      )}

      {/* ============================================================
          VIEW 2: รายละเอียดการแข่งขัน (COMPETITION GUIDELINES)
          ============================================================ */}
      {currentView === 'guidelines' && (
        <main>
          {/* Header */}
          <section className="section-wrapper" style={{ paddingBottom: '20px' }}>
            <div className="pro-container">
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="badge-tag">
                  <BookOpen className="w-4 h-4" />
                  <span>COMPETITION GUIDELINES & RULES</span>
                </div>
                <h1>รายละเอียดและกติกาการแข่งขัน</h1>
                <p>
                  รวบรวมข้อกำหนด คุณสมบัติผู้สมัคร สาขานวัตกรรม รางวัล มาตรฐานผลงาน และเกณฑ์การตัดสินฉบับสมบูรณ์
                </p>
              </div>
            </div>
          </section>

          {/* Sticky Sub-Navigation Tabs */}
          <div className="subnav-sticky-wrapper">
            <div className="pro-container">
              <div className="subnav-tabs-container">
                <a 
                  href="#eligibility"
                  onClick={(e) => { e.preventDefault(); scrollToGuidelineSection('eligibility'); }}
                  className={`subnav-tab-btn ${activeGuidelineSection === 'eligibility' ? 'active' : ''}`}
                  aria-current={activeGuidelineSection === 'eligibility' ? 'location' : undefined}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>1. คุณสมบัติและเงื่อนไข</span>
                </a>

                <a 
                  href="#domains"
                  onClick={(e) => { e.preventDefault(); scrollToGuidelineSection('domains'); }}
                  className={`subnav-tab-btn ${activeGuidelineSection === 'domains' ? 'active' : ''}`}
                  aria-current={activeGuidelineSection === 'domains' ? 'location' : undefined}
                >
                  <Layers className="w-4 h-4" />
                  <span>2. หมวดของผลงาน (5 สาขา)</span>
                </a>

                <a 
                  href="#prizes"
                  onClick={(e) => { e.preventDefault(); scrollToGuidelineSection('prizes'); }}
                  className={`subnav-tab-btn ${activeGuidelineSection === 'prizes' ? 'active' : ''}`}
                  aria-current={activeGuidelineSection === 'prizes' ? 'location' : undefined}
                >
                  <Trophy className="w-4 h-4" />
                  <span>3. รางวัลการประกวด</span>
                </a>

                <a 
                  href="#standards"
                  onClick={(e) => { e.preventDefault(); scrollToGuidelineSection('standards'); }}
                  className={`subnav-tab-btn ${activeGuidelineSection === 'standards' ? 'active' : ''}`}
                  aria-current={activeGuidelineSection === 'standards' ? 'location' : undefined}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>4. มาตรฐานผลงาน</span>
                </a>

                <a 
                  href="#criteria"
                  onClick={(e) => { e.preventDefault(); scrollToGuidelineSection('criteria'); }}
                  className={`subnav-tab-btn ${activeGuidelineSection === 'criteria' ? 'active' : ''}`}
                  aria-current={activeGuidelineSection === 'criteria' ? 'location' : undefined}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>5. หลักเกณฑ์การพิจารณา</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pro-container" style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '80px' }}>
            
            {/* SUB-SECTION 1: คุณสมบัติและเงื่อนไข (ELIGIBILITY) */}
            <section id="eligibility">
              <div className="section-header" style={{ textAlign: 'left', margin: '0 0 28px 0', maxWidth: '100%' }}>
                <div className="badge-tag">
                  <UserCheck className="w-4 h-4" />
                  <span>SECTION 01 • ELIGIBILITY</span>
                </div>
                <h3>1. คุณสมบัติและเงื่อนไขผู้เข้าร่วมประกวด</h3>
              </div>

              <div className="levels-grid">
                {/* Level 1 */}
                <div className="level-card">
                  <div>
                    <div className="level-card-header">
                      <div className="level-icon">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', fontWeight: 600, textTransform: 'uppercase' }}>LEVEL 1</span>
                        <h3>ระดับต่ำกว่าอุดมศึกษา</h3>
                      </div>
                    </div>
                    <p>เปิดรับสมัครโครงงานและสิ่งประดิษฐ์จากนักเรียนสายสามัญและสายอาชีพทั่วประเทศ</p>
                    <ul className="checklist-list">
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>สถานะผู้สมัคร:</strong> นักเรียนมัธยมศึกษา (ม.1 - ม.6), ปวช. หรือเทียบเท่า</span>
                      </li>
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>ขนาดทีม:</strong> ส่งเดี่ยว หรือทีมไม่เกิน 3 - 5 คน</span>
                      </li>
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>อาจารย์ที่ปรึกษา:</strong> ต้องมีอาจารย์รับรองอย่างน้อย 1 ท่าน</span>
                      </li>
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>ลักษณะผลงาน:</strong> เป็นสิ่งประดิษฐ์ โมเดล หรือโครงงานที่คิดค้นขึ้นเอง</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bento-tier-row">
                    <span className="tier-award-label"><Trophy className="w-4 h-4" aria-hidden="true" /> รางวัลชนะเลิศระดับนี้:</span>
                    <strong>30,000 บาท</strong>
                  </div>
                </div>

                {/* Level 2 */}
                <div className="level-card gold-tier">
                  <div>
                    <div className="level-card-header">
                      <div className="level-icon gold">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold-400)', fontWeight: 600, textTransform: 'uppercase' }}>LEVEL 2</span>
                        <h3 style={{ color: 'var(--gold-300)' }}>ระดับตั้งแต่อุดมศึกษาขึ้นไป</h3>
                      </div>
                    </div>
                    <p>เปิดรับสมัครผลงานวิจัย นวัตกรรม และสิ่งประดิษฐ์ต้นแบบพร้อมต่อยอดเชิงพาณิชย์</p>
                    <ul className="checklist-list">
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>สถานะผู้สมัคร:</strong> นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, สตาร์ทอัพ และประชาชน</span>
                      </li>
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>ขนาดทีม:</strong> ส่งรายบุคคล หรือทีมสหสาขาวิชาชีพ (ไม่เกิน 3 - 5 คน)</span>
                      </li>
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>สังกัด:</strong> สถาบันอุดมศึกษา หน่วยงานรัฐ เอกชน หรืออิสระ</span>
                      </li>
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>ลักษณะผลงาน:</strong> มี Prototype หรือผลการทดสอบจริง พร้อมแผนต่อยอด</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bento-tier-row">
                    <span className="tier-award-label"><Trophy className="w-4 h-4" aria-hidden="true" /> รางวัลชนะเลิศระดับนี้:</span>
                    <strong style={{ color: 'var(--gold-400)' }}>50,000 บาท</strong>
                  </div>
                </div>
              </div>

              {/* General Rules Box */}
              <div className="general-rules-box" style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>ข้อกำหนดและกติกาการส่งผลงานทั่วไป (General Rules)</span>
                </h4>
                <ul className="general-rules-grid">
                  <li className="general-rule-item">
                    <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem' }}>01</div>
                    <div>
                      <h5>สิทธิ์ในทรัพย์สินทางปัญญา (IP)</h5>
                      <p>ผลงานต้องเป็นลิขสิทธิ์ของผู้สมัครเอง ไม่คัดลอกหรือละเมิดทรัพย์สินทางปัญญา สิทธิบัตร หรือสิทธิของผู้อื่น</p>
                    </div>
                  </li>
                  <li className="general-rule-item">
                    <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem' }}>02</div>
                    <div>
                      <h5>สถานะรางวัลเดิม</h5>
                      <p>ผลงานต้องไม่เคยได้รับรางวัลชนะเลิศระดับชาติหรือนานาชาติที่ติดสัญญาเงื่อนไขผูกพันห้ามเผยแพร่</p>
                    </div>
                  </li>
                  <li className="general-rule-item">
                    <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem' }}>03</div>
                    <div>
                      <h5>การเผยแพร่เพื่อการศึกษา</h5>
                      <p>ยินยอมให้ผู้จัดงานเผยแพร่ภาพถ่าย วิดีโอ และบทคัดย่อ เพื่อประโยชน์ทางวิชาการและส่งเสริมนวัตกรรม</p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* SUB-SECTION 2: หมวดของผลงาน (INNOVATION DOMAINS) */}
            <section id="domains">
              <div className="section-header" style={{ textAlign: 'left', margin: '0 0 28px 0', maxWidth: '100%' }}>
                <div className="badge-tag">
                  <Layers className="w-4 h-4" />
                  <span>SECTION 02 • 5 INNOVATION DOMAINS</span>
                </div>
                <h3>2. หมวดของผลงานนวัตกรรมเป้าหมาย (5 Domains)</h3>
              </div>

              <div className="domains-grid">
                {DOMAINS.map(domain => {
                  const IconComp = domain.icon;
                  return (
                    <div key={domain.id} className="domain-card">
                      <img className="domain-card-bg" src={domain.bgImage} alt="" loading="lazy" decoding="async" />
                      <div className="domain-card-overlay" />
                      <div>
                        <div className="domain-icon-wrap" style={{ borderColor: `${domain.color}90`, color: domain.color }}>
                          <IconComp className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="domain-card-content">
                        <h4>{domain.nameTh}</h4>
                        <p>{domain.desc}</p>
                        <button 
                          onClick={() => openSubmissionWithDomain(domain.id)}
                          className="domain-card-btn"
                        >
                          <span>สมัครประกวด</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SUB-SECTION 3: รางวัลการประกวด (PRIZES & AWARDS) */}
            <section id="prizes">
              <div className="section-header" style={{ textAlign: 'left', margin: '0 0 28px 0', maxWidth: '100%' }}>
                <div className="badge-tag">
                  <Trophy className="w-4 h-4" />
                  <span>SECTION 03 • PRIZES & HONORS</span>
                </div>
                <h3>3. รางวัลการประกวดและเกียรติยศ (Prizes & Awards)</h3>
              </div>

              <div className="prizes-container">
                {/* Higher & Above Level Prizes */}
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--gold-300)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 className="w-5 h-5 text-orange-400" />
                    <span>รางวัลสำหรับระดับตั้งแต่อุดมศึกษาขึ้นไป (ป.ตรี-โท-เอก / อาจารย์ / นักวิจัย / ประชาชน)</span>
                  </h4>
                  <div className="prizes-tier-grid">
                    <div className="prize-card gold-champion">
                      <div className="prize-medal-icon" aria-hidden="true"><Crown /></div>
                      <h5>ชนะเลิศ Grand Prize</h5>
                      <div className="prize-cash-amount">50,000 ฿</div>
                      <span>ถ้วยพระราชทานฯ + โล่ + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 1</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>30,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 2</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>20,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Award /></div>
                      <h5>รางวัลชมเชย (2 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--text-secondary)' }}>10,000 ฿</div>
                      <span>เกียรติบัตรเชิดชูเกียรติ</span>
                    </div>
                  </div>
                </div>

                {/* Below Higher Level Prizes */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--cyan-300)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    <span>รางวัลสำหรับระดับต่ำกว่าอุดมศึกษา (มัธยมศึกษา / ปวช.)</span>
                  </h4>
                  <div className="prizes-tier-grid">
                    <div className="prize-card" style={{ borderColor: 'var(--border-cyan)' }}>
                      <div className="prize-medal-icon">🥇</div>
                      <h5>ชนะเลิศ First Place</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>30,000 ฿</div>
                      <span>ถ้วยเกียรติยศ + โล่ + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 1</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>20,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 2</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>10,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Award /></div>
                      <h5>รางวัลชมเชย (2 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--text-secondary)' }}>5,000 ฿</div>
                      <span>เกียรติบัตรเชิดชูเกียรติ</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SUB-SECTION 4: มาตรฐานผลงาน (SUBMISSION STANDARDS) */}
            <section id="standards">
              <div className="section-header" style={{ textAlign: 'left', margin: '0 0 28px 0', maxWidth: '100%' }}>
                <div className="badge-tag">
                  <FileCheck className="w-4 h-4" />
                  <span>SECTION 04 • DELIVERABLES & STANDARDS</span>
                </div>
                <h3>4. มาตรฐานและข้อกำหนดของผลงาน (Submission Standards)</h3>
              </div>

              <div className="standards-grid">
                <div className="standard-card">
                  <div className="standard-num-badge">
                    <span>01</span>
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4>เอกสารข้อเสนอโครงการ (Proposal PDF)</h4>
                  <p>เขียนตามแบบฟอร์มที่โครงการกำหนด ความยาวเนื้อหารวมไม่เกิน 10 หน้ากระดาษ A4</p>
                  <ul className="standard-req-list">
                    <li>สรุปบทคัดย่อ (Abstract) และที่มาของปัญหา</li>
                    <li>หลักการทำงานและเทคโนโลยีที่ใช้</li>
                    <li>ผลการทดสอบและประโยชน์เชิงเศรษฐกิจ/สังคม</li>
                  </ul>
                </div>

                <div className="standard-card">
                  <div className="standard-num-badge">
                    <span>02</span>
                    <Video className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4>คลิปวิดีโอแนะนำผลงาน (Video Pitch)</h4>
                  <p>ความยาวไม่เกิน 2 - 3 นาที ความละเอียดอย่างน้อย 1080p Full HD อัปโหลดบน YouTube หรือ Drive</p>
                  <ul className="standard-req-list">
                    <li>แนะนำสมาชิกทีมและแรงบันดาลใจ</li>
                    <li>สาธิตการทำงานจริงของชิ้นงาน/โมเดล</li>
                    <li>เสียงบรรยายชัดเจน มีภาพประกอบการใช้งาน</li>
                  </ul>
                </div>

                <div className="standard-card">
                  <div className="standard-num-badge">
                    <span>03</span>
                    <Box className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4>ชิ้นงานต้นแบบ / ผลการทดสอบ (Prototype)</h4>
                  <p>ต้องมีชิ้นงานตัวอย่าง (Working Prototype) หรือผลวิจัยการทดลองที่สามารถนำมาจัดแสดงวัน Pitching</p>
                  <ul className="standard-req-list">
                    <li>สำหรับสายฮาร์ดแวร์: ชิ้นงานหรือโมเดลจำลอง</li>
                    <li>สำหรับสายซอฟต์แวร์: Live Demo หรือแอปพลิเคชัน</li>
                    <li>สำหรับสายวัสดุ/เกษตร: ตัวอย่างชิ้นงานจริง</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SUB-SECTION 5: หลักเกณฑ์การพิจารณา (JUDGING CRITERIA) */}
            <section id="criteria">
              <div className="section-header" style={{ textAlign: 'left', margin: '0 0 28px 0', maxWidth: '100%' }}>
                <div className="badge-tag">
                  <BarChart3 className="w-4 h-4" />
                  <span>SECTION 05 • JUDGING RUBRIC</span>
                </div>
                <h3>5. หลักเกณฑ์การพิจารณาตัดสินและสัดส่วนคะแนน (100 คะแนนเต็ม)</h3>
              </div>

              <div className="criteria-grid">
                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>ความคิดสร้างสรรค์และความแปลกใหม่ (Novelty & Innovation)</h5>
                    <span className="criteria-score-badge">30 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg" role="progressbar" aria-label="ความคิดสร้างสรรค์และความแปลกใหม่ 30 คะแนน" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">
                    <div className="criteria-progress-fill" style={{ width: '30%' }} />
                  </div>
                  <p>ความโดดเด่น ความคิดริเริ่มสร้างสรรค์ การแก้ปัญหาด้วยมุมมองใหม่ที่ไม่ซ้ำกับเทคโนโลยีที่มีอยู่เดิมในท้องตลาด</p>
                </div>

                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>ความเป็นไปได้ทางเทคนิคและการใช้งานจริง (Technical Feasibility)</h5>
                    <span className="criteria-score-badge">25 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg" role="progressbar" aria-label="ความเป็นไปได้ทางเทคนิคและการใช้งานจริง 25 คะแนน" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                    <div className="criteria-progress-fill" style={{ width: '25%' }} />
                  </div>
                  <p>ความถูกต้องตามหลักวิชาการ ประสิทธิภาพการทำงาน ความสมบูรณ์ของชิ้นงานต้นแบบ และความเสถียรในการทำงาน</p>
                </div>

                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>ผลกระทบเชิงเศรษฐกิจ สังคม หรือสิ่งแวดล้อม (Impact & Value)</h5>
                    <span className="criteria-score-badge">25 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg" role="progressbar" aria-label="ผลกระทบเชิงเศรษฐกิจ สังคม หรือสิ่งแวดล้อม 25 คะแนน" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                    <div className="criteria-progress-fill" style={{ width: '25%' }} />
                  </div>
                  <p>ศักยภาพในการนำไปต่อยอดเชิงพาณิชย์ การลดต้นทุน การยกระดับคุณภาพชีวิตชุมชน หรือการอนุรักษ์สิ่งแวดล้อม</p>
                </div>

                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>คุณภาพการนำเสนอและคลิปวิดีโอ (Presentation & Clarity)</h5>
                    <span className="criteria-score-badge">20 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg" role="progressbar" aria-label="คุณภาพการนำเสนอและคลิปวิดีโอ 20 คะแนน" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100">
                    <div className="criteria-progress-fill" style={{ width: '20%' }} />
                  </div>
                  <p>ความชัดเจนในการสื่อสาร การตอบข้อซักถามของคณะกรรมการ ความน่าสนใจของคลิปวิดีโอ และการจัดเตรียมเอกสาร</p>
                </div>
              </div>
            </section>

          </div>
        </main>
      )}

      {/* ============================================================
          VIEW 3: กำหนดการ (TIMELINE & SCHEDULE)
          ============================================================ */}
      {currentView === 'schedule' && (
        <main>
          <section className="section-wrapper">
            <div className="pro-container">
              
              <div className="section-header">
                <div className="badge-tag">
                  <Calendar className="w-4 h-4" />
                  <span>COMPETITION ROADMAP</span>
                </div>
                <h2>กำหนดการสำคัญ ประจำปี 2569</h2>
                <p>
                  ขั้นตอนการดำเนินโครงการตั้งแต่เปิดรับสมัคร การพิจารณาคัดเลือก จนถึงวันนำเสนอผลงานและพิธีมอบรางวัล
                </p>
              </div>

              {/* Active Phase Banner */}
              <div className="active-phase-banner">
                <div>
                  <div className="active-phase-badge">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                    <span>STAGE ปัจจุบัน • ACTIVE NOW</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    ช่วงเปิดรับข้อเสนอผลงาน (1 กันยายน - 15 พฤศจิกายน 2569)
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    ผู้สมัครสามารถลงทะเบียน กรอกข้อเสนอโครงการ และแนบลิงก์คลิปวิดีโอได้จนถึงเวลา 23:59 น.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setShowPortalModal(true);
                    if (user) setPortalTab('submission');
                  }}
                  className="btn-solid-primary"
                  style={{ padding: '12px 24px' }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{user ? 'ยื่นผลงาน' : 'สมัครประกวด'}</span>
                </button>
              </div>

              {/* Step-by-Step 4 Milestones */}
              <div className="stepper-grid">
                <div className="step-card active">
                  <div className="step-number">01</div>
                  <div className="step-date">1 ก.ย. - 15 พ.ย. 2569</div>
                  <h4>เปิดรับสมัครผลงาน</h4>
                  <p>ยื่นเอกสารข้อเสนอโครงการ (Proposal) และลิงก์คลิปวิดีโอแนะนำผลงานความยาว 2-3 นาที ผ่านระบบออนไลน์</p>
                </div>

                <div className="step-card">
                  <div className="step-number">02</div>
                  <div className="step-date">20 - 30 พ.ย. 2569</div>
                  <h4>พิจารณาคัดเลือกรอบแรก</h4>
                  <p>คณะกรรมการผู้ทรงคุณวุฒิประเมินข้อเสนอโครงการและคลิปวิดีโอเพื่อคัดเลือกผลงานที่ผ่านเกณฑ์เข้าสู่รอบชิงชนะเลิศ</p>
                </div>

                <div className="step-card">
                  <div className="step-number">03</div>
                  <div className="step-date">10 ธ.ค. 2569</div>
                  <h4>ประกาศผลผู้เข้ารอบสุดท้าย</h4>
                  <p>ประกาศรายชื่อทีมที่ผ่านการคัดเลือกผ่านทางเว็บไซต์ พร้อมส่งหนังสือแจ้งยืนยันสิทธิ์เข้าร่วมรอบ Pitching</p>
                </div>

                <div className="step-card" style={{ borderColor: 'var(--border-gold)' }}>
                  <div className="step-number" style={{ background: 'rgba(249, 115, 22, 0.18)', color: 'var(--orange-400)' }} aria-hidden="true"><Trophy /></div>
                  <div className="step-date" style={{ color: 'var(--gold-300)' }}>26 ม.ค. 2570</div>
                  <h4>Pitching & พิธีมอบรางวัล</h4>
                  <p>นำเสนอผลงานต่อหน้าคณะกรรมการ จัดแสดงบูธนิทรรศการ และพิธีมอบถ้วยพระราชทานฯ ณ อุทยานเทคโนโลยี มจพ.</p>
                </div>
              </div>

              {/* Pitching Venue Box */}
              <div className="general-rules-box" style={{ marginTop: '40px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>สถานที่จัดงานรอบชิงชนะเลิศ (Final Pitching & Award Ceremony)</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.88rem' }}>
                  <div>
                    <strong style={{ color: 'var(--cyan-300)', display: 'block', marginBottom: '4px' }}>อาคารอุทยานเทคโนโลยี มจพ. (Techno Park)</strong>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ เลขที่ 1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--cyan-300)', display: 'block', marginBottom: '4px' }}>การเดินทาง</strong>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      รถไฟฟ้า MRT สถานีบางโพ (สายสีน้ำเงิน) หรือ MRT สถานีวงศ์สว่าง (สายสีม่วง) ต่อรถโดยสารประจำทางสาย 32, 33, 49, 90, 117
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </main>
      )}

      {/* ============================================================
          VIEW 4: ประกาศผล (ANNOUNCEMENTS & RESULTS HUB)
          ============================================================ */}
      {currentView === 'announcements' && (
        <main>
          <section className="section-wrapper">
            <div className="pro-container">
              
              <div className="section-header">
                <div className="badge-tag">
                  <Bell className="w-4 h-4" />
                  <span>OFFICIAL ANNOUNCEMENTS & RESULTS</span>
                </div>
                <h2>ประกาศผลและข่าวสารทางการ</h2>
                <p>
                  ศูนย์รวมประกาศรายชื่อผู้ผ่านการคัดเลือก ผลการตัดสินรางวัล และเอกสารประกาศคำสั่งอย่างเป็นทางการ
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div className="announcement-search-bar">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <input 
                    type="text"
                    className="announcement-search-input"
                    placeholder="ค้นหาด้วยชื่อทีม, สถาบัน, รหัสผลงาน หรือหัวข้อประกาศ..."
                    value={annSearch}
                    onChange={e => setAnnSearch(e.target.value)}
                  />
                  {annSearch && (
                    <button onClick={() => setAnnSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="subnav-tabs-container announcement-tabs">
                  <button 
                    onClick={() => setAnnCategory('all')} 
                    className={`subnav-tab-btn ${annCategory === 'all' ? 'active' : ''}`}
                  >
                    <span>ทั้งหมด ({ANNOUNCEMENTS.length})</span>
                  </button>

                  <button 
                    onClick={() => setAnnCategory('finalists')} 
                    className={`subnav-tab-btn ${annCategory === 'finalists' ? 'active' : ''}`}
                  >
                    <span>ผู้ผ่านเข้ารอบสุดท้าย Finalists</span>
                  </button>

                  <button 
                    onClick={() => setAnnCategory('winners')} 
                    className={`subnav-tab-btn ${annCategory === 'winners' ? 'active' : ''}`}
                  >
                    <span>ผลรางวัลชนะเลิศ Winners</span>
                  </button>

                  <button 
                    onClick={() => setAnnCategory('general')} 
                    className={`subnav-tab-btn ${annCategory === 'general' ? 'active' : ''}`}
                  >
                    <span>ข่าวสารโครงการ</span>
                  </button>
                </div>
              </div>

              {/* Announcements List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredAnnouncements.map(ann => (
                  <div key={ann.id} className="announcement-card">
                    <div className="announcement-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={ann.badgeClass}>{ann.badgeText}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                      </div>
                      <a 
                        href={ann.pdfUrl} 
                        className="btn-outline-cyan" 
                        style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ดาวน์โหลดประกาศ (PDF)</span>
                      </a>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{ann.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ann.abstract}</p>

                    {/* Roster Showcase if available */}
                    {ann.roster.length > 0 && (
                      <div className="announcement-roster-box">
                        <strong style={{ color: 'var(--cyan-300)', fontSize: '0.84rem' }}>รายชื่อทีมที่ได้รับการคัดเลือก:</strong>
                        {ann.roster.map((r, idx) => (
                          <div key={idx} className="roster-row">
                            <div>
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)', fontWeight: 700, marginRight: '10px' }}>{r.code}</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{r.title}</strong>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({r.team})</span>
                            </div>
                            <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{r.level}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {filteredAnnouncements.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '16px' }}>
                    ไม่พบข้อมูลประกาศที่ตรงกับคำค้นหา
                  </div>
                )}
              </div>

              {/* Status Callout Banner */}
              <div className="general-rules-box" style={{ marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    ต้องการตรวจสอบผลการพิจารณาเฉพาะของทีมคุณหรือไม่?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    สามารถกรอกรหัสติดตามผลงาน (เช่น KMUTNB-2025-8821) เพื่อดูคอมเมนต์และสถานะแบบส่วนบุคคล
                  </p>
                </div>
                <button onClick={() => setShowStatusModal(true)} className="btn-solid-primary">
                  <Search className="w-4 h-4" />
                  <span>ตรวจสอบสถานะส่วนบุคคล</span>
                </button>
              </div>

            </div>
          </section>
        </main>
      )}

      {/* ============================================================
          VIEW 5: คลังผลงาน (HALL OF FAME)
          ============================================================ */}
      {currentView === 'halloffame' && (
        <main>
          <section className="section-wrapper">
            <div className="pro-container">
              
              <div className="filter-bar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div className="badge-tag">
                      <Trophy className="w-4 h-4" />
                      <span>HALL OF FAME & INSPIRATION</span>
                    </div>
                    <h2 style={{ fontSize: '2rem' }}>คลังผลงานที่เคยได้รับรางวัล</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
                      สืบค้นผลงานนวัตกรรมและสิ่งประดิษฐ์ที่ได้รับรางวัลเกียรติยศในแต่ละปีการประกวด
                    </p>
                  </div>

                  {/* Search Input */}
                  <div style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
                    <div className="search-input-wrap">
                      <Search className="w-4 h-4 text-emerald-400" />
                      <input 
                        type="text"
                        placeholder="ค้นหาชื่อผลงาน, ทีม, สถาบัน..."
                        value={winnerSearch}
                        onChange={e => setWinnerSearch(e.target.value)}
                        className="search-input"
                      />
                      {winnerSearch && (
                        <button type="button" onClick={() => setWinnerSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div className="halloffame-filter-controls" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <select 
                      value={selectedYear} 
                      onChange={e => setSelectedYear(e.target.value)}
                      className="filter-select"
                      style={{ minWidth: '170px' }}
                    >
                      <option value="all">ทุกปีการประกวด</option>
                      <option value="2568">ประจำปี 2568 (2025)</option>
                      <option value="2567">ประจำปี 2567 (2024)</option>
                      <option value="2566">ประจำปี 2566 (2023)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={selectedDomain} 
                      onChange={e => setSelectedDomain(e.target.value)}
                      className="filter-select"
                      style={{ minWidth: '180px' }}
                    >
                      <option value="all">ทุกหมวดหมู่นวัตกรรม</option>
                      <option value="energy_environment">Energy & Environment</option>
                      <option value="food_agriculture">Food & Agriculture</option>
                      <option value="social_economy">Social & Economy</option>
                      <option value="medical_device">Medical Device</option>
                      <option value="material">Material</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={selectedLevel} 
                      onChange={e => setSelectedLevel(e.target.value)}
                      className="filter-select"
                      style={{ minWidth: '180px' }}
                    >
                      <option value="all">ทุกระดับการศึกษา</option>
                      <option value="below_higher">ต่ำกว่าอุดมศึกษา</option>
                      <option value="higher_and_above">ตั้งแต่อุดมศึกษาขึ้นไป</option>
                    </select>
                  </div>

                  {(selectedYear !== 'all' || selectedDomain !== 'all' || selectedLevel !== 'all' || winnerSearch) && (
                    <button 
                      onClick={() => { setSelectedYear('all'); setSelectedDomain('all'); setSelectedLevel('all'); setWinnerSearch(''); }}
                      className="btn-text"
                      style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', textDecoration: 'underline', padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  )}
                </div>
              </div>

              <div className="winner-grid">
                {filteredWinners.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', background: 'rgba(7, 34, 26, 0.5)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                    <Trophy className="w-12 h-12 text-emerald-500/50" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>ไม่พบผลงานตามเงื่อนไขที่ค้นหา</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                      ลองปรับเปลี่ยนตัวเลือกปีการประกวด หมวดหมู่ หรือคำค้นหาใหม่อีกครั้ง
                    </p>
                    <button 
                      onClick={() => { setSelectedYear('all'); setSelectedDomain('all'); setSelectedLevel('all'); setWinnerSearch(''); }}
                      className="btn-outline-cyan"
                      style={{ padding: '8px 20px' }}
                    >
                      แสดงผลงานทั้งหมด
                    </button>
                  </div>
                ) : (
                  filteredWinners.map(w => (
                    <button type="button"
                      key={w.id}
                      onClick={() => setSelectedWinnerModal(w)}
                      className="winner-card"
                    >
                      <div className="winner-card-image-wrap">
                        <img 
                          src={WINNER_IMAGES[w.id] || w.image || '/winner-robot.jpg'} 
                          alt={w.titleTh} 
                          loading="lazy"
                          decoding="async"
                          className="winner-card-image"
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          {renderAwardBadge(w)}
                        </div>
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(7, 34, 26, 0.88)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--emerald-300)', border: '1px solid var(--border-subtle)' }}>
                          {w.trackingCode}
                        </div>
                      </div>

                      <div className="winner-card-body">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span className="badge-category" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.18)', borderColor: 'rgba(52, 211, 153, 0.4)', color: 'var(--emerald-300)' }}>
                              ปี {w.year || '2568'}
                            </span>
                            <span className="badge-category" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                              {getCategoryNameTh(w.category)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {w.educationLevel === 'below_higher' ? 'ต่ำกว่าอุดมศึกษา' : 'อุดมศึกษาขึ้นไป'}
                            </span>
                          </div>
                          <h4>{w.titleTh}</h4>
                          <div className="winner-card-en">{w.titleEn}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', fontWeight: 600, marginTop: '6px', marginBottom: '8px' }}>
                            ทีม {w.teamName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• {w.institution}</span>
                          </div>
                          <p>{w.abstractTh}</p>
                        </div>

                        <div className="winner-card-footer">
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {w.awardNameTh || 'ผลงานที่ได้รับรางวัล'}
                          </span>
                          <span className="winner-cta-link">
                            <span>อ่านสตอรี่ผลงาน</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

            </div>
          </section>
        </main>
      )}

      {/* ============================================================
          VIEW 6: ติดต่อ (CONTACT & DOWNLOADS)
          ============================================================ */}
      {currentView === 'contact' && (
        <main>
          <section className="section-wrapper">
            <div className="pro-container">
              
              <div className="section-header">
                <div className="badge-tag">
                  <Phone className="w-4 h-4" />
                  <span>CONTACT & DOWNLOAD CENTER</span>
                </div>
                <h2>ติดต่อสอบถามและดาวน์โหลดเอกสาร</h2>
                <p>
                  ช่องทางการติดต่อฝ่ายประสานงานโครงการ และดาวน์โหลดแบบฟอร์มเอกสารฉบับทางการ
                </p>
              </div>

              <div className="contact-layout">
                
                {/* Download Docs */}
                <div>
                  <div className="badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5em' }}>
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD CENTER</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>เอกสารประกอบการสมัคร</h3>
                  <p style={{ fontSize: '0.88rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    ดาวน์โหลดแบบฟอร์มข้อเสนอโครงการ และเอกสารประกาศเกณฑ์การประกวด
                  </p>

                  <div className="contact-download-list">
                    <a href="#" className="bento-tier-row contact-download-item" style={{ textDecoration: 'none', padding: '16px', background: 'rgba(7, 34, 26, 0.85)', border: '1px solid var(--border-medium)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ประกาศเกณฑ์การประกวดฉบับทางการ 2569.pdf</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เอกสาร PDF • 2.4 MB</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>

                    <a href="#" className="bento-tier-row contact-download-item" style={{ textDecoration: 'none', padding: '16px', background: 'rgba(7, 34, 26, 0.85)', border: '1px solid var(--border-medium)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-orange-400" />
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>แบบฟอร์มข้อเสนอโครงการ (Proposal Template).docx</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เอกสาร Word • 512 KB</div>
                        </div>
                      </div>
                        <Download className="w-4 h-4 text-orange-400" />
                    </a>
                  </div>
                </div>

                {/* Contact & Location */}
                <div>
                  <div className="badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5em' }}>
                    <MapPin className="w-4 h-4" />
                    <span>ORGANIZER DIRECTORY</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>อุทยานเทคโนโลยี มจพ.</h3>
                  <p style={{ fontSize: '0.88rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    อาคารอุทยานเทคโนโลยี มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (KMUTNB Techno Park)
                  </p>

                  <div className="contact-info-list">
                    <a 
                      href="tel:+6625552000" 
                      className="contact-info-card" 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                    >
                      <Phone className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>เบอร์โทรศัพท์ติดต่อและสายด่วน:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>+66 2 555-2000 ต่อ 1789, 1765</div>
                      </div>
                    </a>

                    <a 
                      href="https://lin.ee/M4J1KKs" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="contact-info-card" 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                    >
                      <LineLogo size={26} />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>LINE Official Account:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>@KMUTNB.inno.award (คลิกเพื่อเพิ่มเพื่อน)</div>
                      </div>
                    </a>

                    <a 
                      href="https://www.facebook.com/profile.php?id=61580844579823" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="contact-info-card" 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', textDecoration: 'none' }}
                    >
                      <FacebookLogo size={26} />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Facebook Fanpage:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>KMUTNB Innovation Awards (คลิกเพื่อเข้าชม)</div>
                      </div>
                    </a>

                    <div className="contact-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <Mail className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>อีเมลสอบถามข้อมูล:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>innoaward@kmutnb.ac.th</div>
                      </div>
                    </div>

                    <div className="contact-info-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>เว็บไซต์ทางการ:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>https://kmutnb-innoawards.com</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>
        </main>
      )}

      {/* GLOBAL FOOTER */}
      <footer className="site-footer">
        <div className="pro-container">
          <div className="site-footer-contact">
            <a href="https://www.facebook.com/profile.php?id=61580844579823" target="_blank" rel="noreferrer" aria-label="Facebook: KMUTNB Innovation Award" className="site-footer-contact-item">
              <FacebookLogo size={26} />
              <span>KMUTNB Innovation Award</span>
            </a>
            <a href="https://lin.ee/M4J1KKs" target="_blank" rel="noreferrer" aria-label="LINE: KMUTNB Innovation Award" className="site-footer-contact-item">
              <LineLogo size={26} />
              <span>@KMUTNB.inno.award</span>
            </a>
            <a href="tel:+6625552000" className="site-footer-contact-item">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+66 2 555-2000 ต่อ 1789, 1765</span>
            </a>
            <div className="footer-visitor-chip" aria-label="ยอดเข้าชมเว็บไซต์">
              <Eye className="footer-visitor-icon" aria-hidden="true" />
              <span>128,686+ เข้าชม</span>
            </div>
          </div>
          <div style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
            โครงการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569 (KMUTNB Innovation Awards 2026)
          </div>
          <div>© 2026 King Mongkut's University of Technology North Bangkok. All Rights Reserved.</div>
        </div>
      </footer>

      {/* --- MODAL 1: ENTERPRISE AUTH & SUBMISSION PORTAL --- */}
      {showPortalModal && (
        <div className="modal-overlay" onClick={() => setShowPortalModal(false)}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="portal-modal-title" onClick={e => e.stopPropagation()}>
            <button aria-label="ปิดหน้าต่างสมัครและส่งผลงาน" className="modal-close-btn" onClick={() => setShowPortalModal(false)}>
              <X className="w-5 h-5" />
            </button>

            {/* In-Modal Checklist Reminder */}
            <div className="modal-checklist-card">
              <strong id="portal-modal-title"><ClipboardList className="w-4 h-4" /> กรุณาเตรียมข้อมูลให้พร้อมก่อนสมัคร (Checklist):</strong>
              <ol>
                <li>ข้อมูลส่วนตัวของผู้สมัคร และทีมงาน</li>
                <li>รายละเอียดผลงานโดยสังเขป</li>
                <li>คลิป VDO นำเสนอผลงาน ความยาวเนื้อหา 2 - 3 นาที</li>
                <li>แบบฟอร์มการสมัครเข้าร่วมโครงการ</li>
              </ol>
            </div>

            <div className="modal-tabs">
              <button 
                onClick={() => setPortalTab('register')}
                className={`modal-tab-btn ${portalTab === 'register' ? 'active' : ''}`}
              >
                ลงทะเบียนบัญชีใหม่
              </button>
              <button 
                onClick={() => setPortalTab('login')}
                className={`modal-tab-btn ${portalTab === 'login' ? 'active' : ''}`}
              >
                เข้าสู่ระบบ
              </button>
              {user && (
                <button 
                  onClick={() => setPortalTab('submission')}
                  className={`modal-tab-btn ${portalTab === 'submission' ? 'active' : ''}`}
                  style={{ color: 'var(--gold-300)' }}
                >
                  ยื่นแบบเสนอผลงาน
                </button>
              )}
            </div>

            {/* TAB: REGISTER */}
            {portalTab === 'register' && (
              <form onSubmit={handleAuthRegister}>
                <div className="form-group">
                  <label htmlFor="reg-full-name" className="form-label">ชื่อ-นามสกุล ผู้เสนอผลงาน / หัวหน้าทีม *</label>
                  <input 
                    id="reg-full-name" type="text" required
                    className="form-input"
                    placeholder="เช่น นายพิพัทธ์ พัฒนาชัย"
                    value={regForm.fullName}
                    onChange={e => setRegForm({...regForm, fullName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">อีเมล (สำหรับรับผลการคัดเลือก) *</label>
                  <input 
                    id="reg-email" type="email" required
                    className="form-input"
                    placeholder="name@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-phone" className="form-label">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input 
                    id="reg-phone" type="tel" required
                    className="form-input"
                    placeholder="081-234-5678"
                    value={regForm.phone}
                    onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-institution" className="form-label">สถาบัน / โรงเรียน / บริษัท *</label>
                  <input 
                    id="reg-institution" type="text" required
                    className="form-input"
                    placeholder="เช่น มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
                    value={regForm.institution}
                    onChange={e => setRegForm({...regForm, institution: e.target.value})}
                  />
                </div>
                <button type="submit" disabled={authLoading} className="btn-solid-primary" style={{ width: '100%', marginTop: '12px' }}>
                  <UserPlus className="w-4 h-4" />
                  <span>{authLoading ? 'กำลังดำเนินการ...' : 'สร้างบัญชีและดำเนินการต่อ'}</span>
                </button>
              </form>
            )}

            {/* TAB: LOGIN */}
            {portalTab === 'login' && (
              <form onSubmit={handleAuthLogin}>
                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">กรอกอีเมลที่ใช้ลงทะเบียน *</label>
                  <input 
                    id="login-email" type="email" required
                    className="form-input"
                    placeholder="name@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                  />
                </div>
                <button type="submit" disabled={authLoading} className="btn-solid-primary" style={{ width: '100%', marginTop: '12px' }}>
                  <LogIn className="w-4 h-4" />
                  <span>{authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
                </button>
              </form>
            )}

            {/* TAB: SUBMISSION */}
            {portalTab === 'submission' && (
              <div>
                {subSuccess ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <CheckCircle2 className="w-14 h-14 text-emerald-400" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>ยื่นผลงานเรียบร้อยแล้ว!</h3>
                    <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>รหัสติดตามผลงานของคุณคือ:</p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-300)', background: 'var(--bg-base)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-cyan)', marginBottom: '24px' }}>
                      {subSuccess.trackingCode}
                    </div>
                    <button onClick={() => { setSubSuccess(null); setShowPortalModal(false); }} className="btn-outline-cyan">
                      ปิดหน้านี้
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="form-group">
                      <label htmlFor="submission-title-th" className="form-label">ชื่อผลงานสิ่งประดิษฐ์/นวัตกรรม (ภาษาไทย) *</label>
                      <input 
                        id="submission-title-th" type="text" required
                        className="form-input"
                        placeholder="เช่น หุ่นยนต์สำรวจภัยพิบัติอัจฉริยะ"
                        value={subForm.titleTh}
                        onChange={e => setSubForm({...subForm, titleTh: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label htmlFor="submission-category" className="form-label">หมวดหมู่นวัตกรรม *</label>
                        <select 
                          id="submission-category" className="form-input"
                          value={subForm.category}
                          onChange={e => setSubForm({...subForm, category: e.target.value})}
                        >
                          <option value="energy_environment">Energy & Environment</option>
                          <option value="food_agriculture">Food & Agriculture</option>
                          <option value="social_economy">Social & Economy</option>
                          <option value="medical_device">Medical Device</option>
                          <option value="material">Material</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="submission-level" className="form-label">ระดับการแข่งขัน *</label>
                        <select 
                          id="submission-level" className="form-input"
                          value={subForm.educationLevel}
                          onChange={e => setSubForm({...subForm, educationLevel: e.target.value})}
                        >
                          <option value="below_higher">ต่ำกว่าอุดมศึกษา (มัธยม / ปวช.)</option>
                          <option value="higher_and_above">ตั้งแต่อุดมศึกษาขึ้นไป (ป.ตรี-โท-เอก / ประชาชน)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="submission-team" className="form-label">ชื่อทีม / สถาบัน</label>
                      <input 
                        id="submission-team" type="text"
                        className="form-input"
                        placeholder="เช่น KMUTNB Robotics Lab"
                        value={subForm.teamName}
                        onChange={e => setSubForm({...subForm, teamName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="submission-abstract" className="form-label">บทคัดย่อ / คำอธิบายผลงานโดยสรุป</label>
                      <textarea 
                        id="submission-abstract" rows={3}
                        className="form-input"
                        placeholder="อธิบายหลักการทำงานและประโยชน์ของผลงาน..."
                        value={subForm.abstractTh}
                        onChange={e => setSubForm({...subForm, abstractTh: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="submission-video" className="form-label">ลิงก์คลิปวิดีโอแนะนำผลงาน ความยาว 2 - 3 นาที (YouTube / Google Drive)</label>
                      <input 
                        id="submission-video" type="url"
                        className="form-input"
                        placeholder="https://youtube.com/watch?v=..."
                        value={subForm.videoUrl}
                        onChange={e => setSubForm({...subForm, videoUrl: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="submission-cover-image" className="form-label">รูปภาพหน้าปกผลงาน / โปสเตอร์ (URL หรือ Path รูปภาพ)</label>
                      <input 
                        id="submission-cover-image" type="text"
                        className="form-input"
                        placeholder="เช่น /photo_candidates/robotics_engineer.jpg หรือ https://..."
                        value={subForm.coverImage}
                        onChange={e => setSubForm({...subForm, coverImage: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button type="button" disabled={submissionLoading} onClick={() => handleSubmission(true)} className="btn-outline-cyan" style={{ flex: 1 }}>
                        <Save className="w-4 h-4" />
                        <span>{submissionLoading ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง'}</span>
                      </button>
                      <button type="button" disabled={submissionLoading || timeLeft.expired} onClick={() => handleSubmission(false)} className="btn-solid-primary" style={{ flex: 1 }}>
                        <Send className="w-4 h-4" />
                        <span>{submissionLoading ? 'กำลังส่ง...' : 'ส่งผลงานฉบับสมบูรณ์'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 2: STATUS CHECK --- */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="status-modal-title" onClick={e => e.stopPropagation()}>
            <button aria-label="ปิดหน้าต่างตรวจสอบสถานะ" className="modal-close-btn" onClick={() => setShowStatusModal(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 id="status-modal-title" style={{ fontSize: '1.4rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search className="w-5 h-5 text-cyan-300" />
              <span>ตรวจสอบสถานะการสมัคร</span>
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
              กรอกรหัสติดตามผลงานเพื่อดูสถานะการพิจารณา (เช่น KMUTNB-2025-8821)
            </p>

            <form onSubmit={handleStatusCheck} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <label htmlFor="status-search" className="form-label" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>รหัสติดตามผลงาน</label>
              <input 
                id="status-search" type="text" required
                className="form-input"
                style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                placeholder="KMUTNB-XXXX-XXXX"
                value={trackingSearch}
                onChange={e => setTrackingSearch(e.target.value)}
              />
              <button type="submit" className="btn-solid-primary" style={{ flexShrink: 0 }}>
                <span>ค้นหา</span>
              </button>
            </form>

            {statusLoading && <div role="status" aria-live="polite" style={{ textAlign: 'center', color: 'var(--cyan-300)', fontSize: '0.88rem', padding: '16px' }}>กำลังค้นหาข้อมูล...</div>}

            {statusError && (
              <div role="alert" aria-live="assertive" style={{ padding: '12px 16px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '0.85rem', textAlign: 'center' }}>
                {statusError}
              </div>
            )}

            {statusResult && (
              <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '18px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700 }}>{statusResult.trackingCode}</span>
                  <span className="badge-category">{statusResult.status}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>{statusResult.titleTh}</div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>ทีม: {statusResult.teamName}</div>
                <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#059669', display: 'block', marginBottom: '4px' }}>ข้อความจากคณะกรรมการ:</strong>
                  <span style={{ color: 'var(--text-primary)' }}>{statusResult.feedback}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: WINNER STORYTELLING MODAL --- */}
      {selectedWinnerModal && (
        <div className="modal-overlay" onClick={() => setSelectedWinnerModal(null)}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="winner-modal-title" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <button aria-label="ปิดหน้าต่างรายละเอียดผลงาน" className="modal-close-btn" onClick={() => setSelectedWinnerModal(null)}>
              <X className="w-5 h-5" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {renderAwardBadge(selectedWinnerModal)}
              <span className="badge-category" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(52, 211, 153, 0.4)', color: 'var(--emerald-300)' }}>
                ปีการประกวด {selectedWinnerModal.year || '2568'}
              </span>
              <span className="badge-category">
                {getCategoryNameTh(selectedWinnerModal.category)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {selectedWinnerModal.educationLevel === 'below_higher' ? 'ระดับต่ำกว่าอุดมศึกษา' : 'ระดับอุดมศึกษาขึ้นไป'}
              </span>
            </div>

            <div style={{ width: '100%', height: '230px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', border: '1px solid var(--border-subtle)' }}>
              <img 
                src={WINNER_IMAGES[selectedWinnerModal.id] || selectedWinnerModal.image || '/winner-robot.jpg'} 
                alt={selectedWinnerModal.titleTh} 
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <h2 id="winner-modal-title" style={{ fontSize: '1.45rem', lineHeight: 1.4, marginBottom: '6px', color: 'var(--text-primary)' }}>
              {selectedWinnerModal.titleTh}
            </h2>
            <div style={{ color: 'var(--emerald-400)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '16px' }}>
              {selectedWinnerModal.titleEn}
            </div>

            {selectedWinnerModal.prizeDetails && (
              <div style={{ background: 'rgba(6, 78, 59, 0.25)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span style={{ fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.5 }}>
                  <strong style={{ color: '#FDE68A' }}>รางวัลที่ได้รับ: </strong>
                  {selectedWinnerModal.prizeDetails}
                </span>
              </div>
            )}

            <div style={{ background: 'rgba(7, 34, 26, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <h4 style={{ color: 'var(--emerald-300)', fontSize: '0.92rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen className="w-4 h-4" />
                <span>รายละเอียดและความโดดเด่นของนวัตกรรม (Problem & Solution)</span>
              </h4>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {selectedWinnerModal.abstractTh}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.84rem', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(7, 34, 26, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>ทีมผู้พัฒนา:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedWinnerModal.teamName}</strong>
              </div>
              <div style={{ background: 'rgba(7, 34, 26, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>สถาบันการศึกษา / หน่วยงาน:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedWinnerModal.institution || selectedWinnerModal.advisorName}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href={selectedWinnerModal.videoUrl || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="btn-solid-primary"
                style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>รับชมวิดีโอสาธิตผลงาน</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
