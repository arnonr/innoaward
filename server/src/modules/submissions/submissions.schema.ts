import { t } from 'elysia';

export const submissionPayloadSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  titleTh: t.String({ minLength: 3 }),
  titleEn: t.Optional(t.String()),
  category: t.String(), // category code or id
  educationLevel: t.String(), // level code or id
  year: t.Optional(t.Union([t.Number(), t.String()])),
  teamName: t.Optional(t.String()),
  advisorName: t.Optional(t.String()),
  members: t.Optional(t.Union([t.Array(t.String()), t.String()])),
  authorName: t.Optional(t.String()),
  abstractTh: t.Optional(t.String()),
  abstractEn: t.Optional(t.String()),
  coverImage: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  documentUrl: t.Optional(t.String()),
  isDraft: t.Optional(t.Boolean()),
});

export const updateStatusSchema = t.Object({
  status: t.String(), // 'draft' | 'submitted' | 'under_review' | 'passed_first_round' | 'finalist' | 'awarded' | 'rejected'
  feedback: t.Optional(t.String()),
  awardTier: t.Optional(t.String()),
  awardNameTh: t.Optional(t.String()),
  prizeDetails: t.Optional(t.String()),
});
