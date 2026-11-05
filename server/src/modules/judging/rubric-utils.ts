export interface RubricCriterion {
  id: string;
  titleTh: string;
  titleEn?: string;
  weight: number;
}

export const DEFAULT_RUBRIC_CONFIG: RubricCriterion[] = [
  {
    id: 'creativity',
    titleTh: 'ความคิดสร้างสรรค์และความใหม่ของนวัตกรรม',
    titleEn: 'Creativity & Novelty',
    weight: 25,
  },
  {
    id: 'prototype',
    titleTh: 'ความสมบูรณ์และประสิทธิภาพของชิ้นงานต้นแบบ',
    titleEn: 'Prototype Readiness & Performance',
    weight: 25,
  },
  {
    id: 'impact',
    titleTh: 'การนำไปใช้งานจริงและผลกระทบที่วัดผลได้',
    titleEn: 'Practical Application & Measurable Impact',
    weight: 20,
  },
  {
    id: 'sustainability',
    titleTh: 'ศักยภาพเชิงพาณิชย์ สังคม และความยั่งยืน',
    titleEn: 'Commercial, Social & Sustainability Potential',
    weight: 15,
  },
  {
    id: 'presentation',
    titleTh: 'ความชัดเจนของเอกสาร โปสเตอร์ และการนำเสนอ',
    titleEn: 'Clarity of Documentation, Poster & Presentation',
    weight: 15,
  },
];

export function normalizeRubricConfig(raw: unknown): RubricCriterion[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_RUBRIC_CONFIG.map((c) => ({ ...c }));
  }

  const cleaned: RubricCriterion[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const id = String(obj.id || `criterion_${i + 1}`).trim();
    const titleTh = String(obj.titleTh || '').trim();
    const titleEn = obj.titleEn ? String(obj.titleEn).trim() : '';
    const weight = Number(obj.weight);
    if (!id || !titleTh || !Number.isFinite(weight) || weight <= 0) continue;
    cleaned.push({ id, titleTh, titleEn, weight });
  }

  const totalWeight = cleaned.reduce((sum, c) => sum + c.weight, 0);
  if (cleaned.length === 0 || Math.round(totalWeight) !== 100) {
    return DEFAULT_RUBRIC_CONFIG.map((c) => ({ ...c }));
  }

  return cleaned;
}

export function validateRubricCriteriaInput(criteria: unknown): {
  valid: boolean;
  message?: string;
  criteria?: RubricCriterion[];
} {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return { valid: false, message: 'กรุณาระบุหัวข้อเกณฑ์การให้คะแนนอย่างน้อย 1 ข้อ' };
  }

  const normalized: RubricCriterion[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < criteria.length; i++) {
    const item = criteria[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, message: `ข้อมูลเกณฑ์ข้อที่ ${i + 1} ไม่ถูกต้อง` };
    }
    const obj = item as Record<string, unknown>;
    const id = String(obj.id || `criterion_${i + 1}`).trim();
    const titleTh = String(obj.titleTh || '').trim();
    const titleEn = obj.titleEn ? String(obj.titleEn).trim() : '';
    const weight = Number(obj.weight);

    if (!titleTh) {
      return { valid: false, message: `กรุณาระบุชื่อเกณฑ์ข้อที่ ${i + 1}` };
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      return { valid: false, message: `ค่าน้ำหนักของ "${titleTh}" ต้องมากกว่า 0%` };
    }
    if (seenIds.has(id)) {
      return { valid: false, message: `รหัสเกณฑ์ "${id}" ซ้ำกัน` };
    }
    seenIds.add(id);
    normalized.push({ id, titleTh, titleEn, weight });
  }

  const totalWeight = normalized.reduce((sum, c) => sum + c.weight, 0);
  if (Math.round(totalWeight * 100) / 100 !== 100) {
    return {
      valid: false,
      message: `ผลรวมค่าน้ำหนักของทุกเกณฑ์ต้องเท่ากับ 100% พอดี (ปัจจุบันรวมได้ ${totalWeight}%)`,
    };
  }

  return { valid: true, criteria: normalized };
}

export function computeWeightedRubricTotal(
  scores: Record<string, unknown> | null | undefined,
  criteria: RubricCriterion[]
): {
  valid: boolean;
  message?: string;
  weightedTotal?: number;
  normalizedScores?: Record<string, number>;
} {
  if (!scores || typeof scores !== 'object') {
    return { valid: false, message: 'กรุณาระบุคะแนนประเมินให้ครบทุกหัวข้อ' };
  }

  const normalizedScores: Record<string, number> = {};
  let total = 0;

  for (const c of criteria) {
    const rawVal = Number((scores as Record<string, unknown>)[c.id]);
    if (!Number.isInteger(rawVal) || rawVal < 1 || rawVal > 5) {
      return {
        valid: false,
        message: `กรุณาให้คะแนนหัวข้อ "${c.titleTh}" เป็นจำนวนเต็มตั้งแต่ 1 ถึง 5`,
      };
    }
    normalizedScores[c.id] = rawVal;
    total += (rawVal / 5) * c.weight;
  }

  const weightedTotal = Math.round(total * 100) / 100;
  return {
    valid: true,
    weightedTotal,
    normalizedScores,
  };
}
