import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOMAIN_IDS,
  DOMAIN_ORBIT_COLORS,
  DOMAIN_PHOTO_URLS,
  DOMAIN_CYCLE_SECONDS,
  LIVING_PHOTO_FRAGMENT_SHADER,
  DOMAIN_CARD_FRAGMENT_SHADER,
  resolveDomainIndexById,
  resolveDomainPhotoUrl,
  getCoverUvScale,
  resolveTargetDomainIndex,
  advanceTransitionState,
  getStageResponsiveConfig,
  getMotionFactor,
  SHOWREEL_CYCLE_SECONDS,
  HOLO_GLASS_FRAGMENT_SHADER,
  getShowreelTimelineState,
  getDomainOrbitPose,
  getHeroTitleCharState,
} from './heroThreeStageConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const HERO_STAGE_JSX_PATH = path.resolve(__dirname, './HeroThreeStage.jsx');

test('DOMAIN_IDS, DOMAIN_ORBIT_COLORS, and DOMAIN_PHOTO_URLS define the 5 2570 domains and existing artwork files', () => {
  assert.deepEqual(DOMAIN_IDS, [
    'agri_food',
    'health_medtech',
    'engineering_ai',
    'energy_env_material_bcg',
    'quality_of_life_soft_power',
  ]);
  assert.deepEqual(DOMAIN_ORBIT_COLORS, [0x22C55E, 0xFB7185, 0x00D9F5, 0x00F5A0, 0xF59E0B]);
  assert.deepEqual(DOMAIN_PHOTO_URLS, [
    '/domain-food.jpg',
    '/domain-medical.jpg',
    '/domain-engineering.jpg',
    '/domain-energy.jpg',
    '/domain-softpower.jpg',
  ]);
  assert.equal(DOMAIN_CYCLE_SECONDS, 14);

  for (const relPhoto of DOMAIN_PHOTO_URLS) {
    const absPhoto = path.join(PUBLIC_DIR, relPhoto.replace(/^\/+/, ''));
    assert.equal(fs.existsSync(absPhoto), true, `Missing domain photo: ${absPhoto}`);
    assert.equal(fs.statSync(absPhoto).size > 0, true, `Empty domain photo: ${absPhoto}`);
  }
});

test('resolveDomainPhotoUrl prefixes Vite BASE_URL without double slashes', () => {
  assert.equal(resolveDomainPhotoUrl('/domain-engineering.jpg', '/innoawards/'), '/innoawards/domain-engineering.jpg');
  assert.equal(resolveDomainPhotoUrl('/domain-engineering.jpg', '/innoawards'), '/innoawards/domain-engineering.jpg');
  assert.equal(resolveDomainPhotoUrl('/domain-engineering.jpg', '/'), '/domain-engineering.jpg');
  assert.equal(resolveDomainPhotoUrl('domain-softpower.jpg', '/innoawards/'), '/innoawards/domain-softpower.jpg');
});

test('LIVING_PHOTO_FRAGMENT_SHADER orders the 5 2570 domain effects (0..4) and clamps every pow() base', () => {
  assert.equal(typeof LIVING_PHOTO_FRAGMENT_SHADER, 'string');
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('float sq(float v)'), true);
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('vec3 sampleSharpTexture('), true);
  // Must not use pow(..., 2.0) on signed differences like (uv.y - scanY), (uv.x - ecgSweepX), or (vUv.x - uMix)
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes(', 2.0)'), false);
  // Must not tear pixels by using raw texture luminance as a UV offset
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('0.35 + depth * 0.95'), false);
  // Must include left-side editorial scrim so hero text is easy to read
  assert.equal(LIVING_PHOTO_FRAGMENT_SHADER.includes('leftScrim'), true);

  // Verify the 5 shader branches follow the 2570 order:
  // 0: agri/leaf scan -> 1: medical ECG sweep -> 2: engineering cyan AI packets -> 3: energy/BCG grid pulse -> 4: soft power shimmer
  const idxScan = LIVING_PHOTO_FRAGMENT_SHADER.indexOf('scanBeam');
  const idxEcg = LIVING_PHOTO_FRAGMENT_SHADER.indexOf('ecgWave');
  const idxPackets = LIVING_PHOTO_FRAGMENT_SHADER.indexOf('packetA');
  const idxGrid = LIVING_PHOTO_FRAGMENT_SHADER.indexOf('gridPulse1');
  const idxSoftPower = LIVING_PHOTO_FRAGMENT_SHADER.indexOf('goldStream1');
  assert.equal(idxScan > 0, true);
  assert.equal(idxEcg > idxScan, true);
  assert.equal(idxPackets > idxEcg, true);
  assert.equal(idxGrid > idxPackets, true);
  assert.equal(idxSoftPower > idxGrid, true);

  // Every remaining pow( must clamp its base with max(0.0,
  const powMatches = LIVING_PHOTO_FRAGMENT_SHADER.match(/pow\([^,]+/g) || [];
  assert.equal(powMatches.length > 0, true);
  powMatches.forEach((snippet) => {
    assert.equal(snippet.startsWith('pow(max(0.0'), true, `Unclamped pow base: ${snippet}`);
  });
});

