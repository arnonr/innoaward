import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { prisma } from '../lib/prisma';
import type { Role } from '@prisma/client';

export const JWT_SECRET = process.env.JWT_SECRET || 'kmutnb_innoaward_super_secret_jwt_key_2026';

export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET,
      exp: '7d',
    })
  )
  .derive({ as: 'scoped' }, async ({ jwt, headers, set }) => {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { currentUser: null };
    }

    const token = authHeader.slice(7).trim();
    const payload = await jwt.verify(token);

    if (!payload || !payload.sub) {
      return { currentUser: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: String(payload.sub) },
      include: { educationLevel: true },
    });

    return { currentUser: user };
  });

export function requireAuth(roles?: Role[]) {
  return (app: Elysia) =>
    app.use(authPlugin).onBeforeHandle(({ currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return {
          success: false,
          message: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ (Unauthorized)',
        };
      }

      if (roles && roles.length > 0 && !roles.includes(currentUser.role)) {
        set.status = 403;
        return {
          success: false,
          message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (Forbidden)',
        };
      }
    });
}
