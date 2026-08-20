import { test, expect, describe } from "bun:test";
import { Elysia } from "elysia";
import { submissionsController } from "../src/modules/submissions/submissions.controller";
import { authController } from "../src/modules/auth/auth.controller";
import { prisma } from "../src/lib/prisma";

describe("Submissions & Tracking Module (/api/submissions)", () => {
  const app = new Elysia()
    .use(authController)
    .use(submissionsController);

  let contestantToken = "";
  let createdTrackingCode = "";
  let createdSubmissionId = "";

  test("Login contestant to get token", async () => {
    const loginRes = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "contestant@kmutnb.ac.th",
          password: "Contestant2026!",
        }),
      })
    );

    const json = await loginRes.json();
    expect(loginRes.status).toBe(200);
    expect(json.token).toBeDefined();
    contestantToken = json.token;
  });

  test("POST /api/submissions creates a new submission with coverImage and members", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "ระบบ AI คัดแยกขยะอัตโนมัติด้วยเซนเซอร์สเปกตรัม",
          titleEn: "Automated AI Waste Sorting System via Spectral Sensors",
          category: "energy_environment",
          educationLevel: "higher_and_above",
          teamName: "GreenVision AI",
          advisorName: "ผศ.ดร. นวัตกรรม สิ่งแวดล้อม",
          members: ["นาย ชัยชนะ เทคโนโลยี", "นางสาว ปัญญา นวัตกรรม"],
          abstractTh: "ระบบตรวจจับและคัดแยกขยะพลาสติกชีวภาพแบบอัตโนมัติด้วย AI และ Spectral Camera ความแม่นยำ 99%",
          abstractEn: "Automated bio-plastic waste detection and sorting robot with 99% accuracy using Spectral Vision.",
          coverImage: "/photo_candidates/robotics_engineer.jpg",
          videoUrl: "https://youtube.com/watch?v=mock123",
          documentUrl: "https://drive.google.com/mock-doc.pdf",
          isDraft: false,
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.trackingCode).toMatch(/^KMUTNB-2569-\d{4}$/);
    expect(json.data.status).toBe("SUBMITTED");
    expect(json.data.coverImage).toBe("/photo_candidates/robotics_engineer.jpg");
    expect(json.data.members.length).toBe(2);

    createdTrackingCode = json.data.trackingCode;
    createdSubmissionId = json.data.id;
  });

  test("GET /api/submissions/status/:trackingCode retrieves submission status correctly", async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/submissions/status/${createdTrackingCode}`)
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.trackingCode).toBe(createdTrackingCode);
    expect(json.data.titleTh).toContain("ระบบ AI คัดแยกขยะอัตโนมัติ");
    expect(json.data.teamName).toBe("GreenVision AI");
    expect(json.data.status).toBe("SUBMITTED");
    expect(json.data.category).toBeDefined();
    expect(json.data.educationLevel).toBeDefined();
  });

  test("GET /api/submissions/my returns submissions for authenticated user", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/submissions/my", {
        headers: {
          Authorization: `Bearer ${contestantToken}`,
        },
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.some((s: any) => s.id === createdSubmissionId)).toBe(true);
  });

  test("GET /api/submissions/status/INVALID-CODE returns 404", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/submissions/status/INVALID-CODE-9999")
    );

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("ไม่พบรหัสติดตาม");
  });
});