test('getCoverUvScale preserves aspect ratio without stretching and handles zero/negative dimensions', () => {
  const zero = getCoverUvScale(0, -20);
  assert.equal(Number.isFinite(zero.scaleX) && zero.scaleX > 0 && zero.scaleX <= 1, true);
  assert.equal(Number.isFinite(zero.scaleY) && zero.scaleY > 0 && zero.scaleY <= 1, true);

  // Wide container (wider than 16:9) crops vertically (scaleY < 1, scaleX === 1)
  const wide = getCoverUvScale(1920, 600, 16 / 9);
  assert.equal(wide.scaleX, 1);
  assert.equal(wide.scaleY < 1, true);

  // Tall mobile container (narrower than 16:9) crops horizontally (scaleX < 1, scaleY === 1)
  const tall = getCoverUvScale(390, 720, 16 / 9);
  assert.equal(tall.scaleX < 1, true);
  assert.equal(tall.scaleY, 1);
});

test('resolveTargetDomainIndex auto-cycles every 14s when unhovered or out of range and locks when hovered (0..4)', () => {
  assert.deepEqual(resolveTargetDomainIndex(0.5, null), { mode: 'auto', domainIndex: 0 });
  assert.deepEqual(resolveTargetDomainIndex(14.1, null), { mode: 'auto', domainIndex: 1 });
  assert.deepEqual(resolveTargetDomainIndex(29.0, 5), { mode: 'auto', domainIndex: 2 });
  assert.deepEqual(resolveTargetDomainIndex(-2.0, undefined), { mode: 'auto', domainIndex: 4 });
  assert.deepEqual(resolveTargetDomainIndex(Number.NaN, null), { mode: 'auto', domainIndex: 0 });

  assert.deepEqual(resolveTargetDomainIndex(1.2, 3), { mode: 'hover', domainIndex: 3 });
});

test('advanceTransitionState keeps hovered domain when mouse leaves and continues auto-cycling forward from there', () => {
  const state = {
    currentIndex: 0,
    nextIndex: 0,
    mixProgress: 0,
    transitioning: false,
    cycleTimer: 0,
  };

  advanceTransitionState(state, 2, 0.25, 2.0);
  assert.equal(state.transitioning, true);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.nextIndex, 2);
  assert.equal(state.mixProgress, 0.5);

  advanceTransitionState(state, null, 0.25, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 2);
  assert.equal(state.nextIndex, 2);
  assert.equal(state.mixProgress, 0);

  advanceTransitionState(state, null, 13.9, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 2);
  assert.equal(state.nextIndex, 2);

  advanceTransitionState(state, null, 0.2, 2.0);
  assert.equal(state.transitioning, true);
  assert.equal(state.currentIndex, 2);
  assert.equal(state.nextIndex, 3);

  advanceTransitionState(state, null, 1.0, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 3);
  assert.equal(state.nextIndex, 3);

  advanceTransitionState(state, 4, 0.1, 2.0);
  advanceTransitionState(state, 3, 0.1, 2.0);
  assert.equal(state.transitioning, false);
  assert.equal(state.currentIndex, 3);
  assert.equal(state.nextIndex, 3);
  assert.equal(state.mixProgress, 0);
});

