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
    
    const year2569 = json.data.find((y: any) => y.year === 2569);
    expect(year2569).toBeDefined();
    expect(year2569.isCurrent).toBe(true);
  });

  test("GET /api/masters/years/2569/categories returns categories for year 2569", async () => {
    const response = await app.handle(new Request("http://localhost/api/masters/years/2569/categories"));
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
    expect(json.event.nameTh).toContain("2569");
    expect(json.categories.length).toBe(5);
    expect(json.educationLevels.length).toBe(2);
  });
});
