# 🏆 KMUTNB Innovation Awards 2026

Web Platform for **โครงการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2569** (KMUTNB Innovation Awards 2026) ชิงถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี

---

## 🌟 Features & Multi-View Architecture

- 🏠 **หน้าแรก (Home):** Hero Showcase, Real-time Countdown, 3-Pillar Overview, 5 Innovation Domains Showcase, Checklist ก่อนสมัคร, Teaser ข่าวสาร
- 📋 **รายละเอียดการแข่งขัน (Guidelines — `#/guidelines`):** Sticky Navigation Tabs ครอบคลุมคุณสมบัติ 2 ระดับ, 5 สาขานวัตกรรม, รางวัลการประกวด, มาตรฐานผลงาน และหลักเกณฑ์การตัดสิน 100 คะแนน
- 📅 **กำหนดการ (Schedule — `#/schedule`):** Active Stage Indicator, 4 Milestones Roadmap, และข้อมูลสถานที่จัดงาน Pitching ณ อาคารอุทยานเทคโนโลยี มจพ. (Techno Park)
- 📢 **ประกาศผล (Announcements — `#/announcements`):** ค้นหารายชื่อทีมผู้ผ่านการคัดเลือก (Finalists), ประกาศผลรางวัลชนะเลิศ (Winners), ดาวน์โหลดเอกสารคำสั่งทางการ (PDF)
- 🏆 **คลังผลงาน (Hall of Fame — `#/halloffame`):** คลังผลงานสิ่งประดิษฐ์ที่เคยได้รับรางวัลชนะเลิศ พร้อมตัวกรองตามสาขาและระดับการศึกษา
- 📞 **ติดต่อ (Contact & Downloads — `#/contact`):** ศูนย์ดาวน์โหลดเอกสาร และข้อมูลช่องทางการติดต่อผู้จัดงาน
- 🔍 **ระบบตรวจสอบสถานะส่วนบุคคล (Tracking Status):** ค้นหาสถานะการพิจารณาผลงานและข้อเสนอแนะจากกรรมการด้วย Tracking Code
- 🚀 **ระบบยื่นข้อเสนอโครงการ (Submission Portal):** รองรับการลงทะเบียน, เข้าสู่ระบบ, บันทึกแบบร่าง (Draft) และส่งผลงานฉบับสมบูรณ์

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Lucide Icons, Canvas Confetti, Custom Luminous Sapphire CSS Design System
- **Backend API:** Bun, Elysia.js, TypeScript, REST API with CORS support

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd innoaward
```

### 2. Run Backend Server

```bash
cd server
bun install
bun run index.ts
# Server runs at http://localhost:3001
```

### 3. Run Frontend Client

```bash
cd client
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 📄 License & Copyright

© 2026 อุทยานเทคโนโลยี มจพ. All Rights Reserved.
