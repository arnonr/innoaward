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
  MAX_PROJECTS_PER_ACCOUNT
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
    presentationUrl: ''
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
