import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
  validateRubricWeights,
  formatCategoryOptionLabel,
  DEFAULT_COMPETITION_LEVELS_2570,
  KMUTNB_TROPHY_SHORT_TH_2570,
  CATEGORY_LABELS_TH,
  LEVEL_LABELS_TH
} from './submissionDossierUtils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('formatCitizenIdInput formats 13 Thai digits as X-XXXX-XXXXX-XX-X and preserves passport strings', () => {
  assert.equal(formatCitizenIdInput('5160100029582'), '5-1601-00029-58-2');
  assert.equal(formatCitizenIdInput('AA1234567'), 'AA1234567');
});

test('validateSubmissionStep requires Proposal PDF, Video, and Image on final submit but allows empty Poster and Presentation', () => {
  const form = {
    ...createInitialSubmissionForm(),
    titleTh: 'เครื่องควบคุมการเชื่อมท่อ HDPE',
    teamName: 'เขาชื่ออะไร',
    affiliation: 'คณะครุศาสตร์อุตสาหกรรม มจพ.',
    abstractTh: 'รายละเอียดผลงานครบถ้วน',
    members: [{ fullName: 'ผศ.ดร.วัฒนา แก้วมณี', role: 'หัวหน้าทีม', idCard: '5-1601-00029-58-2' }],
    primaryCoordinator: {
      name: 'ผศ.ดร.วัฒนา แก้วมณี',
      idCard: '5-1601-00029-58-2',
      phone: '064-274-9888',
      email: 'wattana.k@fte.kmutnb.ac.th'
    },
    proposalPdfUrl: 'https://drive.google.com/proposal.pdf',
    videoUrl: 'https://youtube.com/watch?v=123',
    coverImage: '/hdpe-poster.jpg',
    posterUrl: '',
    presentationUrl: '',
    hasPrototypeConfirmed: true
  };
  assert.equal(validateSubmissionStep(form, 1, false), '');
  assert.equal(validateSubmissionStep(form, 2, false), '');
  assert.equal(validateSubmissionStep(form, 3, false), '');
  const payload = buildSubmissionApiPayload(form, false);
  assert.equal(payload.isDraft, false);
  assert.equal(payload.members.length, 1);
  assert.equal(payload.primaryCoordinator.email, 'wattana.k@fte.kmutnb.ac.th');
});

test('normalizeStatusDossier produces complete 3-round, coordinator, member, and 5-artifact structure for KMUTNB-2569-0001..0006 fallback', () => {
  const dossier = normalizeStatusDossier({ trackingCode: 'KMUTNB-2569-0002' });
  assert.equal(dossier.teamName, 'เขาชื่ออะไร');
  assert.equal(dossier.rounds.round1.status, 'PASSED');
  assert.equal(dossier.rounds.round2.status, 'PASSED');
  assert.equal(dossier.rounds.round3.status, 'PASSED');
  assert.equal(dossier.rounds.round3.result, 'รางวัลรองชนะเลิศอันดับ 1');
  assert.equal(dossier.primaryCoordinator.name, 'ผศ.ดร.วัฒนา แก้วมณี');
  assert.equal(dossier.primaryCoordinator.idCard, '5-1601-XXXXX-XX-X');

  const dossier6 = normalizeStatusDossier({ trackingCode: 'KMUTNB-2569-0006' });
  assert.equal(dossier6.teamName, 'GeoWeld');
  assert.equal(dossier6.rounds.round3.result, 'รางวัลชมเชย');
});

test('buildSubmissionApiPayload preserves existing submission id and MAX_PROJECTS_PER_ACCOUNT is 2', () => {
  assert.equal(MAX_PROJECTS_PER_ACCOUNT, 2);
  const form = {
    ...createInitialSubmissionForm(),
    id: 'sub-existing-01',
    titleTh: 'โครงการทดสอบแก้ไข',
    teamName: 'ทีมทดสอบ',
    category: 'medical_device',
    educationLevel: 'higher_and_above'
  };
  const payload = buildSubmissionApiPayload(form, true, 'user-01');
  assert.equal(payload.id, 'sub-existing-01');
  assert.equal(payload.isDraft, true);
  assert.equal(payload.userId, 'user-01');
});

