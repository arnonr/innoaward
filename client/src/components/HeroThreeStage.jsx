import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DOMAIN_CATALOG } from './domainCatalog.js';
import {
  DOMAIN_ORBIT_COLORS,
  DOMAIN_PHOTO_URLS,
  HOLO_GLASS_VERTEX_SHADER,
  HOLO_GLASS_FRAGMENT_SHADER,
  resolveDomainPhotoUrl,
  getShowreelTimelineState,
  getDomainOrbitPose,
  getStageResponsiveConfig,
  getMotionFactor,
} from './heroThreeStageConfig.js';

const HEX_STRINGS = ['#00F5A0', '#22C55E', '#00D9F5', '#FB7185', '#F59E0B'];

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fillFittedText(
  ctx,
  text,
  x,
  y,
  maxWidth,
  fontWeight,
  baseSizePx,
  fontFamily,
  minSizePx = 13
) {
  const safeText = String(text ?? '');
  let size = baseSizePx;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (size > minSizePx && ctx.measureText(safeText).width > maxWidth) {
    size -= 0.5;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }
  ctx.fillText(safeText, x, y, maxWidth);
}

function truncateTextToWidth(ctx, text, maxWidth) {
  const safeText = String(text ?? '').trim();
  if (ctx.measureText(safeText).width <= maxWidth) {
    return safeText;
  }
  let sliced = safeText;
  while (sliced.length > 1 && ctx.measureText(`${sliced}…`).width > maxWidth) {
    sliced = sliced.slice(0, -1).trimEnd();
  }
  return `${sliced}…`;
}

function createOverviewGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1152;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;

  // Deep translucent holographic glass backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, 'rgba(7, 18, 36, 0.92)');
  bgGrad.addColorStop(0.55, 'rgba(12, 28, 54, 0.86)');
  bgGrad.addColorStop(1, 'rgba(8, 20, 40, 0.94)');
  drawRoundedRect(ctx, 24, 24, W - 48, H - 48, 42);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Subtle internal grid lines (like Pinterest 3D glass UI)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
  ctx.lineWidth = 1.5;
  for (let gx = 140; gx < W - 60; gx += 120) {
    ctx.beginPath();
    ctx.moveTo(gx, 118);
    ctx.lineTo(gx, H - 40);
    ctx.stroke();
  }
  for (let gy = 180; gy < H - 60; gy += 110) {
    ctx.beginPath();
    ctx.moveTo(132, gy);
    ctx.lineTo(W - 40, gy);
    ctx.stroke();
  }

  // Ambient cyan & royal gold glow orbs inside the glass window
  const cyanOrb = ctx.createRadialGradient(580, 460, 20, 580, 460, 520);
  cyanOrb.addColorStop(0, 'rgba(0, 217, 245, 0.22)');
  cyanOrb.addColorStop(0.6, 'rgba(0, 245, 160, 0.08)');
  cyanOrb.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = cyanOrb;
  ctx.fillRect(40, 110, 1200, 860);

  const goldOrb = ctx.createRadialGradient(1540, 500, 20, 1540, 500, 460);
  goldOrb.addColorStop(0, 'rgba(249, 115, 22, 0.24)');
  goldOrb.addColorStop(0.6, 'rgba(251, 191, 36, 0.08)');
  goldOrb.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = goldOrb;
  ctx.fillRect(1050, 110, 960, 860);

  // ============================================================
  // 1. TOP HOLOGRAPHIC BROWSER / COMMAND BAR
  // ============================================================
  ctx.fillStyle = 'rgba(15, 35, 66, 0.88)';
  drawRoundedRect(ctx, 32, 32, W - 64, 84, 28);
  ctx.fill();

  ctx.strokeStyle = 'rgba(103, 232, 249, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Window traffic dots
  const dotColors = ['#FB7185', '#FBBF24', '#34D399'];
  dotColors.forEach((col, idx) => {
    ctx.beginPath();
    ctx.arc(82 + idx * 32, 74, 10, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });

  // URL Address Pill
  drawRoundedRect(ctx, 210, 48, 720, 52, 26);
  ctx.fillStyle = 'rgba(6, 15, 30, 0.78)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '600 22px "JetBrains Mono", "Inter", monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('https://', 242, 82);
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText('technopark.kmutnb.ac.th/innoawards', 345, 82);

  // Top nav items inside glass chrome
  const navItems = ['Overview', '5 Domains', 'Royal Trophy', 'Guidelines'];
  navItems.forEach((label, idx) => {
    const nx = 985 + idx * 170;
    ctx.font = idx === 0 ? '700 22px "Inter", sans-serif' : '500 22px "Inter", sans-serif';
    ctx.fillStyle = idx === 0 ? '#00F5A0' : 'rgba(226, 232, 240, 0.72)';
    ctx.fillText(label, nx, 82);
    if (idx === 0) {
      ctx.fillStyle = '#00F5A0';
      ctx.fillRect(nx, 96, 98, 4);
    }
  });

  // Live Submission Status Pill on top right
  drawRoundedRect(ctx, W - 340, 48, 282, 52, 26);
  const ctaGrad = ctx.createLinearGradient(W - 340, 48, W - 58, 100);
  ctaGrad.addColorStop(0, 'rgba(0, 245, 160, 0.24)');
  ctaGrad.addColorStop(1, 'rgba(0, 217, 245, 0.28)');
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.strokeStyle = '#00F5A0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(W - 306, 74, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#00F5A0';
  ctx.fill();

  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('LIVE // OPEN 2027', W - 284, 81);

  // ============================================================
  // 2. LEFT HOLOGRAPHIC SIDEBAR RAIL (Matching Pinterest UI)
  // ============================================================
  drawRoundedRect(ctx, 40, 136, 76, H - 176, 24);
  ctx.fillStyle = 'rgba(10, 25, 48, 0.78)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  for (let i = 0; i < 6; i += 1) {
    const iy = 186 + i * 94;
    drawRoundedRect(ctx, 54, iy, 48, 48, 14);
    ctx.fillStyle = i === 0 ? 'rgba(0, 217, 245, 0.28)' : 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.strokeStyle = i === 0 ? '#00D9F5' : 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Minimalist vector glyphs inside rail buttons
    ctx.beginPath();
    ctx.arc(78, iy + 24, 9, 0, Math.PI * 2);
    ctx.strokeStyle = i === 0 ? '#00F5A0' : '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // ============================================================
  // 3. HERO KINETIC TYPOGRAPHY BLOCK (LEFT-CENTER)
  // ============================================================
  // Royal Honor Eyebrow Capsule
  drawRoundedRect(ctx, 164, 158, 940, 76, 20);
  ctx.fillStyle = 'rgba(249, 115, 22, 0.14)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  fillFittedText(
    ctx,
    '★ ชิงถ้วยพระราชทาน',
    194,
    192,
    880,
    '700',
    23,
    '"Prompt", "IBM Plex Sans Thai", sans-serif'
  );
  ctx.fillStyle = '#FFFBEB';
  fillFittedText(
    ctx,
    'สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี',
    194,
    220,
    880,
    '600',
    20,
    '"Prompt", "IBM Plex Sans Thai", sans-serif'
  );

  // Giant Stacked Headline: KMUTNB / INNOVATION / AWARDS 2027
  ctx.save();
  ctx.shadowColor = 'rgba(0, 217, 245, 0.35)';
  ctx.shadowBlur = 28;
  ctx.font = '800 94px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText('KMUTNB', 164, 348);

  const innoGrad = ctx.createLinearGradient(164, 370, 980, 490);
  innoGrad.addColorStop(0, '#67E8F9');
  innoGrad.addColorStop(0.55, '#00D9F5');
  innoGrad.addColorStop(1, '#00F5A0');
  ctx.font = '900 132px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = innoGrad;
  ctx.fillText('INNOVATION', 160, 482);

  const awardGrad = ctx.createLinearGradient(164, 510, 920, 620);
  awardGrad.addColorStop(0, '#FDE68A');
  awardGrad.addColorStop(0.5, '#FBBF24');
  awardGrad.addColorStop(1, '#F97316');
  ctx.font = '800 106px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = awardGrad;
  ctx.fillText('AWARDS 2027', 164, 604);
  ctx.restore();

  // Thai Mission Subtitle
  ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
  fillFittedText(
    ctx,
    'เวทีประกวดสิ่งประดิษฐ์และนวัตกรรมระดับประเทศ ประจำปี 2570 ขับเคลื่อนอนาคตด้วยเทคโนโลยี',
    168,
    672,
    1080,
    '500',
    26,
    '"Prompt", "IBM Plex Sans Thai", sans-serif'
  );

  // Interactive Glass Pill Button inside the 3D window
  drawRoundedRect(ctx, 168, 712, 446, 68, 34);
  const pillGrad = ctx.createLinearGradient(168, 712, 614, 780);
  pillGrad.addColorStop(0, 'rgba(0, 245, 160, 0.25)');
  pillGrad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
  ctx.fillStyle = pillGrad;
  ctx.fill();
  ctx.strokeStyle = '#00F5A0';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  fillFittedText(
    ctx,
    'คลิกเพื่อส่งผลงานเข้าประกวด  →',
    208,
    754,
    370,
    '700',
    24,
    '"Prompt", "Inter", sans-serif'
  );

  // ============================================================
  // 4. BOTTOM TELEMETRY CARDS ROW (3 CARDS)
  // ============================================================
  const bottomCards = [
    {
      kicker: 'GRAND HONOR // 01',
      title: 'ถ้วยพระราชทานฯ',
      sub: 'สูงสุดแห่งเกียรติยศระดับประเทศ',
      accent: '#FBBF24',
    },
    {
      kicker: 'TOTAL PRIZE // 02',
      title: '300,000+ THB',
      sub: 'เงินรางวัลรวมและทุนต่อยอดนวัตกรรม',
      accent: '#00F5A0',
    },
    {
      kicker: 'TARGET DOMAINS // 03',
      title: '5 สาขานวัตกรรม',
      sub: 'เปิดรับ 2 ระดับการศึกษาทั่วประเทศ',
      accent: '#38BDF8',
    },
  ];

  bottomCards.forEach((c, idx) => {
    const cx = 164 + idx * 392;
    const cy = 832;
    const cw = 374;
    const ch = 236;
    const padX = 24;
    const innerMaxW = cw - padX * 2 - 8;

    drawRoundedRect(ctx, cx, cy, cw, ch, 22);
    ctx.fillStyle = 'rgba(9, 22, 44, 0.84)';
    ctx.fill();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = c.accent;
    fillFittedText(
      ctx,
      c.kicker,
      cx + padX,
      cy + 46,
      innerMaxW,
      '700',
      17,
      '"JetBrains Mono", monospace'
    );

    ctx.fillStyle = '#FFFFFF';
    fillFittedText(
      ctx,
      c.title,
      cx + padX,
      cy + 110,
      innerMaxW,
      '800',
      35,
      '"Prompt", "Plus Jakarta Sans", sans-serif'
    );

    ctx.fillStyle = 'rgba(203, 213, 225, 0.88)';
    fillFittedText(
      ctx,
      c.sub,
      cx + padX,
      cy + 160,
      innerMaxW,
      '500',
      18.5,
      '"Prompt", sans-serif'
    );

    // Decorative telemetry bar
    drawRoundedRect(ctx, cx + padX, cy + 190, cw - padX * 2, 8, 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();
    drawRoundedRect(ctx, cx + padX, cy + 190, (cw - padX * 2) * 0.72, 8, 4);
    ctx.fillStyle = c.accent;
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createBackTabGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;

  drawRoundedRect(ctx, 16, 16, W - 32, H - 32, 24);
  ctx.fillStyle = 'rgba(8, 20, 40, 0.82)';
  ctx.fill();

  // Top browser tab bar only (no body text to avoid ghosting behind main window)
  drawRoundedRect(ctx, 24, 22, 420, 44, 16);
  ctx.fillStyle = 'rgba(15, 36, 68, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#67E8F9';
  ctx.fillText('KMUTNB // TECHNOPARK ARCHIVE', 48, 50);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createSpotlightSubCardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;

  drawRoundedRect(ctx, 20, 20, W - 40, H - 40, 36);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, 'rgba(16, 34, 64, 0.94)');
  grad.addColorStop(1, 'rgba(8, 19, 38, 0.96)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Concentric orbital rings around Royal Trophy emblem
  ctx.save();
  ctx.translate(W / 2, 340);
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.26)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 240, 120, -0.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 245, 160, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 240, 120, 0.42, 0, Math.PI * 2);
  ctx.stroke();

  // Glowing circle center
  ctx.beginPath();
  ctx.arc(0, 0, 108, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(249, 115, 22, 0.18)';
  ctx.fill();
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Vector Crown / Trophy Icon
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.moveTo(-58, 32);
  ctx.lineTo(-48, -34);
  ctx.lineTo(-18, 4);
  ctx.lineTo(0, -46);
  ctx.lineTo(18, 4);
  ctx.lineTo(48, -34);
  ctx.lineTo(58, 32);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-52, 42, 104, 14);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText('THE ROYAL INNOVATION AWARD', W / 2, 540);

  ctx.font = '700 56px "Prompt", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('เวทีแห่งความคิด', W / 2, 625);
  ctx.fillStyle = '#00F5A0';
  ctx.fillText('ที่เปลี่ยนอนาคต', W / 2, 695);

  // Divider
  ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
  ctx.fillRect(W / 2 - 80, 740, 160, 3);

  // 5 Domain status rows (like right panel in Pinterest 0:01)
  ctx.textAlign = 'left';
  const shorts = [
    '01  Energy, Environment & BCG',
    '02  Food & Smart Agriculture',
    '03  Social & Digital Economy',
    '04  Medical & Health Device',
    '05  Advanced Materials',
  ];
  shorts.forEach((label, idx) => {
    const ry = 790 + idx * 78;
    drawRoundedRect(ctx, 76, ry, W - 152, 62, 16);
    ctx.fillStyle = 'rgba(6, 16, 32, 0.78)';
    ctx.fill();
    ctx.strokeStyle = HEX_STRINGS[idx];
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(114, ry + 31, 8, 0, Math.PI * 2);
    ctx.fillStyle = HEX_STRINGS[idx];
    ctx.fill();

    ctx.font = '600 24px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(label, 142, ry + 39);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createBreakthroughGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1152;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;

  // Semi-transparent cosmic HUD frame
  drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 40);
  ctx.fillStyle = 'rgba(6, 16, 34, 0.76)';
  ctx.fill();

  // Radial network bursts
  const centerGrad = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, 760);
  centerGrad.addColorStop(0, 'rgba(0, 217, 245, 0.28)');
  centerGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.12)');
  centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = centerGrad;
  ctx.fillRect(40, 40, W - 80, H - 80);

  // Constellation lines on the breakthrough card
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.22)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 + Math.cos(angle) * 180, H / 2 + Math.sin(angle) * 110);
    ctx.lineTo(W / 2 + Math.cos(angle) * 860, H / 2 + Math.sin(angle) * 480);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00F5A0';
  ctx.fillText('KMUTNB TECHNOPARK // NATIONAL INNOVATION STAGE', W / 2, 310);

  ctx.font = '800 92px "Prompt", "IBM Plex Sans Thai", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('เวทีแห่งความคิด ที่เปลี่ยนอนาคต', W / 2, 465);

  const subGrad = ctx.createLinearGradient(W / 2 - 600, 520, W / 2 + 600, 640);
  subGrad.addColorStop(0, '#67E8F9');
  subGrad.addColorStop(0.5, '#FDE68A');
  subGrad.addColorStop(1, '#00F5A0');
  ctx.font = '900 84px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = subGrad;
  ctx.fillText('WE BUILD NATIONAL INNOVATION', W / 2, 610);

  ctx.font = '600 32px "Prompt", sans-serif';
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('5 สาขานวัตกรรมเป้าหมาย • ชิงถ้วยพระราชทานฯ และเงินรางวัลรวมกว่า 300,000+ บาท', W / 2, 720);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createDomainHudTexture(domain, index) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1152;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const W = canvas.width;
  const H = canvas.height;
  const accent = HEX_STRINGS[index] || '#00F5A0';

  // Top Holographic Window Header Bar
  drawRoundedRect(ctx, 28, 28, W - 56, 92, 24);
  ctx.fillStyle = 'rgba(7, 18, 36, 0.86)';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.font = '800 28px "JetBrains Mono", monospace';
  ctx.fillStyle = accent;
  ctx.fillText(`DOMAIN // 0${index + 1}`, 72, 84);

  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
  ctx.fillText('KMUTNB INNOVATION AWARDS 2027 // ประจำปี 2570', 340, 84);

  // Right status chip in header
  drawRoundedRect(ctx, W - 446, 44, 386, 60, 30);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  fillFittedText(
    ctx,
    'คลิกการ์ดเพื่อดูเกณฑ์การตัดสิน →',
    W - 418,
    82,
    330,
    '700',
    21,
    '"Prompt", "Inter", sans-serif'
  );

  // Side HUD Analytics Widget (Right side floating glass overlay inside card)
  drawRoundedRect(ctx, W - 490, 160, 430, 430, 24);
  ctx.fillStyle = 'rgba(8, 20, 40, 0.76)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillStyle = accent;
  ctx.fillText('KEY SUB-TOPICS // SCOPE', W - 458, 210);

  const topics = (domain?.subTopics || []).slice(0, 3);
  topics.forEach((topicObj, tIdx) => {
    const ty = 242 + tIdx * 106;
    drawRoundedRect(ctx, W - 462, ty, 374, 84, 14);
    ctx.fillStyle = 'rgba(15, 34, 64, 0.82)';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '600 20px "Prompt", sans-serif';
    ctx.fillStyle = '#F8FAFC';
    const rawTopicTitle =
      typeof topicObj === 'string' ? topicObj : topicObj?.title || '';
    const cleanTopic = rawTopicTitle.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const shortTopic = truncateTextToWidth(ctx, `• ${cleanTopic}`, 328);
    ctx.fillText(shortTopic, W - 440, ty + 50, 328);
  });

  // Bottom Holographic Title Banner (Full-width translucent glass footer)
  const footerGrad = ctx.createLinearGradient(0, H - 390, 0, H - 24);
  footerGrad.addColorStop(0, 'rgba(6, 15, 30, 0.0)');
  footerGrad.addColorStop(0.28, 'rgba(6, 15, 30, 0.86)');
  footerGrad.addColorStop(1, 'rgba(6, 15, 30, 0.96)');
  drawRoundedRect(ctx, 28, H - 380, W - 56, 352, 30);
  ctx.fillStyle = footerGrad;
  ctx.fill();

  // Giant Domain Number Watermark on Left
  ctx.font = '900 138px "JetBrains Mono", monospace';
  ctx.fillStyle = accent;
  ctx.fillText(`0${index + 1}`, 68, H - 150);

  // Domain Title EN + TH
  ctx.fillStyle = '#FFFFFF';
  fillFittedText(
    ctx,
    (domain?.titleEn || '').toUpperCase(),
    280,
    H - 210,
    1680,
    '800',
    54,
    '"Plus Jakarta Sans", "Inter", sans-serif'
  );

  ctx.fillStyle = accent;
  fillFittedText(
    ctx,
    domain?.titleTh || '',
    280,
    H - 142,
    1680,
    '700',
    42,
    '"Prompt", "IBM Plex Sans Thai", sans-serif'
  );

  ctx.font = '500 25px "Prompt", sans-serif';
  ctx.fillStyle = 'rgba(226, 232, 240, 0.92)';
  const desc = domain?.desc || domain?.shortDesc || '';
  const fittedDesc = truncateTextToWidth(ctx, desc, 1680);
  ctx.fillText(fittedDesc, 280, H - 82, 1680);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function HeroThreeStage({
  activeDomainIndex = null,
  onDomainChange,
  onSelectDomain,
  onSelectOverview,
}) {
  const containerRef = useRef(null);
  const activeDomainRef = useRef(activeDomainIndex);
  const onDomainChangeRef = useRef(onDomainChange);
  const onSelectDomainRef = useRef(onSelectDomain);
  const onSelectOverviewRef = useRef(onSelectOverview);

  useEffect(() => {
    activeDomainRef.current = activeDomainIndex;
  }, [activeDomainIndex]);

  useEffect(() => {
    onDomainChangeRef.current = onDomainChange;
  }, [onDomainChange]);

  useEffect(() => {
    onSelectDomainRef.current = onSelectDomain;
  }, [onSelectDomain]);

  useEffect(() => {
    onSelectOverviewRef.current = onSelectOverview;
  }, [onSelectOverview]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    let config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(config.safeWidth, config.safeHeight);
    renderer.setClearColor(0x06101f, 1);
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06101f, 0.032);

    const getResponsiveFov = (aspect) => {
      if (aspect < 0.75) return 68;
      if (aspect < 1.1) return 56;
      return 45;
    };

    const camera = new THREE.PerspectiveCamera(
      getResponsiveFov(config.aspect),
      config.aspect,
      0.1,
      100
    );
    camera.position.set(0, 0.36, 6.2);

    const disposableGeometries = [];
    const disposableMaterials = [];
    const disposableTextures = [];

    const baseUrl = import.meta.env?.BASE_URL || '/';
    const textureLoader = new THREE.TextureLoader();
    const maxAnisotropy = renderer.capabilities?.getMaxAnisotropy?.() || 1;

    const photoTextures = DOMAIN_PHOTO_URLS.map((url) => {
      const tex = textureLoader.load(resolveDomainPhotoUrl(url, baseUrl));
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = maxAnisotropy;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      disposableTextures.push(tex);
      return tex;
    });

    // ============================================================
    // 1. 3D CONSTELLATION NETWORK & DATA FILAMENTS (Background -> Deep Space)
    // ============================================================
    const nodeCount = 130;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodePoints = [];
    for (let i = 0; i < nodeCount; i += 1) {
      const nx = (Math.random() - 0.5) * 26;
      const ny = (Math.random() - 0.5) * 14 + 0.5;
      const nz = 3.5 - Math.random() * 22;
      nodePositions[i * 3] = nx;
      nodePositions[i * 3 + 1] = ny;
      nodePositions[i * 3 + 2] = nz;
      nodePoints.push(new THREE.Vector3(nx, ny, nz));
    }

    const nodesGeo = new THREE.BufferGeometry();
    nodesGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    disposableGeometries.push(nodesGeo);

    const nodesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.14,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposableMaterials.push(nodesMat);
    const nodesCloud = new THREE.Points(nodesGeo, nodesMat);
    scene.add(nodesCloud);

    // Connect nearby constellation nodes with glowing filaments
    const lineSegments = [];
    for (let i = 0; i < nodeCount; i += 1) {
      for (let j = i + 1; j < nodeCount; j += 1) {
        const dist = nodePoints[i].distanceTo(nodePoints[j]);
        if (dist < 4.2 && lineSegments.length < 720) {
          lineSegments.push(
            nodePoints[i].x,
            nodePoints[i].y,
            nodePoints[i].z,
            nodePoints[j].x,
            nodePoints[j].y,
            nodePoints[j].z
          );
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineSegments, 3));
    disposableGeometries.push(lineGeo);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d9f5,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposableMaterials.push(lineMat);
    const networkLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(networkLines);

    // ============================================================
    // 2. DARK REFLECTIVE PEDESTAL STAGE & HOLOGRAM PROJECTOR CORE
    // ============================================================
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Pedestal Rim under Act 1 Main Screen (z = 0, y = -2.1)
    const pedestalGeo = new THREE.PlaneGeometry(9.6, 5.2);
    disposableGeometries.push(pedestalGeo);
    const pedestalMat = new THREE.MeshBasicMaterial({
      color: 0x09192f,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    disposableMaterials.push(pedestalMat);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.rotation.x = -Math.PI / 2;
    pedestalMesh.position.set(0, -2.1, 0);
    stageGroup.add(pedestalMesh);

    const pedestalRimGeo = new THREE.RingGeometry(3.1, 3.22, 64);
    disposableGeometries.push(pedestalRimGeo);
    const pedestalRimMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    disposableMaterials.push(pedestalRimMat);
    const pedestalRim = new THREE.Mesh(pedestalRimGeo, pedestalRimMat);
    pedestalRim.rotation.x = -Math.PI / 2;
    pedestalRim.position.set(0, -2.08, 0);
    stageGroup.add(pedestalRim);

    // Holographic Projector Base & Energy Core in Act 3 Orbital Chamber (z = -10.8)
    const projectorCoreGroup = new THREE.Group();
    projectorCoreGroup.position.set(0, 0, -10.8);
    scene.add(projectorCoreGroup);

    const ringRadii = [
      [1.4, 1.52, 0x00f5a0, 0.65],
      [2.8, 2.92, 0x00d9f5, 0.45],
      [4.4, 4.55, 0xf59e0b, 0.35],
    ];
    const projectorRings = ringRadii.map(([inner, outer, hex, op]) => {
      const rGeo = new THREE.RingGeometry(inner, outer, 72);
      disposableGeometries.push(rGeo);
      const rMat = new THREE.MeshBasicMaterial({
        color: hex,
        transparent: true,
        opacity: op,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      disposableMaterials.push(rMat);
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.position.y = -2.05;
      projectorCoreGroup.add(rMesh);
      return rMesh;
    });

    // Volumetric Upward Hologram Beam Cone
    const coneGeo = new THREE.ConeGeometry(3.6, 4.2, 48, 1, true);
    disposableGeometries.push(coneGeo);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00d9f5,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposableMaterials.push(coneMat);
    const beamCone = new THREE.Mesh(coneGeo, coneMat);
    beamCone.position.y = -0.1;
    beamCone.rotation.x = Math.PI;
    projectorCoreGroup.add(beamCone);

    // Glowing Energy Core Sphere at center of orbit (like 0:14 in Pinterest reference)
    const coreSphereGeo = new THREE.SphereGeometry(0.46, 32, 32);
    disposableGeometries.push(coreSphereGeo);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    disposableMaterials.push(coreSphereMat);
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreSphere.position.y = 0.34;
    projectorCoreGroup.add(coreSphere);

    const coreOrbitGeo = new THREE.RingGeometry(0.78, 0.84, 64);
    disposableGeometries.push(coreOrbitGeo);
    const coreOrbitMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposableMaterials.push(coreOrbitMat);
    const coreOrbitRing1 = new THREE.Mesh(coreOrbitGeo, coreOrbitMat);
    coreOrbitRing1.position.y = 0.34;
    projectorCoreGroup.add(coreOrbitRing1);

    const coreOrbitRing2 = new THREE.Mesh(coreOrbitGeo, coreOrbitMat);
    coreOrbitRing2.position.y = 0.34;
    coreOrbitRing2.rotation.x = Math.PI / 3;
    projectorCoreGroup.add(coreOrbitRing2);

    // ============================================================
    // 3. ACT 1: MAIN HOLOGRAPHIC GLASS STAGE (z = 0)
    // ============================================================
    const overviewGroup = new THREE.Group();
    overviewGroup.position.set(0, 0.54, 0);
    scene.add(overviewGroup);

    const overviewTex = createOverviewGlassTexture();
    disposableTextures.push(overviewTex);
    const backTabTex = createBackTabGlassTexture();
    disposableTextures.push(backTabTex);

    const mainGlassGeo = new THREE.PlaneGeometry(5.6, 3.15);
    disposableGeometries.push(mainGlassGeo);

    // Back stacked glass tab (gives multi-layered browser depth like 0:01 in Pinterest video)
    const backTabUniforms = {
      uPanelTex: { value: backTabTex },
      uPhotoTex: { value: photoTextures[0] },
      uHasPhoto: { value: 0.0 },
      uDomainId: { value: 0.0 },
      uAccentColor: { value: new THREE.Color(0x38bdf8) },
      uTime: { value: 0 },
      uElectricIntensity: { value: 0.45 },
      uPortalOpen: { value: 0 },
      uOpacity: { value: 0.42 },
      uHover: { value: 0 },
    };
    const backTabMat = new THREE.ShaderMaterial({
      uniforms: backTabUniforms,
      vertexShader: HOLO_GLASS_VERTEX_SHADER,
      fragmentShader: HOLO_GLASS_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    disposableMaterials.push(backTabMat);
    const backTabMesh = new THREE.Mesh(mainGlassGeo, backTabMat);
    backTabMesh.position.set(-0.22, 0.18, -0.26);
    backTabMesh.renderOrder = 30;
    overviewGroup.add(backTabMesh);

    // Front Main Holographic Screen (KMUTNB INNOVATION AWARDS 2026)
    const mainGlassUniforms = {
      uPanelTex: { value: overviewTex },
      uPhotoTex: { value: photoTextures[0] },
      uHasPhoto: { value: 0.0 },
      uDomainId: { value: 0.0 },
      uAccentColor: { value: new THREE.Color(0x00d9f5) },
      uTime: { value: 0 },
      uElectricIntensity: { value: 1.0 },
      uPortalOpen: { value: 0 },
      uOpacity: { value: 1.0 },
      uHover: { value: 0 },
    };
    const mainGlassMat = new THREE.ShaderMaterial({
      uniforms: mainGlassUniforms,
      vertexShader: HOLO_GLASS_VERTEX_SHADER,
      fragmentShader: HOLO_GLASS_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    disposableMaterials.push(mainGlassMat);
    const mainGlassMesh = new THREE.Mesh(mainGlassGeo, mainGlassMat);
    mainGlassMesh.renderOrder = 31;
    mainGlassMesh.userData = { type: 'overview' };
    overviewGroup.add(mainGlassMesh);

    // Floating Right 3D Sub-Card (THE ROYAL INNOVATION AWARD) at z = +0.22
    const spotlightTex = createSpotlightSubCardTexture();
    disposableTextures.push(spotlightTex);
    const spotlightGeo = new THREE.PlaneGeometry(1.56, 1.95);
    disposableGeometries.push(spotlightGeo);
    const spotlightUniforms = {
      uPanelTex: { value: spotlightTex },
      uPhotoTex: { value: photoTextures[0] },
      uHasPhoto: { value: 0.0 },
      uDomainId: { value: 0.0 },
      uAccentColor: { value: new THREE.Color(0xfbbf24) },
      uTime: { value: 0 },
      uElectricIntensity: { value: 0.9 },
      uPortalOpen: { value: 0 },
      uOpacity: { value: 0.98 },
      uHover: { value: 0 },
    };
    const spotlightMat = new THREE.ShaderMaterial({
      uniforms: spotlightUniforms,
      vertexShader: HOLO_GLASS_VERTEX_SHADER,
      fragmentShader: HOLO_GLASS_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    disposableMaterials.push(spotlightMat);
    const spotlightMesh = new THREE.Mesh(spotlightGeo, spotlightMat);
    spotlightMesh.position.set(1.74, -0.1, 0.24);
    spotlightMesh.rotation.y = -0.12;
    spotlightMesh.renderOrder = 32;
    spotlightMesh.userData = { type: 'overview' };
    overviewGroup.add(spotlightMesh);

    // ============================================================
    // 4. ACT 2: BREAKTHROUGH KINETIC TYPOGRAPHY HOLOGRAM (z = -4.2)
    // ============================================================
    const breakthroughTex = createBreakthroughGlassTexture();
    disposableTextures.push(breakthroughTex);
    const breakthroughGeo = new THREE.PlaneGeometry(5.2, 2.92);
    disposableGeometries.push(breakthroughGeo);
    const breakthroughUniforms = {
      uPanelTex: { value: breakthroughTex },
      uPhotoTex: { value: photoTextures[0] },
      uHasPhoto: { value: 0.0 },
      uDomainId: { value: 0.0 },
      uAccentColor: { value: new THREE.Color(0x00f5a0) },
      uTime: { value: 0 },
      uElectricIntensity: { value: 1.0 },
      uPortalOpen: { value: 0 },
      uOpacity: { value: 0.95 },
      uHover: { value: 0 },
    };
    const breakthroughMat = new THREE.ShaderMaterial({
      uniforms: breakthroughUniforms,
      vertexShader: HOLO_GLASS_VERTEX_SHADER,
      fragmentShader: HOLO_GLASS_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    disposableMaterials.push(breakthroughMat);
    const breakthroughMesh = new THREE.Mesh(breakthroughGeo, breakthroughMat);
    breakthroughMesh.position.set(0, 0.54, -4.2);
    breakthroughMesh.renderOrder = 20;
    scene.add(breakthroughMesh);

    // ============================================================
    // 5. ACT 3: 5 ORBITING DOMAIN HOLOGRAPHIC GLASS PANELS (Around z = -10.8)
    // ============================================================
    const domainCardGeo = new THREE.PlaneGeometry(4.4, 2.48);
    disposableGeometries.push(domainCardGeo);

    const domainMeshes = DOMAIN_CATALOG.map((domain, idx) => {
      const hudTex = createDomainHudTexture(domain, idx);
      disposableTextures.push(hudTex);

      const uniforms = {
        uPanelTex: { value: hudTex },
        uPhotoTex: { value: photoTextures[idx] },
        uHasPhoto: { value: 1.0 },
        uDomainId: { value: idx },
        uAccentColor: { value: new THREE.Color(DOMAIN_ORBIT_COLORS[idx]) },
        uTime: { value: idx * 1.3 },
        uElectricIntensity: { value: 0.85 },
        uPortalOpen: { value: 0.0 },
        uOpacity: { value: 0.95 },
        uHover: { value: 0.0 },
      };

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: HOLO_GLASS_VERTEX_SHADER,
        fragmentShader: HOLO_GLASS_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposableMaterials.push(mat);

      const mesh = new THREE.Mesh(domainCardGeo, mat);
      mesh.userData = { type: 'domain', domainIndex: idx };
      scene.add(mesh);
      return { mesh, uniforms, index: idx };
    });

    // ============================================================
    // 6. INTERACTIVE POINTER, RAYCASTING & ANIMATION LOOP
    // ============================================================
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);
    const smoothedPointer = new THREE.Vector2(0, 0);
    let hoveredMeshType = null;
    let hoveredCardIdx = -1;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReducedMotion = Boolean(motionQuery?.matches);
    const handleMotionChange = (event) => {
      prefersReducedMotion = Boolean(event.matches);
    };
    motionQuery?.addEventListener?.('change', handleMotionChange);

    const interactiveMeshes = [
      mainGlassMesh,
      spotlightMesh,
      ...domainMeshes.map((d) => d.mesh),
    ];

    const updatePointerFromEvent = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      pointerNdc.x = ((event.clientX - rect.left) / width) * 2 - 1;
      pointerNdc.y = -(((event.clientY - rect.top) / height) * 2 - 1);
    };

    const handlePointerMove = (event) => {
      updatePointerFromEvent(event);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const hitUserData = hits[0].object.userData;
        hoveredMeshType = hitUserData.type;
        hoveredCardIdx = hitUserData.type === 'domain' ? hitUserData.domainIndex : -1;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredMeshType = null;
        hoveredCardIdx = -1;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleClick = (event) => {
      updatePointerFromEvent(event);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length === 0) return;

      const hitUserData = hits[0].object.userData;
      if (hitUserData.type === 'domain' && typeof hitUserData.domainIndex === 'number') {
        onSelectDomainRef.current?.(hitUserData.domainIndex);
      } else if (hitUserData.type === 'overview') {
        onSelectOverviewRef.current?.();
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('click', handleClick);

    const getPortraitOffsets = (aspect) => {
      const factor = aspect < 1.0 ? 1.0 - Math.max(0.35, aspect) : 0.0;
      return {
        pullbackZ: factor * 6.8,
        liftLookY: -factor * 6.2,
        liftPosY: factor * 1.1,
      };
    };

    const initPortrait = getPortraitOffsets(config.aspect);
    const currentCamPos = new THREE.Vector3(0, 0.24 + initPortrait.liftPosY, 7.35 + initPortrait.pullbackZ);
    const currentLookAt = new THREE.Vector3(0, -0.16 + initPortrait.liftLookY, 0);
    let currentOrbitAngle = 0;
    let lastReportedIndex = -99;

    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const { speedFactor, parallaxFactor, breathFactor } = getMotionFactor(prefersReducedMotion);

      const timeline = getShowreelTimelineState(elapsed * speedFactor, activeDomainRef.current);

      if (timeline.activeCardIndex !== lastReportedIndex) {
        lastReportedIndex = timeline.activeCardIndex;
        onDomainChangeRef.current?.(timeline.activeCardIndex);
      }

      smoothedPointer.x += (pointerNdc.x * parallaxFactor - smoothedPointer.x) * 0.08;
      smoothedPointer.y += (pointerNdc.y * parallaxFactor - smoothedPointer.y) * 0.08;

      // Portrait / mobile camera framing adjustment so 16:9 3D glass panels fit horizontally
      // and sit cleanly in the upper viewport space above the mobile Control Dock
      const { pullbackZ: portraitPullbackZ, liftLookY: portraitLiftLookY, liftPosY: portraitLiftPosY } =
        getPortraitOffsets(config.aspect);

      // Smoothly interpolate camera position and lookAt target
      const targetPosX = timeline.cameraTargetPos.x + smoothedPointer.x * 0.42;
      const targetPosY = timeline.cameraTargetPos.y + portraitLiftPosY + smoothedPointer.y * 0.24;
      const targetPosZ = timeline.cameraTargetPos.z + portraitPullbackZ;

      currentCamPos.x += (targetPosX - currentCamPos.x) * 0.088;
      currentCamPos.y += (targetPosY - currentCamPos.y) * 0.088;
      currentCamPos.z += (targetPosZ - currentCamPos.z) * 0.088;

      currentLookAt.x += (timeline.cameraLookAt.x + smoothedPointer.x * 0.18 - currentLookAt.x) * 0.105;
      currentLookAt.y += (timeline.cameraLookAt.y + portraitLiftLookY + smoothedPointer.y * 0.12 - currentLookAt.y) * 0.105;
      currentLookAt.z += (timeline.cameraLookAt.z - currentLookAt.z) * 0.105;

      camera.position.copy(currentCamPos);
      camera.lookAt(currentLookAt);

      // Update Act 1 Overview Glass Group (tilted 3D perspective + electric lightning frame)
      const overviewTiltY = -0.14 + smoothedPointer.x * 0.12 + Math.sin(elapsed * 0.7) * 0.04 * breathFactor;
      const overviewTiltX = smoothedPointer.y * -0.07 + Math.cos(elapsed * 0.55) * 0.025 * breathFactor;
      overviewGroup.rotation.y = overviewTiltY;
      overviewGroup.rotation.x = overviewTiltX;

      const portalVal = timeline.portalOpen;
      mainGlassUniforms.uTime.value = elapsed;
      mainGlassUniforms.uPortalOpen.value = portalVal;
      mainGlassUniforms.uElectricIntensity.value = timeline.electricIntensity;
      mainGlassUniforms.uHover.value = hoveredMeshType === 'overview' ? 1.0 : 0.0;

      backTabUniforms.uTime.value = elapsed * 0.9;
      backTabUniforms.uPortalOpen.value = portalVal;

      spotlightUniforms.uTime.value = elapsed * 1.1;
      spotlightUniforms.uPortalOpen.value = 0;
      spotlightUniforms.uOpacity.value = Math.max(0, 0.98 * (1 - portalVal * 1.6));
      spotlightMesh.position.x = 1.74 + portalVal * 1.8;
      spotlightMesh.position.y = -0.1 + Math.sin(elapsed * 1.4) * 0.05 * breathFactor;

      // Update Act 2 Breakthrough Kinetic Hologram
      const camDistToBreakthrough = currentCamPos.z - breakthroughMesh.position.z;
      const fallbackBtPortal =
        timeline.act === 'orbit' || camDistToBreakthrough < 2.2
          ? Math.min(1, Math.max(0, (2.6 - camDistToBreakthrough) / 1.1))
          : 0;
      const breakthroughPortal =
        typeof timeline.breakthroughPortal === 'number'
          ? timeline.breakthroughPortal
          : fallbackBtPortal;

      const breakthroughVisibility =
        timeline.act === 'overview' && portalVal < 0.05
          ? 0.0
          : Math.min(1, portalVal * 1.4) * (1 - breakthroughPortal * 0.92);
      breakthroughUniforms.uTime.value = elapsed;
      breakthroughUniforms.uPortalOpen.value = breakthroughPortal;
      breakthroughUniforms.uOpacity.value = breakthroughVisibility;
      breakthroughMesh.visible = breakthroughVisibility > 0.01;
      breakthroughMesh.rotation.y = smoothedPointer.x * 0.08;

      // Hide Act 1 Overview group once camera has flown past z = 0
      const overviewVisibility = currentCamPos.z > 0.2 ? 1.0 : 0.0;
      overviewGroup.visible = overviewVisibility > 0.01;

      // Update Act 3 Orbiting 5 Domain Holographic Glass Cards
      // Shortest-angle interpolation for smooth, punchy orbital rotation
      const angleDiff = Math.atan2(
        Math.sin(timeline.orbitAngle - currentOrbitAngle),
        Math.cos(timeline.orbitAngle - currentOrbitAngle)
      );
      currentOrbitAngle += angleDiff * 0.14;

      const orbitStageVisibility =
        timeline.act === 'orbit'
          ? 1.0
          : Math.min(1, Math.max(0, (breakthroughPortal - 0.05) / 0.65));
      projectorCoreGroup.visible = orbitStageVisibility > 0.02;

      domainMeshes.forEach(({ mesh, uniforms, index }) => {
        const pose = getDomainOrbitPose(index, currentOrbitAngle);
        mesh.position.set(pose.x, pose.y, pose.z);
        mesh.rotation.y = pose.rotY + smoothedPointer.x * 0.08 * pose.frontness;
        mesh.rotation.x = smoothedPointer.y * -0.05 * pose.frontness;
        mesh.renderOrder = Math.round(pose.frontness * 10);
        mesh.visible = orbitStageVisibility > 0.02;

        const isCardHovered = hoveredCardIdx === index ? 1.0 : 0.0;
        const scale = 0.82 + pose.frontness * 0.22 + isCardHovered * 0.04;
        mesh.scale.setScalar(scale);

        uniforms.uTime.value = elapsed + index * 1.3;
        uniforms.uElectricIntensity.value = 0.55 + pose.frontness * 0.65;
        uniforms.uOpacity.value = (0.48 + pose.frontness * 0.52) * orbitStageVisibility;
        uniforms.uHover.value = isCardHovered;
      });

      // Animate Holographic Projector Core & Neural Constellation
      projectorRings.forEach((ring, idx) => {
        ring.rotation.z = elapsed * (idx % 2 === 0 ? 0.35 : -0.28);
      });
      coreOrbitRing1.rotation.y = elapsed * 1.1;
      coreOrbitRing1.rotation.x = elapsed * 0.7;
      coreOrbitRing2.rotation.y = -elapsed * 0.9;
      coreSphere.scale.setScalar(0.92 + Math.sin(elapsed * 3.2) * 0.1);

      nodesCloud.rotation.y = Math.sin(elapsed * 0.12) * 0.04;
      networkLines.rotation.y = nodesCloud.rotation.y;

      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        config = getStageResponsiveConfig(container.clientWidth, container.clientHeight);
        renderer.setSize(config.safeWidth, config.safeHeight);
        camera.aspect = config.aspect;
        camera.fov = getResponsiveFov(config.aspect);
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(container);
    }

    let intersectionObserver;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          renderer.setAnimationLoop(entry.isIntersecting ? animate : null);
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);
    }

    return () => {
      renderer.setAnimationLoop(null);
      timer.dispose();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      motionQuery?.removeEventListener?.('change', handleMotionChange);

      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-three-canvas-wrap hero-three-interactive" />;
}
