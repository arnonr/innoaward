import { t } from 'elysia';

export const registerSchema = t.Object({
  email: t.String({ format: 'email', minLength: 3 }),
  password: t.Optional(t.String({ minLength: 6 })),
  fullName: t.String({ minLength: 2 }),
  phone: t.Optional(t.String()),
  institution: t.Optional(t.String()),
  educationLevel: t.Optional(t.String()), // 'general_public' | 'higher_education' | 'below_higher' (or legacy 'higher_and_above' / ID)
});

export const loginSchema = t.Object({
  email: t.String(),
  password: t.Optional(t.String()),
});
