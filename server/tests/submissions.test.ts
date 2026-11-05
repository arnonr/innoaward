import { test, expect, describe } from "bun:test";
import { Elysia } from "elysia";
import { submissionsController } from "../src/modules/submissions/submissions.controller";
import { authController } from "../src/modules/auth/auth.controller";
import { prisma } from "../src/lib/prisma";

describe("Submissions & Tracking Module (/api/submissions)", () => {
  const app = new Elysia()
    .use(authController)
    .use(submissionsController);

  const freshEmail = `contestant-${Date.now()}@kmutnb.ac.th`;
  let contestantToken = "";
  let createdTrackingCode = "";
  let createdSubmissionId = "";
  let secondSubmissionId = "";

  test("Register and login contestant to get token", async () => {
    const regRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: freshEmail,
          password: "Contestant2026!",
          fullName: "นักนวัตกรรม ทดสอบระบบ",
          phone: "081-234-5678",
          institution: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
          educationLevel: "higher_and_above",
        }),
      })
    );
    expect(regRes.status).toBe(200);

    const loginRes = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: freshEmail,
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
    expect(json.data.trackingCode).toMatch(/^KMUTNB-2570-\d{4}$/);
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

  test("POST /api/submissions creates full dossier with affiliation, object members, coordinators, and sanitizes round statuses", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบอัจฉริยะ",
          titleEn: "Smart HDPE Pipe Welding Controller",
          category: "others",
          educationLevel: "higher_and_above",
          teamName: "เขาชื่ออะไร",
          affiliation: "คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
          advisorName: "ผศ.ดร.วัฒนา แก้วมณี",
          abstractTh: "ระบบควบคุมและบันทึกข้อมูลการเชื่อมท่อ HDPE แบบ Butt Fusion",
          members: [
            { fullName: "ผศ.ดร.วัฒนา แก้วมณี", role: "หัวหน้าทีม", idCard: "5-1601-00029-58-2" },
            { fullName: "นาย นวัตกร วิจัยดี", role: "สมาชิก", idCard: "1100100234567" },
          ],
          primaryCoordinator: {
            name: "ผศ.ดร.วัฒนา แก้วมณี",
            idCard: "5-1601-00029-58-2",
            phone: "064-274-9888",
            email: "wattana.k@fte.kmutnb.ac.th",
          },
          secondaryCoordinator: {
            name: "ผศ.ดร.วัฒนา แก้วมณี",
            idCard: "AA9876543",
            phone: "064-274-9888",
            email: "wattana.kaewmanee@gmail.com",
          },
          files: {
            proposalPdfUrl: "https://drive.google.com/proposal.pdf",
            videoUrl: "https://youtube.com/watch?v=hdpe123",
            imageUrl: "/hdpe-poster.jpg",
            posterUrl: "",
            presentationUrl: "",
          },
          // Attempt privilege escalation (must be ignored by server)
          round1Status: "PASSED",
          round2Status: "PASSED",
          round3Status: "PASSED",
          round3Result: "รางวัลชนะเลิศ",
          isDraft: false,
        }),
      })
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.affiliation).toContain("คณะครุศาสตร์อุตสาหกรรม");
    expect(json.data.round1Status).toBe("PENDING");
    expect(json.data.round2Status).toBe("PENDING");
    expect(json.data.round3Status).toBe("PENDING");
    expect(json.data.round3Result).toBe("");
    expect(json.data.members[0].idCard).toBe("5-1601-00029-58-2");
    createdTrackingCode = json.data.trackingCode;
    secondSubmissionId = json.data.id;
  });

  test("POST /api/submissions enforces max 2 projects per account while allowing updates to existing projects", async () => {
    const thirdRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "โครงการที่ 3 เกินโควตา",
          category: "energy_environment",
          educationLevel: "higher_and_above",
          teamName: "QuotaExceeded",
          isDraft: true,
        }),
      })
    );
    expect(thirdRes.status).toBe(400);
    const thirdJson = await thirdRes.json();
    expect(thirdJson.success).toBe(false);
    expect(thirdJson.message).toContain("2 โครงการ");

    // Updating existing project #2 by id succeeds even when account has 2 projects
    const updateRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          id: secondSubmissionId,
          titleTh: "เครื่องควบคุมและบันทึกผลการเชื่อมท่อ HDPE แบบอัจฉริยะ (แก้ไขครั้งที่ 1)",
          titleEn: "Smart HDPE Pipe Welding Controller",
          category: "others",
          educationLevel: "higher_and_above",
          teamName: "เขาชื่ออะไร",
          affiliation: "คณะครุศาสตร์อุตสาหกรรม มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
          advisorName: "ผศ.ดร.วัฒนา แก้วมณี",
          abstractTh: "ระบบควบคุมและบันทึกข้อมูลการเชื่อมท่อ HDPE แบบ Butt Fusion",
          members: [
            { fullName: "ผศ.ดร.วัฒนา แก้วมณี", role: "หัวหน้าทีม", idCard: "5-1601-00029-58-2" },
            { fullName: "นาย นวัตกร วิจัยดี", role: "สมาชิก", idCard: "1100100234567" },
          ],
          primaryCoordinator: {
            name: "ผศ.ดร.วัฒนา แก้วมณี",
            idCard: "5-1601-00029-58-2",
            phone: "064-274-9888",
            email: "wattana.k@fte.kmutnb.ac.th",
          },
          secondaryCoordinator: {
            name: "ผศ.ดร.วัฒนา แก้วมณี",
            idCard: "AA9876543",
            phone: "064-274-9888",
            email: "wattana.kaewmanee@gmail.com",
          },
          files: {
            proposalPdfUrl: "https://drive.google.com/proposal.pdf",
            videoUrl: "https://youtube.com/watch?v=hdpe123",
            imageUrl: "/hdpe-poster.jpg",
          },
          isDraft: false,
        }),
      })
    );
    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.data.titleTh).toContain("แก้ไขครั้งที่ 1");
  });

  test("GET /api/submissions/status/:trackingCode masks PII for unauthenticated requests and unmasks for owner", async () => {
    const publicRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${createdTrackingCode}`)
    );
    expect(publicRes.status).toBe(200);
    const pubJson = await publicRes.json();
    expect(pubJson.data.primaryCoordinator.idCard).toBe("5-1601-XXXXX-XX-X");
    expect(pubJson.data.primaryCoordinator.phone).toBe("064-XXX-9888");
    expect(pubJson.data.primaryCoordinator.email).toBe("w***@fte.kmutnb.ac.th");
    expect(pubJson.data.memberDetails[0].idCard).toBe("5-1601-XXXXX-XX-X");
    expect(pubJson.data.memberDetails[1].idCard).toBe("1-1001-XXXXX-XX-X");
    expect(pubJson.data.secondaryCoordinator.idCard).toBe("AAXXXXX43");

    const ownerRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${createdTrackingCode}`, {
        headers: { Authorization: `Bearer ${contestantToken}` },
      })
    );
    const ownerJson = await ownerRes.json();
    expect(ownerJson.data.primaryCoordinator.idCard).toBe("5-1601-00029-58-2");
    expect(ownerJson.data.primaryCoordinator.phone).toBe("064-274-9888");
    expect(ownerJson.data.primaryCoordinator.email).toBe("wattana.k@fte.kmutnb.ac.th");

    // GET /api/submissions/:id also masks PII for unauthenticated requests
    const byIdPublicRes = await app.handle(
      new Request(`http://localhost/api/submissions/${pubJson.data.id}`)
    );
    expect(byIdPublicRes.status).toBe(200);
    const byIdPubJson = await byIdPublicRes.json();
    expect(byIdPubJson.data.primaryCoordinator.idCard).toBe("5-1601-XXXXX-XX-X");
    expect(byIdPubJson.data.memberDetails[0].idCard).toBe("5-1601-XXXXX-XX-X");

    // Unauthenticated POST /api/submissions attempting to overwrite existing id returns 403
    const hijackRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pubJson.data.id,
          titleTh: "Hijacked Title",
          category: "others",
          educationLevel: "higher_and_above",
          teamName: "Hijacker",
        }),
      })
    );
    expect(hijackRes.status).toBe(403);
  });

  test("PATCH /api/submissions/tracking/:trackingCode/artifacts requires owner auth and allows attaching Poster/Presentation even after deadline", async () => {
    const unauthPatch = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${createdTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/unauthorized.pdf",
        }),
      })
    );
    expect(unauthPatch.status).toBe(401);

    const patchRes = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${createdTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/poster-round2.pdf",
          presentationUrl: "https://drive.google.com/slides-round3.pdf",
        }),
      })
    );
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.success).toBe(true);
    expect(patchJson.data.artifacts.posterUrl).toBe("https://drive.google.com/poster-round2.pdf");
    expect(patchJson.data.artifacts.presentationUrl).toBe("https://drive.google.com/slides-round3.pdf");
    expect(patchJson.data.artifacts.proposalPdfUrl).toBe("https://drive.google.com/proposal.pdf");

    // Sending empty posterUrl does not wipe existing posterUrl
    const partialRes = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${createdTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          posterUrl: "",
          presentationUrl: "https://drive.google.com/slides-round3-v2.pdf",
        }),
      })
    );
    const partialJson = await partialRes.json();
    expect(partialJson.data.artifacts.posterUrl).toBe("https://drive.google.com/poster-round2.pdf");
    expect(partialJson.data.artifacts.presentationUrl).toBe("https://drive.google.com/slides-round3-v2.pdf");

    // When submissionEnd is in the past, full-form POST is rejected (403) while late artifacts PATCH succeeds (200)
    const currentYear = await prisma.competitionYear.findFirst({ where: { isCurrent: true } });
    try {
      if (currentYear) {
        await prisma.competitionYear.update({
          where: { id: currentYear.id },
          data: { submissionEnd: new Date("2020-01-01T00:00:00.000Z") },
        });
      }

      const lateFormEditRes = await app.handle(
        new Request("http://localhost/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${contestantToken}`,
          },
          body: JSON.stringify({
            id: secondSubmissionId,
            titleTh: "แก้ไขหลังปิดรับสมัคร",
            category: "others",
            educationLevel: "higher_and_above",
            teamName: "เขาชื่ออะไร",
          }),
        })
      );
      expect(lateFormEditRes.status).toBe(403);

      const lateArtifactAfterDeadlineRes = await app.handle(
        new Request(`http://localhost/api/submissions/tracking/${createdTrackingCode}/artifacts`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${contestantToken}`,
          },
          body: JSON.stringify({
            posterUrl: "https://drive.google.com/poster-round2-final.pdf",
          }),
        })
      );
      expect(lateArtifactAfterDeadlineRes.status).toBe(200);
    } finally {
      if (currentYear) {
        await prisma.competitionYear.update({
          where: { id: currentYear.id },
          data: { submissionEnd: currentYear.submissionEnd },
        });
      }
    }
  });
});
