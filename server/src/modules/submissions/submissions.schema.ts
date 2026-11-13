import { t } from 'elysia';

const memberObjectSchema = t.Object({
  fullName: t.String(),
  role: t.Optional(t.String()),
  idCard: t.Optional(t.String()),
});

const coordinatorObjectSchema = t.Object({
  name: t.Optional(t.String()),
  idCard: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  email: t.Optional(t.String()),
});

const filesObjectSchema = t.Object({
  proposalPdfUrl: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  posterUrl: t.Optional(t.String()),
  imageUrl: t.Optional(t.String()),
  presentationUrl: t.Optional(t.String()),
});

export const submissionPayloadSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  titleTh: t.String({ minLength: 3 }),
  titleEn: t.Optional(t.String()),
  category: t.String(), // category code or id
  educationLevel: t.String(), // level code or id
  year: t.Optional(t.Union([t.Number(), t.String()])),
  teamName: t.Optional(t.String()),
  affiliation: t.Optional(t.String()),
  institution: t.Optional(t.String()),
  advisorName: t.Optional(t.String()),
  members: t.Optional(
    t.Union([t.Array(t.String()), t.Array(memberObjectSchema), t.String()])
  ),
  primaryCoordinator: t.Optional(coordinatorObjectSchema),
  secondaryCoordinator: t.Optional(coordinatorObjectSchema),
  files: t.Optional(filesObjectSchema),
  authorName: t.Optional(t.String()),
  abstractTh: t.Optional(t.String()),
  abstractEn: t.Optional(t.String()),
  proposalPdfUrl: t.Optional(t.String()),
  coverImage: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  posterUrl: t.Optional(t.String()),
  presentationUrl: t.Optional(t.String()),
  documentUrl: t.Optional(t.String()),
  round1Status: t.Optional(t.String()),
  round2Status: t.Optional(t.String()),
  round3Status: t.Optional(t.String()),
  round3Result: t.Optional(t.String()),
  hasPrototypeConfirmed: t.Optional(t.Boolean()),
  isDraft: t.Optional(t.Boolean()),
});

export const updateArtifactsSchema = t.Object({
  proposalPdfUrl: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  posterUrl: t.Optional(t.String()),
  imageUrl: t.Optional(t.String()),
  coverImage: t.Optional(t.String()),
  presentationUrl: t.Optional(t.String()),
  documentUrl: t.Optional(t.String()),
});

export const updateStatusSchema = t.Object({
  status: t.Optional(t.String()), // 'draft' | 'submitted' | 'under_review' | 'passed_first_round' | 'finalist' | 'awarded' | 'rejected'
  round1Status: t.Optional(t.String()), // 'PENDING' | 'PASSED' | 'FAILED'
  round2Status: t.Optional(t.String()),
  round3Status: t.Optional(t.String()),
  round3Result: t.Optional(t.String()),
  feedback: t.Optional(t.String()),
  awardTier: t.Optional(t.String()),
  awardNameTh: t.Optional(t.String()),
  prizeDetails: t.Optional(t.String()),
});
