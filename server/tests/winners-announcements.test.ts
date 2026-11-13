import { test, expect, describe } from "bun:test";
import { Elysia } from "elysia";
import { winnersController } from "../src/modules/winners/winners.controller";
import { announcementsController } from "../src/modules/announcements/announcements.controller";
import {
  CATEGORIES_2570_DEFAULTS,
  LEVELS_2569_DEFAULTS,
  LEVELS_2570_DEFAULTS,
  PROTOTYPE_RULE_TH,
  formatLevelPrizeSummaryLine,
} from "../src/modules/config/competition-defaults";
import { prisma } from "../src/lib/prisma";

describe("Winners Hall of Fame & Announcements Modules", () => {
  const app = new Elysia()
    .use(winnersController)
    .use(announcementsController);

  test("GET /api/winners returns all awarded submissions", async () => {
    const response = await app.handle(new Request("http://localhost/api/winners"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(6);
  });

  test("GET /api/winners?year=2569 filters by year 2569 (2026)", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/winners?year=2569")
    );
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(6);
    expect(json.data.every((w: any) => w.year === 2569)).toBe(true);
    expect(json.data.every((w: any) => !String(w.prizeDetails || "").includes("โล่"))).toBe(true);

    const runnerUps = json.data.filter((w: any) => w.awardTier !== "grand_winner");
    expect(runnerUps.every((w: any) => !String(w.prizeDetails || "").includes("ถ้วย"))).toBe(true);
    expect(runnerUps.every((w: any) => !String(w.awardBadgeText || "").includes("ถ้วย"))).toBe(true);
  });

  test("GET /api/winners?category=medical_device filters by category", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/winners?category=medical_device")
    );
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.every((w: any) => w.category === "medical_device")).toBe(true);
  });

  test("GET /api/announcements returns published news and announcements with rosters", async () => {
    const response = await app.handle(new Request("http://localhost/api/announcements"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(2);

    const openingAnn = json.data.find((a: any) => a.category === "general");
    expect(openingAnn).toBeDefined();
    expect(openingAnn.title).toContain("2570");
    expect(openingAnn.abstract).toContain("255,000 บาท");
    expect(openingAnn.abstract).toContain("3 ประเภท");
    expect(openingAnn.abstract).toContain("28 ก.พ. 2570");
    expect(String(openingAnn.abstract || "")).not.toContain("โล่");

    // Mock finalists announcement stays hidden until Round 1 results are published
    const finalistAnn = json.data.find((a: any) => a.category === "finalists");
    expect(finalistAnn).toBeUndefined();

    const winnersAnn = json.data.find((a: any) => a.category === "winners");
    expect(winnersAnn).toBeDefined();
    expect(winnersAnn.date).toBe("มิถุนายน 2569");
    expect(winnersAnn.title).toContain("KMUTNB Innovation Awards 2026");
    expect(winnersAnn.title).toContain("ประจำปี 2569");
    expect(winnersAnn.roster.length).toBe(6);
    expect(winnersAnn.roster[0].code).toBe("KMUTNB-2569-0001");
  });

  test("Year 2569 winners preserve historical category and educationLevel labels while 2570 has 3 CompetitionYearLevels", async () => {
    const res = await app.handle(new Request("http://localhost/api/winners?year=2569"));
    const json: any = await res.json();
    const osse = json.data.find((w: any) => w.trackingCode === "KMUTNB-2569-0001");
    expect(osse.category).toBe("medical_device");
    expect(osse.educationLevel).toBe("higher_and_above");
    expect(osse.educationLevelNameTh).toBe("ระดับอุดมศึกษาและบุคคลทั่วไป");

    const roadAi = json.data.find((w: any) => w.trackingCode === "KMUTNB-2569-0004");
    expect(roadAi.category).toBe("social_economy");
    expect(roadAi.educationLevel).toBe("below_higher");
    expect(roadAi.educationLevelNameTh).toBe("ระดับต่ำกว่าอุดมศึกษา");

    const y2570 = await prisma.competitionYear.findUnique({
      where: { year: 2570 },
      include: {
        levels: { include: { educationLevel: true }, orderBy: { orderIndex: "asc" } },
        categories: { where: { isActive: true }, include: { category: true }, orderBy: { orderIndex: "asc" } },
      },
    });
    const active2570Levels = y2570?.levels.filter((l) => l.isActive) || [];
    expect(active2570Levels.length).toBe(3);
    expect(active2570Levels.map((l) => l.educationLevel.code)).toEqual([
      "general_public",
      "higher_education",
      "below_higher",
    ]);
    expect(active2570Levels.reduce((sum, l) => sum + l.totalPrizeAmount, 0)).toBe(255000);
    expect(active2570Levels[0]?.isRoyalTrophy).toBe(true);
    expect(active2570Levels[1]?.isRoyalTrophy).toBe(false);
    expect(active2570Levels[1]?.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");
    expect(active2570Levels[2]?.isRoyalTrophy).toBe(false);
    expect(active2570Levels[2]?.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");
    expect(active2570Levels.every((l) => l.requiresPrototype && l.prototypeRuleTh === PROTOTYPE_RULE_TH)).toBe(true);
    expect(
      active2570Levels.every((l) => !formatLevelPrizeSummaryLine(l).includes("โล่"))
    ).toBe(true);

    expect(y2570?.categories.length).toBe(5);
    expect(y2570?.categories.map((c) => c.category.code)).toEqual(
      CATEGORIES_2570_DEFAULTS.map((c) => c.code)
    );

    const y2569 = await prisma.competitionYear.findUnique({
      where: { year: 2569 },
      include: {
        levels: { include: { educationLevel: true }, orderBy: { orderIndex: "asc" } },
        categories: { where: { isActive: true }, include: { category: true }, orderBy: { orderIndex: "asc" } },
      },
    });
    const active2569Levels = y2569?.levels.filter((l) => l.isActive) || [];
    expect(active2569Levels.length).toBe(2);
    expect(active2569Levels.map((l) => l.educationLevel.code)).toEqual(
      LEVELS_2569_DEFAULTS.map((l) => l.code)
    );
    expect(active2569Levels.reduce((sum, l) => sum + l.totalPrizeAmount, 0)).toBe(180000);
    expect(y2569?.categories.length).toBe(5);
    expect(y2569?.categories.map((c) => c.category.code)).toEqual([
      "energy_environment",
      "food_agriculture",
      "social_economy",
      "medical_device",
      "material",
    ]);

    const seeded2569Submissions = await prisma.submission.findMany({
      where: {
        trackingCode: {
          in: [
            "KMUTNB-2569-0001",
            "KMUTNB-2569-0002",
            "KMUTNB-2569-0003",
            "KMUTNB-2569-0004",
            "KMUTNB-2569-0005",
            "KMUTNB-2569-0006",
          ],
        },
      },
    });
    expect(seeded2569Submissions.length).toBe(6);
    expect(seeded2569Submissions.every((s) => Boolean(s.competitionYearLevelId))).toBe(true);
    expect(LEVELS_2570_DEFAULTS.length).toBe(3);
  });

  test("GET /api/news returns announcements as alias", async () => {
    const response = await app.handle(new Request("http://localhost/api/news"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});