test('hydrateSubmissionFormFromServer maps server submission record back into editable 3-step subForm', () => {
  const serverRecord = {
    id: 'sub-999',
    trackingCode: 'KMUTNB-2570-0099',
    status: 'SUBMITTED',
    titleTh: 'ระบบตรวจสอบรอยร้าวคอนกรีต',
    titleEn: 'Concrete Crack Inspector',
    category: { code: 'social_economy' },
    educationLevel: { code: 'below_higher' },
    teamName: 'ROAD AI',
    affiliation: 'โรงเรียนเตรียมวิศวกรรมศาสตร์ ไทย-เยอรมัน',
    advisorName: 'อ.สมชาย ที่ปรึกษา',
    abstractTh: 'บทคัดย่อระบบตรวจสอบรอยร้าว',
    members: [
      { fullName: 'นายเอก นวัตกรรม', role: 'หัวหน้าทีม', idCard: '1100100234567' },
      { fullName: 'นางสาวโท วิจัย', role: 'สมาชิก', idCard: '2100100234568' }
    ],
    primaryCoordinator: {
      name: 'นายเอก นวัตกรรม',
      idCard: '1-1001-00234-56-7',
      phone: '081-111-2222',
      email: 'aek@kmutnb.ac.th'
    },
    secondaryCoordinator: {
      name: 'อ.สมชาย ที่ปรึกษา',
      idCard: '',
      phone: '089-333-4444',
      email: 'somchai@kmutnb.ac.th'
    },
    artifacts: {
      proposalPdfUrl: 'https://drive.google.com/prop.pdf',
      videoUrl: 'https://youtube.com/watch?v=abc',
      posterUrl: 'https://drive.google.com/poster.pdf',
      imageUrl: '/road-ai-poster.jpg',
      presentationUrl: 'https://drive.google.com/slides.pdf'
    }
  };

  const hydrated = hydrateSubmissionFormFromServer(serverRecord);
  assert.equal(hydrated.id, 'sub-999');
  assert.equal(hydrated.trackingCode, 'KMUTNB-2570-0099');
  assert.equal(hydrated.status, 'SUBMITTED');
  assert.equal(hydrated.category, 'social_economy');
  assert.equal(hydrated.educationLevel, 'below_higher');
  assert.equal(hydrated.members.length, 2);
  assert.equal(hydrated.members[0].idCard, '1-1001-00234-56-7');
  assert.equal(hydrated.primaryCoordinator.email, 'aek@kmutnb.ac.th');
  assert.equal(hydrated.proposalPdfUrl, 'https://drive.google.com/prop.pdf');
  assert.equal(hydrated.posterUrl, 'https://drive.google.com/poster.pdf');
  assert.equal(hydrated.presentationUrl, 'https://drive.google.com/slides.pdf');
  assert.equal(hydrated.coverImage, '/road-ai-poster.jpg');
});

test('isSubmissionDeadlinePassed compares current timestamp against deadline ISO accurately', () => {
  const deadline = '2027-02-28T23:59:59+07:00';
  assert.equal(isSubmissionDeadlinePassed(deadline, Date.parse('2027-02-28T12:00:00+07:00')), false);
  assert.equal(isSubmissionDeadlinePassed(deadline, Date.parse('2027-03-01T00:00:01+07:00')), true);
});

test('normalizeStatusDossier preserves id, userId, and canEditArtifacts for owner-gated editing', () => {
  const pubDossier = normalizeStatusDossier({
    id: 'sub-777',
    userId: 'user-owner-1',
    trackingCode: 'KMUTNB-2570-0077',
    canEditArtifacts: false
  });
  assert.equal(pubDossier.id, 'sub-777');
  assert.equal(pubDossier.userId, 'user-owner-1');
  assert.equal(pubDossier.canEditArtifacts, false);

  const ownerDossier = normalizeStatusDossier({
    id: 'sub-777',
    userId: 'user-owner-1',
    trackingCode: 'KMUTNB-2570-0077',
    canEditArtifacts: true
  });
  assert.equal(ownerDossier.canEditArtifacts, true);
});