test('getStageResponsiveConfig and getMotionFactor handle mobile/desktop and reduced motion', () => {
  const mobile = getStageResponsiveConfig(390, 700);
  const desktop = getStageResponsiveConfig(1440, 760);
  assert.equal(mobile.parallaxStrength < desktop.parallaxStrength, true);
  assert.equal(mobile.uvScaleX < 1, true);

  assert.deepEqual(getMotionFactor(true), {
    speedFactor: 0,
    parallaxFactor: 0,
    breathFactor: 0,
  });
  assert.deepEqual(getMotionFactor(false), {
    speedFactor: 1,
    parallaxFactor: 1,
    breathFactor: 1,
  });
});

test('resolveDomainIndexById maps 2570 domain IDs, legacy 2569 IDs, and numeric indices to 0..4 safely', () => {
  assert.equal(resolveDomainIndexById('agri_food'), 0);
  assert.equal(resolveDomainIndexById('health_medtech'), 1);
  assert.equal(resolveDomainIndexById('engineering_ai'), 2);
  assert.equal(resolveDomainIndexById('energy_env_material_bcg'), 3);
  assert.equal(resolveDomainIndexById('quality_of_life_soft_power'), 4);

  // Legacy 2569 category fallbacks map to matching 2570 living-photo shader slot
  assert.equal(resolveDomainIndexById('food_agriculture'), 0);
  assert.equal(resolveDomainIndexById('medical_device'), 1);
  assert.equal(resolveDomainIndexById('social_economy'), 2);
  assert.equal(resolveDomainIndexById('energy_environment'), 3);
  assert.equal(resolveDomainIndexById('material'), 3);

  assert.equal(resolveDomainIndexById(3), 3);
  assert.equal(resolveDomainIndexById('unknown_domain'), 0);
  assert.equal(resolveDomainIndexById(null), 0);
});

