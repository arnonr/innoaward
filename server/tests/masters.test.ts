import { test, expect, describe, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { mastersController } from "../src/modules/masters/masters.controller";
import { configController } from "../src/modules/config/config.controller";
import { authController } from "../src/modules/auth/auth.controller";
import {
  CATEGORIES_2570_DEFAULTS,
  LEVELS_2570_DEFAULTS,
  PROTOTYPE_RULE_TH,
  formatLevelPrizeSummaryLine,
} from "../src/modules/config/competition-defaults";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";

describe("Masters & Config API Modules", () => {
  const app = new Elysia()
    .use(authController)
    .use(mastersController)
    .use(configController);

  const createdUserEmails: string[] = [];

  afterAll(async () => {
    if (createdUserEmails.length > 0) {
      await prisma.user.deleteMany({
        where: { email: { in: createdUserEmails } },
      });
    }
  });

  test("GET /api/masters/years returns list of competition years", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/years"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(4);

    const year2570 = json.data.find((y: any) => y.year === 2570);
    expect(year2570).toBeDefined();
    expect(year2570.isCurrent).toBe(true);
  });

  test("GET /api/masters/years/2570/categories returns the 5 new 2570 categories", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/years/2570/categories"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(5);
    expect(json.data.map((yc: any) => yc.category.code)).toEqual([
      "agri_food",
      "health_medtech",
      "engineering_ai",
      "energy_env_material_bcg",
      "quality_of_life_soft_power",
    ]);
  });

  test("GET /api/masters/categories returns master category catalog", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/categories"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(5);
    expect(json.data.map((c: any) => c.code)).toEqual([
      "agri_food",
      "health_medtech",
      "engineering_ai",
      "energy_env_material_bcg",
      "quality_of_life_soft_power",
    ]);
  });

  test("GET /api/masters/education-levels returns 3 active education levels", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/education-levels"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(3);
    expect(json.data.map((l: any) => l.code)).toEqual([
      "general_public",
      "higher_education",
      "below_higher",
    ]);
  });

  test("GET /api/masters/years/:year/levels returns 3 levels for 2570 and 2 historical levels for 2569", async () => {
    const res2570 = await app.handle(new Request("http://localhost/api/masters/years/2570/levels"));
    expect(res2570.status).toBe(200);
    const json2570: any = await res2570.json();
    expect(json2570.success).toBe(true);
    expect(json2570.data.length).toBe(3);
    expect(json2570.data.map((yl: any) => yl.educationLevel.code)).toEqual([
      "general_public",
      "higher_education",
      "below_higher",
    ]);

    const res2569 = await app.handle(new Request("http://localhost/api/masters/years/2569/levels"));
    expect(res2569.status).toBe(200);
    const json2569: any = await res2569.json();
    expect(json2569.success).toBe(true);
    expect(json2569.data.length).toBe(2);
    expect(json2569.data.map((yl: any) => yl.educationLevel.code)).toEqual([
      "higher_and_above",
      "below_higher",
    ]);

    const res404 = await app.handle(new Request("http://localhost/api/masters/years/2999/levels"));
    expect(res404.status).toBe(404);
  });

  test("GET /api/config (default 2570) returns 3 tiers, 255,000 THB pool, 18 awards, and prototype rule", async () => {
    const response = await app.handle(new Request("http://localhost/api/config"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.event).toBeDefined();
    expect(json.event.year).toBe(2570);
    expect(json.event.nameTh).toContain("2570");
    expect(json.event.submissionDeadline).toContain("2027-02-28");
    expect(json.categories.length).toBe(5);
    expect(json.categories.map((c: any) => c.code)).toEqual([
      "agri_food",
      "health_medtech",
      "engineering_ai",
      "energy_env_material_bcg",
      "quality_of_life_soft_power",
    ]);

    expect(json.totalPrizePool).toBe(255000);
    expect(json.totalAwardCount).toBe(18);
    expect(json.educationLevels.length).toBe(3);
    expect(json.educationLevels[0].id).toBe("general_public");
    expect(json.educationLevels[0].code).toBe("general_public");
    expect(json.educationLevels[0].educationLevelId).toBeDefined();
    expect(json.educationLevels[0].isRoyalTrophy).toBe(true);
    expect(json.educationLevels[0].totalPrizeAmount).toBe(105000);
    expect(json.educationLevels[1].code).toBe("higher_education");
    expect(json.educationLevels[1].isRoyalTrophy).toBe(false);
    expect(json.educationLevels[1].trophyShortTh).toBe("ถ้วยรางวัล มจพ.");
    expect(json.educationLevels[1].totalPrizeAmount).toBe(75000);
    expect(json.educationLevels[2].code).toBe("below_higher");
    expect(json.educationLevels[2].isRoyalTrophy).toBe(false);
    expect(json.educationLevels[2].trophyShortTh).toBe("ถ้วยรางวัล มจพ.");
    expect(json.educationLevels[2].totalPrizeAmount).toBe(75000);
    expect(json.educationLevels.every((l: any) => l.requiresPrototype === true)).toBe(true);
    expect(
      json.educationLevels.every((l: any) => l.prototypeRuleTh === PROTOTYPE_RULE_TH)
    ).toBe(true);
    expect(
      json.educationLevels.every((l: any) => Array.isArray(l.prizeBreakdown) && l.prizeBreakdown.length === 4)
    ).toBe(true);

    expect(json.prizes.length).toBe(3);
    expect(json.prizes[0].title).toContain("40,000");
    expect(json.prizes[0].title).toContain("ถ้วยพระราชทานฯ");
    expect(json.prizes[1].title).toContain("30,000");
    expect(json.prizes[1].title).toContain("ถ้วยรางวัล มจพ.");
    expect(json.prizes.every((p: any) => !p.title.includes("โล่"))).toBe(true);
  });

  test("GET /api/config?year=2569 returns historical 180,000 THB pool, 2 levels, and 5 legacy categories", async () => {
    const response = await app.handle(new Request("http://localhost/api/config?year=2569"));
    expect(response.status).toBe(200);

    const json: any = await response.json();
    expect(json.event.year).toBe(2569);
    expect(json.totalPrizePool).toBe(180000);
    expect(json.totalAwardCount).toBe(12);
    expect(json.educationLevels.length).toBe(2);
    expect(json.educationLevels.map((l: any) => l.code)).toEqual([
      "higher_and_above",
      "below_higher",
    ]);
    expect(json.categories.map((c: any) => c.code)).toEqual([
      "energy_environment",
      "food_agriculture",
      "social_economy",
      "medical_device",
      "material",
    ]);
    expect(json.prizes.length).toBe(2);
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
    createdUserEmails.push(adminEmail);
    const regRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: "AdminPassword2027!",
          fullName: "Admin Deadline Tester",
          educationLevel: "general_public",
        }),
      })
    );
    const regJson: any = await regRes.json();
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
      const adminJson: any = await adminRes.json();
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

  test("PATCH /api/config/rubric, POST /api/config/categories, POST /api/config/levels, and POST /api/config/years support multi-year rollover", async () => {
    const contestantEmail = `contestant-levels-${Date.now()}@kmutnb.ac.th`;
    const adminEmail = `admin-multiyear-${Date.now()}@kmutnb.ac.th`;
    createdUserEmails.push(contestantEmail, adminEmail);

    const contestantRegRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contestantEmail,
          password: "ContestantPassword2027!",
          fullName: "Contestant Level Tester",
          educationLevel: "general_public",
        }),
      })
    );
    const contestantJson: any = await contestantRegRes.json();

    // Non-admin rejected from POST /api/config/levels (401 without token, 403 as CONTESTANT)
    const unauthLevelRes = await app.handle(
      new Request("http://localhost/api/config/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "general_public",
          nameTh: "บุคคลทั่วไป",
        }),
      })
    );
    expect([401, 403]).toContain(unauthLevelRes.status);

    const forbiddenLevelRes = await app.handle(
      new Request("http://localhost/api/config/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantJson.token}`,
        },
        body: JSON.stringify({
          code: "general_public",
          nameTh: "บุคคลทั่วไป",
        }),
      })
    );
    expect(forbiddenLevelRes.status).toBe(403);

    const regRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: "AdminPassword2027!",
          fullName: "Admin MultiYear Tester",
          educationLevel: "general_public",
        }),
      })
    );
    const regJson: any = await regRes.json();
    await prisma.user.update({
      where: { id: regJson.user.id },
      data: { role: Role.ADMIN },
    });
    const adminToken = regJson.token;

    const year2570Before = await prisma.competitionYear.findUnique({
      where: { year: 2570 },
    });

    const dynamicCatCode = `ai_robotics_${Date.now()}`;
    const dynamicLevelCode = `startup_track_${Date.now()}`;
    const testFutureYear = 2599;
    const testFallbackYear = 2598;

    try {
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
      const validRubricJson: any = await validRubricRes.json();
      expect(validRubricJson.success).toBe(true);
      expect(validRubricJson.rubricConfig[0].weight).toBe(30);

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
      const cfgJson: any = await cfgRes.json();
      expect(cfgJson.categories.some((c: any) => c.id === dynamicCatCode)).toBe(true);
      expect(Array.isArray(cfgJson.rubricConfig)).toBe(true);
      expect(cfgJson.rubricConfig[0].weight).toBe(30);
      expect(Array.isArray(cfgJson.years)).toBe(true);

      // 4. POST /api/config/years creates future competition year and clones active categories, levels, and rubric
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
      const newYearJson: any = await newYearRes.json();
      expect(newYearJson.success).toBe(true);
      expect(newYearJson.data.year).toBe(testFutureYear);

      const futureCfgRes = await app.handle(
        new Request(`http://localhost/api/config?year=${testFutureYear}`)
      );
      const futureCfgJson: any = await futureCfgRes.json();
      expect(futureCfgJson.event.year).toBe(testFutureYear);
      expect(futureCfgJson.categories.some((c: any) => c.id === dynamicCatCode)).toBe(true);
      expect(futureCfgJson.rubricConfig[0].weight).toBe(30);
      expect(futureCfgJson.educationLevels.length).toBe(3);
      expect(futureCfgJson.educationLevels.map((l: any) => l.code)).toEqual([
        "general_public",
        "higher_education",
        "below_higher",
      ]);
      expect(futureCfgJson.totalPrizePool).toBe(255000);
      expect(futureCfgJson.totalAwardCount).toBe(18);

      // 5. POST /api/config/levels lets ADMIN update an existing year level & add a new year level on testFutureYear
      const updateLevelRes = await app.handle(
        new Request("http://localhost/api/config/levels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            year: testFutureYear,
            code: "higher_education",
            nameTh: "อุดมศึกษา (วิจัยประยุกต์)",
            totalPrizeAmount: 95000,
            trophyShortTh: "   ",
          }),
        })
      );
      expect(updateLevelRes.status).toBe(200);
      const updateLevelJson: any = await updateLevelRes.json();
      expect(updateLevelJson.success).toBe(true);
      expect(updateLevelJson.data.totalPrizeAmount).toBe(95000);
      expect(updateLevelJson.data.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");

      const addLevelRes = await app.handle(
        new Request("http://localhost/api/config/levels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            year: testFutureYear,
            code: dynamicLevelCode,
            nameTh: "วิสาหกิจเริ่มต้น (Startup Sandbox)",
            nameEn: "Startup Sandbox",
            eligibleTh: "ทีมสตาร์ทอัพที่มีต้นแบบพร้อมทดสอบตลาด",
            isRoyalTrophy: false,
            totalPrizeAmount: 45000,
            trophyShortTh: "   ",
            prizeBreakdown: [
              null,
              "invalid-primitive",
              {
                tier: "GRAND_WINNER",
                labelTh: "ชนะเลิศ",
                count: 1,
                amountEach: 30000,
                totalAmount: 30000,
              },
              {
                tier: "HONORABLE_MENTION",
                labelTh: "ชมเชย",
                count: 3,
                amountEach: 5000,
                totalAmount: 15000,
              },
            ],
            requiresPrototype: true,
            orderIndex: 4,
          }),
        })
      );
      expect(addLevelRes.status).toBe(200);
      const addLevelJson: any = await addLevelRes.json();
      expect(addLevelJson.success).toBe(true);
      expect(addLevelJson.data.code).toBe(dynamicLevelCode);

      const updatedFutureCfgRes = await app.handle(
        new Request(`http://localhost/api/config?year=${testFutureYear}`)
      );
      const updatedFutureCfgJson: any = await updatedFutureCfgRes.json();
      expect(updatedFutureCfgJson.educationLevels.length).toBe(4);
      // 105,000 + 95,000 + 75,000 + 45,000 = 320,000
      expect(updatedFutureCfgJson.totalPrizePool).toBe(320000);
      // 6 + 6 + 6 + (1 + 3) = 22
      expect(updatedFutureCfgJson.totalAwardCount).toBe(22);
      expect(updatedFutureCfgJson.prizes.every((p: any) => !p.title.includes("โล่"))).toBe(true);

      // 6. POST /api/config/years falls back to CATEGORIES_2570_DEFAULTS and LEVELS_2570_DEFAULTS when previousCurrent is null
      await prisma.competitionYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
      try {
        const fallbackYearRes = await app.handle(
          new Request("http://localhost/api/config/years", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              year: testFallbackYear,
              yearAd: testFallbackYear - 543,
              setAsCurrent: false,
            }),
          })
        );
        expect(fallbackYearRes.status).toBe(200);

        const fallbackCfgRes = await app.handle(
          new Request(`http://localhost/api/config?year=${testFallbackYear}`)
        );
        const fallbackCfgJson: any = await fallbackCfgRes.json();
        expect(fallbackCfgJson.categories.map((c: any) => c.code)).toEqual(
          CATEGORIES_2570_DEFAULTS.map((c) => c.code)
        );
        expect(fallbackCfgJson.educationLevels.map((l: any) => l.code)).toEqual(
          LEVELS_2570_DEFAULTS.map((l) => l.code)
        );
        expect(fallbackCfgJson.totalPrizePool).toBe(255000);
        expect(fallbackCfgJson.totalAwardCount).toBe(18);
      } finally {
        if (year2570Before) {
          await prisma.competitionYear.update({
            where: { id: year2570Before.id },
            data: { isCurrent: true },
          });
        }
      }

      // Direct guard check on formatLevelPrizeSummaryLine
      expect(
        formatLevelPrizeSummaryLine({
          trophyShortTh: "   ",
          totalPrizeAmount: 50000,
          prizeBreakdown: [null, 123, "bad"] as any,
        })
      ).toContain("ถ้วยรางวัล มจพ.");
    } finally {
      await prisma.competitionYear.deleteMany({
        where: { year: { in: [testFutureYear, testFallbackYear] } },
      });
      await prisma.category.deleteMany({ where: { code: dynamicCatCode } });
      await prisma.educationLevel.deleteMany({ where: { code: dynamicLevelCode } });
      if (year2570Before) {
        await prisma.competitionYear.update({
          where: { id: year2570Before.id },
          data: {
            isCurrent: true,
            rubricConfig: (year2570Before.rubricConfig ?? undefined) as any,
          },
        });
      }
    }

    // Verify seeded 2570 and 2569 states remain completely intact after cleanup
    const postCheck2570 = await app.handle(new Request("http://localhost/api/config"));
    const postJson2570: any = await postCheck2570.json();
    expect(postJson2570.event.year).toBe(2570);
    expect(postJson2570.educationLevels.length).toBe(3);
    expect(postJson2570.totalPrizePool).toBe(255000);
    expect(postJson2570.categories.length).toBe(5);

    const postCheck2569 = await app.handle(new Request("http://localhost/api/config?year=2569"));
    const postJson2569: any = await postCheck2569.json();
    expect(postJson2569.event.year).toBe(2569);
    expect(postJson2569.educationLevels.length).toBe(2);
    expect(postJson2569.totalPrizePool).toBe(180000);
    expect(postJson2569.categories.length).toBe(5);
  });
});
