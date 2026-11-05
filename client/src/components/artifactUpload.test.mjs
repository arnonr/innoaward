import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ARTIFACT_SLOT_CONFIG,
  validateArtifactFile,
  formatFileSize,
  resolveServerUploadUrl,
  detectArtifactPreviewKind,
  extractArtifactDisplayName,
} from './artifactUploadUtils.js';

test('ARTIFACT_SLOT_CONFIG defines all 5 competition artifact slots with extensions and maxSizeBytes', () => {
  const slots = ['proposal', 'video', 'image', 'poster', 'presentation'];
  for (const slot of slots) {
    assert.ok(ARTIFACT_SLOT_CONFIG[slot], `Missing slot config for ${slot}`);
    assert.ok(Array.isArray(ARTIFACT_SLOT_CONFIG[slot].extensions));
    assert.ok(ARTIFACT_SLOT_CONFIG[slot].maxSizeBytes > 0);
    assert.ok(typeof ARTIFACT_SLOT_CONFIG[slot].accept === 'object');
  }
});

test('validateArtifactFile validates allowed extensions and max file sizes per slot', () => {
  assert.deepEqual(
    validateArtifactFile({ name: 'proposal.pdf', size: 5 * 1024 * 1024 }, 'proposal'),
    { valid: true, error: '' }
  );

  const badExt = validateArtifactFile({ name: 'script.exe', size: 1024 }, 'proposal');
  assert.equal(badExt.valid, false);
  assert.match(badExt.error, /รองรับเฉพาะ/);

  const tooBig = validateArtifactFile(
    { name: 'huge_proposal.pdf', size: 35 * 1024 * 1024 },
    'proposal'
  );
  assert.equal(tooBig.valid, false);
  assert.match(tooBig.error, /30 MB/);

  const validVideo = validateArtifactFile(
    { name: 'pitch.mp4', size: 120 * 1024 * 1024 },
    'video'
  );
  assert.equal(validVideo.valid, true);
});

test('formatFileSize formats bytes, KB, and MB cleanly', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.00 MB');
});

test('resolveServerUploadUrl resolves /api/uploads/ paths against apiBase origin and static paths against baseUrl', () => {
  assert.equal(
    resolveServerUploadUrl(
      '/api/uploads/files/2569/proposal/123-doc.pdf',
      'http://localhost:3001/api',
      '/innoawards/'
    ),
    'http://localhost:3001/api/uploads/files/2569/proposal/123-doc.pdf'
  );

  assert.equal(
    resolveServerUploadUrl(
      '/api/uploads/files/2569/video/123-vid.mp4',
      '/innoawards/api',
      '/innoawards/'
    ),
    '/innoawards/api/uploads/files/2569/video/123-vid.mp4'
  );

  assert.equal(
    resolveServerUploadUrl('/osbi-poster.jpg', 'http://localhost:3001/api', '/innoawards/'),
    '/innoawards/osbi-poster.jpg'
  );
});

test('detectArtifactPreviewKind and extractArtifactDisplayName identify file types and readable names', () => {
  assert.equal(detectArtifactPreviewKind('/api/uploads/files/2569/image/111-robot.jpg'), 'image');
  assert.equal(detectArtifactPreviewKind('/api/uploads/files/2569/video/111-pitch.mp4'), 'video');
  assert.equal(detectArtifactPreviewKind('/api/uploads/files/2569/proposal/111-doc.pdf'), 'pdf');
  assert.equal(
    detectArtifactPreviewKind('/api/uploads/files/2569/presentation/111-deck.pptx'),
    'slides'
  );
  assert.equal(
    extractArtifactDisplayName('/api/uploads/files/2569/proposal/179389-a1b2c3d4-kmutnb_proposal.pdf'),
    'kmutnb_proposal.pdf'
  );
});

test('ArtifactUploadField.jsx uses useDropzone from react-dropzone and XMLHttpRequest upload progress', () => {
  const compPath = path.resolve(import.meta.dirname, './ArtifactUploadField.jsx');
  const code = fs.readFileSync(compPath, 'utf8');
  assert.match(code, /useDropzone/);
  assert.match(code, /XMLHttpRequest/);
  assert.match(code, /\/uploads\/artifact/);
});
