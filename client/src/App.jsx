import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy, Award, Rocket, Search, CheckCircle2,
  FileText, Download, UserCheck, ShieldCheck, ChevronRight,
  ExternalLink, X, LogIn, UserPlus, Send, Save,
  BookOpen, Layers, Calendar, MapPin, Phone, Mail, Globe,
  Zap, Leaf, Users, Activity, Box, GraduationCap, Building2, ArrowRight,
  CheckCircle, User, Video, ClipboardList, CheckSquare,
  BarChart3, FileCheck, Bell, Megaphone, Crown, Medal, Eye, Menu,
  Play, Pause, Copy, Maximize2, Film, Plus, Trash2
} from 'lucide-react';
import HeroThreeStage from './components/HeroThreeStage';
import DomainLivingCardBg from './components/DomainLivingCardBg';
import { DOMAIN_CATALOG, getDomainSampleWinners } from './components/domainCatalog';
import {
  createInitialSubmissionForm,
  validateSubmissionStep,
  buildSubmissionApiPayload,
  normalizeStatusDossier,
  formatCitizenIdInput,
  hydrateSubmissionFormFromServer,
  isSubmissionDeadlinePassed,
  MAX_PROJECTS_PER_ACCOUNT,
  DEFAULT_RUBRIC_CRITERIA,
  RUBRIC_SCORE_LEVELS,
  calculateWeightedRubricScore,
  validateRubricWeights
} from './components/submissionDossierUtils';


// Helper for public asset paths considering Vite BASE_URL (e.g. /innoawards/ on production)
const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  
  // If path already starts with base (e.g. /innoawards/...), return as is
  if (base !== '/' && path.startsWith(base)) {
    return path;
  }
  
  // Also check if path without leading slash starts with base without leading slash (e.g. innoawards/...)
  const baseNoSlash = base.replace(/^\/+|\/+$/g, '');
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (baseNoSlash && cleanPath.startsWith(baseNoSlash + '/')) {
    return `/${cleanPath}`;
  }
  
  return `${base}${cleanPath}`;
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// Official Brand Logos (Direct Official Image Assets)
const FacebookLogo = ({ size = 24, className = "" }) => (
  <img 
    src={getAssetUrl('/facebook.svg')} 
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
    src={getAssetUrl('/line.svg')} 
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

// Domain Definitions with Custom Background Images & Detailed Scope/Criteria
const DOMAIN_ICONS = {
  energy_environment: Zap,
  food_agriculture: Leaf,
  social_economy: Users,
  medical_device: Activity,
  material: Box,
};

const DOMAINS = DOMAIN_CATALOG.map((domain) => ({
  ...domain,
  icon: DOMAIN_ICONS[domain.id] || Box,
}));

// Project Poster Images & Video Assets for Awarded Works
const WINNER_IMAGES = {
  'sub-2026-01': '/osbi-poster.jpg',
  'KMUTNB-2569-0001': '/osbi-poster.jpg',
  'sub-2026-02': '/hdpe-poster.jpg',
  'KMUTNB-2569-0002': '/hdpe-poster.jpg',
  'sub-2026-03': '/growell-poster.jpg',
  'KMUTNB-2569-0003': '/growell-poster.jpg',
  'sub-2026-04': '/road-ai-poster.jpg',
  'KMUTNB-2569-0004': '/road-ai-poster.jpg',
  'sub-2026-05': '/geoweld-poster.jpg',
  'KMUTNB-2569-0005': '/geoweld-poster.jpg',
  'sub-2026-06': '/clara-poster.jpg',
  'KMUTNB-2569-0006': '/clara-poster.jpg',
  'event-highlight-2569': '/highlight-2569-poster.jpg',
  'EVENT-2569-HIGHLIGHT': '/highlight-2569-poster.jpg',
  'event-highlight-hype-2569': '/highlight-2569-hype-poster.jpg',
  'EVENT-2569-HYPE': '/highlight-2569-hype-poster.jpg'
};

const WINNER_VIDEOS = {
  'sub-2026-01': '/Osbi_ver2.mp4',
  'KMUTNB-2569-0001': '/Osbi_ver2.mp4',
  'sub-2026-02': '/hdpe-welding.mp4',
  'KMUTNB-2569-0002': '/hdpe-welding.mp4',
  'sub-2026-03': '/Growell.mp4',
  'KMUTNB-2569-0003': '/Growell.mp4',
  'sub-2026-04': '/road-ai.mp4',
  'KMUTNB-2569-0004': '/road-ai.mp4',
  'sub-2026-05': '/geoweld.mp4',
  'KMUTNB-2569-0005': '/geoweld.mp4',
  'sub-2026-06': '/clara.mp4',
  'KMUTNB-2569-0006': '/clara.mp4',
  'event-highlight-2569': '/highlight-2569.mp4',
  'EVENT-2569-HIGHLIGHT': '/highlight-2569.mp4',
  'event-highlight-hype-2569': '/highlight-2569-hype.mp4',
  'EVENT-2569-HYPE': '/highlight-2569-hype.mp4'
};

const WINNER_VIDEO_DURATIONS = {
  'sub-2026-01': '03:54',
  'KMUTNB-2569-0001': '03:54',
  'sub-2026-02': '02:46',
  'KMUTNB-2569-0002': '02:46',
  'sub-2026-03': '03:01',
  'KMUTNB-2569-0003': '03:01',
  'sub-2026-04': '02:48',
  'KMUTNB-2569-0004': '02:48',
  'sub-2026-05': '02:56',
  'KMUTNB-2569-0005': '02:56',
  'sub-2026-06': '02:59',
  'KMUTNB-2569-0006': '02:59',
  'event-highlight-2569': '02:07',
  'EVENT-2569-HIGHLIGHT': '02:07',
  'event-highlight-hype-2569': '01:29',
  'EVENT-2569-HYPE': '01:29'
};

const EVENT_HIGHLIGHT_HYPE_CHAPTERS = [
  { id: 'hook', time: 0, timeLabel: '00:00', label: '⚡ The Hook' },
  { id: 'arena', time: 12.0, timeLabel: '00:12', label: '🔥 เวที Pitching สด' },
  { id: 'prototypes', time: 27.6, timeLabel: '00:28', label: '🚀 ผลงานผู้ชนะ' },
  { id: 'royal_climax', time: 55.6, timeLabel: '00:56', label: '👑 ถ้วยพระราชทานฯ & 2570' }
];

const EVENT_HIGHLIGHT_CHAPTERS = [
  { id: 'opening', time: 5, timeLabel: '00:05', label: 'พิธีเปิดงาน' },
  { id: 'pitching', time: 35, timeLabel: '00:35', label: 'Pitching & สาธิตชิ้นงาน' },
  { id: 'awards', time: 80, timeLabel: '01:20', label: 'มอบรางวัลเกียรติยศ' },
  { id: 'royal_trophy', time: 98, timeLabel: '01:38', label: 'พิธีรับถ้วยพระราชทานฯ' }
];

const EVENT_HIGHLIGHT_HYPE_2569 = {
  id: 'event-highlight-hype-2569',
  trackingCode: 'EVENT-2569-HYPE',
  year: 2569,
  awardTier: 'grand_winner',
  awardNameTh: 'Hype Trailer ประมวลภาพไฮไลท์และผลงานชนะเลิศ ปี 2569',
  awardNameEn: 'Official High-Energy Hype Trailer 2026',
  awardBadgeText: '⚡ HYPE TRAILER • 2569',
  prizeDetails: 'รวมช็อตเด็ด 6 นวัตกรรมผู้ชนะรางวัล และวินาทีรับถ้วยพระราชทานฯ ณ อาคารอุทยานเทคโนโลยี มจพ.',
  titleTh: 'THE SPARK TO ROYAL GLORY • ไฮไลท์ปลุกพลังนวัตกรรมและพิธีมอบถ้วยพระราชทานฯ ปี 2569',
  titleEn: 'KMUTNB INNOVATION AWARDS • HIGH-ENERGY HYPE TRAILER',
  category: 'General Innovation',
  educationLevel: 'higher_and_above',
  teamName: 'อุทยานเทคโนโลยี มจพ. (KMUTNB Techno Park)',
  institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
  advisorName: 'อุทยานเทคโนโลยี มจพ.',
  abstractTh: 'วิดีโอไฮไลท์จังหวะเร้าใจ (High-Energy Hype Trailer) รวบรวมช็อตการทำงานจริงของ 6 ผลงานนวัตกรรมที่คว้ารางวัลประจำปี 2569 ตัดสลับบรรยากาศการนำเสนอผลงานรอบชิงชนะเลิศ (Final Pitching Arena) และวินาทีแห่งเกียรติยศในพิธีรับถ้วยพระราชทานฯ เพื่อจุดประกายผู้สมัครเข้าสู่เวทีปี 2570',
  coverImage: '/highlight-2569-hype-poster.jpg',
  videoUrl: '/highlight-2569-hype.mp4',
  videoDuration: '01:29'
};

const EVENT_HIGHLIGHT_2569 = {
  id: 'event-highlight-2569',
  trackingCode: 'EVENT-2569-HIGHLIGHT',
  year: 2569,
  awardTier: 'grand_winner',
  awardNameTh: 'ประมวลภาพบรรยากาศวันจัดงานจริง ประจำปี 2569',
  awardNameEn: 'Official Event Aftermovie 2026',
  awardBadgeText: 'OFFICIAL EVENT HIGHLIGHT • 2569',
  prizeDetails: 'จัดแสดงผลงานรอบชิงชนะเลิศและพิธีมอบถ้วยพระราชทานฯ เมื่อวันที่ 26 มิถุนายน 2569 ณ อาคารอุทยานเทคโนโลยี มจพ.',
  titleTh: 'ประมวลภาพบรรยากาศวันจัดงานประกวดและพิธีมอบถ้วยพระราชทานฯ ประจำปี 2569',
  titleEn: 'KMUTNB INNOVATION AWARDS 2026 • OFFICIAL EVENT HIGHLIGHT REEL',
  category: 'General Innovation',
  educationLevel: 'higher_and_above',
  teamName: 'อุทยานเทคโนโลยี มจพ. (KMUTNB Techno Park)',
  institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
  advisorName: 'อุทยานเทคโนโลยี มจพ.',
  abstractTh: 'บันทึกภาพบรรยากาศวันจัดงานประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569 (26 มิถุนายน 2569 ณ อาคารอุทยานเทคโนโลยี มจพ.) ครบทั้งพิธีเปิด การนำเสนอผลงานรอบชิงชนะเลิศ (Final Pitching) การสาธิตชิ้นงานต้นแบบต่อคณะกรรมการผู้ทรงคุณวุฒิ และพิธีมอบถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
  coverImage: '/highlight-2569-poster.jpg',
  videoUrl: '/highlight-2569.mp4',
  videoDuration: '02:07'
};

const getWinnerPosterUrl = (w) => {
  if (!w) return getAssetUrl('/winner-robot.jpg');
  return getAssetUrl(
    WINNER_IMAGES[w.id] ||
    WINNER_IMAGES[w.trackingCode] ||
    w.coverImage ||
    w.image ||
    '/winner-robot.jpg'
  );
};

const getWinnerVideoInfo = (w) => {
  if (!w) return { type: 'preview', src: null, rawUrl: '', duration: '03:00' };
  const rawUrl = (WINNER_VIDEOS[w.id] || WINNER_VIDEOS[w.trackingCode] || w.videoUrl || '').trim();
  const duration = WINNER_VIDEO_DURATIONS[w.id] || WINNER_VIDEO_DURATIONS[w.trackingCode] || w.videoDuration || '02:45';

  if (
    rawUrl &&
    (rawUrl.startsWith('/') ||
      rawUrl.startsWith('blob:') ||
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(rawUrl))
  ) {
    return {
      type: 'file',
      src: getAssetUrl(rawUrl),
      rawUrl,
      duration
    };
  }

  const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'embed',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      rawUrl,
      duration
    };
  }

  const driveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'embed',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      rawUrl,
      duration
    };
  }

  return {
    type: 'preview',
    src: null,
    rawUrl,
    duration
  };
};

// Official Seed / Fallback Data for Hall of Fame Winners
const FALLBACK_WINNERS = [
  // --- ประจำปี 2569 (2026) ---
  {
    id: 'sub-2026-01',
    trackingCode: 'KMUTNB-2569-0001',
    year: 2569,
    awardTier: 'grand_winner',
    awardNameTh: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)',
    awardNameEn: 'Grand Prize - Royal Trophy',
    awardBadgeText: 'รางวัลชนะเลิศ • ถ้วยพระราชทานฯ',
    prizeDetails: 'ได้รับถ้วยพระราชทานจาก สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดา ฯ สยามบรมราชกุมารี พร้อมเกียรติบัตร และเงินรางวัล 40,000 บาท',
    titleTh: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก',
    titleEn: '3D-Printed Titanium Coated with Bioactive Hyaluronic Acid Hydrogel for Orthopedic Applications',
    category: 'medical_device',
    educationLevel: 'higher_and_above',
    teamName: 'OsseBioMix',
    institution: 'คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'คณะวิทยาศาสตร์ประยุกต์ มจพ.',
    abstractTh: 'นวัตกรรมวัสดุการแพทย์ขั้นสูง ไทเทเนียมที่ผ่านกระบวนการพิมพ์ 3 มิติร่วมกับการเคลือบไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพ ช่วยเร่งการยึดติดของเซลล์กระดูกและลดการอักเสบติดเชื้อสำหรับการผ่าตัดทางศัลยกรรมกระดูก',
    coverImage: '/osbi-poster.jpg',
    videoUrl: '/Osbi_ver2.mp4',
    videoDuration: '03:54'
  },
  {
    id: 'sub-2026-02',
    trackingCode: 'KMUTNB-2569-0002',
    year: 2569,
    awardTier: 'runner_up_1',
    awardNameTh: 'รางวัลรองชนะเลิศอันดับ 1',
    awardNameEn: '1st Runner-Up',
    awardBadgeText: 'รองชนะเลิศอันดับ 1',
    prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 30,000 บาท',
    titleTh: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion',
    titleEn: 'Automatic HDPE Pipe Butt Fusion Welding Controller and Data Logger',
    category: 'energy_environment',
    educationLevel: 'higher_and_above',
    teamName: 'เขาชื่ออะไร',
    institution: 'คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'คณะครุศาสตร์อุตสาหกรรม มจพ.',
    abstractTh: 'อุปกรณ์ควบคุมและบันทึกข้อมูลการเชื่อมท่อพอลิเอทิลีนความหนาแน่นสูง (HDPE) แบบหลอมชนอัตโนมัติ เพื่อเพิ่มความแม่นยำ มาตรฐานความปลอดภัย และตรวจสอบย้อนกลับของคุณภาพแนวเชื่อมในงานวิศวกรรมระบบท่อ',
    coverImage: '/hdpe-poster.jpg',
    videoUrl: '/hdpe-welding.mp4',
    videoDuration: '02:46'
  },
  {
    id: 'sub-2026-03',
    trackingCode: 'KMUTNB-2569-0003',
    year: 2569,
    awardTier: 'runner_up_2',
    awardNameTh: 'รางวัลรองชนะเลิศอันดับ 2',
    awardNameEn: '2nd Runner-Up',
    awardBadgeText: 'รองชนะเลิศอันดับ 2',
    prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 20,000 บาท',
    titleTh: 'Growell: สารจับใบชีวภาพเพื่อเพิ่มประสิทธิภาพการใช้สารทางเกษตร',
    titleEn: 'Growell: Bio-Adjuvant for Agricultural Spraying Efficiency Enhancement',
    category: 'food_agriculture',
    educationLevel: 'higher_and_above',
    teamName: 'Lucyne Innovia Lab',
    institution: 'มหาวิทยาลัยเกษตรศาสตร์',
    advisorName: 'มหาวิทยาลัยเกษตรศาสตร์',
    abstractTh: 'นวัตกรรมสารเสริมประสิทธิภาพการฉีดพ่นทางการเกษตร (Bio-adjuvant) จากสารสกัดชีวภาพ ช่วยเพิ่มการกระจายตัว ยึดเกาะ และการดูดซึมสารอาหารบนใบพืช ลดการชะล้างและเป็นมิตรต่อสิ่งแวดล้อม',
    coverImage: '/growell-poster.jpg',
    videoUrl: '/Growell.mp4',
    videoDuration: '03:01'
  },
  {
    id: 'sub-2026-04',
    trackingCode: 'KMUTNB-2569-0004',
    year: 2569,
    awardTier: 'honorable_mention',
    awardNameTh: 'รางวัลชมเชย',
    awardNameEn: 'Honorable Mention',
    awardBadgeText: 'รางวัลชมเชย',
    prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 5,000 บาท',
    titleTh: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ความเสียหายและประมาณการค่าซ่อมถนนคอนกรีต',
    titleEn: 'Vehicle-Mounted AI Vision System and Web Application for Concrete Road Damage Detection and Repair Cost Estimation',
    category: 'social_economy',
    educationLevel: 'below_higher',
    teamName: 'ROAD AI',
    institution: 'โรงเรียนวารีเชียงใหม่',
    advisorName: 'โรงเรียนวารีเชียงใหม่',
    abstractTh: 'ระบบตรวจจับและประเมินสภาพความเสียหายของพื้นผิวถนนคอนกรีตแบบอัตโนมัติด้วยกล้องติดยานพาหนะร่วมกับโมเดล Deep Learning พร้อมเว็บแอปพลิเคชันประมาณการงบประมาณค่าซ่อมบำรุงแบบเรียลไทม์',
    coverImage: '/road-ai-poster.jpg',
    videoUrl: '/road-ai.mp4',
    videoDuration: '02:48'
  },
  {
    id: 'sub-2026-05',
    trackingCode: 'KMUTNB-2569-0005',
    year: 2569,
    awardTier: 'honorable_mention',
    awardNameTh: 'รางวัลชมเชย',
    awardNameEn: 'Honorable Mention',
    awardBadgeText: 'รางวัลชมเชย',
    prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 5,000 บาท',
    titleTh: 'แผ่นรองหลังแนวเชื่อมจีโอโพลิเมอร์ทนความร้อนสูงจากวัสดุเหลือทิ้งอุตสาหกรรม',
    titleEn: 'High-Temperature Resistant Geopolymer Backing Ceramic for Welding from Industrial By-products',
    category: 'material',
    educationLevel: 'higher_and_above',
    teamName: 'GeoWeld',
    institution: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
    advisorName: 'วิทยาลัยเทคโนโลยีอุตสาหกรรม มจพ.',
    abstractTh: 'นวัตกรรมแผ่นรองหลังแนวเชื่อมทนความร้อนสูงที่พัฒนาจากเถ้าลอยและกากของเสียอุตสาหกรรมด้วยกระบวนการจีโอโพลิเมอร์ ช่วยลดต้นทุนการนำเข้าวัสดุทนไฟจากต่างประเทศ และส่งเสริมเศรษฐกิจหมุนเวียน (Circular Economy)',
    coverImage: '/geoweld-poster.jpg',
    videoUrl: '/geoweld.mp4',
    videoDuration: '02:56'
  },
  {
    id: 'sub-2026-06',
    trackingCode: 'KMUTNB-2569-0006',
    year: 2569,
    awardTier: 'honorable_mention',
    awardNameTh: 'รางวัลชมเชย',
    awardNameEn: 'Honorable Mention',
    awardBadgeText: 'รางวัลชมเชย',
    prizeDetails: 'ได้รับเกียรติบัตร และเงินรางวัล 5,000 บาท',
    titleTh: 'ระบบการตรวจคัดกรองโรคมะเร็งตับผ่านการวิเคราะห์สารประกอบอินทรีย์ระเหยง่ายในลมหายใจด้วยระบบปัญญาประดิษฐ์',
    titleEn: 'AI-Powered Non-Invasive Liver Cancer Screening System via Breath Volatile Organic Compounds (VOCs) Analysis',
    category: 'medical_device',
    educationLevel: 'below_higher',
    teamName: 'CLARA',
    institution: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
    advisorName: 'โรงเรียนปรินส์รอยแยลส์วิทยาลัย',
    abstractTh: 'เครื่องตรวจคัดกรองความเสี่ยงโรคมะเร็งตับเบื้องต้นแบบไม่เจ็บตัว (Non-invasive) โดยการตรวจจับและวิเคราะห์รูปแบบของสารประกอบอินทรีย์ระเหยง่าย (VOCs) ในลมหายใจด้วยเซนเซอร์และอัลกอริทึม AI ที่แม่นยำสูง',
    coverImage: '/clara-poster.jpg',
    videoUrl: '/clara.mp4',
    videoDuration: '02:59'
  }
];

const getCategoryNameTh = (cat) => {
  switch (cat) {
    case 'energy_environment': return 'Energy & Environment';
    case 'food_agriculture': return 'Food & Agriculture';
    case 'social_economy': return 'Social & Economy';
    case 'medical_device': return 'Medical Device';
    case 'material': return 'Material';
    case 'others': return 'อื่นๆ (Others)';
    default: return cat || 'General Innovation';
  }
};

