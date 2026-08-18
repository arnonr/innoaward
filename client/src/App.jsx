import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, Award, Rocket, Search, CheckCircle2, Clock, 
  FileText, Download, UserCheck, ShieldCheck, ChevronRight, 
  ExternalLink, Sparkles, X, Filter, LogIn, UserPlus, Send, Save,
  BookOpen, HelpCircle, Layers, Calendar, MapPin, Phone, Mail, Globe,
  Zap, Leaf, Users, Activity, Box, GraduationCap, Building2, ArrowRight,
  CheckCircle, User, ShieldAlert, Check, Video, ClipboardList, CheckSquare,
  BarChart3, Medal, FileCheck, HelpCircle as InfoIcon, Bell, Megaphone, Crown
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

// Domain Definitions with Custom Background Images
const DOMAINS = [
  {
    id: 'energy_environment',
    nameTh: 'Energy & Environment',
    nameEn: 'Energy & Environment',
    desc: 'นวัตกรรมด้านพลังงานทดแทน การจัดการสิ่งแวดล้อม เทคโนโลยีสีเขียว และการลดการปล่อยคาร์บอน',
    icon: Zap,
    color: '#22D3EE',
    bgImage: '/domain-energy.jpg'
  },
  {
    id: 'food_agriculture',
    nameTh: 'Food & Agriculture',
    nameEn: 'Food & Agriculture',
    desc: 'นวัตกรรมเกษตรอัจฉริยะ (AgriTech) อาหารแห่งอนาคต การแปรรูปผลิตผล และความมั่นคงทางอาหาร',
    icon: Leaf,
    color: '#4ADE80',
    bgImage: '/domain-food.jpg'
  },
  {
    id: 'social_economy',
    nameTh: 'Social & Economy',
    nameEn: 'Social & Economy',
    desc: 'นวัตกรรมเพื่อการพัฒนาสังคม เศรษฐกิจดิจิทัล เทคโนโลยีการศึกษา และการยกระดับคุณภาพชีวิตชุมชน',
    icon: Users,
    color: '#818CF8',
    bgImage: '/domain-social.jpg'
  },
  {
    id: 'medical_device',
    nameTh: 'Medical Device',
    nameEn: 'Medical Device',
    desc: 'อุปกรณ์และเครื่องมือทางการแพทย์ เทคโนโลยีสุขภาพ (HealthTech) ชีวการแพทย์ และอุปกรณ์ช่วยดูแลสุขภาพ',
    icon: Activity,
    color: '#F43F5E',
    bgImage: '/domain-medical.jpg'
  },
  {
    id: 'material',
    nameTh: 'Material',
    nameEn: 'Material',
    desc: 'นวัตกรรมด้านวัสดุศาสตร์ คอมโพสิต โพลีเมอร์ สารเคลือบผิว นาโนเทคโนโลยี และวัสดุก้าวหน้า',
    icon: Box,
    color: '#FBBF24',
    bgImage: '/domain-material.jpg'
  }
];

