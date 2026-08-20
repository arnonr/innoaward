import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authController } from './modules/auth/auth.controller';
import { submissionsController } from './modules/submissions/submissions.controller';
import { winnersController } from './modules/winners/winners.controller';
import { announcementsController } from './modules/announcements/announcements.controller';
import { mastersController } from './modules/masters/masters.controller';
import { configController } from './modules/config/config.controller';

const PORT = Number(process.env.PORT) || 3001;

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'KMUTNB Innovation Awards 2026 API',
          version: '2.0.0',
          description: 'Production Backend API Engine built with Bun, Elysia.js, Prisma ORM, and PostgreSQL 18',
        },
        tags: [
          { name: 'Authentication', description: 'User registration, login, and JWT session verification' },
          { name: 'Submissions', description: 'Contestant submissions, draft management, and tracking code status lookup' },
          { name: 'Winners', description: 'Hall of Fame awarded projects and historical records' },
          { name: 'Announcements', description: 'Official competition announcements and finalists rosters' },
          { name: 'Masters', description: 'Master catalog for competition years, innovation categories, and education levels' },
          { name: 'Config', description: 'Dynamic competition event settings and system health check' },
        ],
      },
    })
  )
  // Global Error Handling
  .onError(({ code, error, set }) => {
    console.error(`[API Error] [${code}]:`, error);

    if (code === 'VALIDATION') {
      set.status = 422;
      return {
        success: false,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้องตามรูปแบบที่กำหนด (Validation Error)',
        errors: error.all,
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        message: 'ไม่พบเส้นทาง API ที่ร้องขอ (Not Found)',
      };
    }

    set.status = 500;
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์ (Internal Server Error)',
    };
  })
  // Mount Domain Modules
  .use(configController)
  .use(authController)
  .use(submissionsController)
  .use(winnersController)
  .use(announcementsController)
  .use(mastersController);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT);
  console.log(`🚀 KMUTNB Innovation Awards 2026 PostgreSQL Engine running at http://${app.server?.hostname}:${app.server?.port}`);
  console.log(`📑 Interactive Swagger UI available at http://${app.server?.hostname}:${app.server?.port}/swagger`);
}

export default app;
