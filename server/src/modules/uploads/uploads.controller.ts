import { Elysia } from 'elysia';
import { appendFile, mkdir, rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { authPlugin } from '../../middlewares/auth.middleware';

export type ArtifactSlot = 'proposal' | 'video' | 'image' | 'poster' | 'presentation';

interface SlotRule {
  extensions: string[];
  maxSizeBytes: number;
  labelTh: string;
}

export const SLOT_RULES: Record<ArtifactSlot, SlotRule> = {
  proposal: {
    extensions: ['.pdf'],
    maxSizeBytes: 30 * 1024 * 1024, // 30 MB
    labelTh: 'ไฟล์ข้อเสนอโครงการ (PDF)',
  },
  video: {
    extensions: ['.mp4', '.webm', '.mov'],
    maxSizeBytes: 300 * 1024 * 1024, // 300 MB
    labelTh: 'คลิปวิดีโอนำเสนอผลงาน',
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeBytes: 15 * 1024 * 1024, // 15 MB
    labelTh: 'รูปภาพผลงาน / ชิ้นงานต้นแบบ',
  },
  poster: {
    extensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    maxSizeBytes: 30 * 1024 * 1024, // 30 MB
    labelTh: 'โปสเตอร์นำเสนอผลงาน',
  },
  presentation: {
    extensions: ['.pdf', '.ppt', '.pptx'],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
    labelTh: 'ไฟล์สไลด์นำเสนอ (PDF/PPT/PPTX)',
  },
};

const MIME_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const SAFE_SEGMENT_REGEX = /^[a-zA-Z0-9._-]+$/;

const UPLOADS_ROOT = path.resolve(import.meta.dir, '../../../uploads');

function sanitizeBaseName(rawName: string): string {
  const base = path.basename(rawName, path.extname(rawName));
  const cleaned = base
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return cleaned || 'artifact';
}

async function extractUploadFields(
  body: unknown,
  request: Request
): Promise<Record<string, unknown> | null> {
  if (body && typeof body === 'object' && !(body instanceof ReadableStream)) {
    const record = body as Record<string, unknown>;
    if ('slot' in record || 'file' in record) {
      return record;
    }
  }
  try {
    const formData = await request.formData();
    const out: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  } catch {
    return null;
  }
}

export const uploadsController = new Elysia({ prefix: '/api/uploads' })
  .use(authPlugin)

  // POST /api/uploads/artifact — Authenticated multipart file upload (single-shot & chunked)
  .post('/artifact', async ({ body, request, currentUser, set }) => {
    if (!currentUser || !currentUser.id) {
      set.status = 401;
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนอัปโหลดไฟล์ประกอบผลงาน',
      };
    }

    const fields = await extractUploadFields(body, request);
    if (!fields) {
      set.status = 400;
      return {
        success: false,
        message: 'รูปแบบข้อมูลการอัปโหลดไม่ถูกต้อง (ต้องเป็น multipart/form-data)',
      };
    }

    const rawSlot = String(fields.slot || '').trim() as ArtifactSlot;
    const rule = SLOT_RULES[rawSlot];
    if (!rule) {
      set.status = 400;
      return {
        success: false,
        message: 'ประเภทช่องไฟล์อัปโหลดไม่ถูกต้อง (ต้องเป็น proposal, video, image, poster หรือ presentation)',
      };
    }

    const fileEntry = fields.file;
    if (!fileEntry || !(fileEntry instanceof Blob)) {
      set.status = 400;
      return {
        success: false,
        message: `กรุณาเลือกไฟล์สำหรับ ${rule.labelTh}`,
      };
    }

    const entryName = 'name' in fileEntry && typeof fileEntry.name === 'string' ? fileEntry.name : '';
    const originalName = String(fields.originalName || entryName || 'uploaded-file');
    const ext = path.extname(originalName).toLowerCase();
    if (!ext || !rule.extensions.includes(ext)) {
      set.status = 400;
      return {
        success: false,
        message: `ชนิดไฟล์ไม่รองรับสำหรับ${rule.labelTh} (รองรับเฉพาะ ${rule.extensions.join(', ')})`,
      };
    }

    if (fileEntry.size <= 0) {
      set.status = 400;
      return {
        success: false,
        message: 'ไฟล์ที่เลือกไม่มีข้อมูล (0 ไบต์)',
      };
    }

    const maxMb = Math.round(rule.maxSizeBytes / (1024 * 1024));
    if (fileEntry.size > rule.maxSizeBytes) {
      set.status = 400;
      return {
        success: false,
        message: `ไฟล์มีขนาดใหญ่เกินกำหนดสำหรับ${rule.labelTh} (สูงสุด ${maxMb} MB)`,
      };
    }

    const rawYear = String(fields.year || '2569').trim();
    const safeYear = /^\d{4}$/.test(rawYear) ? rawYear : '2569';

    const targetDir = path.join(UPLOADS_ROOT, safeYear, rawSlot);
    await mkdir(targetDir, { recursive: true });

    // Chunked Upload Mode (used automatically for large video/PDF files to prevent 502/OOM/proxy timeouts)
    if (fields.chunkIndex !== undefined && fields.totalChunks !== undefined) {
      const chunkIndex = Number.parseInt(String(fields.chunkIndex), 10);
      const totalChunks = Number.parseInt(String(fields.totalChunks), 10);
      const rawUploadId = String(fields.uploadId || '').trim();
      const declaredTotalSize = Number(fields.totalSize || fileEntry.size || 0);

      if (
        !Number.isInteger(chunkIndex) ||
        chunkIndex < 0 ||
        !Number.isInteger(totalChunks) ||
        totalChunks < 1 ||
        chunkIndex >= totalChunks ||
        !/^[a-zA-Z0-9_-]{6,64}$/.test(rawUploadId)
      ) {
        set.status = 400;
        return {
          success: false,
          message: 'พารามิเตอร์การอัปโหลดแบบแบ่งส่วน (Chunk) ไม่ถูกต้อง',
        };
      }

      if (declaredTotalSize > rule.maxSizeBytes) {
        set.status = 400;
        return {
          success: false,
          message: `ไฟล์มีขนาดใหญ่เกินกำหนดสำหรับ${rule.labelTh} (สูงสุด ${maxMb} MB)`,
        };
      }

      const tempPartPath = path.join(targetDir, `.part-${rawUploadId}${ext}`);
      if (chunkIndex === 0) {
        await Bun.write(tempPartPath, fileEntry);
      } else {
        const chunkBytes = new Uint8Array(await fileEntry.arrayBuffer());
        await appendFile(tempPartPath, chunkBytes);
      }

      const partStat = await stat(tempPartPath);
      if (partStat.size > rule.maxSizeBytes) {
        await unlink(tempPartPath).catch(() => {});
        set.status = 400;
        return {
          success: false,
          message: `ไฟล์มีขนาดใหญ่เกินกำหนดสำหรับ${rule.labelTh} (สูงสุด ${maxMb} MB)`,
        };
      }

      if (chunkIndex + 1 < totalChunks) {
        return {
          success: true,
          partial: true,
          message: `อัปโหลดส่วนที่ ${chunkIndex + 1}/${totalChunks} สำเร็จ`,
          data: {
            chunkIndex,
            totalChunks,
            receivedBytes: partStat.size,
          },
        };
      }

      const safeStem = sanitizeBaseName(originalName);
      const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const storedFilename = `${uniqueSuffix}-${safeStem}${ext}`;
      const fullDiskPath = path.join(targetDir, storedFilename);

      await rename(tempPartPath, fullDiskPath);

      const publicUrl = `/api/uploads/files/${safeYear}/${rawSlot}/${storedFilename}`;
      const mimeType = MIME_BY_EXTENSION[ext] || fileEntry.type || 'application/octet-stream';

      return {
        success: true,
        message: `อัปโหลด${rule.labelTh}สำเร็จ`,
        data: {
          url: publicUrl,
          slot: rawSlot,
          year: safeYear,
          originalName,
          storedFilename,
          size: partStat.size,
          mimeType,
        },
      };
    }

    const safeStem = sanitizeBaseName(originalName);
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const storedFilename = `${uniqueSuffix}-${safeStem}${ext}`;
    const fullDiskPath = path.join(targetDir, storedFilename);

    await Bun.write(fullDiskPath, fileEntry);

    const publicUrl = `/api/uploads/files/${safeYear}/${rawSlot}/${storedFilename}`;
    const mimeType = MIME_BY_EXTENSION[ext] || fileEntry.type || 'application/octet-stream';

    return {
      success: true,
      message: `อัปโหลด${rule.labelTh}สำเร็จ`,
      data: {
        url: publicUrl,
        slot: rawSlot,
        year: safeYear,
        originalName,
        storedFilename,
        size: fileEntry.size,
        mimeType,
      },
    };
  })

  // GET /api/uploads/files/:year/:slot/:filename — Serve uploaded artifact with HTTP Range support
  .get('/files/:year/:slot/:filename', async ({ params, request, set }) => {
    const { year, slot, filename } = params;

    if (
      !SAFE_SEGMENT_REGEX.test(year) ||
      !SAFE_SEGMENT_REGEX.test(slot) ||
      !SAFE_SEGMENT_REGEX.test(filename) ||
      year.includes('..') ||
      slot.includes('..') ||
      filename.includes('..')
    ) {
      set.status = 400;
      return {
        success: false,
        message: 'พารามิเตอร์ชื่อไฟล์ไม่ถูกต้อง',
      };
    }

    const resolvedPath = path.resolve(UPLOADS_ROOT, year, slot, filename);
    if (!resolvedPath.startsWith(UPLOADS_ROOT + path.sep)) {
      set.status = 400;
      return {
        success: false,
        message: 'ไม่อนุญาตให้เข้าถึงพาธนอกโฟลเดอร์อัปโหลด',
      };
    }

    const bunFile = Bun.file(resolvedPath);
    const exists = await bunFile.exists();
    if (!exists) {
      set.status = 404;
      return {
        success: false,
        message: 'ไม่พบไฟล์ที่ร้องขอ',
      };
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_BY_EXTENSION[ext] || bunFile.type || 'application/octet-stream';
    const totalSize = bunFile.size;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader && rangeHeader.startsWith('bytes=')) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = Number.parseInt(parts[0] || '0', 10);
      const end = parts[1] ? Number.parseInt(parts[1], 10) : totalSize - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end >= totalSize || start > end) {
        return new Response(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${totalSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const sliced = bunFile.slice(start, end + 1);
      const chunkBytes = await sliced.arrayBuffer();
      return new Response(chunkBytes, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new Response(bunFile, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(totalSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  });