test('App.jsx integrates email/password login verification, 2-project contestant workspace, dynamic deadline from /api/config, and view-only public status lookup', () => {
  const appPath = path.resolve(__dirname, '../App.jsx');
  const appSrc = fs.readFileSync(appPath, 'utf8');

  assert.match(appSrc, /hydrateSubmissionFormFromServer/);
  assert.match(appSrc, /isSubmissionDeadlinePassed/);
  assert.match(appSrc, /MAX_PROJECTS_PER_ACCOUNT/);
  assert.match(appSrc, /\/submissions\/my/);
  assert.match(appSrc, /ผลงานของฉัน/);
  assert.match(appSrc, /เข้าสู่ระบบด้วยอีเมลเพื่อแก้ไขข้อมูล/);
  assert.match(appSrc, /localStorage\.removeItem\('kmutnb_draft_submission'\)/);
  assert.match(appSrc, /<fieldset\s+disabled=\{deadlinePassed && user\?\.role !== 'ADMIN'\}/);
});

test('calculateWeightedRubricScore and validateRubricWeights compute weighted 1..5 scores out of 100 and validate weights sum to 100%', () => {
  assert.equal(Array.isArray(DEFAULT_RUBRIC_CRITERIA), true);
  assert.equal(DEFAULT_RUBRIC_CRITERIA.length, 5);
  assert.equal(RUBRIC_SCORE_LEVELS.length, 5);

  const allFives = {
    creativity: 5,
    prototype: 5,
    impact: 5,
    sustainability: 5,
    presentation: 5
  };
  assert.equal(calculateWeightedRubricScore(allFives, DEFAULT_RUBRIC_CRITERIA), 100);

  const allOnes = {
    creativity: 1,
    prototype: 1,
    impact: 1,
    sustainability: 1,
    presentation: 1
  };
  assert.equal(calculateWeightedRubricScore(allOnes, DEFAULT_RUBRIC_CRITERIA), 20);

  const mixed = {
    creativity: 5,
    prototype: 4,
    impact: 4,
    sustainability: 4,
    presentation: 5
  };
  assert.equal(calculateWeightedRubricScore(mixed, DEFAULT_RUBRIC_CRITERIA), 88);

  assert.equal(validateRubricWeights(DEFAULT_RUBRIC_CRITERIA), '');
  assert.match(
    validateRubricWeights([
      { id: 'c1', titleTh: 'เกณฑ์ที่ 1', weight: 60 },
      { id: 'c2', titleTh: 'เกณฑ์ที่ 2', weight: 30 }
    ]),
    /100%/
  );
});

test('App.jsx integrates Judge & Admin Workspace modal, weighted 1-5 rubric evaluation, dynamic categories, judge category assignment, result publishing, and multi-year setup', () => {
  const appPath = path.resolve(__dirname, '../App.jsx');
  const appSrc = fs.readFileSync(appPath, 'utf8');

  assert.match(appSrc, /calculateWeightedRubricScore/);
  assert.match(appSrc, /validateRubricWeights/);
  assert.match(appSrc, /\/judging\/submissions/);
  assert.match(appSrc, /\/judging\/judges/);
  assert.match(appSrc, /\/judging\/publish-results/);
  assert.match(appSrc, /\/config\/rubric/);
  assert.match(appSrc, /\/config\/categories/);
  assert.match(appSrc, /\/config\/years/);
  assert.match(appSrc, /dynamicCategories/);
  assert.match(appSrc, /ส่ง POSTER แล้ว/);
  assert.match(appSrc, /sub\.myEvaluations\?\.\[targetRound\]/);
  assert.match(appSrc, /stage:\s*publishRoundForm\.round/);
  assert.match(appSrc, /categories:\s*nextCodes/);
  assert.match(appSrc, /sub\.roundSummaries\?\.\[activeSummaryRound\]/);
  assert.match(appSrc, /data\?\.rubricConfig/);
  assert.match(appSrc, /lvl\.label \|\| lvl\.labelTh/);
  assert.match(appSrc, /descriptionTh:\s*newCategoryForm\.description/);
  assert.match(appSrc, /formatCategoryOptionLabel/);
  assert.match(appSrc, /portalTab === 'submission'\s*\?\s*'860px'/);
});

