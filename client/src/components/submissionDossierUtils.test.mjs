import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSubmissionForm,
  validateSubmissionStep,
  buildSubmissionApiPayload,
  normalizeStatusDossier,
  formatCitizenIdInput
} from './submissionDossierUtils.js';

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

test('normalizeStatusDossier produces complete 3-round, coordinator, member, and 5-artifact structure for KMUTNB-2569-0002 fallback', () => {
  const dossier = normalizeStatusDossier({ trackingCode: 'KMUTNB-2569-0002' });
  assert.equal(dossier.teamName, 'เขาชื่ออะไร');
  assert.equal(dossier.rounds.round2.status, 'PASSED');
  assert.equal(dossier.rounds.round3.status, 'PASSED');
  assert.equal(dossier.rounds.round3.result, 'รางวัลรองชนะเลิศอันดับ 1');
  assert.equal(dossier.primaryCoordinator.name, 'ผศ.ดร.วัฒนา แก้วมณี');
});