// Project Images
const WINNER_IMAGES = {
  'sub-2025-01': '/winner-robot.jpg',
  'sub-2025-02': '/winner-eco.jpg'
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
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (['guidelines', 'schedule', 'announcements', 'halloffame', 'contact'].includes(hash.split('#')[0])) {
      return hash.split('#')[0];
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(parseRoute());
  const [activeGuidelineTab, setActiveGuidelineTab] = useState('eligibility');

  // Announcement Filters
  const [annCategory, setAnnCategory] = useState('all');
  const [annSearch, setAnnSearch] = useState('');

  // App Data States
  const [config, setConfig] = useState(null);
  const [winners, setWinners] = useState([]);
  const [news, setNews] = useState([]);

  // Hall of Fame Filters
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  // Modals
  const [selectedWinnerModal, setSelectedWinnerModal] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [portalTab, setPortalTab] = useState('register'); // 'register' | 'login' | 'submission'

  // User & Forms
  const [user, setUser] = useState(null);
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
    videoUrl: '',
    documentUrl: ''
  });

  const [subSuccess, setSubSuccess] = useState(null);

  // Navigate Helper
  const navigateTo = (view, subSection = null) => {
    setCurrentView(view);
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
      return { days: '89', hours: '12', minutes: '34', seconds: '50' };
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(parseRoute());
    };
    window.addEventListener('hashchange', handleHashChange);

    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.warn('Using local fallback for config:', err));

    fetch(`${API_BASE}/winners`)
      .then(res => res.json())
      .then(data => setWinners(data.data || []))
      .catch(err => console.warn('Using local fallback for winners:', err));

    fetch(`${API_BASE}/news`)
      .then(res => res.json())
      .then(data => setNews(data.data || []))
      .catch(err => console.warn('Using local fallback for news:', err));

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(interval);
    };
  }, []);

  // Filter Announcements
  const filteredAnnouncements = ANNOUNCEMENTS.filter(a => {
    if (annCategory !== 'all' && a.category !== annCategory) return false;
    if (annSearch.trim()) {
      const q = annSearch.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchAbstract = a.abstract.toLowerCase().includes(q);
      const matchRoster = a.roster.some(r => r.team.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
      if (!matchTitle && !matchAbstract && !matchRoster) return false;
    }
    return true;
  });

  // Filter Winners
  const filteredWinners = (winners.length > 0 ? winners : [
    {
      id: 'sub-2025-01',
      trackingCode: 'KMUTNB-2025-8821',
      titleTh: 'หุ่นยนต์สำรวจและกู้ภัยอัจฉริยะควบคุมด้วย AI สำหรับพื้นที่ภัยพิบัติ',
      titleEn: 'AI-Powered Disaster Rescue & Reconnaissance Robot',
      category: 'medical_device',
      educationLevel: 'higher_and_above',
      teamName: 'KMUTNB Robotics Lab',
      advisorName: 'รศ.ดร.สมชาย นวัตกรรม',
      abstractTh: 'หุ่นยนต์กู้ภัยที่สามารถลุยพื้นที่เสี่ยงภัยพิบัติ มีระบบตรวจจับสัญญาณชีพด้วยเซ็นเซอร์อินฟราเรดและ AI คอมพิวเตอร์วิสัยทัศน์ พร้อมสร้างแผนที่ 3 มิติแบบ Real-time',
      videoUrl: 'https://youtube.com'
    },
    {
      id: 'sub-2025-02',
      trackingCode: 'KMUTNB-2025-4109',
      titleTh: 'บรรจุภัณฑ์ชีวภาพย่อยสลายได้จากฟางข้าวเสริมนาโนเซลลูโลส',
      titleEn: 'Bio-Nanocellulose Enhanced Rice Straw Sustainable Packaging',
      category: 'food_agriculture',
      educationLevel: 'below_higher',
      teamName: 'EcoInno High School Team',
      advisorName: 'อาจารย์อารีลักษณ์ ปัญญาดี',
      abstractTh: 'แนวคิดการแปรรูปเศษวัสดุเหลือทิ้งทางการเกษตรเป็นบรรจุภัณฑ์ทนความร้อน ทนน้ำ และย่อยสลายได้ในธรรมชาติภายใน 45 วัน เพื่อแทนที่พลาสติก',
      videoUrl: 'https://youtube.com'
    }
  ]).filter(w => {
    if (selectedDomain !== 'all' && w.category !== selectedDomain) return false;
    if (selectedLevel !== 'all' && w.educationLevel !== selectedLevel) return false;
    return true;
  });

  const handleAuthRegister = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setPortalTab('submission');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      })
      .catch(() => {
        setUser({ fullName: regForm.fullName, email: regForm.email });
        setPortalTab('submission');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      });
  };

  const handleAuthLogin = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regForm.email })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setPortalTab('submission');
        }
      })
      .catch(() => {
        setUser({ fullName: 'ผู้เข้าแข่งขัน', email: regForm.email });
        setPortalTab('submission');
      });
  };

  const handleSubmission = (isDraft = false) => {
    if (!subForm.titleTh) {
      alert('กรุณากรอกชื่อผลงาน (ภาษาไทย)');
      return;
    }

    fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      });
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
      
      {/* 1. ENTERPRISE NAVBAR (6 FOCUSED LINKS + NO MULTI-LINE WRAP) */}
      <header className="pro-header">
        <div className="pro-container">
          <div className="pro-header-inner">
            
            {/* Brand Logo */}
            <div onClick={() => navigateTo('home')} className="pro-brand" style={{ cursor: 'pointer' }}>
              <div className="pro-brand-icon">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div className="pro-brand-text">
                <h1>KMUTNB INNOVATION</h1>
                <span>AWARDS 2026</span>
              </div>
            </div>

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
              <button 
                onClick={() => setShowStatusModal(true)}
                className="btn-outline-cyan"
              >
                <Search className="w-4 h-4" />
                <span>ตรวจสถานะ</span>
              </button>

              <button 
                onClick={() => {
                  setShowPortalModal(true);
                  if (user) setPortalTab('submission');
                }}
                className="btn-solid-primary"
              >
                <Rocket className="w-4 h-4" />
                <span>{user ? 'ยื่นผลงาน' : 'สมัครประกวด'}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ============================================================
          VIEW 1: หน้าแรก (HIGH-IMPACT SUMMARY & PORTAL GATE)
          ============================================================ */}
      {currentView === 'home' && (
        <main>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="pro-container">
              <div className="hero-grid hero-cinematic-grid">
                
                {/* Left: Content */}
                <div className="hero-text-content">
                  <div>
                    <div className="badge-royal">
                      <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>ครองถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี</span>
                    </div>
                  </div>

                  <h1 className="hero-title">
                    <span className="hero-brand-lead">KMUTNB</span>
                    <span className="hero-title-cyan">INNOVATION</span>
                    <span className="hero-title-gold">AWARDS 2026</span>
                  </h1>

                  <p className="hero-desc">
                    เวทีประกวดสิ่งประดิษฐ์และนวัตกรรมระดับประเทศ ขับเคลื่อน 5 สาขานวัตกรรมเป้าหมายสู่อนาคต พร้อมเปิดรับข้อเสนอโครงการจากนักเรียน นักศึกษา และนักวิจัยทั่วประเทศ
                  </p>

                  {/* Countdown Bar (Mission Launch Glass HUD) */}
                  <div className="hero-mission-hud">
                    <div className="hud-header">
                      <div className="hud-status-chip">
                        <span className="hud-dot" />
                        <span>OPEN FOR SUBMISSIONS</span>
                      </div>
                      <span className="hud-title-label">เวลาคงเหลือปิดรับสมัคร (COUNTDOWN)</span>
                    </div>

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
                  </div>

                  {/* Action Buttons */}
                  <div className="hero-actions">
                    <button 
                      onClick={() => {
                        setShowPortalModal(true);
                        if (user) setPortalTab('submission');
                      }}
                      className="btn-solid-primary hero-main-cta"
                    >
                      <Rocket className="w-5 h-5" />
                      <span>สมัครเข้าร่วมประกวด (Submit Entry)</span>
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

                {/* Right: Clean Royal Prestige Showcase Card (No 3D Image) */}
                <div className="hero-showcase-column">
                  <div className="royal-prestige-card">
                    
                    <div className="royal-card-header">
                      <div className="royal-emblem-badge">
                        <Crown className="w-8 h-8 text-amber-300" />
                      </div>
                      <div className="royal-emblem-text">
                        <span className="royal-subtitle">เกียรติยศสูงสุดแห่งการประกวด</span>
                        <h3 className="royal-title">ถ้วยพระราชทาน</h3>
                      </div>
                    </div>

                    <p className="royal-dedication">
                      สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี
                    </p>

                    <div className="royal-stats-matrix">
                      <div className="royal-stat-box">
                        <span className="stat-label">เงินรางวัลรวม</span>
                        <strong className="stat-value gold">300,000+</strong>
                        <span className="stat-sub">บาท (THB)</span>
                      </div>
                      <div className="royal-stat-box">
                        <span className="stat-label">รางวัลเกียรติยศ</span>
                        <strong className="stat-value cyan">Grand Prize</strong>
                        <span className="stat-sub">พร้อมถ้วยและโล่รางวัล</span>
                      </div>
                      <div className="royal-stat-box">
                        <span className="stat-label">สาขาประกวด</span>
                        <strong className="stat-value">5 สาขา</strong>
                        <span className="stat-sub">นวัตกรรมเป้าหมาย</span>
                      </div>
                      <div className="royal-stat-box">
                        <span className="stat-label">กลุ่มผู้สมัคร</span>
                        <strong className="stat-value">2 ระดับ</strong>
                        <span className="stat-sub">การศึกษาทั่วประเทศ</span>
                      </div>
                    </div>

                    <div className="royal-card-footer">
                      <div className="royal-perk-tag">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>เกียรติบัตรระดับชาติ</span>
                      </div>
                      <div className="royal-perk-tag">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ต่อยอดเชิงพาณิชย์</span>
                      </div>
                      <div className="royal-perk-tag">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>รับรองโดย มจพ.</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Announcement Alert Banner on Home */}
          <div className="pro-container" style={{ marginTop: '24px' }}>
            <div 
              onClick={() => navigateTo('announcements')}
              style={{ 
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(18, 34, 68, 0.9) 100%)', 
                border: '1px solid var(--border-cyan)', 
                borderRadius: '14px', 
                padding: '14px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Megaphone className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <strong>ข่าวประกาศล่าสุด:</strong> เปิดรับสมัครข้อเสนอโครงการ KMUTNB Innovation Awards 2026 จนถึง 15 พ.ย. 2569
                </span>
              </div>
              <span className="winner-cta-link" style={{ fontSize: '0.84rem' }}>
                <span>ดูประกาศผล & ข่าวทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

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
                    <div className="highlight-icon-wrap" style={{ background: 'rgba(250, 204, 21, 0.15)', color: 'var(--gold-400)' }}>
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
                            <span>สมัครในหมวดนี้</span>
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
                    <span>เริ่มกรอกข้อมูลสมัคร</span>
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
                <div className="badge-tag" style={{ justifyContent: 'center' }}>
                  <Trophy className="w-4 h-4" />
                  <span>PAST GRAND PRIZE WINNERS</span>
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '32px' }}>ตัวอย่างผลงานที่เคยได้รับรางวัลชนะเลิศ</h2>

                <div className="winner-grid" style={{ textAlign: 'left' }}>
                  {filteredWinners.slice(0, 2).map(w => (
                    <div 
                      key={w.id}
                      onClick={() => setSelectedWinnerModal(w)}
                      className="winner-card"
                    >
                      <div className="winner-card-image-wrap">
                        <img 
                          src={WINNER_IMAGES[w.id] || '/winner-robot.jpg'} 
                          alt={w.titleTh} 
                          className="winner-card-image"
                        />
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                            <Trophy className="w-3 h-3 text-amber-300" />
                            <span>Grand Prize Winner</span>
                          </span>
                        </div>
                      </div>

                      <div className="winner-card-body">
                        <div>
                          <h4>{w.titleTh}</h4>
                          <div className="winner-card-en">{w.titleEn}</div>
                          <p>{w.abstractTh}</p>
                        </div>

                        <div className="winner-card-footer">
                          <span>ทีม: <strong style={{ color: 'var(--text-primary)' }}>{w.teamName}</strong></span>
                          <span className="winner-cta-link">
                            <span>อ่านสตอรี่ผลงาน</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
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
                <h2>รายละเอียดและกติกาการแข่งขัน</h2>
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
                  onClick={(e) => { e.preventDefault(); document.getElementById('eligibility')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="subnav-tab-btn"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>1. คุณสมบัติและเงื่อนไข</span>
                </a>

                <a 
                  href="#domains"
                  onClick={(e) => { e.preventDefault(); document.getElementById('domains')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="subnav-tab-btn"
                >
                  <Layers className="w-4 h-4" />
                  <span>2. หมวดของผลงาน (5 สาขา)</span>
                </a>

                <a 
                  href="#prizes"
                  onClick={(e) => { e.preventDefault(); document.getElementById('prizes')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="subnav-tab-btn"
                >
                  <Trophy className="w-4 h-4" />
                  <span>3. รางวัลการประกวด</span>
                </a>

                <a 
                  href="#standards"
                  onClick={(e) => { e.preventDefault(); document.getElementById('standards')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="subnav-tab-btn"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>4. มาตรฐานผลงาน</span>
                </a>

                <a 
                  href="#criteria"
                  onClick={(e) => { e.preventDefault(); document.getElementById('criteria')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="subnav-tab-btn"
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
                    <div className="checklist-list">
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>สถานะผู้สมัคร:</strong> นักเรียนมัธยมศึกษา (ม.1 - ม.6), ปวช. หรือเทียบเท่า</span>
                      </div>
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>ขนาดทีม:</strong> ส่งเดี่ยว หรือทีมไม่เกิน 3 - 5 คน</span>
                      </div>
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>อาจารย์ที่ปรึกษา:</strong> ต้องมีอาจารย์รับรองอย่างน้อย 1 ท่าน</span>
                      </div>
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon" />
                        <span><strong>ลักษณะผลงาน:</strong> เป็นสิ่งประดิษฐ์ โมเดล หรือโครงงานที่คิดค้นขึ้นเอง</span>
                      </div>
                    </div>
                  </div>
                  <div className="bento-tier-row">
                    <span>🏆 รางวัลชนะเลิศระดับนี้:</span>
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
                    <div className="checklist-list">
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>สถานะผู้สมัคร:</strong> นิสิต นักศึกษา (ป.ตรี-โท-เอก), อาจารย์, นักวิจัย, สตาร์ทอัพ และประชาชน</span>
                      </div>
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>ขนาดทีม:</strong> ส่งรายบุคคล หรือทีมสหสาขาวิชาชีพ (ไม่เกิน 3 - 5 คน)</span>
                      </div>
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>สังกัด:</strong> สถาบันอุดมศึกษา หน่วยงานรัฐ เอกชน หรืออิสระ</span>
                      </div>
                      <div className="checklist-item">
                        <CheckCircle className="checklist-icon gold" />
                        <span><strong>ลักษณะผลงาน:</strong> มี Prototype หรือผลการทดสอบจริง พร้อมแผนต่อยอด</span>
                      </div>
                    </div>
                  </div>
                  <div className="bento-tier-row">
                    <span>🏆 รางวัลชนะเลิศระดับนี้:</span>
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
                <div className="general-rules-grid">
                  <div className="general-rule-item">
                    <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem' }}>01</div>
                    <div>
                      <h5>สิทธิ์ในทรัพย์สินทางปัญญา (IP)</h5>
                      <p>ผลงานต้องเป็นลิขสิทธิ์ของผู้สมัครเอง ไม่คัดลอกหรือละเมิดทรัพย์สินทางปัญญา สิทธิบัตร หรือสิทธิของผู้อื่น</p>
                    </div>
                  </div>
                  <div className="general-rule-item">
                    <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem' }}>02</div>
                    <div>
                      <h5>สถานะรางวัลเดิม</h5>
                      <p>ผลงานต้องไม่เคยได้รับรางวัลชนะเลิศระดับชาติหรือนานาชาติที่ติดสัญญาเงื่อนไขผูกพันห้ามเผยแพร่</p>
                    </div>
                  </div>
                  <div className="general-rule-item">
                    <div style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem' }}>03</div>
                    <div>
                      <h5>การเผยแพร่เพื่อการศึกษา</h5>
                      <p>ยินยอมให้ผู้จัดงานเผยแพร่ภาพถ่าย วิดีโอ และบทคัดย่อ เพื่อประโยชน์ทางวิชาการและส่งเสริมนวัตกรรม</p>
                    </div>
                  </div>
                </div>
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
                          <span>สมัครในหมวดนี้</span>
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
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>รางวัลสำหรับระดับตั้งแต่อุดมศึกษาขึ้นไป (ป.ตรี-โท-เอก / อาจารย์ / นักวิจัย / ประชาชน)</span>
                  </h4>
                  <div className="prizes-tier-grid">
                    <div className="prize-card gold-champion">
                      <div className="prize-medal-icon">👑</div>
                      <h5>ชนะเลิศ Grand Prize</h5>
                      <div className="prize-cash-amount">50,000 ฿</div>
                      <span>ถ้วยพระราชทานฯ + โล่ + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon">🥈</div>
                      <h5>รองชนะเลิศอันดับ 1</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>30,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon">🥉</div>
                      <h5>รองชนะเลิศอันดับ 2</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>20,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon">🎖️</div>
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
                      <div className="prize-medal-icon">🥈</div>
                      <h5>รองชนะเลิศอันดับ 1</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>20,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon">🥉</div>
                      <h5>รองชนะเลิศอันดับ 2</h5>
                      <div className="prize-cash-amount" style={{ color: 'var(--cyan-300)' }}>10,000 ฿</div>
                      <span>โล่รางวัล + เกียรติบัตร</span>
                    </div>
                    <div className="prize-card">
                      <div className="prize-medal-icon">🎖️</div>
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
                  <div className="standard-req-list">
                    <div>• สรุปบทคัดย่อ (Abstract) และที่มาของปัญหา</div>
                    <div>• หลักการทำงานและเทคโนโลยีที่ใช้</div>
                    <div>• ผลการทดสอบและประโยชน์เชิงเศรษฐกิจ/สังคม</div>
                  </div>
                </div>

                <div className="standard-card">
                  <div className="standard-num-badge">
                    <span>02</span>
                    <Video className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4>คลิปวิดีโอแนะนำผลงาน (Video Pitch)</h4>
                  <p>ความยาวไม่เกิน 2 - 3 นาที ความละเอียดอย่างน้อย 1080p Full HD อัปโหลดบน YouTube หรือ Drive</p>
                  <div className="standard-req-list">
                    <div>• แนะนำสมาชิกทีมและแรงบันดาลใจ</div>
                    <div>• สาธิตการทำงานจริงของชิ้นงาน/โมเดล</div>
                    <div>• เสียงบรรยายชัดเจน มีภาพประกอบการใช้งาน</div>
                  </div>
                </div>

                <div className="standard-card">
                  <div className="standard-num-badge">
                    <span>03</span>
                    <Box className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4>ชิ้นงานต้นแบบ / ผลการทดสอบ (Prototype)</h4>
                  <p>ต้องมีชิ้นงานตัวอย่าง (Working Prototype) หรือผลวิจัยการทดลองที่สามารถนำมาจัดแสดงวัน Pitching</p>
                  <div className="standard-req-list">
                    <div>• สำหรับสายฮาร์ดแวร์: ชิ้นงานหรือโมเดลจำลอง</div>
                    <div>• สำหรับสายซอฟต์แวร์: Live Demo หรือแอปพลิเคชัน</div>
                    <div>• สำหรับสายวัสดุ/เกษตร: ตัวอย่างชิ้นงานจริง</div>
                  </div>
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
                  <div className="criteria-progress-bg">
                    <div className="criteria-progress-fill" style={{ width: '30%' }} />
                  </div>
                  <p>ความโดดเด่น ความคิดริเริ่มสร้างสรรค์ การแก้ปัญหาด้วยมุมมองใหม่ที่ไม่ซ้ำกับเทคโนโลยีที่มีอยู่เดิมในท้องตลาด</p>
                </div>

                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>ความเป็นไปได้ทางเทคนิคและการใช้งานจริง (Technical Feasibility)</h5>
                    <span className="criteria-score-badge">25 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg">
                    <div className="criteria-progress-fill" style={{ width: '25%' }} />
                  </div>
                  <p>ความถูกต้องตามหลักวิชาการ ประสิทธิภาพการทำงาน ความสมบูรณ์ของชิ้นงานต้นแบบ และความเสถียรในการทำงาน</p>
                </div>

                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>ผลกระทบเชิงเศรษฐกิจ สังคม หรือสิ่งแวดล้อม (Impact & Value)</h5>
                    <span className="criteria-score-badge">25 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg">
                    <div className="criteria-progress-fill" style={{ width: '25%' }} />
                  </div>
                  <p>ศักยภาพในการนำไปต่อยอดเชิงพาณิชย์ การลดต้นทุน การยกระดับคุณภาพชีวิตชุมชน หรือการอนุรักษ์สิ่งแวดล้อม</p>
                </div>

                <div className="criteria-card">
                  <div className="criteria-header">
                    <h5>คุณภาพการนำเสนอและคลิปวิดีโอ (Presentation & Clarity)</h5>
                    <span className="criteria-score-badge">20 คะแนน</span>
                  </div>
                  <div className="criteria-progress-bg">
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
                  <span>ยื่นสมัครผลงานตอนนี้</span>
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
                  <div className="step-number" style={{ background: 'rgba(250, 204, 21, 0.18)', color: 'var(--gold-300)' }}>🏆</div>
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

                <div className="subnav-tabs-container">
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
              
              <div className="filter-bar">
                <div>
                  <div className="badge-tag">
                    <Trophy className="w-4 h-4" />
                    <span>HALL OF FAME & INSPIRATION</span>
                  </div>
                  <h2 style={{ fontSize: '2rem' }}>คลังผลงานที่เคยได้รับรางวัล</h2>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <select 
                    value={selectedDomain} 
                    onChange={e => setSelectedDomain(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">ทุกหมวดหมู่นวัตกรรม</option>
                    <option value="energy_environment">Energy & Environment</option>
                    <option value="food_agriculture">Food & Agriculture</option>
                    <option value="social_economy">Social & Economy</option>
                    <option value="medical_device">Medical Device</option>
                    <option value="material">Material</option>
                  </select>

                  <select 
                    value={selectedLevel} 
                    onChange={e => setSelectedLevel(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">ทุกระดับการศึกษา</option>
                    <option value="below_higher">ต่ำกว่าอุดมศึกษา</option>
                    <option value="higher_and_above">ตั้งแต่อุดมศึกษาขึ้นไป</option>
                  </select>
                </div>
              </div>

              <div className="winner-grid">
                {filteredWinners.map(w => (
                  <div 
                    key={w.id}
                    onClick={() => setSelectedWinnerModal(w)}
                    className="winner-card"
                  >
                    <div className="winner-card-image-wrap">
                      <img 
                        src={WINNER_IMAGES[w.id] || '/winner-robot.jpg'} 
                        alt={w.titleTh} 
                        className="winner-card-image"
                      />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span className="badge-royal" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                          <Trophy className="w-3 h-3 text-amber-300" />
                          <span>Grand Prize Winner</span>
                        </span>
                      </div>
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(11, 21, 40, 0.85)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan-300)' }}>
                        {w.trackingCode}
                      </div>
                    </div>

                    <div className="winner-card-body">
                      <div>
                        <h4>{w.titleTh}</h4>
                        <div className="winner-card-en">{w.titleEn}</div>
                        <p>{w.abstractTh}</p>
                      </div>

                      <div className="winner-card-footer">
                        <span>ทีม: <strong style={{ color: 'var(--text-primary)' }}>{w.teamName}</strong></span>
                        <span className="winner-cta-link">
                          <span>อ่านสตอรี่ผลงาน</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                
                {/* Download Docs */}
                <div>
                  <div className="badge-tag">
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD CENTER</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>เอกสารประกอบการสมัคร</h3>
                  <p style={{ fontSize: '0.88rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    ดาวน์โหลดแบบฟอร์มข้อเสนอโครงการ และเอกสารประกาศเกณฑ์การประกวด
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a href="#" className="bento-tier-row" style={{ textDecoration: 'none', padding: '16px', background: 'rgba(16, 31, 61, 0.85)', border: '1px solid var(--border-medium)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ประกาศเกณฑ์การประกวดฉบับทางการ 2569.pdf</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เอกสาร PDF • 2.4 MB</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-cyan-400" />
                    </a>

                    <a href="#" className="bento-tier-row" style={{ textDecoration: 'none', padding: '16px', background: 'rgba(16, 31, 61, 0.85)', border: '1px solid var(--border-medium)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="w-5 h-5 text-amber-400" />
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>แบบฟอร์มข้อเสนอโครงการ (Proposal Template).docx</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เอกสาร Word • 512 KB</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-amber-400" />
                    </a>
                  </div>
                </div>

                {/* Contact & Location */}
                <div>
                  <div className="badge-tag">
                    <MapPin className="w-4 h-4" />
                    <span>ORGANIZER DIRECTORY</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>สำนักวิจัยวิทยาศาสตร์และเทคโนโลยี</h3>
                  <p style={{ fontSize: '0.88rem', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                    อาคารอุทยานเทคโนโลยี มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (KMUTNB Techno Park)
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <Phone className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>เบอร์โทรศัพท์ติดต่อ:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>02-555-2000 ต่อ 1508, 1509</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>อีเมลสอบถามข้อมูล:</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>innoaward@kmutnb.ac.th</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <Globe className="w-5 h-5 text-cyan-400" />
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
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '28px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', background: '#091222' }}>
        <div className="pro-container">
          <div style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
            โครงการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569 (KMUTNB Innovation Awards 2026)
          </div>
          <div>© 2026 King Mongkut's University of Technology North Bangkok. All Rights Reserved.</div>
        </div>
      </footer>

      {/* --- MODAL 1: ENTERPRISE AUTH & SUBMISSION PORTAL --- */}
      {showPortalModal && (
        <div className="modal-overlay" onClick={() => setShowPortalModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPortalModal(false)}>
              <X className="w-5 h-5" />
            </button>

            {/* In-Modal Checklist Reminder */}
            <div className="modal-checklist-card">
              <strong>📋 กรุณาเตรียมข้อมูลให้พร้อมก่อนสมัคร (Checklist):</strong>
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
                  📝 ยื่นแบบเสนอผลงาน
                </button>
              )}
            </div>

            {/* TAB: REGISTER */}
            {portalTab === 'register' && (
              <form onSubmit={handleAuthRegister}>
                <div className="form-group">
                  <label className="form-label">ชื่อ-นามสกุล ผู้เสนอผลงาน / หัวหน้าทีม *</label>
                  <input 
                    type="text" required
                    className="form-input"
                    placeholder="เช่น นายพิพัทธ์ พัฒนาชัย"
                    value={regForm.fullName}
                    onChange={e => setRegForm({...regForm, fullName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">อีเมล (สำหรับรับผลการคัดเลือก) *</label>
                  <input 
                    type="email" required
                    className="form-input"
                    placeholder="name@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input 
                    type="tel" required
                    className="form-input"
                    placeholder="081-234-5678"
                    value={regForm.phone}
                    onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">สถาบัน / โรงเรียน / บริษัท *</label>
                  <input 
                    type="text" required
                    className="form-input"
                    placeholder="เช่น มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
                    value={regForm.institution}
                    onChange={e => setRegForm({...regForm, institution: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-solid-primary" style={{ width: '100%', marginTop: '12px' }}>
                  <UserPlus className="w-4 h-4" />
                  <span>สร้างบัญชีและดำเนินการต่อ</span>
                </button>
              </form>
            )}

            {/* TAB: LOGIN */}
            {portalTab === 'login' && (
              <form onSubmit={handleAuthLogin}>
                <div className="form-group">
                  <label className="form-label">กรอกอีเมลที่ใช้ลงทะเบียน *</label>
                  <input 
                    type="email" required
                    className="form-input"
                    placeholder="name@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-solid-primary" style={{ width: '100%', marginTop: '12px' }}>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
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
                      <label className="form-label">ชื่อผลงานสิ่งประดิษฐ์/นวัตกรรม (ภาษาไทย) *</label>
                      <input 
                        type="text" required
                        className="form-input"
                        placeholder="เช่น หุ่นยนต์สำรวจภัยพิบัติอัจฉริยะ"
                        value={subForm.titleTh}
                        onChange={e => setSubForm({...subForm, titleTh: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">หมวดหมู่นวัตกรรม *</label>
                        <select 
                          className="form-input"
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
                        <label className="form-label">ระดับการแข่งขัน *</label>
                        <select 
                          className="form-input"
                          value={subForm.educationLevel}
                          onChange={e => setSubForm({...subForm, educationLevel: e.target.value})}
                        >
                          <option value="below_higher">ต่ำกว่าอุดมศึกษา (มัธยม / ปวช.)</option>
                          <option value="higher_and_above">ตั้งแต่อุดมศึกษาขึ้นไป (ป.ตรี-โท-เอก / ประชาชน)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">ชื่อทีม / สถาบัน</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="เช่น KMUTNB Robotics Lab"
                        value={subForm.teamName}
                        onChange={e => setSubForm({...subForm, teamName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">บทคัดย่อ / คำอธิบายผลงานโดยสรุป</label>
                      <textarea 
                        rows={3}
                        className="form-input"
                        placeholder="อธิบายหลักการทำงานและประโยชน์ของผลงาน..."
                        value={subForm.abstractTh}
                        onChange={e => setSubForm({...subForm, abstractTh: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ลิงก์คลิปวิดีโอแนะนำผลงาน ความยาว 2 - 3 นาที (YouTube / Google Drive)</label>
                      <input 
                        type="url"
                        className="form-input"
                        placeholder="https://youtube.com/watch?v=..."
                        value={subForm.videoUrl}
                        onChange={e => setSubForm({...subForm, videoUrl: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button onClick={() => handleSubmission(true)} className="btn-outline-cyan" style={{ flex: 1 }}>
                        <Save className="w-4 h-4" />
                        <span>บันทึกแบบร่าง</span>
                      </button>
                      <button onClick={() => handleSubmission(false)} className="btn-solid-primary" style={{ flex: 1 }}>
                        <Send className="w-4 h-4" />
                        <span>ส่งผลงานฉบับสมบูรณ์</span>
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
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowStatusModal(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search className="w-5 h-5 text-cyan-300" />
              <span>ตรวจสอบสถานะการสมัคร</span>
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
              กรอกรหัสติดตามผลงานเพื่อดูสถานะการพิจารณา (เช่น KMUTNB-2025-8821)
            </p>

            <form onSubmit={handleStatusCheck} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" required
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

            {statusLoading && <div style={{ textAlign: 'center', color: 'var(--cyan-300)', fontSize: '0.88rem', padding: '16px' }}>กำลังค้นหาข้อมูล...</div>}

            {statusError && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#FCA5A5', fontSize: '0.85rem', textAlign: 'center' }}>
                {statusError}
              </div>
            )}

            {statusResult && (
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-cyan)', borderRadius: '12px', padding: '18px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-300)', fontWeight: 700 }}>{statusResult.trackingCode}</span>
                  <span className="badge-category">{statusResult.status}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{statusResult.titleTh}</div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>ทีม: {statusResult.teamName}</div>
                <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--cyan-300)', display: 'block', marginBottom: '4px' }}>ข้อความจากคณะกรรมการ:</strong>
                  <span>{statusResult.feedback}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: WINNER STORYTELLING MODAL --- */}
      {selectedWinnerModal && (
        <div className="modal-overlay" onClick={() => setSelectedWinnerModal(null)}>
          <div className="modal-box" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedWinnerModal(null)}>
              <X className="w-5 h-5" />
            </button>

            <div className="badge-royal" style={{ marginBottom: '14px' }}>
              <Trophy className="w-3.5 h-3.5" />
              <span>GRAND PRIZE WINNER STORY</span>
            </div>

            <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
              <img 
                src={WINNER_IMAGES[selectedWinnerModal.id] || '/winner-robot.jpg'} 
                alt={selectedWinnerModal.titleTh} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{selectedWinnerModal.titleTh}</h2>
            <div style={{ color: 'var(--cyan-300)', fontSize: '0.88rem', fontWeight: 500, marginBottom: '20px' }}>
              {selectedWinnerModal.titleEn}
            </div>

            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--cyan-300)', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen className="w-4 h-4" />
                <span>ที่มาและปัญหาของนวัตกรรม (Problem & Solution)</span>
              </h4>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>
                {selectedWinnerModal.abstractTh}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.84rem', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>ทีมพัฒนา:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedWinnerModal.teamName}</strong>
              </div>
              <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>อาจารย์ที่ปรึกษา:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedWinnerModal.advisorName}</strong>
              </div>
            </div>

            <a 
              href={selectedWinnerModal.videoUrl} 
              target="_blank" 
              rel="noreferrer"
              className="btn-solid-primary"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>รับชมวิดีโอสาธิตการทำงานของผลงาน</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