test('formatCategoryOptionLabel avoids duplicating English name when nameTh already contains parentheses or English prefix', () => {
  assert.equal(
    formatCategoryOptionLabel({
      code: 'energy_environment',
      nameTh: 'Energy & Environment (พลังงานและสิ่งแวดล้อม)',
      nameEn: 'Energy & Environment'
    }),
    'Energy & Environment (พลังงานและสิ่งแวดล้อม)'
  );
  assert.equal(
    formatCategoryOptionLabel({
      code: 'energy_environment',
      nameTh: 'พลังงานและสิ่งแวดล้อม',
      nameEn: 'Energy & Environment'
    }),
    'พลังงานและสิ่งแวดล้อม (Energy & Environment)'
  );
  assert.equal(
    formatCategoryOptionLabel({
      code: 'ai_robotics',
      nameTh: 'ปัญญาประดิษฐ์และหุ่นยนต์อัตโนมัติ',
      nameEn: ''
    }),
    'ปัญญาประดิษฐ์และหุ่นยนต์อัตโนมัติ'
  );
});

test('App.jsx integrates ArtifactUploadField across all 5 submission artifact slots and Round 2 late-upload form', () => {
  const appPath = path.resolve(__dirname, '../App.jsx');
  const appSrc = fs.readFileSync(appPath, 'utf8');

  assert.match(appSrc, /import ArtifactUploadField from '\.\/components\/ArtifactUploadField'/);
  assert.match(appSrc, /resolveServerUploadUrl/);
  assert.match(appSrc, /slot="proposal"/);
  assert.match(appSrc, /slot="video"/);
  assert.match(appSrc, /slot="image"/);
  assert.match(appSrc, /slot="poster"/);
  assert.match(appSrc, /slot="presentation"/);
});

test('DEFAULT_COMPETITION_LEVELS_2570 defines 3 tiers summing to 255,000 THB with Royal Trophy only on general_public and KMUTNB Trophy on student tiers', () => {
  assert.equal(Array.isArray(DEFAULT_COMPETITION_LEVELS_2570), true);
  assert.equal(DEFAULT_COMPETITION_LEVELS_2570.length, 3);

  const codes = DEFAULT_COMPETITION_LEVELS_2570.map((lvl) => lvl.code);
  assert.deepEqual(codes, ['general_public', 'higher_education', 'below_higher']);

  const totalPool = DEFAULT_COMPETITION_LEVELS_2570.reduce(
    (sum, lvl) => sum + lvl.totalPrizeAmount,
    0
  );
  assert.equal(totalPool, 255000);

  const generalPublic = DEFAULT_COMPETITION_LEVELS_2570.find((l) => l.code === 'general_public');
  const higherEdu = DEFAULT_COMPETITION_LEVELS_2570.find((l) => l.code === 'higher_education');
  const belowHigher = DEFAULT_COMPETITION_LEVELS_2570.find((l) => l.code === 'below_higher');

  assert.equal(generalPublic.isRoyalTrophy, true);
  assert.equal(generalPublic.totalPrizeAmount, 105000);
  assert.equal(generalPublic.requiresPrototype, true);
  assert.equal(generalPublic.trophyShortTh, 'ถ้วยพระราชทานฯ');

  assert.equal(higherEdu.isRoyalTrophy, false);
  assert.equal(higherEdu.totalPrizeAmount, 75000);
  assert.equal(higherEdu.requiresPrototype, true);
  assert.equal(higherEdu.trophyShortTh, 'ถ้วยรางวัล มจพ.');

  assert.equal(belowHigher.isRoyalTrophy, false);
  assert.equal(belowHigher.totalPrizeAmount, 75000);
  assert.equal(belowHigher.requiresPrototype, true);
  assert.equal(belowHigher.trophyShortTh, 'ถ้วยรางวัล มจพ.');

  // Verify both 2570 and 2569 codes exist in label dictionaries
  for (const code of [
    'agri_food',
    'health_medtech',
    'engineering_ai',
    'energy_env_material_bcg',
    'quality_of_life_soft_power',
    'energy_environment',
    'food_agriculture',
    'social_economy',
    'medical_device',
    'material',
    'others'
  ]) {
    assert.equal(typeof CATEGORY_LABELS_TH[code], 'string');
    assert.ok(CATEGORY_LABELS_TH[code].length > 0);
  }

  for (const code of ['general_public', 'higher_education', 'below_higher', 'higher_and_above']) {
    assert.equal(typeof LEVEL_LABELS_TH[code], 'string');
    assert.ok(LEVEL_LABELS_TH[code].length > 0);
  }

  // Historical 2569 fallback dossiers preserve exact historical labels
  const d1 = normalizeStatusDossier({ trackingCode: 'KMUTNB-2569-0001' });
  const d4 = normalizeStatusDossier({ trackingCode: 'KMUTNB-2569-0004' });
  assert.equal(d1.educationLevel, 'higher_and_above');
  assert.equal(d1.educationLevelNameTh, 'ระดับอุดมศึกษาและบุคคลทั่วไป');
  assert.equal(d4.educationLevel, 'below_higher');
  assert.equal(d4.educationLevelNameTh, 'ระดับต่ำกว่าอุดมศึกษา');
});

