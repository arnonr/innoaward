import { Elysia } from 'elysia';
import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/auth-utils';
import { authPlugin, requireAuth } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { Role } from '@prisma/client';

export const authController = new Elysia({ prefix: '/api/auth' })
  .use(authPlugin)

  // Register New User
  .post(
    '/register',
    async ({ body, jwt, set }) => {
      const { email, password, fullName, phone, institution, educationLevel } = body;

      const normalizedEmail = email.toLowerCase().trim();

      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        set.status = 400;
        return {
          success: false,
          message: 'อีเมลนี้มีอยู่ในระบบแล้ว โปรดเข้าสู่ระบบ',
        };
      }

      // Find education level (resolve by code or id; fallback to 'general_public', then first active)
      const requestedLevel = educationLevel?.trim();
      let level = requestedLevel
        ? await prisma.educationLevel.findFirst({
            where: {
              OR: [{ code: requestedLevel }, { id: requestedLevel }],
            },
          })
        : null;

      if (!level) {
        level = await prisma.educationLevel.findFirst({
          where: { code: 'general_public' },
        });
      }

      if (!level) {
        level = await prisma.educationLevel.findFirst({
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        });
      }

      if (!level) {
        set.status = 500;
        return {
          success: false,
          message: 'ไม่พบข้อมูลระดับผู้เข้าแข่งขันในระบบ',
        };
      }

      const rawPassword = password || 'Contestant2026!';
      const passwordHash = await hashPassword(rawPassword);

      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName,
          phone: phone || '',
          institution: institution || 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',
          educationLevelId: level!.id,
          role: Role.CONTESTANT,
        },
        include: {
          educationLevel: true,
        },
      });

      const token = await jwt.sign({
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return {
        success: true,
        message: 'ลงทะเบียนสำเร็จเข้าสู่ระบบเรียบร้อย',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          phone: newUser.phone,
          institution: newUser.institution,
          role: newUser.role,
          educationLevel: {
            id: newUser.educationLevel.id,
            code: newUser.educationLevel.code,
            nameTh: newUser.educationLevel.nameTh,
            nameEn: newUser.educationLevel.nameEn,
          },
        },
      };
    },
    {
      body: registerSchema,
    }
  )

  // Login User
  .post(
    '/login',
    async ({ body, jwt, set }) => {
      const { email, password } = body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { educationLevel: true },
      });

      if (!user || !password) {
        set.status = 401;
        return {
          success: false,
          message: 'ไม่พบบัญชีอีเมลนี้ หรือรหัสผ่านไม่ถูกต้อง โปรดลองใหม่อีกครั้ง',
        };
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        set.status = 401;
        return {
          success: false,
          message: 'รหัสผ่านไม่ถูกต้อง โปรดลองใหม่อีกครั้ง',
        };
      }

      const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          institution: user.institution,
          role: user.role,
          educationLevel: {
            id: user.educationLevel.id,
            code: user.educationLevel.code,
            nameTh: user.educationLevel.nameTh,
            nameEn: user.educationLevel.nameEn,
          },
        },
      };
    },
    {
      body: loginSchema,
    }
  )

  // Get Current Authenticated User Profile
  .get('/me', async ({ currentUser, set }) => {
    if (!currentUser) {
      set.status = 401;
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ (Unauthorized)',
      };
    }

    return {
      success: true,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        institution: currentUser.institution,
        role: currentUser.role,
        educationLevel: currentUser.educationLevel,
      },
    };
  });
