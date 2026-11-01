import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { Elysia } from "elysia";
import { mastersController } from "../src/modules/masters/masters.controller";
import { configController } from "../src/modules/config/config.controller";
import { prisma } from "../src/lib/prisma";

describe("Masters & Config API Modules", () => {
  const app = new Elysia()
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
});