test('createInitialSubmissionForm, validateSubmissionStep, buildSubmissionApiPayload, and hydrateSubmissionFormFromServer enforce 2570 defaults and prototype confirmation without blocking drafts', () => {
  const initial = createInitialSubmissionForm();
  assert.equal(initial.category, 'agri_food');
  assert.equal(initial.educationLevel, 'general_public');
  assert.equal(initial.hasPrototypeConfirmed, false);

  const baseCompleteStep3 = {
    ...initial,
    titleTh: 'หุ่นยนต์ตรวจสอบแผงโซลาร์เซลล์อัตโนมัติ',
    teamName: 'SolarBot',
    affiliation: 'คณะวิศวกรรมศาสตร์ มจพ.',
    abstractTh: 'รายละเอียดการพัฒนาต้นแบบครบถ้วน',
    members: [{ fullName: 'นายนวัต กรรม', role: 'หัวหน้าทีม', idCard: '1-1001-00001-00-1' }],
    primaryCoordinator: {
      name: 'นายนวัต กรรม',
      idCard: '1-1001-00001-00-1',
      phone: '081-222-3333',
      email: 'nawat@kmutnb.ac.th'
    },
    proposalPdfUrl: 'https://drive.google.com/proposal.pdf',
    videoUrl: 'https://youtube.com/watch?v=demo',
    coverImage: '/domain-engineering.jpg',
    hasPrototypeConfirmed: false
  };

  // Final submit on step 3 must fail with Prototype message when unchecked
  const errUnchecked = validateSubmissionStep(baseCompleteStep3, 3, false);
  assert.match(errUnchecked, /Prototype/);

  // Full validation (!step) on final submit also fails when unchecked
  assert.match(validateSubmissionStep(baseCompleteStep3, undefined, false), /Prototype/);

  // Draft save is NEVER blocked when hasPrototypeConfirmed is false (Review Focus #1)
  assert.equal(
    validateSubmissionStep({ titleTh: 'ร่างโครงการ', hasPrototypeConfirmed: false }, 3, true),
    ''
  );

  // Final submit passes once hasPrototypeConfirmed is true
  const checkedForm = { ...baseCompleteStep3, hasPrototypeConfirmed: true };
  assert.equal(validateSubmissionStep(checkedForm, 3, false), '');

  const payloadUnchecked = buildSubmissionApiPayload(baseCompleteStep3, true, 'user-1');
  assert.equal(payloadUnchecked.hasPrototypeConfirmed, false);

  const payloadChecked = buildSubmissionApiPayload(checkedForm, false, 'user-1');
  assert.equal(payloadChecked.hasPrototypeConfirmed, true);

  // Review Focus #2: hydrateSubmissionFormFromServer sets hasPrototypeConfirmed from status when omitted
  const hydratedSubmitted = hydrateSubmissionFormFromServer({
    id: 'sub-2570-1',
    status: 'SUBMITTED',
    titleTh: 'โครงการส่งแล้ว'
  });
  assert.equal(hydratedSubmitted.hasPrototypeConfirmed, true);

  const hydratedDraft = hydrateSubmissionFormFromServer({
    id: 'sub-2570-2',
    status: 'DRAFT',
    titleTh: 'โครงการร่าง'
  });
  assert.equal(hydratedDraft.hasPrototypeConfirmed, false);

  const hydratedExplicitFalse = hydrateSubmissionFormFromServer({
    id: 'sub-2570-3',
    status: 'SUBMITTED',
    hasPrototypeConfirmed: false,
    titleTh: 'โครงการระบุชัดเจน'
  });
  assert.equal(hydratedExplicitFalse.hasPrototypeConfirmed, false);
});

