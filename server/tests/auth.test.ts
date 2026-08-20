import { test, expect, describe } from "bun:test";
import { Elysia } from "elysia";
import { authController } from "../src/modules/auth/auth.controller";
import { prisma } from "../src/lib/prisma";

describe("Authentication Module (/api/auth)", () => {
  const app = new Elysia().use(authController);

  const testEmail = `test-user-${Date.now()}@kmutnb.ac.th`;
  const testPassword = "PasswordTest2026!";
  let jwtToken = "";

  test("POST /api/auth/register creates a new contestant and returns JWT token", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          fullName: "ทดสอบ ผู้เข้าแข่งขัน",
          phone: "089-999-8888",
          institution: "คณะวิศวกรรมศาสตร์ มจพ.",
          educationLevel: "higher_and_above",
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.token).toBeDefined();
    expect(json.user.email).toBe(testEmail);
    expect(json.user.role).toBe("CONTESTANT");
    expect(json.user.educationLevel).toBeDefined();

    jwtToken = json.token;
  });

  test("POST /api/auth/register rejects duplicate email", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          fullName: "สมหญิง นวัตกรรม",
        }),
      })
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("มีอยู่ในระบบแล้ว");
  });

  test("POST /api/auth/login succeeds with valid credentials", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.token).toBeDefined();
    expect(json.user.email).toBe(testEmail);
  });

  test("POST /api/auth/login fails with invalid password", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: "WrongPassword!",
        }),
      })
    );

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
  });

  test("GET /api/auth/me returns current user profile when valid token provided", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/auth/me", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user.email).toBe(testEmail);
    expect(json.user.fullName).toBe("ทดสอบ ผู้เข้าแข่งขัน");
  });

  test("GET /api/auth/me returns 401 Unauthorized without token", async () => {
    const response = await app.handle(new Request("http://localhost/api/auth/me"));
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
  });
});
