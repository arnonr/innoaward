import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { mastersController } from "../src/modules/masters/masters.controller";
import { configController } from "../src/modules/config/config.controller";
import { authController } from "../src/modules/auth/auth.controller";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";

describe("Masters & Config API Modules", () => {
  const app = new Elysia()
    .use(authController)
    .use(mastersController)
    .use(configController);

  test("GET /api/masters/years returns list of competition years", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/years"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(4);
    
    const year2570 = json.data.find((y: any) => y.year === 2570);
    expect(year2570).toBeDefined();
    expect(year2570.isCurrent).toBe(true);
  });

  test("GET /api/masters/years/2570/categories returns categories for year 2570", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/years/2570/categories"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(5);
    expect(json.data[0].category.code).toBeDefined();
  });

  test("GET /api/masters/categories returns master category catalog", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/categories"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(5);
  });

  test("GET /api/masters/education-levels returns 2 education levels", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/education-levels"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(2);
  });

  test("GET /api/config returns combined competition config from database", async () => {
    const response = await app.handle(new Request("http://localhost/api/config"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.event).toBeDefined();
    expect(json.event.nameTh).toContain("2570");
    expect(json.event.submissionDeadline).toContain("2027-02-28");
    expect(json.categories.length).toBe(5);
    expect(json.educationLevels.length).toBe(2);
    expect(json.educationLevels.some((l: any) => l.nameTh === "ระดับอุดมศึกษาและบุคคลทั่วไป")).toBe(true);
    expect(json.totalPrizePool).toBe(180000);
    expect(json.prizes.length).toBe(2);
    expect(json.prizes[0].title).toContain("40,000");
    expect(json.prizes[1].title).toContain("30,000");
    expect(json.prizes.every((p: any) => !p.title.includes("โล่"))).toBe(true);
  });

  test("PATCH /api/config/deadline rejects non-admin and allows ADMIN to update submissionDeadline", async () => {
    const unauthRes = await app.handle(
      new Request("http://localhost/api/config/deadline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionDeadline: "2027-03-15T16:59:59.000Z" }),
      })
    );
    expect([401, 403]).toContain(unauthRes.status);

    // Register a user and promote to ADMIN
    const adminEmail = `admin-deadline-${Date.now()}@kmutnb.ac.th`;
    const regRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: "AdminPassword2027!",
          fullName: "Admin Deadline Tester",
          educationLevel: "higher_and_above",
        }),
      })
    );
    const regJson = await regRes.json();
    await prisma.user.update({
      where: { id: regJson.user.id },
      data: { role: Role.ADMIN },
    });

    const currentYearBefore = await prisma.competitionYear.findFirst({
      where: { isCurrent: true },
    });

    try {
      const adminRes = await app.handle(
        new Request("http://localhost/api/config/deadline", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${regJson.token}`,
          },
          body: JSON.stringify({ submissionDeadline: "2027-03-15T16:59:59.000Z" }),
        })
      );
      expect(adminRes.status).toBe(200);
      const adminJson = await adminRes.json();
      expect(adminJson.success).toBe(true);
      expect(adminJson.submissionDeadline).toBe("2027-03-15T16:59:59.000Z");
    } finally {
      if (currentYearBefore) {
        await prisma.competitionYear.update({
          where: { id: currentYearBefore.id },
          data: { submissionEnd: currentYearBefore.submissionEnd },
        });
      }
    }
  });

  test("PATCH /api/config/rubric, POST /api/config/categories, and POST /api/config/years support multi-year rubric and dynamic categories", async () => {
    const adminEmail = `admin-multiyear-${Date.now()}@kmutnb.ac.th`;
    const regRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: "AdminPassword2027!",
          fullName: "Admin MultiYear Tester",
          educationLevel: "higher_and_above",
        }),
      })
    );
    const regJson = await regRes.json();
    await prisma.user.update({
      where: { id: regJson.user.id },
      data: { role: Role.ADMIN },
    });
    const adminToken = regJson.token;

    // 1. PATCH /api/config/rubric rejects weights summing to 90 (400)
    const badRubricRes = await app.handle(
      new Request("http://localhost/api/config/rubric", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          year: 2570,
          criteria: [
            { id: "c1", titleTh: "ความคิดสร้างสรรค์", weight: 50 },
            { id: "c2", titleTh: "ความสมบูรณ์ต้นแบบ", weight: 40 },
          ],
        }),
      })
    );
    expect(badRubricRes.status).toBe(400);

    // 2. PATCH /api/config/rubric accepts weights summing to 100 (200)
    const validRubricRes = await app.handle(
      new Request("http://localhost/api/config/rubric", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          year: 2570,
          criteria: [
            { id: "creativity", titleTh: "ความคิดสร้างสรรค์และความใหม่ของนวัตกรรม", weight: 30 },
            { id: "prototype", titleTh: "ความสมบูรณ์และประสิทธิภาพของชิ้นงานต้นแบบ", weight: 25 },
            { id: "impact", titleTh: "การนำไปใช้งานจริงและผลกระทบที่วัดผลได้", weight: 20 },
            { id: "sustainability", titleTh: "ศักยภาพเชิงพาณิชย์ สังคม และความยั่งยืน", weight: 15 },
            { id: "presentation", titleTh: "ความชัดเจนของเอกสาร โปสเตอร์ และการนำเสนอ", weight: 10 },
          ],
        }),
      })
    );
    expect(validRubricRes.status).toBe(200);
    const validRubricJson = await validRubricRes.json();
    expect(validRubricJson.success).toBe(true);
    expect(validRubricJson.rubricConfig[0].weight).toBe(30);

    const dynamicCatCode = `ai_robotics_${Date.now()}`;
    const testFutureYear = 2599;
    try {
      // 3. POST /api/config/categories adds a 6th category dynamically for year 2570
      const addCatRes = await app.handle(
        new Request("http://localhost/api/config/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            year: 2570,
            code: dynamicCatCode,
            nameTh: "AI & Robotics (ปัญญาประดิษฐ์และหุ่นยนต์อัจฉริยะ)",
            nameEn: "AI & Robotics",
            descriptionTh: "นวัตกรรมหุ่นยนต์และระบบอัตโนมัติอัจฉริยะ",
            color: "#8B5CF6",
            isActive: true,
          }),
        })
      );
      expect(addCatRes.status).toBe(200);

      const cfgRes = await app.handle(new Request("http://localhost/api/config?year=2570"));
      const cfgJson = await cfgRes.json();
      expect(cfgJson.categories.some((c: any) => c.id === dynamicCatCode)).toBe(true);
      expect(Array.isArray(cfgJson.rubricConfig)).toBe(true);
      expect(cfgJson.rubricConfig[0].weight).toBe(30);
      expect(Array.isArray(cfgJson.years)).toBe(true);

      // 4. POST /api/config/years creates future competition year and clones active categories + rubric
      const newYearRes = await app.handle(
        new Request("http://localhost/api/config/years", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            year: testFutureYear,
            yearAd: testFutureYear - 543,
            titleTh: `โครงการประกวดสิ่งประดิษฐ์ ประจำปี ${testFutureYear}`,
            setAsCurrent: false,
          }),
        })
      );
      expect(newYearRes.status).toBe(200);
      const newYearJson = await newYearRes.json();
      expect(newYearJson.success).toBe(true);
      expect(newYearJson.data.year).toBe(testFutureYear);

      const futureCfgRes = await app.handle(
        new Request(`http://localhost/api/config?year=${testFutureYear}`)
      );
      const futureCfgJson = await futureCfgRes.json();
      expect(futureCfgJson.event.year).toBe(testFutureYear);
      expect(futureCfgJson.categories.some((c: any) => c.id === dynamicCatCode)).toBe(true);
      expect(futureCfgJson.rubricConfig[0].weight).toBe(30);
    } finally {
      await prisma.competitionYear.deleteMany({ where: { year: testFutureYear } });
      await prisma.category.deleteMany({ where: { code: dynamicCatCode } });
    }
  });
});
