export interface NormalizedMember {
  fullName: string;
  role: string;
  idCard: string;
}

export function maskIdCard(raw: string | null | undefined): string {
  const cleaned = (raw || '').trim();
  if (!cleaned) return '';

  const digitsOnly = cleaned.replace(/-/g, '');
  if (/^\d{13}$/.test(digitsOnly)) {
    return `${digitsOnly[0]}-${digitsOnly.slice(1, 5)}-XXXXX-XX-X`;
  }

  if (cleaned.length >= 4) {
    const middleMask = 'X'.repeat(Math.max(3, cleaned.length - 4));
    return `${cleaned.slice(0, 2)}${middleMask}${cleaned.slice(-2)}`;
  }

  return 'XXXX';
}

export function maskPhone(raw: string | null | undefined): string {
  const cleaned = (raw || '').trim();
  if (!cleaned) return '';

  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-XXX-${digitsOnly.slice(6)}`;
  }

  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 3)}-XXX-${cleaned.slice(-4)}`;
  }

  return 'XXX-XXX-XXXX';
}

export function maskEmail(raw: string | null | undefined): string {
  const cleaned = (raw || '').trim();
  if (!cleaned || !cleaned.includes('@')) return '';

  const [localPart, domain] = cleaned.split('@');
  if (!localPart || !domain) return '';

  return `${localPart[0]}***@${domain}`;
}

export function normalizeMembersInput(
  members: unknown,
  fallbackName: string
): NormalizedMember[] {
  const result: NormalizedMember[] = [];

  if (Array.isArray(members)) {
    members.forEach((item, idx) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) {
          result.push({
            fullName: trimmed,
            role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก',
            idCard: '',
          });
        }
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const fullName = String(obj.fullName || obj.name || '').trim();
        if (fullName) {
          result.push({
            fullName,
            role: String(obj.role || (idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก')).trim(),
            idCard: String(obj.idCard || '').trim(),
          });
        }
      }
    });
  } else if (typeof members === 'string') {
    members
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .forEach((name, idx) => {
        result.push({
          fullName: name,
          role: idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก',
          idCard: '',
        });
      });
  }

  if (result.length === 0) {
    result.push({
      fullName: fallbackName || 'หัวหน้าทีม',
      role: 'หัวหน้าทีม',
      idCard: '',
    });
  }

  return result;
}

export function formatDossierResponse(found: any, isOwnerOrAdmin: boolean) {
  const rawMembers: Array<any> = Array.isArray(found.members) ? found.members : [];

  const memberDetails = rawMembers.map((m, idx) => ({
    orderIndex: m.orderIndex || idx + 1,
    fullName: m.fullName,
    role: m.role || (idx === 0 ? 'หัวหน้าทีม' : 'สมาชิก'),
    idCard: isOwnerOrAdmin ? m.idCard || '' : maskIdCard(m.idCard),
  }));

  const proposalPdfUrl = found.proposalPdfUrl || found.documentUrl || '';
  const videoUrl = found.videoUrl || '';
  const posterUrl = found.posterUrl || '';
  const imageUrl = found.coverImage || found.image || '';
  const presentationUrl = found.presentationUrl || '';

  const round1Status =
    found.round1Status ||
    (['PASSED_FIRST_ROUND', 'FINALIST', 'AWARDED'].includes(found.status) ? 'PASSED' : 'PENDING');
  const round2Status =
    found.round2Status ||
    (['FINALIST', 'AWARDED'].includes(found.status) ? 'PASSED' : 'PENDING');
  const round3Status =
    found.round3Status || (found.status === 'AWARDED' ? 'PASSED' : 'PENDING');
  const round3Result = found.round3Result || found.awardNameTh || '';

  return {
    id: found.id,
    trackingCode: found.trackingCode,
    titleTh: found.titleTh,
    titleEn: found.titleEn || '',
    category: found.category?.code || '',
    categoryNameTh: found.category?.nameTh || '',
    categoryNameEn: found.category?.nameEn || '',
    educationLevel: found.educationLevel?.code || '',
    educationLevelNameTh: found.educationLevel?.nameTh || '',
    teamName: found.teamName,
    affiliation: found.affiliation || found.institution || '',
    institution: found.institution || found.affiliation || '',
    advisorName: found.advisorName || '',
    abstractTh: found.abstractTh || '',
    abstractEn: found.abstractEn || '',
    status: found.status,
    round1Status,
    round2Status,
    round3Status,
    round3Result,
    rounds: {
      round1: {
        label: 'รอบคัดเลือกเอกสาร',
        status: round1Status,
      },
      round2: {
        label: 'รอบการประกวดออนไลน์',
        status: round2Status,
      },
      round3: {
        label: 'รอบตัดสิน',
        status: round3Status,
        result: round3Result,
      },
    },
    primaryCoordinator: {
      name: found.primaryCoordName || '',
      idCard: isOwnerOrAdmin
        ? found.primaryCoordIdCard || ''
        : maskIdCard(found.primaryCoordIdCard),
      phone: isOwnerOrAdmin
        ? found.primaryCoordPhone || ''
        : maskPhone(found.primaryCoordPhone),
      email: isOwnerOrAdmin
        ? found.primaryCoordEmail || ''
        : maskEmail(found.primaryCoordEmail),
    },
    secondaryCoordinator: {
      name: found.secondaryCoordName || '',
      idCard: isOwnerOrAdmin
        ? found.secondaryCoordIdCard || ''
        : maskIdCard(found.secondaryCoordIdCard),
      phone: isOwnerOrAdmin
        ? found.secondaryCoordPhone || ''
        : maskPhone(found.secondaryCoordPhone),
      email: isOwnerOrAdmin
        ? found.secondaryCoordEmail || ''
        : maskEmail(found.secondaryCoordEmail),
    },
    artifacts: {
      proposalPdfUrl,
      videoUrl,
      posterUrl,
      imageUrl,
      presentationUrl,
    },
    coverImage: imageUrl,
    videoUrl,
    documentUrl: proposalPdfUrl,
    posterUrl,
    presentationUrl,
    submittedAt: found.submittedAt,
    updatedAt: found.updatedAt,
    year: found.competitionYear?.year || 2570,
    members: rawMembers.map((m) => m.fullName),
    memberDetails,
    feedback: found.feedback || 'เอกสารเรียบร้อย อยู่ระหว่างการพิจารณาจากคณะกรรมการ',
  };
}
