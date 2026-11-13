import { afterAll, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { submissionsController } from "../src/modules/submissions/submissions.controller";
import { authController } from "../src/modules/auth/auth.controller";
import { prisma } from "../src/lib/prisma";

describe("Submissions & Tracking Module (/api/submissions)", () => {
  const app = new Elysia()
    .use(authController)
    .use(submissionsController);

  const ts = Date.now();
  const freshEmail = `contestant-${ts}@kmutnb.ac.th`;
  const otherEmail = `other-${ts}@kmutnb.ac.th`;
  const gateEmail = `gate-tester-${ts}@kmutnb.ac.th`;

  let contestantToken = "";
  let createdTrackingCode = "";
  let createdSubmissionId = "";
  let secondTrackingCode = "";
  let secondSubmissionId = "";
  const cleanupSubmissionIds: string[] = [];

  afterAll(async () => {
    const ids = [
      createdSubmissionId,
      secondSubmissionId,
      ...cleanupSubmissionIds,
    ].filter(Boolean);
    if (ids.length > 0) {
      await prisma.submission.deleteMany({
        where: { id: { in: ids } },
      });
    }
    await prisma.user.deleteMany({
      where: {
        email: { in: [freshEmail, otherEmail, gateEmail] },
      },
    });
  });

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
          educationLevel: "general_public",
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

    const json: any = await loginRes.json();
    expect(loginRes.status).toBe(200);
    expect(json.token).toBeDefined();
    contestantToken = json.token;
  });

  test("POST /api/submissions creates a new 2570 general_public submission with coverImage, members, and competitionYearLevel", async () => {
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
          category: "engineering_ai",
          educationLevel: "general_public",
          teamName: "GreenVision AI",
          advisorName: "ผศ.ดร. นวัตกรรม สิ่งแวดล้อม",
          members: ["นาย ชัยชนะ เทคโนโลยี", "นางสาว ปัญญา นวัตกรรม"],
          abstractTh: "ระบบตรวจจับและคัดแยกขยะพลาสติกชีวภาพแบบอัตโนมัติด้วย AI และ Spectral Camera ความแม่นยำ 99%",
          abstractEn: "Automated bio-plastic waste detection and sorting robot with 99% accuracy using Spectral Vision.",
          coverImage: "/photo_candidates/robotics_engineer.jpg",
          videoUrl: "https://youtube.com/watch?v=mock123",
          documentUrl: "https://drive.google.com/mock-doc.pdf",
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );

    expect(response.status).toBe(200);
    const json: any = await response.json();
    createdTrackingCode = json.data?.trackingCode || "";
    createdSubmissionId = json.data?.id || "";
    expect(json.success).toBe(true);
    expect(json.data.trackingCode).toMatch(/^KMUTNB-2570-\d{4}$/);
    expect(json.data.status).toBe("SUBMITTED");
    expect(json.data.coverImage).toBe("/photo_candidates/robotics_engineer.jpg");
    expect(json.data.members.length).toBe(2);
    expect(json.data.competitionYearLevelId).toBeTruthy();
    expect(json.data.competitionYearLevel?.isRoyalTrophy).toBe(true);
  });

  test("GET /api/submissions/status/:trackingCode retrieves submission status and Royal Trophy metadata correctly", async () => {
    const response = await app.handle(
      new Request(`http://localhost/api/submissions/status/${createdTrackingCode}`)
    );

    expect(response.status).toBe(200);
    const json: any = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.trackingCode).toBe(createdTrackingCode);
    expect(json.data.titleTh).toContain("ระบบ AI คัดแยกขยะอัตโนมัติ");
    expect(json.data.teamName).toBe("GreenVision AI");
    expect(json.data.status).toBe("SUBMITTED");
    expect(json.data.category).toBe("engineering_ai");
    expect(json.data.educationLevel).toBe("general_public");
    expect(json.data.isRoyalTrophy).toBe(true);
    expect(json.data.trophyShortTh).toBe("ถ้วยพระราชทานฯ");
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
    const json: any = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.some((s: any) => s.id === createdSubmissionId)).toBe(true);
  });

  test("GET /api/submissions/status/INVALID-CODE returns 404", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/submissions/status/INVALID-CODE-9999")
    );

    expect(response.status).toBe(404);
    const json: any = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("ไม่พบรหัสติดตาม");
  });

  test("POST /api/submissions creates full higher_education dossier with affiliation, object members, coordinators, and sanitizes round statuses", async () => {
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
          educationLevel: "higher_education",
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
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );

    expect(response.status).toBe(200);
    const json: any = await response.json();
    secondTrackingCode = json.data?.trackingCode || "";
    secondSubmissionId = json.data?.id || "";
    expect(json.success).toBe(true);
    expect(json.data.affiliation).toContain("คณะครุศาสตร์อุตสาหกรรม");
    expect(json.data.round1Status).toBe("PENDING");
    expect(json.data.round2Status).toBe("PENDING");
    expect(json.data.round3Status).toBe("PENDING");
    expect(json.data.round3Result).toBe("");
    expect(json.data.members[0].idCard).toBe("5-1601-00029-58-2");
    expect(json.data.competitionYearLevel?.isRoyalTrophy).toBe(false);
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
          category: "agri_food",
          educationLevel: "below_higher",
          teamName: "QuotaExceeded",
          isDraft: true,
        }),
      })
    );
    expect(thirdRes.status).toBe(400);
    const thirdJson: any = await thirdRes.json();
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
          educationLevel: "higher_education",
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
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );
    expect(updateRes.status).toBe(200);
    const updateJson: any = await updateRes.json();
    expect(updateJson.data.titleTh).toContain("แก้ไขครั้งที่ 1");
  });

  test("GET /api/submissions/status/:trackingCode masks PII for unauthenticated requests, exposes KMUTNB Trophy metadata, and unmasks for owner", async () => {
    const publicRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${secondTrackingCode}`)
    );
    expect(publicRes.status).toBe(200);
    const pubJson: any = await publicRes.json();
    expect(pubJson.data.primaryCoordinator.idCard).toBe("5-1601-XXXXX-XX-X");
    expect(pubJson.data.primaryCoordinator.phone).toBe("064-XXX-9888");
    expect(pubJson.data.primaryCoordinator.email).toBe("w***@fte.kmutnb.ac.th");
    expect(pubJson.data.memberDetails[0].idCard).toBe("5-1601-XXXXX-XX-X");
    expect(pubJson.data.memberDetails[1].idCard).toBe("1-1001-XXXXX-XX-X");
    expect(pubJson.data.secondaryCoordinator.idCard).toBe("AAXXXXX43");
    expect(pubJson.data.isRoyalTrophy).toBe(false);
    expect(pubJson.data.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");

    const ownerRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${secondTrackingCode}`, {
        headers: { Authorization: `Bearer ${contestantToken}` },
      })
    );
    const ownerJson: any = await ownerRes.json();
    expect(ownerJson.data.primaryCoordinator.idCard).toBe("5-1601-00029-58-2");
    expect(ownerJson.data.primaryCoordinator.phone).toBe("064-274-9888");
    expect(ownerJson.data.primaryCoordinator.email).toBe("wattana.k@fte.kmutnb.ac.th");
    expect(pubJson.data.userId).toBe("");

    // GET /api/submissions/:id also masks PII for unauthenticated requests
    const byIdPublicRes = await app.handle(
      new Request(`http://localhost/api/submissions/${pubJson.data.id}`)
    );
    expect(byIdPublicRes.status).toBe(200);
    const byIdPubJson: any = await byIdPublicRes.json();
    expect(byIdPubJson.data.primaryCoordinator.idCard).toBe("5-1601-XXXXX-XX-X");
    expect(byIdPubJson.data.memberDetails[0].idCard).toBe("5-1601-XXXXX-XX-X");
    expect(byIdPubJson.data.isRoyalTrophy).toBe(false);
    expect(byIdPubJson.data.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");

    // Unauthenticated POST /api/submissions attempting to overwrite existing id returns 403
    const hijackRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pubJson.data.id,
          titleTh: "Hijacked Title",
          category: "others",
          educationLevel: "higher_education",
          teamName: "Hijacker",
        }),
      })
    );
    expect(hijackRes.status).toBe(403);
  });

  test("POST /api/submissions enforces active 2570 CompetitionYearLevel and mandatory Prototype gate while allowing drafts", async () => {
    const regRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail,
          password: "Contestant2026!",
          fullName: "ผู้ทดสอบ เกณฑ์ปี 2570",
          educationLevel: "below_higher",
        }),
      })
    );
    expect(regRes.status).toBe(200);
    const regJson: any = await regRes.json();
    const gateToken = regJson.token;

    // 1. Review Focus #4: CONTESTANT submitting inactive legacy level higher_and_above for year 2570 returns 400
    const inactiveLevelRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gateToken}`,
        },
        body: JSON.stringify({
          year: 2570,
          titleTh: "ผลงานทดสอบส่งระดับเดิมในปี 2570",
          category: "agri_food",
          educationLevel: "higher_and_above",
          teamName: "LegacyLevelTeam",
          abstractTh: "ทดสอบการส่งระดับที่ไม่เปิดรับในปี 2570",
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );
    expect(inactiveLevelRes.status).toBe(400);
    const inactiveLevelJson: any = await inactiveLevelRes.json();
    expect(inactiveLevelJson.success).toBe(false);
    expect(inactiveLevelJson.message).toContain(
      "ประเภทการแข่งขันที่เลือกไม่เปิดรับในปีการแข่งขันนี้"
    );

    // 1b. CONTESTANT submitting inactive legacy 2569 category medical_device for year 2570 returns 400
    const inactiveCatRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gateToken}`,
        },
        body: JSON.stringify({
          year: 2570,
          titleTh: "ผลงานทดสอบส่งสาขาเดิมในปี 2570",
          category: "medical_device",
          educationLevel: "general_public",
          teamName: "LegacyCategoryTeam",
          abstractTh: "ทดสอบการส่งสาขาที่ไม่เปิดรับในปี 2570",
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );
    expect(inactiveCatRes.status).toBe(400);
    const inactiveCatJson: any = await inactiveCatRes.json();
    expect(inactiveCatJson.success).toBe(false);
    expect(inactiveCatJson.message).toContain(
      "หมวดหมู่นวัตกรรมที่เลือกไม่เปิดรับในปีการแข่งขันนี้"
    );

    // 2. Final submission (isDraft: false) with hasPrototypeConfirmed: false returns 400 mentioning Prototype
    const noProtoRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gateToken}`,
        },
        body: JSON.stringify({
          year: 2570,
          titleTh: "ผลงานแนวคิดที่ยังไม่มีชิ้นงานต้นแบบ",
          category: "agri_food",
          educationLevel: "below_higher",
          teamName: "IdeaOnlyTeam",
          abstractTh: "ทดสอบการไม่ยืนยันชิ้นงานต้นแบบ",
          hasPrototypeConfirmed: false,
          isDraft: false,
        }),
      })
    );
    expect(noProtoRes.status).toBe(400);
    const noProtoJson: any = await noProtoRes.json();
    expect(noProtoJson.success).toBe(false);
    expect(noProtoJson.message).toContain("Prototype");

    // 3. Review Focus #1: Draft save (isDraft: true) with hasPrototypeConfirmed: false succeeds (200, DRAFT)
    const draftRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gateToken}`,
        },
        body: JSON.stringify({
          year: 2570,
          titleTh: "ฉบับร่างผลงานเกษตรอัจฉริยะ",
          category: "agri_food",
          educationLevel: "below_higher",
          teamName: "AgriDraftTeam",
          abstractTh: "บันทึกร่างไว้ก่อนยืนยันชิ้นงานต้นแบบ",
          hasPrototypeConfirmed: false,
          isDraft: true,
        }),
      })
    );
    expect(draftRes.status).toBe(200);
    const draftJson: any = await draftRes.json();
    expect(draftJson.success).toBe(true);
    expect(draftJson.data.status).toBe("DRAFT");
    if (draftJson.data?.id) {
      cleanupSubmissionIds.push(draftJson.data.id);
    }

    // 4. Historical 2569 below_higher dossier retains year-scoped Royal Trophy metadata while 2570 draft below_higher uses KMUTNB Trophy
    const draftStatusRes = await app.handle(
      new Request(`http://localhost/api/submissions/status/${draftJson.data.trackingCode}`)
    );
    expect(draftStatusRes.status).toBe(200);
    const draftStatusJson: any = await draftStatusRes.json();
    expect(draftStatusJson.data.isRoyalTrophy).toBe(false);
    expect(draftStatusJson.data.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");

    const hist2569Res = await app.handle(
      new Request("http://localhost/api/submissions/status/KMUTNB-2569-0004")
    );
    expect(hist2569Res.status).toBe(200);
    const hist2569Json: any = await hist2569Res.json();
    expect(hist2569Json.data.educationLevel).toBe("below_higher");
    expect(hist2569Json.data.isRoyalTrophy).toBe(true);
    expect(hist2569Json.data.trophyShortTh).toBe("ถ้วยพระราชทานฯ");
  });

  test("PATCH /api/submissions/tracking/:trackingCode/artifacts requires owner auth (401/403) and ignores spoofed payload.userId on POST /api/submissions", async () => {
    const otherRegRes = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otherEmail,
          password: "Contestant2026!",
          fullName: "ผู้แข่งขัน อีกราย",
          educationLevel: "general_public",
        }),
      })
    );
    const otherRegJson: any = await otherRegRes.json();
    const otherToken = otherRegJson.token;
    const otherUserId = otherRegJson.user.id;

    // Unauthenticated caller attempting to spoof otherUserId in payload.userId cannot attribute project to otherUserId
    const spoofRes = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: otherUserId,
          titleTh: "Spoofed Project",
          category: "agri_food",
          educationLevel: "general_public",
          teamName: "Spoofer",
        }),
      })
    );
    const spoofJson: any = await spoofRes.json().catch(() => null);
    if (spoofJson?.data?.id) {
      cleanupSubmissionIds.push(spoofJson.data.id);
    }

    const otherMyRes = await app.handle(
      new Request("http://localhost/api/submissions/my", {
        headers: { Authorization: `Bearer ${otherToken}` },
      })
    );
    const otherMyJson: any = await otherMyRes.json();
    expect(otherMyJson.data.length).toBe(0);

    const unauthPatch = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${secondTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/unauthorized.pdf",
        }),
      })
    );
    expect(unauthPatch.status).toBe(401);

    const otherUserPatch = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${secondTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${otherToken}`,
        },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/other-user.pdf",
        }),
      })
    );
    expect(otherUserPatch.status).toBe(403);

    const patchRes = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${secondTrackingCode}/artifacts`, {
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
    const patchJson: any = await patchRes.json();
    expect(patchJson.success).toBe(true);
    expect(patchJson.data.artifacts.posterUrl).toBe("https://drive.google.com/poster-round2.pdf");
    expect(patchJson.data.artifacts.presentationUrl).toBe("https://drive.google.com/slides-round3.pdf");
    expect(patchJson.data.artifacts.proposalPdfUrl).toBe("https://drive.google.com/proposal.pdf");

    // Sending empty posterUrl does not wipe existing posterUrl
    const partialRes = await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${secondTrackingCode}/artifacts`, {
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
    const partialJson: any = await partialRes.json();
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
            educationLevel: "higher_education",
            teamName: "เขาชื่ออะไร",
          }),
        })
      );
      expect(lateFormEditRes.status).toBe(403);

      const lateArtifactAfterDeadlineRes = await app.handle(
        new Request(`http://localhost/api/submissions/tracking/${secondTrackingCode}/artifacts`, {
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