test('DOMAIN_CARD_FRAGMENT_SHADER includes sampleSharpTexture, applyLivingPhotoEffect, and hover zoom without leftScrim darkening', () => {
  assert.equal(typeof DOMAIN_CARD_FRAGMENT_SHADER, 'string');
  assert.equal(DOMAIN_CARD_FRAGMENT_SHADER.includes('vec3 sampleSharpTexture('), true);
  assert.equal(DOMAIN_CARD_FRAGMENT_SHADER.includes('vec3 applyLivingPhotoEffect('), true);
  assert.equal(DOMAIN_CARD_FRAGMENT_SHADER.includes('uniform float uHover;'), true);
  assert.equal(DOMAIN_CARD_FRAGMENT_SHADER.includes('leftScrim'), false);
  const powMatches = DOMAIN_CARD_FRAGMENT_SHADER.match(/pow\([^,]+/g) || [];
  assert.equal(powMatches.length > 0, true);
  powMatches.forEach((snippet) => {
    assert.equal(snippet.startsWith('pow(max(0.0'), true, `Unclamped pow base: ${snippet}`);
  });
});

test('getShowreelTimelineState sequences overview -> breakthrough -> orbit across SHOWREEL_CYCLE_SECONDS and supports interactive overrides', () => {
  assert.equal(SHOWREEL_CYCLE_SECONDS, 32);

  const act1 = getShowreelTimelineState(3.0, null);
  assert.equal(act1.act, 'overview');
  assert.equal(act1.activeCardIndex, -1);
  assert.equal(act1.portalOpen, 0);
  assert.equal(act1.cameraTargetPos.z > 4, true);

  const act2 = getShowreelTimelineState(8.2, null);
  assert.equal(act2.act, 'breakthrough');
  assert.equal(act2.activeCardIndex, -1);
  assert.equal(act2.portalOpen > 0.2, true);
  assert.equal(act2.cameraTargetPos.z < act1.cameraTargetPos.z, true);

  const act3Domain0 = getShowreelTimelineState(11.5, null);
  assert.equal(act3Domain0.act, 'orbit');
  assert.equal(act3Domain0.activeCardIndex, 0);

  const act3Domain3 = getShowreelTimelineState(23.0, null);
  assert.equal(act3Domain3.act, 'orbit');
  assert.equal(act3Domain3.activeCardIndex, 3);

  const lockedOverview = getShowreelTimelineState(18.0, 'overview');
  assert.equal(lockedOverview.act, 'overview');
  assert.equal(lockedOverview.activeCardIndex, -1);
  assert.equal(lockedOverview.portalOpen, 0);
  assert.equal(lockedOverview.breakthroughPortal, 0);

  const lockedDomain2 = getShowreelTimelineState(1.5, 2);
  assert.equal(lockedDomain2.act, 'orbit');
  assert.equal(lockedDomain2.activeCardIndex, 2);
  assert.equal(lockedDomain2.portalOpen, 1);
  assert.equal(lockedDomain2.breakthroughPortal, 1);
});

test('getDomainOrbitPose positions the active front domain closest to the camera with frontness = 1', () => {
  const stateForDomain2 = getShowreelTimelineState(0, 2);
  const pose2 = getDomainOrbitPose(2, stateForDomain2.orbitAngle);
  const pose0 = getDomainOrbitPose(0, stateForDomain2.orbitAngle);

  assert.equal(pose2.z > pose0.z, true);
  assert.equal(pose2.frontness > 0.98, true);
  assert.equal(Math.abs(pose2.x) < 0.05, true);
});

test('HOLO_GLASS_FRAGMENT_SHADER includes electric border plasma, portal split ring, and clamped pow()', () => {
  assert.equal(typeof HOLO_GLASS_FRAGMENT_SHADER, 'string');
  assert.equal(HOLO_GLASS_FRAGMENT_SHADER.includes('uniform float uElectricIntensity;'), true);
  assert.equal(HOLO_GLASS_FRAGMENT_SHADER.includes('uniform float uPortalOpen;'), true);
  const powMatches = HOLO_GLASS_FRAGMENT_SHADER.match(/pow\([^,]+/g) || [];
  assert.equal(powMatches.length > 0, true);
  powMatches.forEach((snippet) => {
    assert.equal(snippet.startsWith('pow(max(0.0'), true, `Unclamped pow base: ${snippet}`);
  });
});

test('getHeroTitleCharState staggers letter-by-letter entrance with flash and continuous sheen', () => {
  const before = getHeroTitleCharState(5, 0.05, 0.05);
  assert.equal(before.visible, false);
  assert.equal(before.alpha, 0);

  const entering = getHeroTitleCharState(0, 0.12, 0.12);
  assert.equal(entering.visible, true);
  assert.equal(entering.progress > 0 && entering.progress < 1, true);
  assert.equal(entering.flash > 0.5, true);

  const settled = getHeroTitleCharState(0, 3.0, 3.0);
  assert.equal(settled.visible, true);
  assert.equal(settled.progress, 1);
  assert.equal(settled.alpha, 1);
});

test('HeroThreeStage.jsx HUD reflects 2570 3-tier 255,000 THB & 5-domain Prototype rules without "+ อื่นๆ" or plaques', () => {
  const heroSrc = fs.readFileSync(HERO_STAGE_JSX_PATH, 'utf8');

  // Top bar items (Spec §5.4)
  assert.equal(heroSrc.includes('5 หมวดการแข่งขัน'), true);
  assert.equal(heroSrc.includes('ต้องมี Prototype ขั้นต่ำ'), true);
  assert.equal(heroSrc.includes('เงินรางวัลรวม 255,000 บาท'), true);

  // Bottom telemetry cards (Spec §5.4)
  assert.equal(heroSrc.includes('ถ้วยพระราชทานฯ & ถ้วย มจพ.'), true);
  assert.equal(heroSrc.includes('สูงสุดแห่งเกียรติยศ 3 ประเภทการแข่งขัน'), true);
  assert.equal(heroSrc.includes('255,000 THB'), true);
  assert.equal(heroSrc.includes('เงินรางวัลรวม 3 ประเภท (18 รางวัล)'), true);
  assert.equal(heroSrc.includes('5 หมวดนวัตกรรม'), true);
  assert.equal(heroSrc.includes('ต้องมีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำ'), true);

  // Breakthrough subtitle (Spec §5.4)
  assert.equal(
    heroSrc.includes('5 หมวดนวัตกรรมเป้าหมาย • ชิงถ้วยพระราชทานฯ ถ้วยรางวัล มจพ. และเงินรางวัลรวม 255,000 บาท'),
    true
  );

  // Forbidden legacy / plaque strings
  assert.equal(heroSrc.includes('+ อื่นๆ'), false);
  assert.equal(heroSrc.includes('180,000'), false);
  assert.equal(heroSrc.includes('12 รางวัล'), false);
  assert.equal(heroSrc.includes('โล่'), false);
});
