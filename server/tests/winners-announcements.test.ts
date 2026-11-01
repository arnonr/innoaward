import { test, expect, describe } from "bun:test";
import { Elysia } from "elysia";
import { winnersController } from "../src/modules/winners/winners.controller";
import { announcementsController } from "../src/modules/announcements/announcements.controller";
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
    expect(json.data.length).toBeGreaterThanOrEqual(8);
  });

  test("GET /api/winners?year=2568 filters by year 2568", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/winners?year=2568")
    );
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(6);
    expect(json.data.every((w: any) => w.year === 2568)).toBe(true);
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
    expect(openingAnn.abstract).toContain("180,000 บาท");
    expect(openingAnn.abstract).toContain("28 ก.พ. 2570");

    // Mock finalists announcement stays hidden until Round 1 results are published
    const finalistAnn = json.data.find((a: any) => a.category === "finalists");
    expect(finalistAnn).toBeUndefined();

    const winnersAnn = json.data.find((a: any) => a.category === "winners");
    expect(winnersAnn).toBeDefined();
    expect(winnersAnn.roster.length).toBeGreaterThanOrEqual(2);
    expect(winnersAnn.roster[0].code).toBe("KMUTNB-2568-0001");
  });

  test("GET /api/news returns announcements as alias", async () => {
    const response = await app.handle(new Request("http://localhost/api/news"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});