test('App.jsx integrates 3-tier dynamicLevels, 255,000 THB prize pool, Step 3 prototype checkbox, /config/levels admin setup, trophy-aware champion awarding, and removes auto-injected others category', () => {
  const appPath = path.resolve(__dirname, '../App.jsx');
  const appSrc = fs.readFileSync(appPath, 'utf8');

  assert.match(appSrc, /DEFAULT_COMPETITION_LEVELS_2570/);
  assert.match(appSrc, /dynamicLevels/);
  assert.match(appSrc, /hasPrototypeConfirmed/);
  assert.match(appSrc, /\/config\/levels/);
  assert.match(appSrc, /isRoyalTrophy/);
  assert.match(appSrc, /ถ้วยรางวัล มจพ\./);
  assert.doesNotMatch(appSrc, /normalizedCats\.some\(\s*\(?c\)?\s*=>\s*c\.code\s*===\s*'others'\s*\)/);
});

test('normalizeStatusDossier unwraps raw Prisma category/educationLevel objects, preserves isRoyalTrophy/trophyShortTh, and uses KMUTNB_TROPHY_SHORT_TH_2570 fallback', () => {
  assert.equal(KMUTNB_TROPHY_SHORT_TH_2570, 'ถ้วยรางวัล มจพ.');

  const rawPostSubmissionGeneralPublic = {
    id: 'sub-post-2570-gp',
    trackingCode: 'KMUTNB-2570-0101',
    status: 'SUBMITTED',
    titleTh: 'ระบบโดรนเกษตรอัจฉริยะ',
    teamName: 'AgriSky',
    affiliation: 'บริษัท นวัตกรรมไทย จำกัด',
    category: {
      id: 'c1',
      code: 'agri_food',
      nameTh: 'ด้านการเกษตรและอุตสาหกรรมอาหาร',
      nameEn: 'Agriculture & Food Industry'
    },
    competitionYearCategory: {
      id: 'cyc1',
      customNameTh: 'ด้านการเกษตรและอุตสาหกรรมอาหาร'
    },
    educationLevel: {
      id: 'l1',
      code: 'general_public',
      nameTh: 'บุคคลทั่วไป'
    },
    competitionYearLevel: {
      id: 'cyl1',
      isRoyalTrophy: true,
      trophyShortTh: 'ถ้วยพระราชทานฯ',
      customNameTh: 'บุคคลทั่วไป'
    },
    competitionYear: {
      id: 'cy2570',
      year: 2570
    }
  };

  const gpDossier = normalizeStatusDossier(rawPostSubmissionGeneralPublic);
  assert.equal(typeof gpDossier.category, 'string');
  assert.equal(gpDossier.category, 'agri_food');
  assert.equal(typeof gpDossier.categoryNameTh, 'string');
  assert.equal(gpDossier.categoryNameTh, 'ด้านการเกษตรและอุตสาหกรรมอาหาร');
  assert.equal(typeof gpDossier.educationLevel, 'string');
  assert.equal(gpDossier.educationLevel, 'general_public');
  assert.equal(typeof gpDossier.educationLevelNameTh, 'string');
  assert.equal(gpDossier.educationLevelNameTh, 'บุคคลทั่วไป');
  assert.equal(gpDossier.isRoyalTrophy, true);
  assert.equal(gpDossier.trophyShortTh, 'ถ้วยพระราชทานฯ');
  assert.equal(gpDossier.year, 2570);

  const rawPostSubmissionStudentTier = {
    id: 'sub-post-2570-he',
    trackingCode: 'KMUTNB-2570-0102',
    status: 'SUBMITTED',
    titleTh: 'หุ่นยนต์คัดแยกเวชภัณฑ์',
    teamName: 'MedBot KMUTNB',
    category: {
      id: 'c2',
      code: 'custom_biotech',
      nameTh: 'เทคโนโลยีชีวภาพขั้นสูง'
    },
    educationLevel: {
      id: 'l2',
      code: 'higher_education',
      nameTh: 'อุดมศึกษา'
    },
    competitionYearLevel: {
      id: 'cyl2',
      isRoyalTrophy: false,
      trophyShortTh: '   ',
      customNameTh: 'อุดมศึกษา'
    },
    competitionYear: {
      id: 'cy2570',
      year: 2570
    }
  };

  const heDossier = normalizeStatusDossier(rawPostSubmissionStudentTier);
  assert.equal(typeof heDossier.category, 'string');
  assert.equal(heDossier.category, 'custom_biotech');
  assert.equal(typeof heDossier.categoryNameTh, 'string');
  assert.equal(heDossier.categoryNameTh, 'เทคโนโลยีชีวภาพขั้นสูง');
  assert.equal(typeof heDossier.educationLevel, 'string');
  assert.equal(heDossier.educationLevel, 'higher_education');
  assert.equal(typeof heDossier.educationLevelNameTh, 'string');
  assert.equal(heDossier.educationLevelNameTh, 'อุดมศึกษา');
  assert.equal(heDossier.isRoyalTrophy, false);
  assert.equal(heDossier.trophyShortTh, 'ถ้วยรางวัล มจพ.');
});

