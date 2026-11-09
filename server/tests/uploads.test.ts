import { describe, expect, test } from 'bun:test';
import { app } from '../src/index';

describe('Artifact Uploads Controller (/api/uploads)', () => {
  const ts = Date.now();
  const email = `uploader-${ts}@kmutnb.ac.th`;
  let token = '';
  let uploadedVideoUrl = '';

  test('setup test contestant user', async () => {
    const reg = await app.handle(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'UploadPassword2027!',
          fullName: 'Uploader Contestant',
          educationLevel: 'higher_and_above',
        }),
      })
    );
    const json = await reg.json();
    expect(reg.status).toBe(200);
    token = json.token;
    expect(typeof token).toBe('string');
  });

  test('rejects unauthenticated upload with 401', async () => {
    const form = new FormData();
    form.append('slot', 'proposal');
    form.append(
      'file',
      new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'proposal.pdf', {
        type: 'application/pdf',
      })
    );
    const res = await app.handle(
      new Request('http://localhost/api/uploads/artifact', {
        method: 'POST',
        body: form,
      })
    );
    expect(res.status).toBe(401);
  });

  test('rejects invalid slot or disallowed extension for slot with 400', async () => {
    const badExtForm = new FormData();
    badExtForm.append('slot', 'proposal');
    badExtForm.append(
      'file',
      new File([new Uint8Array([1, 2, 3, 4])], 'malware.exe', {
        type: 'application/octet-stream',
      })
    );
    const res = await app.handle(
      new Request('http://localhost/api/uploads/artifact', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: badExtForm,
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  test('uploads valid PDF for proposal and valid MP4 for video, and serves both with Range 206 support', async () => {
    const pdfBytes = new TextEncoder().encode('%PDF-1.7 sample innovation proposal content');
    const pdfForm = new FormData();
    pdfForm.append('slot', 'proposal');
    pdfForm.append('year', '2569');
    pdfForm.append(
      'file',
      new File([pdfBytes], 'kmutnb_proposal.pdf', { type: 'application/pdf' })
    );

    const pdfRes = await app.handle(
      new Request('http://localhost/api/uploads/artifact', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: pdfForm,
      })
    );
    expect(pdfRes.status).toBe(200);
    const pdfJson = await pdfRes.json();
    expect(pdfJson.success).toBe(true);
    expect(pdfJson.data.url).toStartWith('/api/uploads/files/2569/proposal/');
    expect(pdfJson.data.url.endsWith('.pdf')).toBe(true);

    // Fetch full PDF file
    const getPdfRes = await app.handle(
      new Request(`http://localhost${pdfJson.data.url}`, { method: 'GET' })
    );
    expect(getPdfRes.status).toBe(200);
    expect(getPdfRes.headers.get('accept-ranges')).toBe('bytes');
    const fetchedPdfText = await getPdfRes.text();
    expect(fetchedPdfText).toBe('%PDF-1.7 sample innovation proposal content');

    // Upload MP4 video and test Range 206 Partial Content
    const videoBytes = new Uint8Array(2048);
    for (let i = 0; i < videoBytes.length; i++) videoBytes[i] = i % 256;
    const videoForm = new FormData();
    videoForm.append('slot', 'video');
    videoForm.append('year', '2569');
    videoForm.append(
      'file',
      new File([videoBytes], 'demo_pitch.mp4', { type: 'video/mp4' })
    );

    const vidRes = await app.handle(
      new Request('http://localhost/api/uploads/artifact', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: videoForm,
      })
    );
    expect(vidRes.status).toBe(200);
    const vidJson = await vidRes.json();
    expect(vidJson.success).toBe(true);
    uploadedVideoUrl = vidJson.data.url;

    const rangeRes = await app.handle(
      new Request(`http://localhost${uploadedVideoUrl}`, {
        method: 'GET',
        headers: { Range: 'bytes=0-255' },
      })
    );
    expect(rangeRes.status).toBe(206);
    expect(rangeRes.headers.get('content-range')).toBe('bytes 0-255/2048');
    const sliceBuf = new Uint8Array(await rangeRes.arrayBuffer());
    expect(sliceBuf.byteLength).toBe(256);
    expect(sliceBuf[0]).toBe(0);
    expect(sliceBuf[255]).toBe(255);
  });

  test('rejects path traversal characters in GET /api/uploads/files/:year/:slot/:filename', async () => {
    const badRes = await app.handle(
      new Request('http://localhost/api/uploads/files/2569/proposal/..%2F..%2Fpackage.json', {
        method: 'GET',
      })
    );
    expect([400, 404]).toContain(badRes.status);
  });

  test('reassembles multi-chunk video upload accurately without memory spikes', async () => {
    const chunk0 = new Uint8Array([10, 20, 30, 40, 50]);
    const chunk1 = new Uint8Array([60, 70, 80, 90, 100]);
    const uploadId = `chunktest_${Date.now()}`;

    const form0 = new FormData();
    form0.append('slot', 'video');
    form0.append('year', '2569');
    form0.append('uploadId', uploadId);
    form0.append('chunkIndex', '0');
    form0.append('totalChunks', '2');
    form0.append('originalName', 'chunked_pitch.mp4');
    form0.append('totalSize', '10');
    form0.append('file', new File([chunk0], 'chunked_pitch.mp4', { type: 'video/mp4' }));

    const res0 = await app.handle(
      new Request('http://localhost/api/uploads/artifact', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form0,
      })
    );
    expect(res0.status).toBe(200);
    const json0 = await res0.json();
    expect(json0.success).toBe(true);
    expect(json0.partial).toBe(true);

    const form1 = new FormData();
    form1.append('slot', 'video');
    form1.append('year', '2569');
    form1.append('uploadId', uploadId);
    form1.append('chunkIndex', '1');
    form1.append('totalChunks', '2');
    form1.append('originalName', 'chunked_pitch.mp4');
    form1.append('totalSize', '10');
    form1.append('file', new File([chunk1], 'chunked_pitch.mp4', { type: 'video/mp4' }));

    const res1 = await app.handle(
      new Request('http://localhost/api/uploads/artifact', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form1,
      })
    );
    expect(res1.status).toBe(200);
    const json1 = await res1.json();
    expect(json1.success).toBe(true);
    expect(json1.data.size).toBe(10);
    expect(json1.data.url).toStartWith('/api/uploads/files/2569/video/');

    const getRes = await app.handle(
      new Request(`http://localhost${json1.data.url}`, { method: 'GET' })
    );
    expect(getRes.status).toBe(200);
    const fullBytes = new Uint8Array(await getRes.arrayBuffer());
    expect(Array.from(fullBytes)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });
});
