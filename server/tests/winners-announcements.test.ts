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

  test("GET /api/announcements returns news and announcements with rosters", async () => {
    const response = await app.handle(new Request("http://localhost/api/announcements"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(3);

    const finalistAnn = json.data.find((a: any) => a.category === "finalists");
    expect(finalistAnn).toBeDefined();
    expect(finalistAnn.roster.length).toBe(3);
    expect(finalistAnn.roster[0].code).toBe("KMUTNB-2026-8821");
  });

  test("GET /api/news returns announcements as alias", async () => {
    const response = await app.handle(new Request("http://localhost/api/news"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});