test('validateSubmissionStep honors options.requiresPrototype === false on Step 3 while enforcing Prototype gate by default', () => {
  const formWithoutPrototypeTick = {
    ...createInitialSubmissionForm(),
    titleTh: 'โครงการแนวคิดนวัตกรรมชุมชน',
    teamName: 'OpenIdea',
    affiliation: 'โรงเรียนสาธิต',
    abstractTh: 'รายละเอียดครบถ้วนทุกช่อง',
    members: [{ fullName: 'นายต้นกล้า คิดดี', role: 'หัวหน้าทีม', idCard: '1-1001-00001-00-1' }],
    primaryCoordinator: {
      name: 'นายต้นกล้า คิดดี',
      idCard: '1-1001-00001-00-1',
      phone: '081-222-3333',
      email: 'tonkla@example.com'
    },
    proposalPdfUrl: 'https://drive.google.com/proposal.pdf',
    videoUrl: 'https://youtube.com/watch?v=demo',
    coverImage: '/domain-engineering.jpg',
    hasPrototypeConfirmed: false
  };

  // Default (omitted options) and explicit requiresPrototype: true still block final submit
  assert.match(validateSubmissionStep(formWithoutPrototypeTick, 3, false), /Prototype/);
  assert.match(
    validateSubmissionStep(formWithoutPrototypeTick, 3, false, { requiresPrototype: true }),
    /Prototype/
  );

  // When tier sets requiresPrototype: false, Step 3 and full-form validation pass without checkbox
  assert.equal(
    validateSubmissionStep(formWithoutPrototypeTick, 3, false, { requiresPrototype: false }),
    ''
  );
  assert.equal(
    validateSubmissionStep(formWithoutPrototypeTick, 0, false, { requiresPrototype: false }),
    ''
  );
});

test('App.jsx isolates public active-year config from Judge/Admin selectedJudgeYear, honors dynamic winner names/trophies, and supports tier requiresPrototype/0-THB/rollover', () => {
  const appPath = path.resolve(__dirname, '../App.jsx');
  const appSrc = fs.readFileSync(appPath, 'utf8');

  // Critical #2: Public vs Judge/Admin year state isolation & upload year safety
  assert.match(appSrc, /activeCompetitionYear/);
  assert.match(appSrc, /judgeDynamicCategories/);
  assert.match(appSrc, /judgeDynamicLevels/);
  assert.match(appSrc, /judgeTotalPrizePool/);
  assert.match(appSrc, /y\.isCurrent\s*\|\|\s*y\.isActive/);
  assert.doesNotMatch(appSrc, /year=\{selectedJudgeYear/);

  // Important #3: Winner dynamic category/level names and <= 2569 Royal Trophy fallback
  assert.match(appSrc, /Number\(w\.year\)\s*<=\s*2569/);
  assert.match(appSrc, /w\.categoryNameTh/);
  assert.match(appSrc, /w\.educationLevelNameTh/);

  // Important #4: totalAwardCount state, requiresPrototype option, and 0-THB safe parsing
  assert.match(appSrc, /totalAwardCount/);
  assert.doesNotMatch(appSrc, /dynamicLevels\.length\s*\*\s*6/);
  assert.match(appSrc, /requiresPrototype:\s*selectedTierRequiresPrototype/);

  // Minor #6: Year rollover copy mentions competition tiers & trophies
  assert.match(appSrc, /ประเภทการแข่งขันและถ้วยรางวัล/);
});