const renderAwardBadge = (w) => {
  const tier = w.awardTier || (w.id === 'sub-2026-01' ? 'grand_winner' : (w.id === 'sub-2026-02' ? 'runner_up_1' : (w.id === 'sub-2026-03' ? 'runner_up_2' : 'honorable_mention')));
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
        <span>{w.awardBadgeText || 'รองชนะเลิศอันดับ 1'}</span>
      </span>
    );
  }
  if (tier === 'runner_up_2') {
    return (
      <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.95), rgba(120, 53, 15, 0.9))', color: '#FEF3C7', border: '1px solid rgba(245, 158, 11, 0.7)' }}>
        <Medal className="w-3.5 h-3.5 text-amber-200" />
        <span>{w.awardBadgeText || 'รองชนะเลิศอันดับ 2'}</span>
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
    id: 'ann-2027-01',
    category: 'general',
    badgeText: 'ข่าวสารโครงการ',
    badgeClass: 'announcement-badge-general',
    date: '1 พฤศจิกายน 2569',
    title: 'เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2027 (ประจำปี 2570) ชิงถ้วยพระราชทานฯ',
    abstract: 'ขอเชิญชวนนักเรียน นักศึกษา นักวิจัย และประชาชนทั่วไป ส่งผลงานสิ่งประดิษฐ์และนวัตกรรมเข้าร่วมประกวด 5 สาขาเป้าหมาย ชิงถ้วยพระราชทานฯ และเงินรางวัลรวม 180,000 บาท เปิดรับสมัครตั้งแต่บัดนี้ – 28 ก.พ. 2570',
    pdfUrl: '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf',
    roster: []
  },
  {
    id: 'ann-2026-01',
    category: 'winners',
    badgeText: 'ประกาศผลรางวัลชนะเลิศ',
    badgeClass: 'announcement-badge-winners',
    date: 'มิถุนายน 2569',
    title: 'ประกาศผลการตัดสินรางวัลชนะเลิศ KMUTNB Innovation Awards 2026 (ประจำปี 2569) ครองถ้วยพระราชทานฯ',
    abstract: 'สรุปรายชื่อผลงานที่ได้รับรางวัลชนะเลิศ ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี และรางวัลเกียรติยศตามระดับการแข่งขัน ประจำปี 2569 (KMUTNB Innovation Awards 2026)',
    pdfUrl: '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf',
    roster: [
      { code: 'KMUTNB-2569-0001', title: 'ไทเทเนียมที่พิมพ์ 3 มิติเคลือบด้วยไฮโดรเจลกรดไฮยาลูรอนิกที่มีฤทธิ์ทางชีวภาพสำหรับการประยุกต์ใช้ทางด้านศัลยกรรมกระดูก', team: 'OsseBioMix', level: 'รางวัลชนะเลิศ • อุดมศึกษาและบุคคลทั่วไป' },
      { code: 'KMUTNB-2569-0002', title: 'เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion', team: 'เขาชื่ออะไร', level: 'รองชนะเลิศอันดับ 1 • อุดมศึกษาและบุคคลทั่วไป' },
      { code: 'KMUTNB-2569-0003', title: 'Growell: สารจับใบชีวภาพเพื่อเพิ่มประสิทธิภาพการใช้สารทางเกษตร', team: 'Lucyne Innovia Lab', level: 'รองชนะเลิศอันดับ 2 • อุดมศึกษาและบุคคลทั่วไป' },
      { code: 'KMUTNB-2569-0004', title: 'ระบบกล้องติดยานพาหนะและเว็บแอปพลิเคชัน AI สำหรับวิเคราะห์ความเสียหายและประมาณการค่าซ่อมถนนคอนกรีต', team: 'ROAD AI', level: 'รางวัลชมเชย • ต่ำกว่าอุดมศึกษา' },
      { code: 'KMUTNB-2569-0005', title: 'แผ่นรองหลังแนวเชื่อมจีโอโพลิเมอร์ทนความร้อนสูงจากวัสดุเหลือทิ้งอุตสาหกรรม', team: 'GeoWeld', level: 'รางวัลชมเชย • อุดมศึกษาและบุคคลทั่วไป' },
      { code: 'KMUTNB-2569-0006', title: 'ระบบการตรวจคัดกรองโรคมะเร็งตับผ่านการวิเคราะห์สารประกอบอินทรีย์ระเหยง่ายในลมหายใจด้วยระบบปัญญาประดิษฐ์', team: 'CLARA', level: 'รางวัลชมเชย • ต่ำกว่าอุดมศึกษา' }
    ]
  }
];

// Default target deadline (can be overridden by VITE_SUBMISSION_DEADLINE or GET /api/config)
const DEFAULT_SUBMISSION_DEADLINE_ISO =
  import.meta.env.VITE_SUBMISSION_DEADLINE || '2027-02-28T23:59:59+07:00';
const TARGET_DEADLINE = new Date(DEFAULT_SUBMISSION_DEADLINE_ISO).getTime();

