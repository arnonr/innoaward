export const ARTIFACT_SLOT_CONFIG = {
  proposal: {
    slot: 'proposal',
    labelTh: 'ไฟล์ข้อเสนอโครงการ (PDF)',
    extensions: ['.pdf'],
    extensionsLabel: 'PDF (.pdf)',
    maxSizeBytes: 30 * 1024 * 1024,
    maxSizeLabel: '30 MB',
    hintTh: 'ลากไฟล์ PDF มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 30 MB)',
    accept: {
      'application/pdf': ['.pdf'],
    },
  },
  video: {
    slot: 'video',
    labelTh: 'คลิปวิดีโอนำเสนอผลงาน (2–3 นาที)',
    extensions: ['.mp4', '.webm', '.mov'],
    extensionsLabel: 'MP4, WebM, MOV (.mp4, .webm, .mov)',
    maxSizeBytes: 300 * 1024 * 1024,
    maxSizeLabel: '300 MB',
    hintTh: 'ลากไฟล์วิดีโอ (ความยาว 2–3 นาที) มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 300 MB)',
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
    },
  },
  image: {
    slot: 'image',
    labelTh: 'รูปภาพผลงาน / ชิ้นงานต้นแบบ',
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    extensionsLabel: 'JPG, PNG, WebP (.jpg, .png, .webp)',
    maxSizeBytes: 15 * 1024 * 1024,
    maxSizeLabel: '15 MB',
    hintTh: 'ลากไฟล์รูปภาพผลงานมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 15 MB)',
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  },
  poster: {
    slot: 'poster',
    labelTh: 'โปสเตอร์นำเสนอผลงาน (Poster)',
    extensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    extensionsLabel: 'PDF, JPG, PNG, WebP (.pdf, .jpg, .png, .webp)',
    maxSizeBytes: 30 * 1024 * 1024,
    maxSizeLabel: '30 MB',
    hintTh: 'ลากไฟล์โปสเตอร์ (PDF หรือรูปภาพ) มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 30 MB)',
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  },
  presentation: {
    slot: 'presentation',
    labelTh: 'สไลด์นำเสนอผลงาน (Presentation)',
    extensions: ['.pdf', '.ppt', '.pptx'],
    extensionsLabel: 'PDF, PowerPoint (.pdf, .ppt, .pptx)',
    maxSizeBytes: 50 * 1024 * 1024,
    maxSizeLabel: '50 MB',
    hintTh: 'ลากไฟล์สไลด์นำเสนอ (PDF หรือ PowerPoint) มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 50 MB)',
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
  },
};

export function validateArtifactFile(file, slot) {
  const config = ARTIFACT_SLOT_CONFIG[slot];
  if (!config) {
    return { valid: false, error: 'ประเภทช่องไฟล์ไม่ถูกต้อง' };
  }
  if (!file || !file.name) {
    return { valid: false, error: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' };
  }

  const dotIdx = file.name.lastIndexOf('.');
  const ext = dotIdx >= 0 ? file.name.slice(dotIdx).toLowerCase() : '';
  if (!ext || !config.extensions.includes(ext)) {
    return {
      valid: false,
      error: `ชนิดไฟล์ไม่รองรับสำหรับ${config.labelTh} (รองรับเฉพาะ ${config.extensions.join(', ')})`,
    };
  }

  if (typeof file.size === 'number' && file.size <= 0) {
    return { valid: false, error: 'ไฟล์ที่เลือกไม่มีข้อมูล (0 ไบต์)' };
  }

  if (typeof file.size === 'number' && file.size > config.maxSizeBytes) {
    return {
      valid: false,
      error: `ไฟล์มีขนาดใหญ่เกินกำหนดสำหรับ${config.labelTh} (สูงสุด ${config.maxSizeLabel})`,
    };
  }

  return { valid: true, error: '' };
}

export function formatFileSize(bytes) {
  const num = Number(bytes);
  if (!Number.isFinite(num) || num <= 0) return '0 B';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

export function resolveServerUploadUrl(path, apiBase = 'http://localhost:3001/api', baseUrl = '/') {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Server-uploaded files live at /api/uploads/files/...
  if (path.startsWith('/api/uploads/')) {
    const normalizedApi = String(apiBase || 'http://localhost:3001/api').replace(/\/+$/, '');
    const apiRoot = normalizedApi.endsWith('/api')
      ? normalizedApi.slice(0, -4)
      : normalizedApi;
    return `${apiRoot}${path}`;
  }

  const rawBase = baseUrl || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  if (base !== '/' && path.startsWith(base)) {
    return path;
  }

  const baseNoSlash = base.replace(/^\/+|\/+$/g, '');
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (baseNoSlash && cleanPath.startsWith(`${baseNoSlash}/`)) {
    return `/${cleanPath}`;
  }

  return `${base}${cleanPath}`;
}

export function detectArtifactPreviewKind(url) {
  if (!url || typeof url !== 'string') return 'none';
  const clean = url.split('?')[0].toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/.test(clean)) return 'image';
  if (/\.(mp4|webm|mov)$/.test(clean)) return 'video';
  if (/\.pdf$/.test(clean)) return 'pdf';
  if (/\.(ppt|pptx)$/.test(clean)) return 'slides';
  return 'none';
}

export function extractArtifactDisplayName(url) {
  if (!url || typeof url !== 'string') return '';
  const clean = url.split('?')[0];
  const segments = clean.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || url;
  // Strip timestamp-uuid prefix generated by server (<digits>-<8hex>-<name>)
  return last.replace(/^\d+-[a-f0-9]{8}-/i, '');
}