export default function App() {
  // Navigation & View Routing State
  const parseRoute = () => {
    const route = window.location.hash.replace(/^#\//, '');
    const [view] = route.split('#');
    if (view === 'winners' || view === 'halloffame') {
      return 'halloffame';
    }
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
  const [playingCardId, setPlayingCardId] = useState(null);
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
    password: '',
    fullName: '',
    phone: '',
    institution: '',
    educationLevel: 'higher_and_above'
  });

  const [subForm, setSubForm] = useState(createInitialSubmissionForm);
  const [submissionStep, setSubmissionStep] = useState(1);
  const [showLateArtifactEditor, setShowLateArtifactEditor] = useState(false);
  const [lateArtifactsForm, setLateArtifactsForm] = useState({ posterUrl: '', presentationUrl: '' });
  const [lateArtifactSaving, setLateArtifactSaving] = useState(false);
  const [lateArtifactNotice, setLateArtifactNotice] = useState('');

  const [subSuccess, setSubSuccess] = useState(null);
  const [draftNotice, setDraftNotice] = useState('');
  const [copiedTrackingCode, setCopiedTrackingCode] = useState(false);
  const [isPausedHeroStage, setIsPausedHeroStage] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [mySubmissionsLoading, setMySubmissionsLoading] = useState(false);
  const [submissionDeadlineIso, setSubmissionDeadlineIso] = useState(DEFAULT_SUBMISSION_DEADLINE_ISO);

  // Multi-Year Judging, Dynamic Categories & Weighted Rubric State
  const [dynamicCategories, setDynamicCategories] = useState([
    { code: 'energy_environment', nameTh: 'พลังงานและสิ่งแวดล้อม', nameEn: 'Energy & Environment' },
    { code: 'food_agriculture', nameTh: 'เกษตรและอาหารแปรรูป', nameEn: 'Food & Agriculture' },
    { code: 'social_economy', nameTh: 'เศรษฐกิจและสังคมดิจิทัล', nameEn: 'Social & Economy' },
    { code: 'medical_device', nameTh: 'เครื่องมือแพทย์และสาธารณสุข', nameEn: 'Medical Device' },
    { code: 'material', nameTh: 'วัสดุศาสตร์และเทคโนโลยีก้าวหน้า', nameEn: 'Material' },
    { code: 'others', nameTh: 'อื่นๆ (สิ่งประดิษฐ์และนวัตกรรมทั่วไป)', nameEn: 'Others' }
  ]);
  const [rubricCriteria, setRubricCriteria] = useState(DEFAULT_RUBRIC_CRITERIA);
  const [availableYears, setAvailableYears] = useState([
    { year: 2570, isActive: true, submissionDeadline: DEFAULT_SUBMISSION_DEADLINE_ISO },
    { year: 2569, isActive: false, submissionDeadline: '2026-02-28T23:59:59+07:00' }
  ]);
  const [selectedJudgeYear, setSelectedJudgeYear] = useState(2570);
  const [showJudgingModal, setShowJudgingModal] = useState(false);
  const [judgingTab, setJudgingTab] = useState('queue'); // 'queue' | 'judges' | 'setup'
  const [judgeRoundFilter, setJudgeRoundFilter] = useState('ROUND_1'); // 'all' | 'SCREENING' | 'ROUND_1' | 'ROUND_2' | 'ROUND_3'
  const [judgeCategoryFilter, setJudgeCategoryFilter] = useState('all');
  const [judgeLevelFilter, setJudgeLevelFilter] = useState('all');
  const [judgingSubmissions, setJudgingSubmissions] = useState([]);
  const [judgingLoading, setJudgingLoading] = useState(false);
  const [judgingNotice, setJudgingNotice] = useState('');
  const [judgingError, setJudgingError] = useState('');
  const [activeEvalSubmission, setActiveEvalSubmission] = useState(null);
  const [evalRound, setEvalRound] = useState('ROUND_1');
  const [evalScores, setEvalScores] = useState({});
  const [evalComment, setEvalComment] = useState('');
  const [evalSaving, setEvalSaving] = useState(false);
  const [judgesList, setJudgesList] = useState([]);
  const [newJudgeForm, setNewJudgeForm] = useState({
    email: '',
    fullName: '',
    password: '',
    institution: '',
    categoryCodes: []
  });
  const [newCategoryForm, setNewCategoryForm] = useState({
    code: '',
    nameTh: '',
    nameEn: '',
    description: ''
  });
  const [newYearForm, setNewYearForm] = useState({
    year: 2571,
    submissionDeadline: '2028-02-28T23:59:59+07:00',
    cloneFromYear: 2570
  });
  const [publishRoundForm, setPublishRoundForm] = useState({
    round: 'ROUND_1',
    title: ''
  });
  const [deadlineEditValue, setDeadlineEditValue] = useState(DEFAULT_SUBMISSION_DEADLINE_ISO);

  const deadlinePassed = isSubmissionDeadlinePassed(submissionDeadlineIso);

  const fetchConfigForYear = (yearParam = null) => {
    const query = yearParam ? `?year=${encodeURIComponent(yearParam)}` : '';
    fetch(`${API_BASE}/config${query}`)
      .then(res => res.json())
      .then(data => {
        if (data?.event?.submissionDeadline) {
          if (!yearParam) {
            setSubmissionDeadlineIso(data.event.submissionDeadline);
          }
          setDeadlineEditValue(data.event.submissionDeadline);
        }
        if (data?.event?.year && !yearParam) {
          setSelectedJudgeYear(Number(data.event.year));
        }
        const yearsList = data?.years || data?.availableYears;
        if (Array.isArray(yearsList) && yearsList.length > 0) {
          setAvailableYears(yearsList);
        }
        const categoriesList = data?.categories || data?.masters?.categories;
        if (Array.isArray(categoriesList) && categoriesList.length > 0) {
          setDynamicCategories(categoriesList);
        }
        const rubricList = data?.rubricConfig || data?.rubric?.criteria;
        if (Array.isArray(rubricList) && rubricList.length > 0) {
          setRubricCriteria(rubricList);
        }
      })
      .catch(() => {});
  };

  const fetchJudgingWorkspace = (yearOverride = selectedJudgeYear, tokenOverride = authToken) => {
    const activeToken = tokenOverride || authToken;
    if (!activeToken) return;
    const targetYear = Number(yearOverride || selectedJudgeYear || 2570);
    setJudgingLoading(true);
    setJudgingError('');

    fetch(`${API_BASE}/judging/submissions?year=${targetYear}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJudgingSubmissions(Array.isArray(data.data) ? data.data : []);
          const workspaceRubric = data.rubricConfig || data.rubric?.criteria;
          if (Array.isArray(workspaceRubric) && workspaceRubric.length > 0) {
            setRubricCriteria(workspaceRubric);
          }
        } else {
          setJudgingError(data.message || 'ไม่สามารถดึงรายการผลงานสำหรับประเมินได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ระบบประเมินได้'))
      .finally(() => setJudgingLoading(false));

    fetch(`${API_BASE}/judging/judges?year=${targetYear}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setJudgesList(data.data);
        }
      })
      .catch(() => {});
  };

  const openEvaluationDrawer = (sub, defaultRound = judgeRoundFilter) => {
    const targetRound = ['ROUND_1', 'ROUND_2', 'ROUND_3'].includes(defaultRound)
      ? defaultRound
      : 'ROUND_1';
    setActiveEvalSubmission(sub);
    setEvalRound(targetRound);
    const existing = Array.isArray(sub.myEvaluations)
      ? sub.myEvaluations.find(ev => ev.round === targetRound)
      : sub.myEvaluations?.[targetRound];
    if (existing && existing.scores) {
      setEvalScores(existing.scores);
      setEvalComment(existing.comment || '');
    } else {
      const initialScores = {};
      for (const crit of rubricCriteria) {
        initialScores[crit.id] = 4;
      }
      setEvalScores(initialScores);
      setEvalComment('');
    }
  };

  const handleSaveEvaluation = (e) => {
    e.preventDefault();
    if (!activeEvalSubmission || evalSaving) return;
    setEvalSaving(true);
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/judging/submissions/${activeEvalSubmission.id}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        round: evalRound,
        scores: evalScores,
        comment: evalComment
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const savedTotal = data.data?.weightedTotal ?? data.evaluation?.weightedTotal ?? calculateWeightedRubricScore(evalScores, rubricCriteria);
          setJudgingNotice(`บันทึกคะแนน ${evalRound} สำเร็จ (คะแนนรวมถ่วงน้ำหนัก ${savedTotal} / 100)`);
          setActiveEvalSubmission(null);
          fetchJudgingWorkspace(selectedJudgeYear, authToken);
        } else {
          setJudgingError(data.message || 'ไม่สามารถบันทึกคะแนนประเมินได้');
        }
      })
      .catch(() => setJudgingError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'))
      .finally(() => setEvalSaving(false));
  };

  const handleAdminStatusAdvance = (submissionId, payload, successLabel) => {
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/submissions/${submissionId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJudgingNotice(successLabel || 'อัปเดตสถานะโครงการเรียบร้อยแล้ว');
          fetchJudgingWorkspace(selectedJudgeYear, authToken);
        } else {
          setJudgingError(data.message || 'ไม่สามารถอัปเดตสถานะโครงการได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handleCreateOrUpdateJudge = (e) => {
    e.preventDefault();
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/judging/judges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        email: newJudgeForm.email,
        fullName: newJudgeForm.fullName,
        password: newJudgeForm.password || undefined,
        institution: newJudgeForm.institution || undefined,
        categories: newJudgeForm.categoryCodes,
        year: selectedJudgeYear
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJudgingNotice('บันทึกข้อมูลกรรมการและผูกกลุ่มนวัตกรรมเรียบร้อยแล้ว');
          setNewJudgeForm({ email: '', fullName: '', password: '', institution: '', categoryCodes: [] });
          fetchJudgingWorkspace(selectedJudgeYear, authToken);
        } else {
          setJudgingError(data.message || 'ไม่สามารถบันทึกข้อมูลกรรมการได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handleToggleJudgeCategory = (judge, categoryCode) => {
    const currentCodes = (judge.assignedCategories || []).map(c => (typeof c === 'string' ? c : c?.code)).filter(Boolean);
    const nextCodes = currentCodes.includes(categoryCode)
      ? currentCodes.filter(c => c !== categoryCode)
      : [...currentCodes, categoryCode];

    fetch(`${API_BASE}/judging/judges/${judge.id}/categories`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        year: selectedJudgeYear,
        categories: nextCodes
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJudgingNotice(`อัปเดตกลุ่มนวัตกรรมของ ${judge.fullName} เรียบร้อยแล้ว`);
          fetchJudgingWorkspace(selectedJudgeYear, authToken);
        } else {
          setJudgingError(data.message || 'ไม่สามารถอัปเดตกลุ่มนวัตกรรมของกรรมการได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handleSaveRubricWeights = (e) => {
    e.preventDefault();
    const weightErr = validateRubricWeights(rubricCriteria);
    if (weightErr) {
      setJudgingError(weightErr);
      return;
    }
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/config/rubric`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        year: selectedJudgeYear,
        criteria: rubricCriteria
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const updatedRubric = data.rubricConfig || data.data?.criteria;
          if (Array.isArray(updatedRubric)) {
            setRubricCriteria(updatedRubric);
          }
          setJudgingNotice(`บันทึกเกณฑ์รูบริกและค่าน้ำหนักประจำปี ${selectedJudgeYear} เรียบร้อยแล้ว (รวม 100%)`);
        } else {
          setJudgingError(data.message || 'ไม่สามารถบันทึกเกณฑ์รูบริกได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handleSaveDynamicCategory = (e) => {
    e.preventDefault();
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/config/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        code: newCategoryForm.code,
        nameTh: newCategoryForm.nameTh,
        nameEn: newCategoryForm.nameEn || undefined,
        descriptionTh: newCategoryForm.description || undefined,
        year: selectedJudgeYear,
        isActive: true
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJudgingNotice(`เพิ่ม/อัปเดตกลุ่มนวัตกรรม "${newCategoryForm.nameTh}" สำหรับปี ${selectedJudgeYear} สำเร็จ`);
          setNewCategoryForm({ code: '', nameTh: '', nameEn: '', description: '' });
          fetchConfigForYear(selectedJudgeYear);
        } else {
          setJudgingError(data.message || 'ไม่สามารถบันทึกกลุ่มนวัตกรรมได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handleUpdateDeadline = (e) => {
    e.preventDefault();
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/config/deadline`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        year: selectedJudgeYear,
        submissionDeadline: deadlineEditValue
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const updatedDeadline = data.submissionDeadline || data.data?.submissionDeadline || deadlineEditValue;
          setSubmissionDeadlineIso(updatedDeadline);
          setJudgingNotice(`อัปเดตวันปิดรับสมัครปี ${selectedJudgeYear} เป็น ${updatedDeadline} สำเร็จ`);
        } else {
          setJudgingError(data.message || 'ไม่สามารถอัปเดตวันปิดรับสมัครได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handlePublishRoundResults = (e) => {
    e.preventDefault();
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/judging/publish-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        year: selectedJudgeYear,
        stage: publishRoundForm.round,
        title: publishRoundForm.title || undefined
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJudgingNotice(`เผยแพร่ประกาศผล ${publishRoundForm.round} ประจำปี ${selectedJudgeYear} ขึ้นหน้าเว็บไซต์เรียบร้อยแล้ว`);
          fetch(`${API_BASE}/announcements`)
            .then(r => r.json())
            .then(annData => {
              if (Array.isArray(annData?.data) && annData.data.length > 0) {
                setAnnouncementsList(annData.data);
              }
            })
            .catch(() => {});
        } else {
          setJudgingError(data.message || 'ไม่สามารถเผยแพร่ประกาศผลได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const handleCreateNextYear = (e) => {
    e.preventDefault();
    setJudgingError('');
    setJudgingNotice('');
    fetch(`${API_BASE}/config/years`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        year: Number(newYearForm.year),
        submissionDeadline: newYearForm.submissionDeadline,
        cloneFromYear: Number(newYearForm.cloneFromYear),
        isActive: true
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const createdYear = Number(data.data?.year || newYearForm.year);
          setSelectedJudgeYear(createdYear);
          fetchConfigForYear(createdYear);
          fetchJudgingWorkspace(createdYear, authToken);
          setJudgingNotice(`เปิดปีการแข่งขัน พ.ศ. ${createdYear} สำเร็จ (คัดลอกกลุ่มนวัตกรรมและเกณฑ์คะแนนจากปี ${newYearForm.cloneFromYear} เรียบร้อย)`);
        } else {
          setJudgingError(data.message || 'ไม่สามารถสร้างปีการแข่งขันใหม่ได้');
        }
      })
      .catch(() => setJudgingError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'));
  };

  const fetchMySubmissions = (tokenOverride = authToken) => {
    const activeToken = tokenOverride || authToken;
    if (!activeToken) {
      setMySubmissions([]);
      return;
    }
    setMySubmissionsLoading(true);
    fetch(`${API_BASE}/submissions/my`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setMySubmissions(data.data);
          setSubForm(prev => {
            const belongsToCurrentUser = prev.id && data.data.some(s => s.id === prev.id);
            if (prev.id && !belongsToCurrentUser) {
              return data.data.length > 0
                ? hydrateSubmissionFormFromServer(data.data[0])
                : createEmptySubmissionForm();
            }
            if (data.data.length > 0 && !prev.id && !prev.titleTh) {
              return hydrateSubmissionFormFromServer(data.data[0]);
            }
            return prev;
          });
        }
      })
      .catch(() => {})
      .finally(() => setMySubmissionsLoading(false));
  };

  // Restore draft submission from localStorage if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('kmutnb_draft_submission');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          setSubForm(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchMySubmissions(authToken);
    }
  }, [authToken]);

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
  const calculateTimeLeft = (deadlineStr = submissionDeadlineIso) => {
    const now = new Date().getTime();
    const targetMs = new Date(deadlineStr || DEFAULT_SUBMISSION_DEADLINE_ISO).getTime() || TARGET_DEADLINE;
    const diff = targetMs - now;

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

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(DEFAULT_SUBMISSION_DEADLINE_ISO));
  const [hoveredDomainIndex, setHoveredDomainIndex] = useState(null);
  const [displayedDomainIndex, setDisplayedDomainIndex] = useState(-1);
  const [detailDomainModal, setDetailDomainModal] = useState(null);
  const [subError, setSubError] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(parseRoute());
    };
    window.addEventListener('hashchange', handleHashChange);

    fetchConfigForYear();

    fetch(`${API_BASE}/winners`)
      .then(res => res.json())
      .then(data => setWinners(data.data || []))
      .catch(err => console.warn('Using local fallback for winners:', err));

    fetch(`${API_BASE}/announcements`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          const mapped = data.data.map(ann => {
            let pdf = ann.pdfUrl;
            if (!pdf || pdf === '#') {
              if (ann.id === 'ann-2027-01' || ann.title?.includes('2027') || ann.title?.includes('2570')) {
                pdf = '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf';
              } else {
                pdf = '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf';
              }
            }
            return { ...ann, pdfUrl: pdf };
          });
          setAnnouncementsList(mapped);
        }
      })
      .catch(err => console.warn('Using local fallback for announcements:', err));

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(submissionDeadlineIso));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(submissionDeadlineIso));
    }, 1000);
    return () => clearInterval(interval);
  }, [submissionDeadlineIso]);

  useEffect(() => {
    const hasOpenModal = showPortalModal || showStatusModal || selectedWinnerModal || detailDomainModal || showJudgingModal;
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
        setDetailDomainModal(null);
        setShowJudgingModal(false);
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
  }, [showPortalModal, portalTab, subSuccess, showStatusModal, selectedWinnerModal, detailDomainModal, showJudgingModal]);

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

  const handleLogout = () => {
    setUser(null);
    setAuthToken('');
    setMySubmissions([]);
    setSubForm(createEmptySubmissionForm());
    setSubSuccess(null);
    setAuthError('');
    setSubError('');
    setDraftNotice('');
    setPortalTab('login');
    try {
      localStorage.removeItem('innoaward_token');
      localStorage.removeItem('innoaward_user');
      localStorage.removeItem('kmutnb_draft_submission');
    } catch {}
  };

  const handleAuthRegister = (e) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthError('');
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
            fetchMySubmissions(data.token);
            if (data.user?.role === 'ADMIN' || data.user?.role === 'JUDGE') {
              fetchJudgingWorkspace(selectedJudgeYear, data.token);
            }
          }
          if (data.user?.role === 'ADMIN' || data.user?.role === 'JUDGE') {
            setShowPortalModal(false);
            setShowJudgingModal(true);
          } else {
            setPortalTab('submission');
          }
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } else {
          setAuthError(data.message || 'ไม่สามารถลงทะเบียนได้ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        }
      })
      .catch(() => {
        setAuthError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setAuthLoading(false));
  };

  const handleAuthLogin = (e) => {
    e.preventDefault();
    if (authLoading) return;
    if (!regForm.email.trim() || !regForm.password) {
      setAuthError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }
    setAuthError('');
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
            fetchMySubmissions(data.token);
            if (data.user?.role === 'ADMIN' || data.user?.role === 'JUDGE') {
              fetchJudgingWorkspace(selectedJudgeYear, data.token);
            }
          }
          if (data.user?.role === 'ADMIN' || data.user?.role === 'JUDGE') {
            setShowPortalModal(false);
            setShowJudgingModal(true);
          } else {
            setPortalTab('submission');
          }
        } else {
          setAuthError(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดลองใหม่อีกครั้ง');
        }
      })
      .catch(() => {
        setAuthError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง');
      })
      .finally(() => setAuthLoading(false));
  };

  const handleSubmission = (isDraft = false) => {
    if (submissionLoading) return;

    if (deadlinePassed && user?.role !== 'ADMIN') {
      setSubError('ปิดรับสมัครและสิ้นสุดเวลาแก้ไขข้อมูลใบสมัครแล้ว (หากต้องการแนบโปสเตอร์หรือสไลด์นำเสนอ กรุณากดดูแฟ้มสถานะของโครงการ)');
      return;
    }

    if (!subForm.id && mySubmissions.length >= MAX_PROJECTS_PER_ACCOUNT && user?.role !== 'ADMIN') {
      setSubError(`บัญชีของคุณสร้างผลงานครบโควตาสูงสุด ${MAX_PROJECTS_PER_ACCOUNT} โครงการแล้ว (กรุณาเลือกแก้ไขโครงการเดิมจากรายการผลงานของฉันด้านบน)`);
      return;
    }

    if (isDraft) {
      const draftErr = validateSubmissionStep(subForm, 0, true);
      if (draftErr) {
        setSubError(draftErr);
        return;
      }
      try {
        localStorage.setItem('kmutnb_draft_submission', JSON.stringify(subForm));
      } catch {}

      if (authToken) {
        setSubmissionLoading(true);
        setSubError('');
        const draftPayload = buildSubmissionApiPayload(subForm, true, user?.id || 'guest-user');
        fetch(`${API_BASE}/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(draftPayload)
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              setSubForm(hydrateSubmissionFormFromServer(data.data));
              fetchMySubmissions(authToken);
              setDraftNotice(`บันทึกแบบร่างขึ้นระบบบัญชีสำเร็จ (${data.data.trackingCode})! คุณสามารถล็อกอินกลับมาแก้ไขต่อได้จนถึงวันปิดรับสมัคร`);
            } else {
              setSubError(data.message || 'ไม่สามารถบันทึกแบบร่างได้');
            }
          })
          .catch(() => {
            setDraftNotice('บันทึกแบบร่างไว้ในเครื่องเรียบร้อยแล้ว');
          })
          .finally(() => setSubmissionLoading(false));
        return;
      }

      setDraftNotice('บันทึกแบบร่างสำเร็จเรียบร้อยแล้ว! ข้อมูลถูกเก็บไว้ในเครื่องของคุณและสามารถแก้ไขหรือส่งต่อได้ตลอดเวลา');
      setSubError('');
      return;
    }

    // Validate all 3 steps in order
    for (const s of [1, 2, 3]) {
      const stepErr = validateSubmissionStep(subForm, s, false);
      if (stepErr) {
        setSubmissionStep(s);
        setSubError(stepErr);
        return;
      }
    }

    setSubError('');
    setDraftNotice('');
    setSubmissionLoading(true);

    const apiPayload = buildSubmissionApiPayload(subForm, false, user?.id || 'guest-user');

    const finishSuccessSubmission = (code, serverData = null) => {
      const submissionRecord = normalizeStatusDossier({
        ...apiPayload,
        ...(serverData || {}),
        userId: user?.id || serverData?.userId || '',
        canEditArtifacts: true,
        trackingCode: code,
        submittedAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: 'SUBMITTED',
        rounds: {
          round1: { label: 'รอบคัดเลือกเอกสาร', status: serverData?.round1Status || 'PENDING' },
          round2: { label: 'รอบการประกวดออนไลน์', status: serverData?.round2Status || 'PENDING' },
          round3: { label: 'รอบตัดสิน', status: serverData?.round3Status || 'PENDING', result: serverData?.round3Result || 'รอประกาศผล' }
        },
        feedback: 'เอกสารข้อเสนอโครงการได้รับการบันทึกในระบบเรียบร้อยแล้ว อยู่ระหว่างการตรวจสอบคุณสมบัติและเอกสารโดยคณะกรรมการ'
      });

      try {
        const history = JSON.parse(localStorage.getItem('kmutnb_submissions_history') || '[]');
        const filtered = history.filter(item => item.trackingCode !== code);
        localStorage.setItem('kmutnb_submissions_history', JSON.stringify([submissionRecord, ...filtered]));
        localStorage.removeItem('kmutnb_draft_submission');
      } catch {}

      if (authToken) {
        fetchMySubmissions(authToken);
      }
      setSubSuccess(submissionRecord);
      setSubForm(createInitialSubmissionForm());
      setSubmissionStep(1);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    };

    fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(apiPayload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.trackingCode) {
          finishSuccessSubmission(data.data.trackingCode, data.data);
        } else if (data.message) {
          setSubError(data.message);
        } else {
          const mockCode = `KMUTNB-2570-${Math.floor(1000 + Math.random() * 9000)}`;
          finishSuccessSubmission(mockCode);
        }
      })
      .catch(() => {
        const mockCode = `KMUTNB-2570-${Math.floor(1000 + Math.random() * 9000)}`;
        finishSuccessSubmission(mockCode);
      })
      .finally(() => setSubmissionLoading(false));
  };

  const executeStatusSearch = (rawQuery) => {
    const query = String(rawQuery || '').trim();
    if (!query) return;

    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);
    setShowLateArtifactEditor(false);
    setLateArtifactNotice('');

    const applyStatusDossier = (rawDossier) => {
      const normalized = normalizeStatusDossier(rawDossier);
      setStatusResult(normalized);
      setLateArtifactsForm({
        posterUrl: normalized.artifacts?.posterUrl || '',
        presentationUrl: normalized.artifacts?.presentationUrl || ''
      });
    };

    const checkFallback = () => {
      // 1. Check local submissions history (for offline-created submissions)
      try {
        const history = JSON.parse(localStorage.getItem('kmutnb_submissions_history') || '[]');
        const matched = history.find(item => item.trackingCode.toLowerCase() === query.toLowerCase());
        if (matched) {
          applyStatusDossier(matched);
          return;
        }
      } catch {}

      // 2. Built-in 2569 official winners fallback (KMUTNB-2569-0001 .. KMUTNB-2569-0006)
      const qUpper = query.toUpperCase();
      const match2569 = qUpper.match(/2569-000([1-6])/);
      if (match2569) {
        applyStatusDossier({ trackingCode: `KMUTNB-2569-000${match2569[1]}` });
      } else if (qUpper.startsWith('KMUTNB-2570-') || qUpper.startsWith('KMUTNB-2569-')) {
        applyStatusDossier({
          trackingCode: qUpper,
          titleTh: 'โครงงานสิ่งประดิษฐ์และนวัตกรรม (ประจำปี 2570)',
          teamName: 'ทีมผู้สมัครนวัตกรรม',
          status: 'SUBMITTED'
        });
      } else {
        setStatusError('ไม่พบรหัสติดตามผลงานนี้ในระบบ (กรุณาตรวจสอบรหัสในรูปแบบ KMUTNB-2570-XXXX หรือทดสอบด้วย KMUTNB-2569-0002)');
      }
    };

    fetch(`${API_BASE}/submissions/status/${query}`, {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setStatusLoading(false);
        if (data.success && data.data) {
          applyStatusDossier(data.data);
        } else {
          checkFallback();
        }
      })
      .catch(() => {
        setStatusLoading(false);
        checkFallback();
      });
  };

  const handleStatusCheck = (e) => {
    e.preventDefault();
    executeStatusSearch(trackingSearch);
  };

  const handleSaveLateArtifacts = (e) => {
    e.preventDefault();
    if (!statusResult?.trackingCode || lateArtifactSaving) return;
    setLateArtifactSaving(true);
    setLateArtifactNotice('');

    const code = statusResult.trackingCode;
    const applyUpdatedArtifacts = (nextPoster, nextPresentation) => {
      const updatedDossier = normalizeStatusDossier({
        ...statusResult,
        posterUrl: nextPoster,
        presentationUrl: nextPresentation,
        artifacts: {
          ...(statusResult.artifacts || {}),
          posterUrl: nextPoster,
          presentationUrl: nextPresentation
        }
      });
      setStatusResult(updatedDossier);
      try {
        const history = JSON.parse(localStorage.getItem('kmutnb_submissions_history') || '[]');
        const nextHistory = history.map(item =>
          item.trackingCode.toUpperCase() === code.toUpperCase() ? updatedDossier : item
        );
        localStorage.setItem('kmutnb_submissions_history', JSON.stringify(nextHistory));
      } catch {}
      setLateArtifactNotice('บันทึกไฟล์ Poster และ Presentation เพิ่มเติมเรียบร้อยแล้ว!');
      setShowLateArtifactEditor(false);
    };

    fetch(`${API_BASE}/submissions/tracking/${code}/artifacts`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        posterUrl: lateArtifactsForm.posterUrl.trim(),
        presentationUrl: lateArtifactsForm.presentationUrl.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStatusResult(normalizeStatusDossier(data.data));
          if (authToken) {
            fetchMySubmissions(authToken);
          }
          setLateArtifactNotice('บันทึกไฟล์ Poster และ Presentation เพิ่มเติมเรียบร้อยแล้ว!');
          setShowLateArtifactEditor(false);
        } else if (data.message) {
          setStatusError(data.message);
        } else {
          applyUpdatedArtifacts(lateArtifactsForm.posterUrl.trim(), lateArtifactsForm.presentationUrl.trim());
        }
      })
      .catch(() => {
        applyUpdatedArtifacts(lateArtifactsForm.posterUrl.trim(), lateArtifactsForm.presentationUrl.trim());
      })
      .finally(() => setLateArtifactSaving(false));
  };

  const openSubmissionWithDomain = (domainId) => {
    setSubForm(prev => ({ ...prev, category: domainId }));
    setShowPortalModal(true);
    if (user) setPortalTab('submission');
  };

  const [highlightVersion, setHighlightVersion] = useState('hype'); // 'hype' | 'full'
  const [activeHighlightChapter, setActiveHighlightChapter] = useState('hook');
  const [highlightSeekTime, setHighlightSeekTime] = useState(0);
  const highlightInlineVideoRef = useRef(null);
  const modalVideoRef = useRef(null);

  const activeHighlightItem = highlightVersion === 'hype' ? EVENT_HIGHLIGHT_HYPE_2569 : EVENT_HIGHLIGHT_2569;
  const activeHighlightChapters = highlightVersion === 'hype' ? EVENT_HIGHLIGHT_HYPE_CHAPTERS : EVENT_HIGHLIGHT_CHAPTERS;

  const getHighlightChapterByTime = (seconds, version = highlightVersion) => {
    if (version === 'hype') {
      if (seconds >= 55.6) return 'royal_climax';
      if (seconds >= 27.6) return 'prototypes';
      if (seconds >= 12.0) return 'arena';
      return 'hook';
    }
    if (seconds >= 98) return 'royal_trophy';
    if (seconds >= 80) return 'awards';
    if (seconds >= 35) return 'pitching';
    return 'opening';
  };

  const openWinnerModal = (w) => {
    setPlayingCardId(null);
    setSelectedWinnerModal(w);
  };

  const handleSwitchHighlightVersion = (version) => {
    setHighlightVersion(version);
    setHighlightSeekTime(0);
    setActiveHighlightChapter(version === 'hype' ? 'hook' : 'opening');
    if (playingCardId === EVENT_HIGHLIGHT_HYPE_2569.id || playingCardId === EVENT_HIGHLIGHT_2569.id) {
      setPlayingCardId(version === 'hype' ? EVENT_HIGHLIGHT_HYPE_2569.id : EVENT_HIGHLIGHT_2569.id);
    }
  };

  const handleJumpToHighlightChapter = (chapter, { inModal = false } = {}) => {
    setActiveHighlightChapter(chapter.id);
    setHighlightSeekTime(chapter.time);

    if (inModal && modalVideoRef.current) {
      modalVideoRef.current.currentTime = chapter.time;
      modalVideoRef.current.play().catch(() => {});
      return;
    }

    if (playingCardId === activeHighlightItem.id && highlightInlineVideoRef.current) {
      highlightInlineVideoRef.current.currentTime = chapter.time;
      highlightInlineVideoRef.current.play().catch(() => {});
    } else {
      setPlayingCardId(activeHighlightItem.id);
    }
  };

  useEffect(() => {
    if (playingCardId === activeHighlightItem.id && highlightInlineVideoRef.current) {
      const videoEl = highlightInlineVideoRef.current;
      if (highlightSeekTime > 0 && videoEl.readyState >= 1 && Math.abs(videoEl.currentTime - highlightSeekTime) > 0.5) {
        videoEl.currentTime = highlightSeekTime;
      }
      if (videoEl.paused) {
        videoEl.play().catch(() => {});
      }
    }
  }, [playingCardId, activeHighlightItem.id, highlightSeekTime]);

  const renderEventHighlightShowcase = ({ isHallOfFame = false } = {}) => {
    const posterUrl = getWinnerPosterUrl(activeHighlightItem);
    const videoInfo = getWinnerVideoInfo(activeHighlightItem);
    const isPlayingInline = playingCardId === activeHighlightItem.id;

    const handleActivateInline = (e) => {
      if (e) e.stopPropagation();
      setHighlightSeekTime(0);
      setActiveHighlightChapter(highlightVersion === 'hype' ? 'hook' : 'opening');
      if (playingCardId === activeHighlightItem.id && highlightInlineVideoRef.current) {
        highlightInlineVideoRef.current.currentTime = 0;
        highlightInlineVideoRef.current.play().catch(() => {});
      } else {
        setPlayingCardId(activeHighlightItem.id);
      }
    };

    return (
      <section
        aria-label="ประมวลภาพบรรยากาศวันจัดงานจริง ประจำปี 2569"
        className={`event-highlight-showcase ${isHallOfFame ? 'is-halloffame' : ''}`}
      >
        <div className="event-highlight-grid">
          {/* Left 60%: Cinema 16:9 Stage + 4 Interactive Chapter Jumps */}
          <div className="event-highlight-stage-col">
            <div
              className={`event-highlight-video-frame ${isPlayingInline ? 'is-playing' : ''}`}
              onClick={!isPlayingInline ? handleActivateInline : undefined}
            >
              {isPlayingInline ? (
                <video
                  key={`inline-player-${videoInfo.src}`}
                  ref={highlightInlineVideoRef}
                  src={videoInfo.src}
                  poster={posterUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="winner-card-video-player"
                  onLoadedMetadata={(e) => {
                    if (highlightSeekTime > 0) {
                      e.currentTarget.currentTime = highlightSeekTime;
                    }
                    e.currentTarget.play().catch(() => {});
                  }}
                  onTimeUpdate={(e) => {
                    const ch = getHighlightChapterByTime(e.currentTarget.currentTime, highlightVersion);
                    if (ch !== activeHighlightChapter) {
                      setActiveHighlightChapter(ch);
                    }
                  }}
                  onEnded={() => setPlayingCardId(null)}
                />
              ) : (
                <>
                  <video
                    key={`preview-${videoInfo.src}`}
                    src={videoInfo.src}
                    poster={posterUrl}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="winner-card-image winner-card-video-preview"
                    onMouseEnter={(e) => {
                      e.currentTarget.play().catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="winner-video-stage-scrim" aria-hidden="true" />

                  <div className="winner-video-stage-topbar">
                    <span
                      className="badge-royal"
                      style={{
                        fontSize: '0.72rem',
                        padding: '4px 10px',
                        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.96), rgba(180, 83, 9, 0.92))',
                        color: '#FEF3C7',
                        border: '1px solid rgba(251, 191, 36, 0.85)',
                        boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-200" />
                      <span>{highlightVersion === 'hype' ? '⚡ HYPE TRAILER • 2569' : 'OFFICIAL EVENT HIGHLIGHT • 2569'}</span>
                    </span>
                    <span className="winner-video-badge">
                      <Film className="w-3.5 h-3.5" />
                      <span>HD 1080P • {videoInfo.duration}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="winner-video-play-btn"
                    aria-label="เล่นวิดีโอประมวลภาพบรรยากาศวันจัดงานจริง ประจำปี 2569"
                    onClick={handleActivateInline}
                  >
                    <span className="event-highlight-play-circle">
                      <Play className="w-7 h-7" style={{ fill: 'currentColor', marginLeft: '2px' }} />
                    </span>
                    <span className="winner-video-play-caption">
                      {highlightVersion === 'hype'
                        ? `คลิกเพื่อเล่น ⚡ Hype Trailer (${videoInfo.duration} นาที)`
                        : `คลิกเพื่อรับชมบรรยากาศวันจัดงานฉบับเต็ม (${videoInfo.duration} นาที)`}
                    </span>
                  </button>

                  <div className="winner-video-stage-bottombar" aria-hidden="true">
                    <div className="winner-video-stage-meta">
                      <span className="winner-video-live-indicator">
                        <span className="winner-video-live-dot" />
                        <span>26 มิ.ย. 2569 • อาคารอุทยานเทคโนโลยี มจพ.</span>
                      </span>
                      <span className="winner-video-tracking-chip">KMUTNB INNOVATION AWARDS 2026</span>
                    </div>
                    <div className="winner-video-scrubber">
                      <div className="winner-video-scrubber-fill" style={{ width: '42%' }} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Interactive Chapter Chips */}
            <div className="event-highlight-chapters" role="group" aria-label="เลือกช่วงเวลาสำคัญในวิดีโอไฮไลท์">
              {activeHighlightChapters.map((ch) => {
                const isActive = isPlayingInline && activeHighlightChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleJumpToHighlightChapter(ch)}
                    className={`event-chapter-chip ${isActive ? 'active' : ''}`}
                    title={`ข้ามไปยังช่วง ${ch.label} (${ch.timeLabel})`}
                  >
                    <span className="event-chapter-time">
                      <Play className="w-3 h-3" style={{ fill: 'currentColor' }} />
                      <span>{ch.timeLabel}</span>
                    </span>
                    <span className="event-chapter-label">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 40%: Version Switcher + Editorial Narrative + Highlight Metrics & Actions */}
          <div className="event-highlight-story-col">
            <div>
              {/* Dual Version Switcher */}
              <div className="event-highlight-mode-switcher" role="tablist" aria-label="เลือกเวอร์ชันวิดีโอไฮไลท์">
                <button
                  type="button"
                  role="tab"
                  aria-selected={highlightVersion === 'hype'}
                  onClick={() => handleSwitchHighlightVersion('hype')}
                  className={`event-mode-tab ${highlightVersion === 'hype' ? 'active' : ''}`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Hype Trailer</span>
                  <span className="event-mode-tab-badge">01:29</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={highlightVersion === 'full'}
                  onClick={() => handleSwitchHighlightVersion('full')}
                  className={`event-mode-tab ${highlightVersion === 'full' ? 'active' : ''}`}
                >
                  <Film className="w-3.5 h-3.5 text-emerald-300" />
                  <span>บรรยากาศงานฉบับเต็ม</span>
                  <span className="event-mode-tab-badge">02:07</span>
                </button>
              </div>

              <h3 className="event-highlight-title">
                {highlightVersion === 'hype'
                  ? 'ปลุกพลังนวัตกรรม สู่เกียรติยศถ้วยพระราชทานฯ (Official Hype Trailer)'
                  : 'ประมวลภาพบรรยากาศวันจัดงานประกวดและพิธีมอบถ้วยพระราชทานฯ ประจำปี 2569'}
              </h3>
              <div className="event-highlight-en">
                {highlightVersion === 'hype'
                  ? 'THE SPARK TO ROYAL GLORY • 6 AWARDED INNOVATIONS & FINAL ARENA'
                  : 'KMUTNB INNOVATION AWARDS 2026 • FINAL PITCHING & ROYAL TROPHY CEREMONY'}
              </div>

              <p className="event-highlight-desc">
                {highlightVersion === 'hype'
                  ? 'รวมช็อตเด็ดการทำงานจริงของ 6 ผลงานนวัตกรรมที่คว้ารางวัลประจำปี 2569 ตัดสลับบรรยากาศการประชันวิสัยทัศน์บนเวทีรอบชิงชนะเลิศ (Final Pitching) และวินาทีแห่งความภาคภูมิใจในพิธีรับถ้วยพระราชทานฯ ณ อาคารอุทยานเทคโนโลยี มจพ.'
                  : 'สัมผัสบรรยากาศจริงจากเวทีการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569 ณ อาคารอุทยานเทคโนโลยี มจพ. ครบทั้งช่วงพิธีเปิด การนำเสนอผลงานและสาธิตชิ้นงานต้นแบบต่อคณะกรรมการผู้ทรงคุณวุฒิ ไปจนถึงพิธีมอบถ้วยพระราชทานฯ อันทรงเกียรติ'}
              </p>
            </div>

            <div>
              <div className="event-highlight-metrics" style={{ marginBottom: '16px' }}>
                <div className="event-highlight-metric-box">
                  <span className="event-highlight-metric-val">ถ้วยพระราชทานฯ</span>
                  <span className="event-highlight-metric-lbl">รางวัลสูงสุดเกียรติยศระดับประเทศ</span>
                </div>
                <div className="event-highlight-metric-box">
                  <span className="event-highlight-metric-val">6 ผลงานต้นแบบ</span>
                  <span className="event-highlight-metric-lbl">โชว์ศักยภาพจริง 5 สาขานวัตกรรม</span>
                </div>
                <div className="event-highlight-metric-box">
                  <span className="event-highlight-metric-val">26 มิ.ย. 2569</span>
                  <span className="event-highlight-metric-lbl">ณ อาคารอุทยานเทคโนโลยี มจพ.</span>
                </div>
              </div>

              <div className="event-highlight-actions">
                {!isPlayingInline && (
                  <button
                    type="button"
                    onClick={handleActivateInline}
                    className="btn-gold-cinema"
                  >
                    <Play className="w-4 h-4" style={{ fill: 'currentColor' }} />
                    <span>{highlightVersion === 'hype' ? 'เล่น Hype Trailer' : 'เล่นวิดีโอไฮไลท์'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openWinnerModal(activeHighlightItem)}
                  className="btn-outline-cyan"
                  style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>เปิดรับชมเต็มจอ</span>
                </button>

                {!isHallOfFame && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear('2569');
                      navigateTo('halloffame');
                    }}
                    className="winner-cta-link winner-cta-btn"
                    style={{ marginLeft: 'auto' }}
                  >
                    <span>ดูคลังผลงานปี 2569</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderWinnerVideoCard = (w, { isFeatured = false } = {}) => {
    const cardKey = w.id || w.trackingCode;
    const posterUrl = getWinnerPosterUrl(w);
    const videoInfo = getWinnerVideoInfo(w);
    const isPlayingInline = playingCardId === cardKey && (videoInfo.type === 'file' || videoInfo.type === 'embed');

    const handleVideoStageActivate = (e) => {
      e.stopPropagation();
      if (videoInfo.type === 'file' || videoInfo.type === 'embed') {
        setPlayingCardId(cardKey);
      } else {
        openWinnerModal(w);
      }
    };

    return (
      <article
        key={cardKey}
        className={`winner-card winner-video-card ${isFeatured ? 'winner-card-featured' : ''} ${isPlayingInline ? 'is-playing' : ''}`}
      >
        <div
          className="winner-card-image-wrap winner-card-video-stage"
          onClick={!isPlayingInline ? handleVideoStageActivate : undefined}
        >
          {isPlayingInline ? (
            videoInfo.type === 'file' ? (
              <video
                key={`inline-player-${cardKey}-${videoInfo.src}`}
                src={videoInfo.src}
                poster={posterUrl}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="winner-card-video-player"
                onLoadedMetadata={(e) => {
                  e.currentTarget.play().catch(() => {});
                }}
                onEnded={() => setPlayingCardId(null)}
              />
            ) : (
              <iframe
                src={videoInfo.src}
                title={w.titleTh}
                className="winner-card-video-player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <>
              {videoInfo.type === 'file' ? (
                <video
                  key={`preview-${cardKey}-${videoInfo.src}`}
                  src={videoInfo.src}
                  poster={posterUrl}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="winner-card-image winner-card-video-preview"
                  onMouseEnter={(e) => {
                    e.currentTarget.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
                <img
                  src={posterUrl}
                  alt={w.titleTh}
                  loading="lazy"
                  decoding="async"
                  className="winner-card-image"
                />
              )}

              <div className="winner-video-stage-scrim" aria-hidden="true" />

              {/* Top Overlay Row: Award Badge + Video Format Duration Pill */}
              <div className="winner-video-stage-topbar">
                <div>{renderAwardBadge(w)}</div>
                <span className="winner-video-badge">
                  <Film className="w-3.5 h-3.5" />
                  <span>VIDEO • {videoInfo.duration}</span>
                </span>
              </div>

              {/* Center Cinema Play Button */}
              <button
                type="button"
                className="winner-video-play-btn"
                aria-label={`เล่นวิดีโอผลงาน ${w.titleTh}`}
                onClick={handleVideoStageActivate}
              >
                <span className="winner-video-play-circle">
                  <Play className="w-6 h-6" style={{ fill: 'currentColor', marginLeft: '2px' }} />
                </span>
                <span className="winner-video-play-caption">
                  {videoInfo.type === 'file' || videoInfo.type === 'embed'
                    ? 'คลิกเพื่อเล่นวิดีโอผลงาน'
                    : 'คลิกเพื่อรับชมวิดีโอผลงาน'}
                </span>
              </button>

              {/* Bottom Cinema HUD + Progress Bar */}
              <div className="winner-video-stage-bottombar" aria-hidden="true">
                <div className="winner-video-stage-meta">
                  <span className="winner-video-live-indicator">
                    <span className="winner-video-live-dot" />
                    <span>{videoInfo.type === 'file' ? 'HD 1080P • VDO PITCH' : 'VDO PRESENTATION'}</span>
                  </span>
                  <span className="winner-video-tracking-chip">{w.trackingCode}</span>
                </div>
                <div className="winner-video-scrubber">
                  <div className="winner-video-scrubber-fill" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="winner-card-body">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge-category" style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.18)', borderColor: 'rgba(52, 211, 153, 0.4)', color: 'var(--emerald-300)' }}>
                ปี {w.year || '2569'}
              </span>
              <span className="badge-category" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {getCategoryNameTh(w.category)}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {w.educationLevel === 'below_higher' ? 'ต่ำกว่าอุดมศึกษา' : 'อุดมศึกษาและบุคคลทั่วไป'}
              </span>
            </div>

            <h4
              onClick={() => openWinnerModal(w)}
              style={{ cursor: 'pointer' }}
            >
              {w.titleTh}
            </h4>
            <div className="winner-card-en">{w.titleEn}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--emerald-400)', fontWeight: 600, marginTop: '6px', marginBottom: '8px' }}>
              ทีม {w.teamName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• {w.institution}</span>
            </div>
            <p>{w.abstractTh}</p>
          </div>

          <div className="winner-card-footer">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>{w.awardNameTh || 'ผลงานที่ได้รับรางวัล'}</span>
            </span>

            <div className="winner-card-actions">
              {(videoInfo.type === 'file' || videoInfo.type === 'embed') && !isPlayingInline && (
                <button
                  type="button"
                  onClick={handleVideoStageActivate}
                  className="winner-action-play-inline"
                >
                  <Play className="w-3.5 h-3.5" style={{ fill: 'currentColor' }} />
                  <span>เล่นวิดีโอ</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => openWinnerModal(w)}
                className="winner-cta-link winner-cta-btn"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>รับชมวิดีโอ & รายละเอียด</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div>
      
      {/* 1. ENTERPRISE NAVBAR (STREAMLINED + LOGOS) */}
      <header className="pro-header">
        <div className="pro-container">
          <div className="pro-header-inner">
            
            {/* Brand Logo & University Badges */}
            <button type="button" onClick={() => navigateTo('home')} className="pro-brand" aria-label="หน้าแรก KMUTNB Innovation Awards 2027">
              <img className="pro-brand-logo" src={getAssetUrl('/logo-68.png')} alt="KMUTNB Techno Park" />
            </button>

            {/* Streamlined Menu Links */}
            <nav className="pro-nav" aria-label="เมนูหลักของเว็บไซต์">
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
              {/* Global Status Check Button (Mandated by CONTEXT.md) */}
              <button
                type="button"
                aria-label="ตรวจสอบสถานะผลงาน"
                onClick={() => setShowStatusModal(true)}
                className="btn-ghost-status header-btn-status"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>ตรวจสถานะ</span>
              </button>

              {(user?.role === 'ADMIN' || user?.role === 'JUDGE') && (
                <button
                  type="button"
                  onClick={() => {
                    setShowJudgingModal(true);
                    fetchJudgingWorkspace(selectedJudgeYear, authToken);
                  }}
                  className="btn-outline-cyan"
                  style={{ padding: '7px 13px', fontSize: '0.8rem', borderColor: 'rgba(251, 191, 36, 0.55)', color: 'var(--gold-300)' }}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>{user?.role === 'ADMIN' ? 'ระบบกรรมการ & แอดมิน' : 'ประเมินผลงาน (Judge)'}</span>
                </button>
              )}

              {user ? (
                /* Logged In: User Profile Capsule */
                <div className="user-profile-pill">
                  <div className="user-avatar-badge">
                    <User className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <span className="user-name-label">{user.fullName || 'ผู้เข้าแข่งขัน'}</span>
                  <button 
                    onClick={handleLogout}
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
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
            <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="เมนูการนำทางบนมือถือ">
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

              {/* Mobile Nav Actions - Direct Access to Auth & Status */}
              <div className="mobile-nav-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    setShowStatusModal(true);
                  }}
                  className="btn-outline-cyan"
                  style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
                >
                  <Search className="w-4 h-4" />
                  <span>🔍 ตรวจสอบสถานะผลงาน</span>
                </button>
                {!user ? (
                  <button 
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      setPortalTab('login');
                      setShowPortalModal(true);
                    }}
                    className="btn-ghost-auth"
                    style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
                  >
                    <LogIn className="w-4 h-4 text-cyan-400" />
                    <span>เข้าสู่ระบบ</span>
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      setUser(null);
                      setMobileNavOpen(false);
                    }}
                    className="btn-ghost-auth"
                    style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
                  >
                    <LogIn className="w-4 h-4 rotate-180 text-rose-400" />
                    <span>ออกจากระบบ ({user.fullName || 'ผู้เข้าแข่งขัน'})</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    setShowPortalModal(true);
                    if (user) setPortalTab('submission');
                    else setPortalTab('register');
                  }}
                  className="btn-solid-primary"
                  style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{user ? 'ยื่นผลงาน' : 'สมัครประกวด'}</span>
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
          {/* Hero Section: 3D Holographic Cinema Stage + Bottom Control Dock */}
          <section className="hero-section hero-video-stage hero-hologram-cinema">
            <HeroThreeStage
              activeDomainIndex={hoveredDomainIndex}
              isPaused={isPausedHeroStage}
              onDomainChange={setDisplayedDomainIndex}
              onSelectDomain={(idx) => {
                if (DOMAINS[idx]) {
                  setDetailDomainModal(DOMAINS[idx]);
                }
              }}
              onSelectOverview={() => {
                setShowPortalModal(true);
                if (user) setPortalTab('submission');
              }}
            />

            {/* Permanent Anchored Hero Editorial Identity (Never lost when 3D rotates) */}
            <div className="hero-editorial-overlay">
              <div className="badge-royal inline-flex items-center gap-2 mb-1.5">
                <Crown className="w-4 h-4 text-amber-300" />
                <span>ชิงถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี</span>
              </div>
              <h1 className="hero-editorial-main-title">KMUTNB INNOVATION AWARDS 2027</h1>
              <p className="hero-editorial-subtitle">
                <span>เวทีประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2570</span>
                <span className="hero-editorial-subtitle-sep" aria-hidden="true">•</span>
                <span className="hero-editorial-subtitle-prize">เงินรางวัลรวม 180,000 บาท</span>
              </p>
            </div>

            <div className="pro-container hero-hologram-container">
              {/* Unobstructed 3D Stage Viewport Area */}
              <div className="hero-hologram-viewport-space">
                <div className="hero-stage-camera-pill">
                  <span className="hud-dot" />
                  <span>
                    {hoveredDomainIndex === 'overview' || (hoveredDomainIndex ?? displayedDomainIndex) === -1
                      ? 'เวทีกลาง • ภาพรวมการแข่งขัน KMUTNB 2027'
                      : `สาขาที่ 0${(hoveredDomainIndex ?? displayedDomainIndex) + 1} • ${DOMAINS[hoveredDomainIndex ?? displayedDomainIndex]?.titleTh || DOMAINS[hoveredDomainIndex ?? displayedDomainIndex]?.titleEn}`}
                  </span>
                  <span className="hero-stage-camera-hint">• คลิกที่จอกระจก 3D เพื่อโต้ตอบ</span>
                  <button
                    type="button"
                    onClick={() => setIsPausedHeroStage((prev) => !prev)}
                    className={`hero-stage-pause-btn ${isPausedHeroStage ? 'is-paused' : ''}`}
                    aria-label={isPausedHeroStage ? 'เล่นการเคลื่อนไหว 3D ต่อ' : 'หยุดการเคลื่อนไหว 3D ชั่วคราว'}
                    title={isPausedHeroStage ? 'เล่นต่อ' : 'หยุดชั่วคราว'}
                  >
                    {isPausedHeroStage ? (
                      <Play className="hero-stage-pause-icon" />
                    ) : (
                      <Pause className="hero-stage-pause-icon" />
                    )}
                    <span>{isPausedHeroStage ? 'เล่นต่อ' : 'หยุด 3D'}</span>
                  </button>
                </div>
              </div>

              {/* Sleek Bottom Control Dock (Countdown + CTAs + 00..06 Scene Selector) */}
              <div className="hero-control-dock">
                <div className="hero-dock-topbar">
                  {/* Compact Countdown HUD */}
                  <div className="hero-dock-countdown" aria-live="polite">
                    <div className="hero-dock-status">
                      <span className="hud-dot" />
                      <span className="hero-dock-status-live">เปิดรับสมัคร • กำหนดส่งผลงาน 28 ก.พ. 2570</span>
                    </div>

                    {timeLeft.expired ? (
                      <div className="deadline-expired-message">ปิดรับสมัครแล้ว</div>
                    ) : (
                      <div className="hero-dock-digits">
                        <div className="hero-dock-digit">
                          <span className="hud-num">{timeLeft.days}</span>
                          <span className="hud-unit">DAYS</span>
                        </div>
                        <span className="hud-sep">:</span>
                        <div className="hero-dock-digit">
                          <span className="hud-num">{timeLeft.hours}</span>
                          <span className="hud-unit">HRS</span>
                        </div>
                        <span className="hud-sep">:</span>
                        <div className="hero-dock-digit">
                          <span className="hud-num">{timeLeft.minutes}</span>
                          <span className="hud-unit">MINS</span>
                        </div>
                        <span className="hud-sep">:</span>
                        <div className="hero-dock-digit accent">
                          <span className="hud-num">{timeLeft.seconds}</span>
                          <span className="hud-unit">SECS</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="hero-dock-actions">
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

                {/* Scene & Domain Navigation Strip (00 Overview + 01..05 Domains + 06 Others) */}
                <div className="editorial-category-strip hero-dock-category-strip">
                  <div className="editorial-category-strip-label">HOLOGRAM<br />STAGE</div>
                  <div className="editorial-category-list hero-dock-category-list">
                    <button
                      type="button"
                      onClick={() => setHoveredDomainIndex((prev) => (prev === 'overview' ? null : 'overview'))}
                      onMouseEnter={() => setHoveredDomainIndex('overview')}
                      onMouseLeave={() => setHoveredDomainIndex(null)}
                      onFocus={() => setHoveredDomainIndex('overview')}
                      onBlur={() => setHoveredDomainIndex(null)}
                      aria-current={(hoveredDomainIndex === 'overview' || (hoveredDomainIndex === null && displayedDomainIndex === -1)) ? 'true' : undefined}
                      className={`editorial-category-item ${
                        hoveredDomainIndex === 'overview' || (hoveredDomainIndex === null && displayedDomainIndex === -1)
                          ? 'active'
                          : ''
                      }`}
                    >
                      <span className="editorial-category-index">00</span>
                      <Crown className="w-4 h-4" />
                      <span>Overview</span>
                    </button>

                    {DOMAINS.map((domain, idx) => {
                      const IconComponent = domain.icon;
                      const isDomainActive = (hoveredDomainIndex ?? displayedDomainIndex) === idx;
                      return (
                        <button
                          key={domain.id}
                          type="button"
                          onClick={() => setDetailDomainModal(domain)}
                          onMouseEnter={() => setHoveredDomainIndex(idx)}
                          onMouseLeave={() => setHoveredDomainIndex(null)}
                          onFocus={() => setHoveredDomainIndex(idx)}
                          onBlur={() => setHoveredDomainIndex(null)}
                          aria-current={isDomainActive ? 'true' : undefined}
                          className={`editorial-category-item ${isDomainActive ? 'active' : ''}`}
                        >
                          <span className="editorial-category-index">0{idx + 1}</span>
                          <IconComponent className="w-4 h-4" />
                          <span>{domain.titleEn}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => openSubmissionWithDomain('others')}
                      onMouseEnter={() => setHoveredDomainIndex(null)}
                      onMouseLeave={() => setHoveredDomainIndex(null)}
                      onFocus={() => setHoveredDomainIndex(null)}
                      onBlur={() => setHoveredDomainIndex(null)}
                      className="editorial-category-item editorial-category-item-other"
                    >
                      <span className="editorial-category-index">06</span>
                      <Globe className="w-4 h-4" />
                      <span>Others</span>
                    </button>
                  </div>
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
                      เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2027 (ประจำปี 2570) จนถึง 28 ก.พ. 2570
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
                    <h3 style={{ color: 'var(--gold-300)' }}>เงินรางวัลรวม 180,000 บาท</h3>
                    <p>รางวัลชนะเลิศรับถ้วยพระราชทานฯ อันทรงเกียรติ พร้อมเงินรางวัลและเกียรติบัตร รวมทั้งสิ้น 12 รางวัล (2 ระดับการแข่งขัน)</p>
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
                    <h3>เปิดรับ 2 ระดับการแข่งขัน</h3>
                    <p>ระดับต่ำกว่าอุดมศึกษา (มัธยม/ปวช.) และระดับอุดมศึกษาและบุคคลทั่วไป (ป.ตรี-โท-เอก/ประชาชน)</p>
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
                      <div
                        key={domain.id}
                        className="domain-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setDetailDomainModal(domain)}
                      >
                        <DomainLivingCardBg domainId={domain.id} bgImage={domain.bgImage} />
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailDomainModal(domain);
                            }}
                            className="domain-card-btn"
                          >
                            <span>ดูรายละเอียดและสมัคร</span>
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

              {/* Official Event Highlight 2569 — Editorial Cinema Split-Stage */}
              <div style={{ marginTop: '56px' }}>
                {renderEventHighlightShowcase({ isHallOfFame: false })}
              </div>

              {/* Hall of Fame Video Showcase Teaser */}
              <div style={{ marginTop: '56px', textAlign: 'center' }}>
                <div className="badge-tag" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5em' }}>
                  <Film className="w-4 h-4" />
                  <span>PAST AWARD WINNERS • VIDEO SHOWCASE</span>
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>ผลงานที่เคยได้รับรางวัล</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '680px', margin: '0 auto 32px' }}>
                  รับชมคลิปวิดีโอนำเสนอผลงานนวัตกรรมและสิ่งประดิษฐ์ที่เคยได้รับรางวัลเกียรติยศจากเวทีการประกวด
                </p>

                <div className="winner-grid home-winner-grid" style={{ textAlign: 'left' }}>
                  {filteredWinners.slice(0, 3).map((w, idx) =>
                    renderWinnerVideoCard(w, { isFeatured: idx === 0 })
                  )}
                </div>

                <div style={{ marginTop: '32px' }}>
                  <button onClick={() => navigateTo('halloffame')} className="btn-outline-cyan" style={{ padding: '10px 24px' }}>
                    <Film className="w-4 h-4" />
                    <span>เข้าสู่คลังวิดีโอผลงานทั้งหมด (Hall of Fame)</span>
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
                <h2>1. คุณสมบัติและเงื่อนไขผู้เข้าร่วมประกวด</h2>
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
                    <span className="tier-award-label"><Trophy className="w-4 h-4" aria-hidden="true" /> รางวัลชนะเลิศ (ถ้วยพระราชทานฯ):</span>
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
                        <h3 style={{ color: 'var(--gold-300)' }}>ระดับอุดมศึกษาและบุคคลทั่วไป</h3>
                      </div>
                    </div>
                    <p>เปิดรับสมัครผลงานวิจัย นวัตกรรม และสิ่งประดิษฐ์ต้นแบบพร้อมต่อยอดเชิงพาณิชย์</p>
                    <ul className="checklist-list">
                      <li className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>สถานะผู้สมัคร:</strong> นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, สตาร์ทอัพ และประชาชนทั่วไป</span>
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
                    <span className="tier-award-label"><Trophy className="w-4 h-4" aria-hidden="true" /> รางวัลชนะเลิศ (ถ้วยพระราชทานฯ):</span>
                    <strong style={{ color: 'var(--gold-400)' }}>40,000 บาท</strong>
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
                <h2>2. หมวดของผลงานนวัตกรรมเป้าหมาย (5 Domains)</h2>
              </div>

              <div className="domains-grid">
                {DOMAINS.map(domain => {
                  const IconComp = domain.icon;
                  return (
                    <div
                      key={domain.id}
                      className="domain-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDetailDomainModal(domain)}
                    >
                      <DomainLivingCardBg domainId={domain.id} bgImage={domain.bgImage} />
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
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailDomainModal(domain);
                          }}
                          className="domain-card-btn"
                        >
                          <span>ดูรายละเอียดและสมัคร</span>
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
                <h2>3. รางวัลการประกวดและเกียรติยศ (Prizes & Awards)</h2>
              </div>

              <div className="prizes-container">
                {/* Higher & General Public Level Prizes */}
                <div>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--gold-300)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Building2 className="w-5 h-5 text-orange-400" />
                    <span>รางวัลระดับอุดมศึกษาและบุคคลทั่วไป (รวม 6 รางวัล • 105,000 บาท)</span>
                  </h4>
                  <div className="prizes-tier-grid">
                    <div className="prize-card gold-champion">
                      <div className="prize-medal-icon" aria-hidden="true"><Crown /></div>
                      <h5>รางวัลชนะเลิศ (1 รางวัล)</h5>
                      <div className="prize-cash-amount">40,000 ฿</div>
                      <span>ถ้วยพระราชทานฯ + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 1 (1 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>30,000 ฿</div>
                      <span>เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 2 (1 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>20,000 ฿</div>
                      <span>เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Award /></div>
                      <h5>รางวัลชมเชย (3 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--text-secondary)' }}>5,000 ฿</div>
                      <span>รางวัลละ 5,000 ฿ (รวม 15,000 ฿) + เกียรติบัตร</span>
                    </div>
                  </div>
                </div>

                {/* Below Higher Level Prizes */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--cyan-300)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    <span>รางวัลระดับต่ำกว่าอุดมศึกษา (รวม 6 รางวัล • 75,000 บาท)</span>
                  </h4>
                  <div className="prizes-tier-grid">
                    <div className="prize-card" style={{ borderColor: 'var(--border-cyan)' }}>
                      <div className="prize-medal-icon" aria-hidden="true"><Crown /></div>
                      <h5>รางวัลชนะเลิศ (1 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>30,000 ฿</div>
                      <span>ถ้วยพระราชทานฯ + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 1 (1 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>20,000 ฿</div>
                      <span>เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Medal /></div>
                      <h5>รองชนะเลิศอันดับ 2 (1 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>10,000 ฿</div>
                      <span>เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon" aria-hidden="true"><Award /></div>
                      <h5>รางวัลชมเชย (3 รางวัล)</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--text-secondary)' }}>5,000 ฿</div>
                      <span>รางวัลละ 5,000 ฿ (รวม 15,000 ฿) + เกียรติบัตร</span>
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
                <h2>4. มาตรฐานและข้อกำหนดของผลงาน (Submission Standards)</h2>
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
                <h2>5. หลักเกณฑ์การพิจารณาตัดสินและสัดส่วนคะแนน (100 คะแนนเต็ม)</h2>
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
                <h1>กำหนดการสำคัญ ประจำปี 2570</h1>
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
                    ช่วงเปิดรับข้อเสนอผลงาน (บัดนี้ - 28 กุมภาพันธ์ 2570)
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    ผู้สมัครสามารถลงทะเบียน กรอกข้อเสนอโครงการ และแนบลิงก์คลิปวิดีโอผ่านระบบออนไลน์ได้จนถึงวันที่ 28 กุมภาพันธ์ 2570 เวลา 23:59 น.
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

              {/* Step-by-Step 6 Milestones (Official 2570 Roadmap) */}
              <div className="stepper-grid">
                <div className="step-card active">
                  <div className="step-number">01</div>
                  <div className="step-date">บัดนี้ – 28 ก.พ. 2570</div>
                  <h4>เปิดรับสมัครและส่งผลงานออนไลน์</h4>
                  <p>เปิดตัวเว็บไซต์และระบบรับสมัคร ประชาสัมพันธ์โครงการ จัดฝึกอบรมภายในมหาวิทยาลัย เปิดรับส่งผลงานออนไลน์ และตรวจสอบคัดกรองเอกสาร</p>
                </div>

                <div className="step-card">
                  <div className="step-number">02</div>
                  <div className="step-date">มีนาคม 2570</div>
                  <h4>ประเมินผลและประกาศผลรอบคัดเลือก</h4>
                  <p>คณะกรรมการประเมินผลรอบคัดเลือก ประกาศรายชื่อผลงานที่ผ่านรอบคัดเลือกจำนวน 60 ทีม และแจ้งให้ผู้สมัครจัดทำโปสเตอร์ (Poster)</p>
                </div>

                <div className="step-card">
                  <div className="step-number">03</div>
                  <div className="step-date">เมษายน 2570</div>
                  <h4>ผู้ผ่านเข้ารอบจัดส่งโปสเตอร์</h4>
                  <p>ผู้ผ่านเข้ารอบคัดเลือกทั้ง 60 ทีม ดำเนินการจัดทำและจัดส่งโปสเตอร์นำเสนอผลงาน (Poster) ตามรูปแบบที่โครงการกำหนด</p>
                </div>

                <div className="step-card">
                  <div className="step-number">04</div>
                  <div className="step-date">เมษายน – พฤษภาคม 2570</div>
                  <h4>ประเมินผลงาน รอบที่ 2</h4>
                  <p>คณะกรรมการผู้ทรงคุณวุฒิดำเนินการพิจารณาและประเมินผลงานในรอบที่ 2 เพื่อคัดเลือกผลงานเข้าสู่รอบชิงชนะเลิศ</p>
                </div>

                <div className="step-card">
                  <div className="step-number">05</div>
                  <div className="step-date">พฤษภาคม 2570</div>
                  <h4>ประกาศผลผู้ผ่านรอบชิงชนะเลิศ</h4>
                  <p>ประกาศรายชื่อผลงานที่ผ่านการคัดเลือกเข้าสู่รอบชิงชนะเลิศผ่านทางเว็บไซต์อย่างเป็นทางการ เพื่อเตรียมนำเสนอในวันจัดงาน</p>
                </div>

                <div className="step-card" style={{ borderColor: 'var(--border-gold)' }}>
                  <div className="step-number" style={{ background: 'rgba(249, 115, 22, 0.18)', color: 'var(--orange-400)' }} aria-hidden="true"><Trophy /></div>
                  <div className="step-date" style={{ color: 'var(--gold-300)' }}>มิถุนายน 2570</div>
                  <h4>จัดงานประกวดและพิธีมอบรางวัล</h4>
                  <p>จัดงานประกวด นำเสนอผลงานรอบชิงชนะเลิศ จัดแสดงนิทรรศการ และพิธีมอบถ้วยพระราชทานฯ ณ อุทยานเทคโนโลยี มจพ.</p>
                </div>
              </div>

              {/* Pitching Venue Box */}
              <div className="general-rules-box" style={{ marginTop: '40px' }}>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>สถานที่จัดงานรอบชิงชนะเลิศ (Final Pitching & Award Ceremony)</span>
                </h4>
                <div className="responsive-two-col-grid" style={{ gap: '20px', fontSize: '0.88rem' }}>
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
                <h1>ประกาศผลการตัดสินและข่าวสารทางการ</h1>
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
                    aria-label="ค้นหาด้วยชื่อทีม สถาบัน รหัสผลงาน หรือหัวข้อประกาศ"
                    placeholder="ค้นหาด้วยชื่อทีม, สถาบัน, รหัสผลงาน หรือหัวข้อประกาศ..."
                    value={annSearch}
                    onChange={e => setAnnSearch(e.target.value)}
                  />
                  {annSearch && (
                    <button type="button" aria-label="ล้างคำค้นหาประกาศ" onClick={() => setAnnSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="subnav-tabs-container announcement-tabs">
                  <button 
                    onClick={() => setAnnCategory('all')} 
                    className={`subnav-tab-btn ${annCategory === 'all' ? 'active' : ''}`}
                  >
                    <span>ทั้งหมด ({announcementsList.length})</span>
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
                        href={(!ann.pdfUrl || ann.pdfUrl === '#')
                          ? (ann.title?.includes('2027') || ann.title?.includes('2570')
                              ? '/docs/KMUTNB_Innovation_Awards_2027_Announcement.pdf'
                              : '/docs/KMUTNB_Innovation_Awards_2026_Winners.pdf')
                          : ann.pdfUrl} 
                        download
                        aria-label={`ดาวน์โหลดประกาศ PDF: ${ann.title}`}
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
                    {!annSearch.trim() && annCategory === 'finalists'
                      ? 'ยังไม่มีประกาศรายชื่อผู้ผ่านเข้ารอบในขณะนี้ (ติดตามประกาศผลรอบคัดเลือก มีนาคม 2570 และรอบชิงชนะเลิศ พฤษภาคม 2570)'
                      : 'ไม่พบข้อมูลประกาศที่ตรงกับคำค้นหา'}
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
                    สามารถกรอกรหัสติดตามผลงาน (เช่น KMUTNB-2569-0001) เพื่อดูคอมเมนต์และสถานะแบบส่วนบุคคล
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
                    <h1 style={{ fontSize: '2rem' }}>คลังผลงานและทำเนียบเกียรติยศ</h1>
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
                        aria-label="ค้นหาชื่อผลงาน ทีม หรือสถาบันที่เคยได้รับรางวัล"
                        placeholder="ค้นหาชื่อผลงาน, ทีม, สถาบัน..."
                        value={winnerSearch}
                        onChange={e => setWinnerSearch(e.target.value)}
                        className="search-input"
                      />
                      {winnerSearch && (
                        <button type="button" aria-label="ล้างคำค้นหาผลงาน" onClick={() => setWinnerSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
                      aria-label="เลือกปีการประกวด"
                      className="filter-select"
                      style={{ minWidth: '170px' }}
                    >
                      <option value="all">ทุกปีการประกวด</option>
                      <option value="2569">ประจำปี 2569 (2026)</option>
                      <option value="2567">ประจำปี 2567 (2024)</option>
                      <option value="2566">ประจำปี 2566 (2023)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={selectedDomain} 
                      onChange={e => setSelectedDomain(e.target.value)}
                      aria-label="เลือกหมวดหมู่นวัตกรรม"
                      className="filter-select"
                      style={{ minWidth: '180px' }}
                    >
                      <option value="all">ทุกหมวดหมู่นวัตกรรม</option>
                      <option value="energy_environment">Energy & Environment</option>
                      <option value="food_agriculture">Food & Agriculture</option>
                      <option value="social_economy">Social & Economy</option>
                      <option value="medical_device">Medical Device</option>
                      <option value="material">Material</option>
                      <option value="others">อื่นๆ (Others)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={selectedLevel} 
                      onChange={e => setSelectedLevel(e.target.value)}
                      aria-label="เลือกระดับการแข่งขัน"
                      className="filter-select"
                      style={{ minWidth: '180px' }}
                    >
                      <option value="all">ทุกระดับการแข่งขัน</option>
                      <option value="below_higher">ต่ำกว่าอุดมศึกษา</option>
                      <option value="higher_and_above">อุดมศึกษาและบุคคลทั่วไป</option>
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

              {(selectedYear === 'all' || selectedYear === '2569') && !winnerSearch.trim() && (
                renderEventHighlightShowcase({ isHallOfFame: true })
              )}

              <div className="winner-grid">
                {filteredWinners.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', background: 'rgba(24, 52, 88, 0.5)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
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
                  filteredWinners.map((w, idx) =>
                    renderWinnerVideoCard(w, {
                      isFeatured:
                        idx === 0 &&
                        selectedYear === 'all' &&
                        selectedDomain === 'all' &&
                        selectedLevel === 'all' &&
                        !winnerSearch.trim()
                    })
                  )
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
                <h1>ติดต่อสอบถามและศูนย์ดาวน์โหลดเอกสาร</h1>
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
                    ดาวน์โหลดแบบฟอร์มข้อเสนอโครงการ และเอกสารประกาศเกณฑ์การประกวดฉบับทางการ
                  </p>

                  <div className="contact-download-list">
                    <a
                      href="/docs/KMUTNB_Innovation_Awards_2027_Guidelines.pdf"
                      download="KMUTNB_Innovation_Awards_2027_Guidelines.pdf"
                      aria-label="ดาวน์โหลดเอกสารประกาศเกณฑ์การประกวดฉบับทางการ 2570 (PDF)"
                      className="bento-tier-row contact-download-item"
                      style={{ textDecoration: 'none', padding: '16px', background: 'rgba(24, 52, 88, 0.85)', border: '1px solid var(--border-medium)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ประกาศเกณฑ์การประกวดฉบับทางการ 2570.pdf</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เอกสาร PDF ฉบับทางการ • 2.4 MB • คลิกเพื่อดาวน์โหลด</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-emerald-400" />
                    </a>

                    <a
                      href="/docs/Proposal_Template_2570.docx"
                      download="Proposal_Template_2570.docx"
                      aria-label="ดาวน์โหลดแบบฟอร์มข้อเสนอโครงการ Proposal Template (DOCX)"
                      className="bento-tier-row contact-download-item"
                      style={{ textDecoration: 'none', padding: '16px', background: 'rgba(24, 52, 88, 0.85)', border: '1px solid var(--border-medium)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-orange-400" />
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>แบบฟอร์มข้อเสนอโครงการ (Proposal Template).docx</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เอกสาร Word Template • 512 KB • คลิกเพื่อดาวน์โหลด</div>
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
            โครงการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2570 (KMUTNB Innovation Awards 2027)
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
                onClick={() => { setAuthError(''); setPortalTab('register'); }}
                className={`modal-tab-btn ${portalTab === 'register' ? 'active' : ''}`}
              >
                ลงทะเบียนบัญชีใหม่
              </button>
              <button 
                onClick={() => { setAuthError(''); setPortalTab('login'); }}
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
                  ผลงานของฉัน & ยื่นใบสมัคร ({mySubmissions.length}/{MAX_PROJECTS_PER_ACCOUNT})
                </button>
              )}
            </div>

            {authError && (portalTab === 'register' || portalTab === 'login') && (
              <div
                role="alert"
                style={{
                  padding: '12px 16px',
                  marginBottom: '16px',
                  borderRadius: '10px',
                  background: 'rgba(225, 29, 72, 0.16)',
                  border: '1px solid rgba(251, 113, 133, 0.5)',
                  color: '#FDA4AF',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                {authError}
              </div>
            )}

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
                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *</label>
                  <input 
                    id="reg-password" type="password" required minLength={6}
                    className="form-input"
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={e => setRegForm({...regForm, password: e.target.value})}
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
                <div className="form-group">
                  <label htmlFor="login-password" className="form-label">รหัสผ่าน *</label>
                  <input 
                    id="login-password" type="password" required
                    className="form-input"
                    placeholder="••••••••"
                    value={regForm.password}
                    onChange={e => setRegForm({...regForm, password: e.target.value})}
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
                {/* Contestant Account Bar & My Projects Workspace (Max 2 Projects) */}
                {user && (
                  <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(15, 32, 56, 0.78)', border: '1px solid var(--border-cyan)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          บัญชีผู้สมัคร: {user.fullName || user.email}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {user.email} • โควตาผลงานของฉัน: <strong style={{ color: 'var(--cyan-300)' }}>{mySubmissions.length} / {MAX_PROJECTS_PER_ACCOUNT} โครงการ</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {!deadlinePassed && mySubmissions.length < MAX_PROJECTS_PER_ACCOUNT && (
                          <button
                            type="button"
                            onClick={() => {
                              setSubSuccess(null);
                              setSubError('');
                              setDraftNotice('');
                              setSubForm(createInitialSubmissionForm());
                              setSubmissionStep(1);
                            }}
                            className="btn-outline-cyan"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ สร้างโครงการใหม่</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="btn-text"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#FDA4AF' }}
                        >
                          ออกจากระบบ
                        </button>
                      </div>
                    </div>

                    {mySubmissionsLoading ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>กำลังโหลดรายการผลงานของคุณ...</div>
                    ) : mySubmissions.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {mySubmissions.map((proj, idx) => {
                          const isSelected = subForm.id === proj.id;
                          return (
                            <div
                              key={proj.id || idx}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '10px',
                                background: isSelected ? 'rgba(6, 182, 212, 0.14)' : 'rgba(9, 19, 36, 0.75)',
                                border: isSelected ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--cyan-300)' }}>
                                    {proj.trackingCode}
                                  </span>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    background: proj.status === 'DRAFT' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: proj.status === 'DRAFT' ? '#FCD34D' : '#6EE7B7',
                                    fontWeight: 600
                                  }}>
                                    {proj.status === 'DRAFT' ? 'ฉบับร่าง (DRAFT)' : 'ส่งแล้ว (SUBMITTED)'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {proj.titleTh || 'ยังไม่ได้ระบุชื่อผลงาน'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  รอบที่ 1: {proj.rounds?.round1?.status === 'PASSED' ? 'ผ่าน' : proj.rounds?.round1?.status === 'FAILED' ? 'ไม่ผ่าน' : 'รอผล'} •
                                  รอบที่ 2: {proj.rounds?.round2?.status === 'PASSED' ? 'ผ่าน' : proj.rounds?.round2?.status === 'FAILED' ? 'ไม่ผ่าน' : 'รอผล'} •
                                  รอบที่ 3: {proj.rounds?.round3?.result || (proj.rounds?.round3?.status === 'PASSED' ? 'ผ่าน' : 'รอผล')}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {!deadlinePassed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSubSuccess(null);
                                      setSubError('');
                                      setDraftNotice(`กำลังแก้ไขโครงการ ${proj.trackingCode} (สามารถแก้ไขข้อมูลและบันทึกซ้ำได้จนถึงวันปิดรับสมัคร)`);
                                      setSubForm(hydrateSubmissionFormFromServer(proj));
                                      setSubmissionStep(1);
                                    }}
                                    className="btn-outline-cyan"
                                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                  >
                                    แก้ไขข้อมูลใบสมัคร
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowPortalModal(false);
                                    setTrackingSearch(proj.trackingCode);
                                    setShowStatusModal(true);
                                    executeStatusSearch(proj.trackingCode);
                                  }}
                                  className="btn-solid-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                >
                                  ดูแฟ้มสถานะ & แนบไฟล์เพิ่ม
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        ยังไม่มีผลงานในบัญชีนี้ กรุณากรอกใบสมัคร 3 ขั้นตอนด้านล่าง (ส่งได้สูงสุด {MAX_PROJECTS_PER_ACCOUNT} โครงการ)
                      </div>
                    )}
                  </div>
                )}

                {deadlinePassed && (
                  <div
                    role="alert"
                    style={{
                      padding: '12px 16px',
                      marginBottom: '16px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.16)',
                      border: '1px solid rgba(251, 191, 36, 0.5)',
                      color: '#FDE68A',
                      fontSize: '0.84rem'
                    }}
                  >
                    ขณะนี้พ้นกำหนดวันปิดรับสมัครและแก้ไขข้อมูลฟอร์มหลักแล้ว — หากคุณผ่านการคัดเลือกและต้องการแนบลิงก์ <strong>Poster</strong> หรือ <strong>Presentation</strong> เพิ่มเติม กรุณากดปุ่ม <strong>“ดูแฟ้มสถานะ & แนบไฟล์เพิ่ม”</strong> ของโครงการด้านบน
                  </div>
                )}
                {subSuccess ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <CheckCircle2 className="w-14 h-14 text-emerald-400" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>ยื่นผลงานเรียบร้อยแล้ว!</h3>
                    <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>รหัสติดตามผลงานของคุณคือ:</p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-300)', background: 'var(--bg-base)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-cyan)', marginBottom: '16px' }}>
                      {subSuccess.trackingCode}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(subSuccess.trackingCode);
                          }
                          setCopiedTrackingCode(true);
                          setTimeout(() => setCopiedTrackingCode(false), 2500);
                        }}
                        className="btn-outline-cyan"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Copy className="w-4 h-4" />
                        <span>{copiedTrackingCode ? 'คัดลอกรหัสแล้ว!' : 'คัดลอกรหัสติดตาม'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const code = subSuccess.trackingCode;
                          setSubSuccess(null);
                          setShowPortalModal(false);
                          setTrackingSearch(code);
                          setShowStatusModal(true);
                          executeStatusSearch(code);
                        }}
                        className="btn-solid-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Search className="w-4 h-4" />
                        <span>ดูบัตรรายละเอียดและตรวจสถานะผลงาน</span>
                      </button>
                    </div>
                    <button onClick={() => { setSubSuccess(null); setShowPortalModal(false); }} className="btn-text" style={{ color: 'var(--text-muted)' }}>
                      ปิดหน้านี้
                    </button>
                  </div>
                ) : (
                  <fieldset disabled={deadlinePassed && user?.role !== 'ADMIN'} style={{ border: 'none', padding: 0, margin: 0, minInlineSize: 0 }}>
                    {/* 3-Step Submission Stepper */}
                    <div className="submission-stepper" role="tablist" aria-label="ขั้นตอนการกรอกใบสมัคร">
                      {[
                        { step: 1, label: '1. ข้อมูลผลงานและสังกัด' },
                        { step: 2, label: '2. สมาชิกและผู้ประสานงาน' },
                        { step: 3, label: '3. ไฟล์ประกอบผลงาน (5 รายการ)' }
                      ].map((item) => (
                        <button
                          key={item.step}
                          type="button"
                          role="tab"
                          aria-selected={submissionStep === item.step}
                          onClick={() => {
                            if (subError) setSubError('');
                            setSubmissionStep(item.step);
                          }}
                          className={`submission-step-btn ${submissionStep === item.step ? 'active' : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {draftNotice && (
                      <div
                        role="status"
                        aria-live="polite"
                        style={{
                          padding: '12px 16px',
                          marginBottom: '16px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.16)',
                          border: '1px solid rgba(52, 211, 153, 0.5)',
                          color: '#6EE7B7',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{draftNotice}</span>
                      </div>
                    )}
                    {subError && (
                      <div
                        role="alert"
                        aria-live="assertive"
                        style={{
                          padding: '12px 16px',
                          marginBottom: '16px',
                          borderRadius: '10px',
                          background: 'rgba(225, 29, 72, 0.16)',
                          border: '1px solid rgba(251, 113, 133, 0.5)',
                          color: '#FDA4AF',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      >
                        {subError}
                      </div>
                    )}

                    {/* STEP 1: ข้อมูลผลงานและสังกัด */}
                    {submissionStep === 1 && (
                      <div>
                        <div className="form-group">
                          <label htmlFor="submission-title-th" className="form-label">ชื่อผลงาน (ไทย) *</label>
                          <input 
                            id="submission-title-th" type="text" required
                            className="form-input"
                            placeholder="เช่น เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบ Butt Fusion"
                            value={subForm.titleTh}
                            onChange={e => {
                              if (subError) setSubError('');
                              setSubForm({...subForm, titleTh: e.target.value});
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="submission-title-en" className="form-label">ชื่อผลงาน (อังกฤษ)</label>
                          <input 
                            id="submission-title-en" type="text"
                            className="form-input"
                            placeholder="e.g. Automatic HDPE Pipe Butt Fusion Welding Controller and Data Logger"
                            value={subForm.titleEn}
                            onChange={e => setSubForm({...subForm, titleEn: e.target.value})}
                          />
                        </div>
                        <div className="responsive-two-col-grid" style={{ gap: '12px' }}>
                          <div className="form-group">
                            <label htmlFor="submission-category" className="form-label">หมวดหมู่ *</label>
                            <select 
                              id="submission-category" className="form-input"
                              value={subForm.category}
                              onChange={e => setSubForm({...subForm, category: e.target.value})}
                            >
                              {dynamicCategories.map(cat => (
                                <option key={cat.code} value={cat.code}>
                                  {cat.nameEn ? `${cat.nameEn} (${cat.nameTh})` : cat.nameTh}
                                </option>
                              ))}
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
                              <option value="higher_and_above">อุดมศึกษาและบุคคลทั่วไป (ป.ตรี-โท-เอก / ประชาชน)</option>
                            </select>
                          </div>
                        </div>
                        <div className="responsive-two-col-grid" style={{ gap: '12px' }}>
                          <div className="form-group">
                            <label htmlFor="submission-team" className="form-label">ชื่อทีม *</label>
                            <input 
                              id="submission-team" type="text"
                              className="form-input"
                              placeholder="เช่น เขาชื่ออะไร / KMUTNB Robotics Lab"
                              value={subForm.teamName}
                              onChange={e => setSubForm({...subForm, teamName: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="submission-affiliation" className="form-label">สังกัด (คณะ / โรงเรียน / สถาบัน / หน่วยงาน) *</label>
                            <input 
                              id="submission-affiliation" type="text"
                              className="form-input"
                              placeholder="เช่น คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
                              value={subForm.affiliation || ''}
                              onChange={e => setSubForm({...subForm, affiliation: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="submission-advisor" className="form-label">ชื่ออาจารย์ที่ปรึกษา / หน่วยงานรับรอง (ถ้ามี)</label>
                          <input 
                            id="submission-advisor" type="text"
                            className="form-input"
                            placeholder="เช่น ผศ.ดร.วัฒนา แก้วมณี"
                            value={subForm.advisorName}
                            onChange={e => setSubForm({...subForm, advisorName: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="submission-abstract" className="form-label">รายละเอียดผลงาน *</label>
                          <textarea 
                            id="submission-abstract" rows={3}
                            className="form-input"
                            placeholder="อธิบายหลักการทำงาน ความคิดสร้างสรรค์ และประโยชน์ของผลงาน..."
                            value={subForm.abstractTh}
                            onChange={e => setSubForm({...subForm, abstractTh: e.target.value})}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const err = validateSubmissionStep(subForm, 1, false);
                              if (err) {
                                setSubError(err);
                                return;
                              }
                              setSubError('');
                              setSubmissionStep(2);
                            }}
                            className="btn-solid-primary"
                          >
                            <span>ถัดไป: สมาชิกและผู้ประสานงาน</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: สมาชิกทีม & ผู้ประสานงานหลัก-รอง */}
                    {submissionStep === 2 && (
                      <div>
                        <div className="dossier-section-box" style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <strong style={{ color: 'var(--emerald-300)', fontSize: '0.92rem' }}>สมาชิกทีม *</strong>
                            <button
                              type="button"
                              onClick={() => {
                                const current = Array.isArray(subForm.members) ? subForm.members : [];
                                setSubForm({
                                  ...subForm,
                                  members: [...current, { fullName: '', role: 'สมาชิก', idCard: '' }]
                                });
                              }}
                              className="btn-outline-cyan"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '36px' }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>เพิ่มสมาชิกทีม</span>
                            </button>
                          </div>

                          {(Array.isArray(subForm.members) ? subForm.members : [{ fullName: '', role: 'หัวหน้าทีม', idCard: '' }]).map((member, idx) => {
                            const mObj = typeof member === 'string' ? { fullName: member, role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก', idCard: '' } : member;
                            return (
                              <div key={idx} className="member-input-row">
                                <span className="member-index-badge">{idx + 1}.</span>
                                <input
                                  type="text"
                                  aria-label={`ชื่อสมาชิกคนที่ ${idx + 1}`}
                                  className="form-input"
                                  placeholder={idx === 0 ? 'ชื่อ-นามสกุล (หัวหน้าทีม) เช่น ผศ.ดร.วัฒนา แก้วมณี' : 'ชื่อ-นามสกุล สมาชิก'}
                                  value={mObj.fullName}
                                  onChange={e => {
                                    const next = [...(Array.isArray(subForm.members) ? subForm.members : [])];
                                    next[idx] = { ...mObj, fullName: e.target.value };
                                    setSubForm({ ...subForm, members: next });
                                  }}
                                />
                                <input
                                  type="text"
                                  aria-label={`เลขบัตรประชาชนหรือพาสปอร์ตสมาชิกคนที่ ${idx + 1}`}
                                  className="form-input"
                                  style={{ fontFamily: 'var(--font-mono)' }}
                                  placeholder="เลขบัตรประชาชน / พาสปอร์ต เช่น 5-1601-00029-58-2"
                                  value={mObj.idCard}
                                  onChange={e => {
                                    const next = [...(Array.isArray(subForm.members) ? subForm.members : [])];
                                    next[idx] = { ...mObj, idCard: formatCitizenIdInput(e.target.value) };
                                    setSubForm({ ...subForm, members: next });
                                  }}
                                />
                                <select
                                  aria-label={`บทบาทสมาชิกคนที่ ${idx + 1}`}
                                  className="form-input"
                                  value={mObj.role || (idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก')}
                                  onChange={e => {
                                    const next = [...(Array.isArray(subForm.members) ? subForm.members : [])];
                                    next[idx] = { ...mObj, role: e.target.value };
                                    setSubForm({ ...subForm, members: next });
                                  }}
                                >
                                  <option value="หัวหน้าทีม" style={{ background: '#0F172A' }}>หัวหน้าทีม</option>
                                  <option value="สมาชิก" style={{ background: '#0F172A' }}>สมาชิก</option>
                                  <option value="ที่ปรึกษา" style={{ background: '#0F172A' }}>ที่ปรึกษา</option>
                                </select>
                                {(Array.isArray(subForm.members) && subForm.members.length > 1) && (
                                  <button
                                    type="button"
                                    aria-label={`ลบสมาชิกคนที่ ${idx + 1}`}
                                    onClick={() => {
                                      const next = subForm.members.filter((_, i) => i !== idx);
                                      setSubForm({ ...subForm, members: next });
                                    }}
                                    className="member-remove-btn"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* ผู้ประสานงานหลัก */}
                        <div className="dossier-section-box" style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <strong style={{ color: 'var(--cyan-300)', fontSize: '0.92rem' }}>ผู้ประสานงานหลัก *</strong>
                            <button
                              type="button"
                              onClick={() => {
                                const firstMember = Array.isArray(subForm.members) && subForm.members[0]
                                  ? (typeof subForm.members[0] === 'string' ? { fullName: subForm.members[0], idCard: '' } : subForm.members[0])
                                  : { fullName: '', idCard: '' };
                                setSubForm({
                                  ...subForm,
                                  primaryCoordinator: {
                                    ...subForm.primaryCoordinator,
                                    name: firstMember.fullName || user?.fullName || '',
                                    idCard: firstMember.idCard || '',
                                    email: subForm.primaryCoordinator?.email || user?.email || ''
                                  }
                                });
                              }}
                              className="btn-outline-cyan"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', minHeight: '32px' }}
                            >
                              ใช้ข้อมูลเดียวกับหัวหน้าทีม
                            </button>
                          </div>
                          <div className="responsive-two-col-grid" style={{ gap: '10px' }}>
                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label htmlFor="primary-coord-name" className="form-label">ชื่อ-นามสกุล *</label>
                              <input
                                id="primary-coord-name"
                                type="text"
                                className="form-input"
                                placeholder="เช่น ผศ.ดร.วัฒนา แก้วมณี"
                                value={subForm.primaryCoordinator?.name || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  primaryCoordinator: { ...(subForm.primaryCoordinator || {}), name: e.target.value }
                                })}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label htmlFor="primary-coord-id" className="form-label">เลขบัตรประชาชน / พาสปอร์ต</label>
                              <input
                                id="primary-coord-id"
                                type="text"
                                className="form-input"
                                style={{ fontFamily: 'var(--font-mono)' }}
                                placeholder="5-1601-00029-58-2"
                                value={subForm.primaryCoordinator?.idCard || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  primaryCoordinator: { ...(subForm.primaryCoordinator || {}), idCard: formatCitizenIdInput(e.target.value) }
                                })}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label htmlFor="primary-coord-phone" className="form-label">โทรศัพท์ *</label>
                              <input
                                id="primary-coord-phone"
                                type="tel"
                                className="form-input"
                                placeholder="064-274-9888"
                                value={subForm.primaryCoordinator?.phone || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  primaryCoordinator: { ...(subForm.primaryCoordinator || {}), phone: e.target.value }
                                })}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label htmlFor="primary-coord-email" className="form-label">อีเมล *</label>
                              <input
                                id="primary-coord-email"
                                type="email"
                                className="form-input"
                                placeholder="wattana.k@fte.kmutnb.ac.th"
                                value={subForm.primaryCoordinator?.email || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  primaryCoordinator: { ...(subForm.primaryCoordinator || {}), email: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ผู้ประสานงานรอง */}
                        <div className="dossier-section-box" style={{ marginBottom: '16px' }}>
                          <strong style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>
                            ผู้ประสานงานรอง (สำรองติดต่อ - ถ้ามี)
                          </strong>
                          <div className="responsive-two-col-grid" style={{ gap: '10px' }}>
                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label htmlFor="secondary-coord-name" className="form-label">ชื่อ-นามสกุล</label>
                              <input
                                id="secondary-coord-name"
                                type="text"
                                className="form-input"
                                placeholder="ชื่อ-นามสกุล ผู้ประสานงานรอง"
                                value={subForm.secondaryCoordinator?.name || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  secondaryCoordinator: { ...(subForm.secondaryCoordinator || {}), name: e.target.value }
                                })}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label htmlFor="secondary-coord-id" className="form-label">เลขบัตรประชาชน / พาสปอร์ต</label>
                              <input
                                id="secondary-coord-id"
                                type="text"
                                className="form-input"
                                style={{ fontFamily: 'var(--font-mono)' }}
                                placeholder="5-1601-00029-58-2"
                                value={subForm.secondaryCoordinator?.idCard || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  secondaryCoordinator: { ...(subForm.secondaryCoordinator || {}), idCard: formatCitizenIdInput(e.target.value) }
                                })}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label htmlFor="secondary-coord-phone" className="form-label">โทรศัพท์</label>
                              <input
                                id="secondary-coord-phone"
                                type="tel"
                                className="form-input"
                                placeholder="064-274-9888"
                                value={subForm.secondaryCoordinator?.phone || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  secondaryCoordinator: { ...(subForm.secondaryCoordinator || {}), phone: e.target.value }
                                })}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label htmlFor="secondary-coord-email" className="form-label">อีเมล</label>
                              <input
                                id="secondary-coord-email"
                                type="email"
                                className="form-input"
                                placeholder="wattana.kaewmanee@gmail.com"
                                value={subForm.secondaryCoordinator?.email || ''}
                                onChange={e => setSubForm({
                                  ...subForm,
                                  secondaryCoordinator: { ...(subForm.secondaryCoordinator || {}), email: e.target.value }
                                })}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '12px' }}>
                          <button type="button" onClick={() => setSubmissionStep(1)} className="btn-outline-cyan">
                            <span>ย้อนกลับ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const err = validateSubmissionStep(subForm, 2, false);
                              if (err) {
                                setSubError(err);
                                return;
                              }
                              setSubError('');
                              setSubmissionStep(3);
                            }}
                            className="btn-solid-primary"
                          >
                            <span>ถัดไป: แนบไฟล์ประกอบผลงาน</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ไฟล์ประกอบผลงาน 5 รายการ */}
                    {submissionStep === 3 && (
                      <div>
                        <div className="form-group">
                          <label htmlFor="submission-document-url" className="form-label">
                            1. ไฟล์ PDF แบบฟอร์มเสนอผลงานประกวดสิ่งประดิษฐ์และนวัตกรรม * <span style={{ color: 'var(--emerald-300)', fontSize: '0.76rem' }}>(จำเป็น)</span>
                          </label>
                          <input 
                            id="submission-document-url" type="url"
                            className="form-input"
                            placeholder="https://drive.google.com/file/d/... (ลิงก์ PDF ข้อเสนอโครงการ)"
                            value={subForm.proposalPdfUrl || subForm.documentUrl || ''}
                            onChange={e => setSubForm({...subForm, proposalPdfUrl: e.target.value, documentUrl: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="submission-video" className="form-label">
                            2. คลิป VDO นำเสนอผลงาน (ความยาว 2 - 3 นาที) * <span style={{ color: 'var(--emerald-300)', fontSize: '0.76rem' }}>(จำเป็น)</span>
                          </label>
                          <input 
                            id="submission-video" type="url"
                            className="form-input"
                            placeholder="https://youtube.com/watch?v=... หรือ Google Drive"
                            value={subForm.videoUrl}
                            onChange={e => setSubForm({...subForm, videoUrl: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="submission-cover-image" className="form-label">
                            3. Image (รูปภาพผลงาน / ชิ้นงานต้นแบบ) * <span style={{ color: 'var(--emerald-300)', fontSize: '0.76rem' }}>(จำเป็น)</span>
                          </label>
                          <input 
                            id="submission-cover-image" type="text"
                            className="form-input"
                            placeholder="วางลิงก์รูปภาพ https://... หรือเลือกภาพตัวอย่างด้านล่าง"
                            value={subForm.coverImage}
                            onChange={e => setSubForm({...subForm, coverImage: e.target.value})}
                          />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {[
                              { label: 'ภาพหุ่นยนต์/AI', path: '/photo_candidates/robotics_engineer.jpg' },
                              { label: 'ภาพห้องปฏิบัติการ', path: '/photo_candidates/science_lab.jpg' },
                              { label: 'ภาพทีมวิจัย', path: '/photo_candidates/tech_creators.jpg' }
                            ].map((preset) => (
                              <button
                                key={preset.path}
                                type="button"
                                onClick={() => setSubForm({ ...subForm, coverImage: preset.path })}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  background: subForm.coverImage === preset.path ? 'rgba(0, 245, 160, 0.22)' : 'rgba(24, 52, 88, 0.72)',
                                  border: `1px solid ${subForm.coverImage === preset.path ? 'var(--emerald-400)' : 'var(--border-subtle)'}`,
                                  color: subForm.coverImage === preset.path ? 'var(--emerald-300)' : 'var(--text-secondary)',
                                  cursor: 'pointer'
                                }}
                              >
                                + {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="responsive-two-col-grid" style={{ gap: '12px' }}>
                          <div className="form-group">
                            <label htmlFor="submission-poster-url" className="form-label">
                              4. Poster (โปสเตอร์นำเสนอผลงาน) <span style={{ color: 'var(--gold-300)', fontSize: '0.75rem' }}>(แนบเพิ่มเติมทีหลังได้)</span>
                            </label>
                            <input 
                              id="submission-poster-url" type="text"
                              className="form-input"
                              placeholder="https://drive.google.com/... (ส่งเพิ่มเมื่อเข้ารอบ 2 ได้)"
                              value={subForm.posterUrl || ''}
                              onChange={e => setSubForm({...subForm, posterUrl: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="submission-presentation-url" className="form-label">
                              5. Presentation (สไลด์นำเสนอ PDF/PPT) <span style={{ color: 'var(--gold-300)', fontSize: '0.75rem' }}>(แนบเพิ่มเติมทีหลังได้)</span>
                            </label>
                            <input 
                              id="submission-presentation-url" type="text"
                              className="form-input"
                              placeholder="https://drive.google.com/... (ส่งเพิ่มเมื่อเข้ารอบได้)"
                              value={subForm.presentationUrl || ''}
                              onChange={e => setSubForm({...subForm, presentationUrl: e.target.value})}
                            />
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <button type="button" onClick={() => setSubmissionStep(2)} className="btn-text" style={{ color: 'var(--cyan-300)', fontSize: '0.82rem' }}>
                            ← ย้อนกลับไปแก้ไขข้อมูลสมาชิกและผู้ประสานงาน
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                      <button type="button" disabled={submissionLoading || (deadlinePassed && user?.role !== 'ADMIN')} onClick={() => handleSubmission(true)} className="btn-outline-cyan" style={{ flex: 1 }}>
                        <Save className="w-4 h-4" />
                        <span>{submissionLoading ? 'กำลังบันทึก...' : 'บันทึกแบบร่าง'}</span>
                      </button>
                      <button type="button" disabled={submissionLoading || timeLeft.expired || (deadlinePassed && user?.role !== 'ADMIN')} onClick={() => handleSubmission(false)} className="btn-solid-primary" style={{ flex: 1 }}>
                        <Send className="w-4 h-4" />
                        <span>{submissionLoading ? 'กำลังส่ง...' : 'ส่งผลงานฉบับสมบูรณ์'}</span>
                      </button>
                    </div>
                  </fieldset>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 2: STATUS CHECK & OFFICIAL SUBMISSION DOSSIER --- */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="status-modal-title" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
            <button aria-label="ปิดหน้าต่างตรวจสอบสถานะ" className="modal-close-btn" onClick={() => setShowStatusModal(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 id="status-modal-title" style={{ fontSize: '1.35rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search className="w-5 h-5 text-cyan-300" />
              <span>ตรวจสอบสถานะและรายละเอียดผลงาน</span>
            </h3>
            <p style={{ fontSize: '0.84rem', marginBottom: '12px' }}>
              กรอกรหัสผลงานเพื่อดูรายละเอียดใบสมัคร สถานะการเข้ารอบ และไฟล์ประกอบผลงาน
            </p>

            <form onSubmit={handleStatusCheck} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>ตัวอย่างรหัสผลงาน:</span>
              {['KMUTNB-2569-0002', 'KMUTNB-2569-0001'].map(sampleCode => (
                <button
                  key={sampleCode}
                  type="button"
                  onClick={() => {
                    setTrackingSearch(sampleCode);
                    executeStatusSearch(sampleCode);
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    background: 'rgba(24, 52, 88, 0.8)',
                    border: '1px solid var(--border-cyan)',
                    color: 'var(--cyan-300)',
                    cursor: 'pointer'
                  }}
                >
                  {sampleCode}
                </button>
              ))}
            </div>

            {statusLoading && <div role="status" aria-live="polite" style={{ textAlign: 'center', color: 'var(--cyan-300)', fontSize: '0.88rem', padding: '16px' }}>กำลังค้นหาข้อมูล...</div>}

            {statusError && (
              <div
                role="alert"
                aria-live="assertive"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(225, 29, 72, 0.16)',
                  border: '1px solid rgba(251, 113, 133, 0.5)',
                  color: '#FDA4AF',
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}
              >
                {statusError}
              </div>
            )}

            {statusResult && (
              <div className="dossier-card">
                <div className="dossier-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>รายละเอียดผลงาน</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', color: 'var(--emerald-300)' }}>
                        รหัสผลงาน: {statusResult.trackingCode}
                      </strong>
                      <span className="badge-category">{statusResult.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>วันที่สมัคร:</strong> {statusResult.submittedAt}
                  </div>
                </div>

                {/* ข้อมูลหลักของผลงาน */}
                <div className="dossier-grid" style={{ marginBottom: '14px' }}>
                  <div className="dossier-field">
                    <span className="dossier-label">ชื่อทีม</span>
                    <strong className="dossier-value">{statusResult.teamName}</strong>
                  </div>
                  <div className="dossier-field">
                    <span className="dossier-label">หมวดหมู่</span>
                    <strong className="dossier-value">{statusResult.categoryNameTh}</strong>
                  </div>
                  <div className="dossier-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="dossier-label">สังกัด</span>
                    <strong className="dossier-value">{statusResult.affiliation}</strong>
                  </div>
                  <div className="dossier-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="dossier-label">ชื่อผลงาน (ไทย)</span>
                    <strong className="dossier-value" style={{ color: 'var(--text-primary)', fontSize: '0.98rem' }}>{statusResult.titleTh}</strong>
                  </div>
                  {statusResult.titleEn && (
                    <div className="dossier-field" style={{ gridColumn: '1 / -1' }}>
                      <span className="dossier-label">ชื่อผลงาน (อังกฤษ)</span>
                      <strong className="dossier-value" style={{ color: 'var(--cyan-300)' }}>{statusResult.titleEn}</strong>
                    </div>
                  )}
                  <div className="dossier-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="dossier-label">รายละเอียดผลงาน</span>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.65 }}>
                      {statusResult.abstractTh}
                    </p>
                  </div>
                </div>

                {/* สมาชิกทีม */}
                <div className="dossier-section-box" style={{ marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--emerald-300)', fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>สมาชิกทีม</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(statusResult.memberDetails || []).map((m, idx) => (
                      <div key={idx} style={{ fontSize: '0.83rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '6px 10px', borderRadius: '8px', background: 'rgba(15, 32, 56, 0.65)' }}>
                        <span>
                          <strong>{idx + 1}. ชื่อ :</strong> {m.fullName} {m.role ? `(${m.role})` : ''}
                        </span>
                        {m.idCard && (
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            เลขบัตรประชาชน / พาสปอร์ต : {m.idCard}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ผู้ประสานงานหลัก & ผู้ประสานงานรอง */}
                <div className="responsive-two-col-grid" style={{ gap: '12px', marginBottom: '14px' }}>
                  <div className="dossier-section-box">
                    <strong style={{ color: 'var(--cyan-300)', fontSize: '0.86rem', display: 'block', marginBottom: '6px' }}>ผู้ประสานงานหลัก</strong>
                    <div style={{ fontSize: '0.8rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                      <div><strong>ชื่อ :</strong> {statusResult.primaryCoordinator?.name || '-'}</div>
                      {statusResult.primaryCoordinator?.idCard && (
                        <div><strong>เลขบัตรประชาชน / พาสปอร์ต :</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{statusResult.primaryCoordinator.idCard}</span></div>
                      )}
                      <div><strong>โทร :</strong> {statusResult.primaryCoordinator?.phone || '-'}</div>
                      <div><strong>อีเมล :</strong> {statusResult.primaryCoordinator?.email || '-'}</div>
                    </div>
                  </div>
                  <div className="dossier-section-box">
                    <strong style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', display: 'block', marginBottom: '6px' }}>ผู้ประสานงานรอง</strong>
                    {statusResult.secondaryCoordinator?.name ? (
                      <div style={{ fontSize: '0.8rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                        <div><strong>ชื่อ :</strong> {statusResult.secondaryCoordinator.name}</div>
                        {statusResult.secondaryCoordinator.idCard && (
                          <div><strong>เลขบัตรประชาชน / พาสปอร์ต :</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{statusResult.secondaryCoordinator.idCard}</span></div>
                        )}
                        <div><strong>โทร :</strong> {statusResult.secondaryCoordinator.phone || '-'}</div>
                        <div><strong>อีเมล :</strong> {statusResult.secondaryCoordinator.email || '-'}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ไม่ได้ระบุผู้ประสานงานรอง</div>
                    )}
                  </div>
                </div>

                {/* ผลการคัดเลือกรายรอบ */}
                <div className="dossier-rounds-box" style={{ marginBottom: '14px' }}>
                  <div className="dossier-round-row">
                    <span>ผ่านเข้ารอบที่ 1 (รอบคัดเลือกเอกสาร) :</span>
                    <strong className={statusResult.rounds?.round1?.status === 'PASSED' ? 'text-emerald-400' : ''}>
                      {statusResult.rounds?.round1?.status === 'PASSED'
                        ? 'ผ่าน'
                        : statusResult.rounds?.round1?.status === 'FAILED'
                        ? 'ไม่ผ่าน'
                        : 'รอประกาศผล'}
                    </strong>
                  </div>
                  <div className="dossier-round-row">
                    <span>ผ่านเข้ารอบที่ 2 (รอบการประกวดออนไลน์) :</span>
                    <strong className={statusResult.rounds?.round2?.status === 'PASSED' ? 'text-emerald-400' : ''}>
                      {statusResult.rounds?.round2?.status === 'PASSED'
                        ? 'ผ่าน'
                        : statusResult.rounds?.round2?.status === 'FAILED'
                        ? 'ไม่ผ่าน'
                        : 'รอประกาศผล'}
                    </strong>
                  </div>
                  <div className="dossier-round-row">
                    <span>ผ่านเข้ารอบที่ 3 (รอบตัดสิน) :</span>
                    <strong className={statusResult.rounds?.round3?.status === 'PASSED' ? 'text-emerald-400' : ''}>
                      {statusResult.rounds?.round3?.status === 'PASSED'
                        ? 'ผ่าน'
                        : statusResult.rounds?.round3?.status === 'FAILED'
                        ? 'ไม่ผ่าน'
                        : 'รอประกาศผล'}
                    </strong>
                  </div>
                  <div className="dossier-round-row">
                    <span>ผลลัพธ์การแข่งขันรอบ 3 :</span>
                    <strong style={{ color: 'var(--gold-300)' }}>
                      {statusResult.rounds?.round3?.result || 'รอประกาศผล'}
                    </strong>
                  </div>
                </div>

                {/* ไฟล์ประกอบผลงาน 5 รายการ */}
                <div className="dossier-section-box" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--emerald-300)', fontSize: '0.88rem' }}>ไฟล์ประกอบผลงาน (5 รายการ)</strong>
                    {user && (statusResult.canEditArtifacts || statusResult.userId === user.id || user.role === 'ADMIN') ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {!deadlinePassed && statusResult.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setSubForm(hydrateSubmissionFormFromServer(statusResult));
                              setSubmissionStep(1);
                              setSubSuccess(null);
                              setShowStatusModal(false);
                              setShowPortalModal(true);
                              setPortalTab('submission');
                            }}
                            className="btn-outline-cyan"
                            style={{ padding: '5px 12px', fontSize: '0.76rem', minHeight: '34px' }}
                          >
                            แก้ไขข้อมูลใบสมัคร (3 ขั้นตอน)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowLateArtifactEditor(prev => !prev)}
                          className="btn-outline-cyan"
                          style={{ padding: '5px 12px', fontSize: '0.76rem', minHeight: '34px' }}
                        >
                          {showLateArtifactEditor ? 'ซ่อนฟอร์มอัปเดตไฟล์' : '+ แนบ/อัปเดต Poster & Presentation เพิ่มเติม'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowStatusModal(false);
                          setShowPortalModal(true);
                          setPortalTab('login');
                        }}
                        className="btn-outline-cyan"
                        style={{ padding: '5px 12px', fontSize: '0.76rem', minHeight: '34px' }}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>เข้าสู่ระบบด้วยอีเมลเพื่อแก้ไขข้อมูล / แนบไฟล์เพิ่มเติม</span>
                      </button>
                    )}
                  </div>

                  {lateArtifactNotice && (
                    <div role="status" style={{ padding: '8px 12px', marginBottom: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(52, 211, 153, 0.45)', color: '#6EE7B7', fontSize: '0.8rem' }}>
                      {lateArtifactNotice}
                    </div>
                  )}

                  {showLateArtifactEditor && user && (statusResult.canEditArtifacts || statusResult.userId === user.id || user.role === 'ADMIN') && (
                    <form onSubmit={handleSaveLateArtifacts} style={{ padding: '12px', marginBottom: '12px', borderRadius: '10px', background: 'rgba(15, 32, 56, 0.85)', border: '1px solid var(--border-cyan)' }}>
                      <div className="responsive-two-col-grid" style={{ gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <label htmlFor="late-poster-url" className="form-label" style={{ fontSize: '0.78rem' }}>ลิงก์ไฟล์ Poster (สำหรับรอบที่ 2)</label>
                          <input
                            id="late-poster-url"
                            type="text"
                            className="form-input"
                            placeholder="https://drive.google.com/..."
                            value={lateArtifactsForm.posterUrl}
                            onChange={e => setLateArtifactsForm({ ...lateArtifactsForm, posterUrl: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="late-presentation-url" className="form-label" style={{ fontSize: '0.78rem' }}>ลิงก์ไฟล์ Presentation (สไลด์นำเสนอ)</label>
                          <input
                            id="late-presentation-url"
                            type="text"
                            className="form-input"
                            placeholder="https://drive.google.com/..."
                            value={lateArtifactsForm.presentationUrl}
                            onChange={e => setLateArtifactsForm({ ...lateArtifactsForm, presentationUrl: e.target.value })}
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={lateArtifactSaving} className="btn-solid-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                        <Save className="w-4 h-4" />
                        <span>{lateArtifactSaving ? 'กำลังบันทึก...' : 'บันทึกไฟล์เพิ่มเติม'}</span>
                      </button>
                    </form>
                  )}

                  <div className="dossier-artifact-list">
                    {[
                      { label: 'ไฟล์ PDF แบบฟอร์มเสนอผลงานประกวดสิ่งประดิษฐ์และนวัตกรรม', url: statusResult.artifacts?.proposalPdfUrl },
                      { label: 'คลิป VDO นำเสนอผลงาน', url: statusResult.artifacts?.videoUrl },
                      { label: 'Poster', url: statusResult.artifacts?.posterUrl },
                      { label: 'Image', url: statusResult.artifacts?.imageUrl },
                      { label: 'Presentation', url: statusResult.artifacts?.presentationUrl }
                    ].map((art, idx) => (
                      <div key={idx} className="dossier-artifact-item">
                        <span>{idx + 1}. {art.label}</span>
                        {art.url ? (
                          <a
                            href={getAssetUrl(art.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="dossier-artifact-link"
                          >
                            <span>เปิดดูไฟล์</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>ยังไม่ได้แนบ (แนบเพิ่มเติมภายหลังได้)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(15, 32, 56, 0.78)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <strong style={{ color: 'var(--emerald-300)', display: 'block', marginBottom: '4px' }}>ข้อความจากคณะกรรมการ:</strong>
                  <span style={{ color: 'var(--text-primary)' }}>{statusResult.feedback}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: WINNER VIDEO & STORYTELLING MODAL --- */}
      {selectedWinnerModal && (() => {
        const modalVideoInfo = getWinnerVideoInfo(selectedWinnerModal);
        const modalPosterUrl = getWinnerPosterUrl(selectedWinnerModal);
        return (
          <div className="modal-overlay" onClick={() => setSelectedWinnerModal(null)}>
            <div className="modal-box winner-video-modal-box" role="dialog" aria-modal="true" aria-labelledby="winner-modal-title" style={{ maxWidth: '860px' }} onClick={e => e.stopPropagation()}>
              <button aria-label="ปิดหน้าต่างรายละเอียดผลงาน" className="modal-close-btn" onClick={() => setSelectedWinnerModal(null)}>
                <X className="w-5 h-5" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', paddingRight: '52px' }}>
                {renderAwardBadge(selectedWinnerModal)}
                <span className="badge-category" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(52, 211, 153, 0.4)', color: 'var(--emerald-300)' }}>
                  ปีการประกวด {selectedWinnerModal.year || '2569'}
                </span>
                <span className="badge-category">
                  {getCategoryNameTh(selectedWinnerModal.category)}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedWinnerModal.educationLevel === 'below_higher' ? 'ระดับต่ำกว่าอุดมศึกษา' : 'ระดับอุดมศึกษาและบุคคลทั่วไป'}
                </span>
                <span className="winner-video-badge">
                  <Film className="w-3.5 h-3.5" />
                  <span>VIDEO • {modalVideoInfo.duration}</span>
                </span>
              </div>

              {/* 16:9 Cinema Video Player Stage */}
              <div className="winner-modal-video-stage">
                {modalVideoInfo.type === 'file' ? (
                  <video
                    ref={(selectedWinnerModal.id === EVENT_HIGHLIGHT_2569.id || selectedWinnerModal.id === EVENT_HIGHLIGHT_HYPE_2569.id) ? modalVideoRef : undefined}
                    key={`modal-player-${modalVideoInfo.src}`}
                    src={modalVideoInfo.src}
                    poster={modalPosterUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="winner-modal-video-player"
                    onLoadedMetadata={(e) => {
                      if ((selectedWinnerModal.id === EVENT_HIGHLIGHT_2569.id || selectedWinnerModal.id === EVENT_HIGHLIGHT_HYPE_2569.id) && highlightSeekTime > 0) {
                        e.currentTarget.currentTime = highlightSeekTime;
                      }
                      e.currentTarget.play().catch(() => {});
                    }}
                    onTimeUpdate={(e) => {
                      if (selectedWinnerModal.id === EVENT_HIGHLIGHT_2569.id || selectedWinnerModal.id === EVENT_HIGHLIGHT_HYPE_2569.id) {
                        const modalVer = selectedWinnerModal.id === EVENT_HIGHLIGHT_HYPE_2569.id ? 'hype' : 'full';
                        const ch = getHighlightChapterByTime(e.currentTarget.currentTime, modalVer);
                        if (ch !== activeHighlightChapter) {
                          setActiveHighlightChapter(ch);
                        }
                      }
                    }}
                  />
                ) : modalVideoInfo.type === 'embed' ? (
                  <iframe
                    src={modalVideoInfo.src}
                    title={selectedWinnerModal.titleTh}
                    className="winner-modal-video-player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="winner-modal-video-preview-wrap">
                    <img
                      src={modalPosterUrl}
                      alt={selectedWinnerModal.titleTh}
                      decoding="async"
                      className="winner-modal-video-poster"
                    />
                    <div className="winner-video-stage-scrim" aria-hidden="true" />
                    <div className="winner-modal-preview-overlay">
                      <span className="winner-video-play-circle">
                        <Film className="w-6 h-6" />
                      </span>
                      <div className="winner-modal-preview-text">
                        <strong>คลิปวิดีโอนำเสนอผลงาน ({modalVideoInfo.duration} นาที)</strong>
                        <span>รหัสผลงาน {selectedWinnerModal.trackingCode} • ทีม {selectedWinnerModal.teamName}</span>
                      </div>
                    </div>
                    <div className="winner-video-stage-bottombar" aria-hidden="true">
                      <div className="winner-video-stage-meta">
                        <span className="winner-video-live-indicator">
                          <span className="winner-video-live-dot" />
                          <span>VDO PRESENTATION ARCHIVE • {modalVideoInfo.duration}</span>
                        </span>
                        <span className="winner-video-tracking-chip">{selectedWinnerModal.trackingCode}</span>
                      </div>
                      <div className="winner-video-scrubber">
                        <div className="winner-video-scrubber-fill" style={{ width: '35%' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(selectedWinnerModal.id === EVENT_HIGHLIGHT_2569.id || selectedWinnerModal.id === EVENT_HIGHLIGHT_HYPE_2569.id) && (
                <div className="event-highlight-chapters" style={{ marginBottom: '18px' }} role="group" aria-label="เลือกช่วงเวลาสำคัญในวิดีโอไฮไลท์">
                  {(selectedWinnerModal.id === EVENT_HIGHLIGHT_HYPE_2569.id ? EVENT_HIGHLIGHT_HYPE_CHAPTERS : EVENT_HIGHLIGHT_CHAPTERS).map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleJumpToHighlightChapter(ch, { inModal: true })}
                      className={`event-chapter-chip ${activeHighlightChapter === ch.id ? 'active' : ''}`}
                    >
                      <span className="event-chapter-time">
                        <Play className="w-3 h-3" style={{ fill: 'currentColor' }} />
                        <span>{ch.timeLabel}</span>
                      </span>
                      <span className="event-chapter-label">{ch.label}</span>
                    </button>
                  ))}
                </div>
              )}

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

              <div style={{ background: 'rgba(24, 52, 88, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                <h4 style={{ color: 'var(--emerald-300)', fontSize: '0.92rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen className="w-4 h-4" />
                  <span>รายละเอียดและความโดดเด่นของนวัตกรรม (Problem & Solution)</span>
                </h4>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                  {selectedWinnerModal.abstractTh}
                </p>
              </div>

              <div className="responsive-two-col-grid" style={{ gap: '12px', fontSize: '0.84rem', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(24, 52, 88, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>ทีมผู้พัฒนา:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedWinnerModal.teamName}</strong>
                </div>
                <div style={{ background: 'rgba(24, 52, 88, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>สถาบันการศึกษา / หน่วยงาน:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedWinnerModal.institution || selectedWinnerModal.advisorName}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {modalVideoInfo.type === 'file' ? (
                  <a
                    href={modalVideoInfo.src}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-solid-primary"
                    style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>เปิดไฟล์วิดีโอในแท็บใหม่</span>
                  </a>
                ) : modalVideoInfo.rawUrl && modalVideoInfo.rawUrl !== 'https://youtube.com' ? (
                  <a
                    href={modalVideoInfo.rawUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-solid-primary"
                    style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>รับชมวิดีโอต้นฉบับ</span>
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedWinnerModal(null)}
                  className="btn-outline-cyan"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>ปิดหน้าต่าง</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- MODAL 4: DOMAIN DETAIL MODAL (FROM HERO CATEGORY STRIP & DOMAIN CARDS) --- */}
      {detailDomainModal && (() => {
        const domainWinners = getDomainSampleWinners(
          detailDomainModal.id,
          winners.length > 0 ? winners : FALLBACK_WINNERS,
          2
        );
        return (
          <div className="modal-overlay" onClick={() => setDetailDomainModal(null)}>
            <div
              className="modal-box"
              role="dialog"
              aria-modal="true"
              aria-labelledby="domain-modal-title"
              style={{ maxWidth: '720px' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                aria-label="ปิดหน้าต่างรายละเอียดประเภทการแข่งขัน"
                className="modal-close-btn"
                onClick={() => setDetailDomainModal(null)}
              >
                <X className="w-5 h-5" />
              </button>

              <div style={{ width: '100%', height: '200px', borderRadius: '14px', overflow: 'hidden', marginBottom: '18px', border: '1px solid var(--border-subtle)', position: 'relative', isolation: 'isolate' }}>
                <DomainLivingCardBg domainId={detailDomainModal.id} bgImage={detailDomainModal.bgImage} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,32,56,0.12) 0%, rgba(15,32,56,0.88) 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="badge-category" style={{ background: 'rgba(24, 52, 88, 0.92)', borderColor: 'var(--border-cyan)', color: 'var(--emerald-300)' }}>
                    {detailDomainModal.indexLabel || 'INNOVATION DOMAIN'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {detailDomainModal.titleEn}
                  </span>
                </div>
              </div>

              <h2 id="domain-modal-title" style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {detailDomainModal.titleTh}
              </h2>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '18px' }}>
                {detailDomainModal.overview || detailDomainModal.desc}
              </p>

              {/* Scope & Sub-Topics */}
              {Array.isArray(detailDomainModal.subTopics) && detailDomainModal.subTopics.length > 0 && (
                <div style={{ background: 'rgba(24, 52, 88, 0.58)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                  <h4 style={{ color: 'var(--emerald-300)', fontSize: '0.94rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>ขอบเขตและด้านที่เกี่ยวข้อง (Scope & Sub-Topics)</span>
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {detailDomainModal.subTopics.map((topic, idx) => (
                      <li key={idx}>
                        <strong style={{ color: 'var(--text-primary)' }}>{topic.title}: </strong>
                        <span>{topic.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Initial Criteria */}
              {Array.isArray(detailDomainModal.initialCriteria) && detailDomainModal.initialCriteria.length > 0 && (
                <div style={{ background: 'rgba(24, 52, 88, 0.58)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                  <h4 style={{ color: 'var(--cyan-300)', fontSize: '0.94rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>เกณฑ์เบื้องต้นของผลงานในหมวดนี้ (Initial Criteria)</span>
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {detailDomainModal.initialCriteria.map((criterion, idx) => (
                      <li key={idx}>
                        <strong style={{ color: 'var(--text-primary)' }}>{criterion.title}: </strong>
                        <span>{criterion.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Past Winners in this Domain */}
              {domainWinners.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed rgba(251, 191, 36, 0.45)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--gold-300)', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Film className="w-4 h-4 text-amber-300" />
                    <span>ตัวอย่างวิดีโอผลงานที่เคยได้รับรางวัลในหมวดนี้</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {domainWinners.map((w) => {
                      const dwVideo = getWinnerVideoInfo(w);
                      const dwPoster = getWinnerPosterUrl(w);
                      return (
                        <button
                          key={w.id || w.trackingCode}
                          type="button"
                          onClick={() => {
                            setDetailDomainModal(null);
                            openWinnerModal(w);
                          }}
                          className="domain-sample-video-item"
                        >
                          <div className="domain-sample-video-thumb">
                            <img src={dwPoster} alt={w.titleTh} loading="lazy" decoding="async" />
                            <span className="domain-sample-video-play">
                              <Play className="w-3.5 h-3.5" style={{ fill: 'currentColor', marginLeft: '1px' }} />
                            </span>
                            <span className="domain-sample-video-duration">{dwVideo.duration}</span>
                          </div>
                          <div style={{ fontSize: '0.84rem', lineHeight: 1.45, flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.titleTh}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--emerald-300)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{w.awardNameTh || 'รางวัลเกียรติยศ'} • ปี {w.year || '2569'}</span>
                              <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>• คลิกเพื่อรับชมวิดีโอ</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-emerald-400" style={{ flexShrink: 0 }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-solid-primary"
                  style={{ flex: 1.2 }}
                  disabled={timeLeft.expired}
                  onClick={() => {
                    const targetId = detailDomainModal.id;
                    setDetailDomainModal(null);
                    openSubmissionWithDomain(targetId);
                  }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{timeLeft.expired ? 'ปิดรับสมัครแล้ว' : 'สมัครประกวดในหมวดนี้'}</span>
                </button>
                <button
                  type="button"
                  className="btn-outline-cyan"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setDetailDomainModal(null);
                    navigateTo('guidelines', 'domains');
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ดูกติกาฉบับเต็ม</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- MODAL 5: MULTI-YEAR JUDGE & ADMIN EVALUATION WORKSPACE --- */}
      {showJudgingModal && (
        <div className="modal-overlay" onClick={() => setShowJudgingModal(false)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="judging-modal-title"
            style={{ maxWidth: '1080px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              aria-label="ปิดหน้าต่างระบบประเมินและจัดการการแข่งขัน"
              className="modal-close-btn"
              onClick={() => setShowJudgingModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.14)', border: '1px solid rgba(251, 191, 36, 0.4)', color: 'var(--gold-300)', fontSize: '0.76rem', fontWeight: 700, marginBottom: '8px' }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user?.role === 'ADMIN' ? 'ADMIN & JUDGE COMMAND CENTER' : 'CATEGORY JUDGE EVALUATION PORTAL'}</span>
                </div>
                <h2 id="judging-modal-title" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0 }}>
                  ระบบประเมินคะแนนแบบรูบริกถ่วงน้ำหนัก และบริหารจัดการการประกวดรายปี
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label htmlFor="judge-year-select" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ปีการแข่งขัน (พ.ศ.):
                </label>
                <select
                  id="judge-year-select"
                  className="form-input"
                  style={{ width: 'auto', minWidth: '140px', padding: '7px 12px' }}
                  value={selectedJudgeYear}
                  onChange={e => {
                    const nextYear = Number(e.target.value);
                    setSelectedJudgeYear(nextYear);
                    fetchConfigForYear(nextYear);
                    fetchJudgingWorkspace(nextYear, authToken);
                  }}
                >
                  {availableYears.map(y => (
                    <option key={y.year} value={y.year}>
                      พ.ศ. {y.year} {y.isActive ? '(ปีปัจจุบัน)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {judgingNotice && (
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(52, 211, 153, 0.45)', color: 'var(--emerald-300)', fontSize: '0.86rem', marginBottom: '14px' }}>
                {judgingNotice}
              </div>
            )}
            {judgingError && (
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.14)', border: '1px solid rgba(248, 113, 113, 0.45)', color: '#fca5a5', fontSize: '0.86rem', marginBottom: '14px' }}>
                {judgingError}
              </div>
            )}

            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <button
                type="button"
                className={judgingTab === 'queue' ? 'btn-solid-primary' : 'btn-outline-cyan'}
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                onClick={() => setJudgingTab('queue')}
              >
                <ClipboardList className="w-4 h-4" />
                <span>ประเมินและคัดกรองผลงาน ({judgingSubmissions.length})</span>
              </button>
              {user?.role === 'ADMIN' && (
                <>
                  <button
                    type="button"
                    className={judgingTab === 'judges' ? 'btn-solid-primary' : 'btn-outline-cyan'}
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                    onClick={() => setJudgingTab('judges')}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>จัดการกรรมการประจำกลุ่มนวัตกรรม ({judgesList.length})</span>
                  </button>
                  <button
                    type="button"
                    className={judgingTab === 'setup' ? 'btn-solid-primary' : 'btn-outline-cyan'}
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                    onClick={() => setJudgingTab('setup')}
                  >
                    <Layers className="w-4 h-4" />
                    <span>ตั้งค่ากลุ่มนวัตกรรม, รูบริก, ประกาศผล & ปีถัดไป</span>
                  </button>
                </>
              )}
            </div>

            {/* TAB 1: EVALUATION & SCREENING QUEUE */}
            {judgingTab === 'queue' && (
              <div>
                {/* 4-Stage Filter Bar */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {[
                    { id: 'all', label: 'ทั้งหมด (All Stages)' },
                    { id: 'SCREENING', label: '0. ตรวจคัดกรอง (Screening)' },
                    { id: 'ROUND_1', label: '1. ตัดสินรอบที่ 1 (คัดเลือกเอกสาร)' },
                    { id: 'ROUND_2', label: '2. ตัดสินรอบที่ 2 (ต้องส่ง POSTER)' },
                    { id: 'ROUND_3', label: '3. ตัดสินรอบชิงชนะเลิศ (Final)' }
                  ].map(stage => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setJudgeRoundFilter(stage.id)}
                      className={judgeRoundFilter === stage.id ? 'btn-solid-primary' : 'btn-outline-cyan'}
                      style={{ padding: '6px 12px', fontSize: '0.79rem' }}
                    >
                      <span>{stage.label}</span>
                    </button>
                  ))}
                </div>

                {/* Category & Education Level Filters */}
                <div className="responsive-two-col-grid" style={{ gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>กรองตามกลุ่มนวัตกรรม</label>
                    <select
                      className="form-input"
                      value={judgeCategoryFilter}
                      onChange={e => setJudgeCategoryFilter(e.target.value)}
                    >
                      <option value="all">ทุกกลุ่มนวัตกรรมที่รับผิดชอบ</option>
                      {dynamicCategories.map(cat => (
                        <option key={cat.code} value={cat.code}>
                          {cat.nameTh} ({cat.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>กรองตามระดับการศึกษา</label>
                    <select
                      className="form-input"
                      value={judgeLevelFilter}
                      onChange={e => setJudgeLevelFilter(e.target.value)}
                    >
                      <option value="all">ทุกระดับการแข่งขัน</option>
                      <option value="below_higher">ต่ำกว่าอุดมศึกษา</option>
                      <option value="higher_and_above">อุดมศึกษาและบุคคลทั่วไป</option>
                    </select>
                  </div>
                </div>

                {/* Active Weighted Rubric Evaluative Drawer */}
                {activeEvalSubmission && (
                  <form
                    onSubmit={handleSaveEvaluation}
                    style={{ background: 'rgba(15, 32, 56, 0.95)', border: '1px solid var(--border-cyan)', borderRadius: '14px', padding: '18px', marginBottom: '18px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <div>
                        <span className="badge-category" style={{ marginRight: '8px' }}>{activeEvalSubmission.trackingCode}</span>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{activeEvalSubmission.titleTh}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          className="form-input"
                          style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
                          value={evalRound}
                          onChange={e => openEvaluationDrawer(activeEvalSubmission, e.target.value)}
                        >
                          <option value="ROUND_1">รอบที่ 1 (คัดเลือกเอกสาร)</option>
                          <option value="ROUND_2">รอบที่ 2 (ออนไลน์ + POSTER)</option>
                          <option value="ROUND_3">รอบที่ 3 (รอบชิงชนะเลิศ)</option>
                        </select>
                        <span style={{ padding: '6px 12px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(52, 211, 153, 0.5)', color: 'var(--emerald-300)', fontWeight: 700, fontSize: '0.88rem' }}>
                          คะแนนรวมถ่วงน้ำหนัก: {calculateWeightedRubricScore(evalScores, rubricCriteria)} / 100
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                      {rubricCriteria.map(crit => (
                        <div
                          key={crit.id}
                          style={{ background: 'rgba(24, 52, 88, 0.55)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
                        >
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {crit.titleTh} <span style={{ color: 'var(--gold-300)', fontFamily: 'var(--font-mono)' }}>(น้ำหนัก {crit.weight}%)</span>
                            </div>
                            {crit.description && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{crit.description}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {RUBRIC_SCORE_LEVELS.map(lvl => {
                              const selected = Number(evalScores[crit.id]) === lvl.score;
                              return (
                                <button
                                  key={lvl.score}
                                  type="button"
                                  onClick={() => setEvalScores(prev => ({ ...prev, [crit.id]: lvl.score }))}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    border: selected ? '1px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                                    background: selected ? 'rgba(16, 185, 129, 0.24)' : 'rgba(15, 23, 42, 0.65)',
                                    color: selected ? 'var(--emerald-300)' : 'var(--text-secondary)',
                                    fontWeight: selected ? 700 : 500,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {lvl.score} ({lvl.label || lvl.labelTh})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>ข้อเสนอแนะจากกรรมการ (Feedback / Comment)</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="ระบุจุดเด่นหรือข้อเสนอแนะเพื่อพัฒนาผลงาน..."
                        value={evalComment}
                        onChange={e => setEvalComment(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-outline-cyan"
                        onClick={() => setActiveEvalSubmission(null)}
                      >
                        ยกเลิก
                      </button>
                      <button type="submit" className="btn-solid-primary" disabled={evalSaving}>
                        <Save className="w-4 h-4" />
                        <span>{evalSaving ? 'กำลังบันทึกคะแนน...' : 'ยืนยันการบันทึกคะแนนรูบริก'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Submission Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {judgingSubmissions
                    .filter(sub => {
                      if (judgeCategoryFilter !== 'all' && sub.category !== judgeCategoryFilter) return false;
                      if (judgeLevelFilter !== 'all' && sub.educationLevel !== judgeLevelFilter) return false;
                      if (judgeRoundFilter === 'SCREENING') return sub.status === 'SUBMITTED' || sub.status === 'UNDER_REVIEW' || sub.status === 'REJECTED';
                      if (judgeRoundFilter === 'ROUND_2') return sub.round1Status === 'PASSED' || sub.status === 'PASSED_FIRST_ROUND' || sub.status === 'FINALIST' || sub.status === 'AWARDED';
                      if (judgeRoundFilter === 'ROUND_3') return sub.round2Status === 'PASSED' || sub.status === 'FINALIST' || sub.status === 'AWARDED';
                      return true;
                    })
                    .map(sub => {
                      const activeSummaryRound = ['ROUND_1', 'ROUND_2', 'ROUND_3'].includes(judgeRoundFilter) ? judgeRoundFilter : 'ROUND_1';
                      const rawStats = sub.roundSummaries?.[activeSummaryRound] || sub.evaluationSummary?.[activeSummaryRound] || { count: 0, avgScore: null };
                      const roundAvg = rawStats.avgScore ?? rawStats.averageWeightedTotal ?? null;
                      return (
                        <div
                          key={sub.id}
                          style={{ background: 'rgba(24, 52, 88, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px 16px' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '260px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                <span className="badge-category">{sub.trackingCode}</span>
                                <span className="badge-category" style={{ background: 'rgba(16, 185, 129, 0.16)', color: 'var(--emerald-300)' }}>
                                  {sub.categoryNameTh || sub.category}
                                </span>
                                <span style={{ fontSize: '0.76rem', padding: '2px 8px', borderRadius: '999px', background: sub.hasPoster ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.16)', color: sub.hasPoster ? 'var(--emerald-300)' : 'var(--gold-300)', fontWeight: 700 }}>
                                  {sub.hasPoster ? 'ส่ง POSTER แล้ว' : 'ยังไม่ส่ง POSTER'}
                                </span>
                                <span style={{ fontSize: '0.76rem', color: 'var(--cyan-300)', fontFamily: 'var(--font-mono)' }}>
                                  สถานะ: {sub.status}
                                </span>
                              </div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.96rem' }}>{sub.titleTh}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                                ทีม {sub.teamName} • {sub.affiliation}
                              </div>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.78rem' }}>
                                {sub.artifacts?.proposalPdfUrl && (
                                  <a href={sub.artifacts.proposalPdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-300)' }}>
                                    เปิด Proposal PDF
                                  </a>
                                )}
                                {sub.artifacts?.videoUrl && (
                                  <a href={sub.artifacts.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--emerald-300)' }}>
                                    เปิด Video Pitch
                                  </a>
                                )}
                                {sub.artifacts?.posterUrl && (
                                  <a href={sub.artifacts.posterUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--gold-300)' }}>
                                    เปิดไฟล์ POSTER (รอบที่ 2)
                                  </a>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <div>
                                  ค่าเฉลี่ย {activeSummaryRound}:{' '}
                                  <strong style={{ color: 'var(--gold-300)', fontSize: '0.96rem' }}>
                                    {roundAvg !== null ? `${roundAvg} / 100` : 'ยังไม่มีผลประเมิน'}
                                  </strong>{' '}
                                  ({rawStats.count || 0} กรรมการ)
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className="btn-solid-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                  onClick={() => openEvaluationDrawer(sub, activeSummaryRound)}
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>ให้คะแนนรูบริก (1-5)</span>
                                </button>

                                {user?.role === 'ADMIN' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-outline-cyan"
                                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                      onClick={() => handleAdminStatusAdvance(sub.id, { status: 'UNDER_REVIEW' }, `ผ่านตรวจคัดกรอง: ${sub.trackingCode}`)}
                                    >
                                      ผ่านคัดกรอง
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-outline-cyan"
                                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                      onClick={() => handleAdminStatusAdvance(sub.id, { status: 'PASSED_FIRST_ROUND', round1Status: 'PASSED' }, `ผ่านรอบที่ 1: ${sub.trackingCode}`)}
                                    >
                                      ผ่านรอบ 1
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-outline-cyan"
                                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                      onClick={() => handleAdminStatusAdvance(sub.id, { status: 'FINALIST', round1Status: 'PASSED', round2Status: 'PASSED' }, `ผ่านรอบที่ 2 (Finalist): ${sub.trackingCode}`)}
                                    >
                                      ผ่านรอบ 2 (ชิงชนะเลิศ)
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-outline-cyan"
                                      style={{ padding: '6px 10px', fontSize: '0.75rem', borderColor: 'rgba(251, 191, 36, 0.5)', color: 'var(--gold-300)' }}
                                      onClick={() => handleAdminStatusAdvance(sub.id, { status: 'AWARDED', round1Status: 'PASSED', round2Status: 'PASSED', round3Status: 'PASSED', awardTier: 'GRAND_WINNER', round3Result: 'รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)' }, `มอบรางวัลชนะเลิศ: ${sub.trackingCode}`)}
                                    >
                                      มอบรางวัลชนะเลิศ
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 2: ADMIN JUDGE MANAGEMENT & CATEGORY ASSIGNMENT */}
            {judgingTab === 'judges' && user?.role === 'ADMIN' && (
              <div>
                <form
                  onSubmit={handleCreateOrUpdateJudge}
                  style={{ background: 'rgba(24, 52, 88, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}
                >
                  <h4 style={{ margin: '0 0 12px 0', color: 'var(--emerald-300)', fontSize: '0.96rem' }}>
                    เพิ่มกรรมการและผูกเข้ากับกลุ่มนวัตกรรม (ไม่ต้องจัดการเป็นรายชิ้นงาน)
                  </h4>
                  <div className="responsive-two-col-grid" style={{ gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="ชื่อ-นามสกุลกรรมการ *"
                      value={newJudgeForm.fullName}
                      onChange={e => setNewJudgeForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="อีเมลสำหรับเข้าสู่ระบบกรรมการ *"
                      value={newJudgeForm.email}
                      onChange={e => setNewJudgeForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="รหัสผ่านเริ่มต้น (อย่างน้อย 8 ตัวอักษร)"
                      value={newJudgeForm.password}
                      onChange={e => setNewJudgeForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="สังกัด / คณะ / หน่วยงาน"
                      value={newJudgeForm.institution}
                      onChange={e => setNewJudgeForm(prev => ({ ...prev, institution: e.target.value }))}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      เลือกกลุ่มนวัตกรรมที่กรรมการท่านนี้รับผิดชอบในปี พ.ศ. {selectedJudgeYear}:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {dynamicCategories.map(cat => {
                        const checked = newJudgeForm.categoryCodes.includes(cat.code);
                        return (
                          <label
                            key={cat.code}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '8px', background: checked ? 'rgba(16, 185, 129, 0.22)' : 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setNewJudgeForm(prev => ({
                                  ...prev,
                                  categoryCodes: checked
                                    ? prev.categoryCodes.filter(c => c !== cat.code)
                                    : [...prev.categoryCodes, cat.code]
                                }));
                              }}
                            />
                            <span>{cat.nameTh}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit" className="btn-solid-primary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                    <UserPlus className="w-4 h-4" />
                    <span>บันทึกกรรมการและผูกกลุ่มนวัตกรรม</span>
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {judgesList.map(judge => (
                    <div
                      key={judge.id}
                      style={{ background: 'rgba(24, 52, 88, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px' }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {judge.fullName} <span style={{ color: 'var(--cyan-300)', fontWeight: 400, fontSize: '0.8rem' }}>({judge.email})</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {dynamicCategories.map(cat => {
                          const assigned = (judge.assignedCategories || []).some(c => (typeof c === 'string' ? c === cat.code : c?.code === cat.code));
                          return (
                            <button
                              key={cat.code}
                              type="button"
                              onClick={() => handleToggleJudgeCategory(judge, cat.code)}
                              className={assigned ? 'btn-solid-primary' : 'btn-outline-cyan'}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              {assigned ? '✓ ' : '+ '}
                              {cat.nameTh}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN RUBRIC WEIGHTS, DYNAMIC CATEGORIES, RESULT PUBLISHING & MULTI-YEAR SETUP */}
            {judgingTab === 'setup' && user?.role === 'ADMIN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Rubric Weights Editor */}
                <form
                  onSubmit={handleSaveRubricWeights}
                  style={{ background: 'rgba(24, 52, 88, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--gold-300)', fontSize: '0.96rem' }}>
                    1. ตั้งค่าเกณฑ์คะแนนรูบริก (ระดับ 5-4-3-2-1) และค่าน้ำหนักแต่ละข้อ (รวม 100%) ประจำปี {selectedJudgeYear}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {rubricCriteria.map((crit, idx) => (
                      <div key={crit.id || idx} style={{ display: 'grid', gridTemplateColumns: '2fr 90px', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={crit.titleTh}
                          onChange={e => {
                            const val = e.target.value;
                            setRubricCriteria(prev => prev.map((c, i) => (i === idx ? { ...c, titleTh: val } : c)));
                          }}
                        />
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="form-input"
                          value={crit.weight}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setRubricCriteria(prev => prev.map((c, i) => (i === idx ? { ...c, weight: val } : c)));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn-solid-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    <Save className="w-4 h-4" />
                    <span>บันทึกเกณฑ์รูบริกและค่าน้ำหนักประจำปี {selectedJudgeYear}</span>
                  </button>
                </form>

                {/* 2. Dynamic Innovation Categories Manager */}
                <form
                  onSubmit={handleSaveDynamicCategory}
                  style={{ background: 'rgba(24, 52, 88, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--emerald-300)', fontSize: '0.96rem' }}>
                    2. จัดการกลุ่มนวัตกรรมแบบยืดหยุ่น (รองรับ 3, 5, 6, 7+ กลุ่มต่อปี) ประจำปี {selectedJudgeYear}
                  </h4>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {dynamicCategories.map(cat => (
                      <span key={cat.code} className="badge-category">
                        {cat.nameTh} ({cat.code})
                      </span>
                    ))}
                  </div>
                  <div className="responsive-two-col-grid" style={{ gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="รหัสกลุ่มนวัตกรรม เช่น ai_robotics *"
                      value={newCategoryForm.code}
                      onChange={e => setNewCategoryForm(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="ชื่อกลุ่มนวัตกรรม (ภาษาไทย) *"
                      value={newCategoryForm.nameTh}
                      onChange={e => setNewCategoryForm(prev => ({ ...prev, nameTh: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn-solid-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    <Plus className="w-4 h-4" />
                    <span>เพิ่ม/อัปเดตกลุ่มนวัตกรรมในปี {selectedJudgeYear}</span>
                  </button>
                </form>

                {/* 3. Publish Official Round Announcements & Deadline */}
                <div className="responsive-two-col-grid" style={{ gap: '14px' }}>
                  <form
                    onSubmit={handlePublishRoundResults}
                    style={{ background: 'rgba(24, 52, 88, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--cyan-300)', fontSize: '0.94rem' }}>
                      3. ประกาศผลการตัดสินขึ้นหน้าเว็บไซต์ (One-Click Publish)
                    </h4>
                    <select
                      className="form-input"
                      style={{ marginBottom: '10px' }}
                      value={publishRoundForm.round}
                      onChange={e => setPublishRoundForm(prev => ({ ...prev, round: e.target.value }))}
                    >
                      <option value="ROUND_1">ประกาศผลรอบที่ 1 (ผู้ผ่านคัดเลือกเอกสาร)</option>
                      <option value="ROUND_2">ประกาศผลรอบที่ 2 (ผู้ผ่านเข้าสู่รอบชิงชนะเลิศ)</option>
                      <option value="ROUND_3">ประกาศผลรางวัลชนะเลิศรอบชิงชนะเลิศ</option>
                    </select>
                    <button type="submit" className="btn-solid-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                      <Megaphone className="w-4 h-4" />
                      <span>เผยแพร่ประกาศผลประจำปี {selectedJudgeYear}</span>
                    </button>
                  </form>

                  <form
                    onSubmit={handleUpdateDeadline}
                    style={{ background: 'rgba(24, 52, 88, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--cyan-300)', fontSize: '0.94rem' }}>
                      4. กำหนดเวลาปิดรับสมัครและแก้ไขใบสมัคร (ISO-8601)
                    </h4>
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginBottom: '10px' }}
                      value={deadlineEditValue}
                      onChange={e => setDeadlineEditValue(e.target.value)}
                    />
                    <button type="submit" className="btn-outline-cyan" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                      <Calendar className="w-4 h-4" />
                      <span>อัปเดตวันปิดรับสมัครปี {selectedJudgeYear}</span>
                    </button>
                  </form>
                </div>

                {/* 5. Multi-Year Competition Rollover */}
                <form
                  onSubmit={handleCreateNextYear}
                  style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed rgba(52, 211, 153, 0.45)', borderRadius: '12px', padding: '16px' }}
                >
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--emerald-300)', fontSize: '0.96rem' }}>
                    5. เปิดปีการแข่งขันถัดไปอัตโนมัติ (คัดลอกกลุ่มนวัตกรรมและเกณฑ์รูบริกโดยไม่ต้องพัฒนาระบบใหม่)
                  </h4>
                  <div className="responsive-two-col-grid" style={{ gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="ปี พ.ศ. ใหม่ เช่น 2571"
                      value={newYearForm.year}
                      onChange={e => setNewYearForm(prev => ({ ...prev, year: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="วันปิดรับสมัครปีใหม่ (ISO-8601)"
                      value={newYearForm.submissionDeadline}
                      onChange={e => setNewYearForm(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn-solid-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    <Rocket className="w-4 h-4" />
                    <span>สร้างและเปิดใช้งานปีการแข่งขัน พ.ศ. {newYearForm.year}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
