import { afterAll, describe, expect, test } from "bun:test";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";

describe("Judging, Weighted Rubric Evaluation & Result Publishing (/api/judging)", () => {
  const ts = Date.now();
  const adminEmail = `admin-judge-${ts}@kmutnb.ac.th`;
  const judgeEmail = `judge-eng-${ts}@kmutnb.ac.th`;
  const contestantEmail = `contestant-judge-${ts}@kmutnb.ac.th`;

  let adminToken = "";
  let judgeToken = "";
  let judgeId = "";
  let contestantToken = "";
  let engSubId = "";
  let engTrackingCode = "";
  let agriSubId = "";
  let agriTrackingCode = "";

  afterAll(async () => {
    await prisma.submission.deleteMany({
      where: { id: { in: [engSubId, agriSubId].filter(Boolean) } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, judgeEmail, contestantEmail] } },
    });
  });

  test("Setup ADMIN and CONTESTANT and create 2 submissions in active 2570 categories and tiers", async () => {
    const adminReg = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: "AdminPassword2027!",
          fullName: "Admin Judging Tester",
          educationLevel: "general_public",
        }),
      })
    );
    const adminJson: any = await adminReg.json();
    await prisma.user.update({
      where: { id: adminJson.user.id },
      data: { role: Role.ADMIN },
    });
    adminToken = adminJson.token;

    const contReg = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contestantEmail,
          password: "ContestantPassword2027!",
          fullName: "Contestant Judging Tester",
          educationLevel: "general_public",
        }),
      })
    );
    const contJson: any = await contReg.json();
    contestantToken = contJson.token;

    // Submission 1: engineering_ai + general_public (Royal Trophy tier)
    const sub1Res = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "ระบบหุ่นยนต์ปัญญาประดิษฐ์ตรวจสอบโครงสร้างอุตสาหกรรม",
          titleEn: "Autonomous Industrial Structure Inspection Robot",
          category: "engineering_ai",
          educationLevel: "general_public",
          teamName: "RoboInspect AI",
          abstractTh: "หุ่นยนต์อัตโนมัติพร้อมต้นแบบใช้งานจริงในโรงงาน",
          proposalPdfUrl: "https://drive.google.com/robo-proposal.pdf",
          videoUrl: "https://youtube.com/watch?v=robo123",
          coverImage: "/winner-robo.jpg",
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );
    const sub1Json: any = await sub1Res.json();
    expect(sub1Res.status).toBe(200);
    engSubId = sub1Json.data.id;
    engTrackingCode = sub1Json.data.trackingCode;

    // Submission 2: agri_food + higher_education (KMUTNB Trophy tier)
    const sub2Res = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "เครื่องคัดแยกคุณภาพผลไม้ด้วยสเปกตรัม",
          titleEn: "Spectral Fruit Sorter",
          category: "agri_food",
          educationLevel: "higher_education",
          teamName: "AgriSort",
          abstractTh: "เครื่องตรวจความหวานของผลไม้แบบไม่ทำลายพร้อมชิ้นงานต้นแบบ",
          proposalPdfUrl: "https://drive.google.com/agri-proposal.pdf",
          videoUrl: "https://youtube.com/watch?v=agri123",
          coverImage: "/winner-agri.jpg",
          hasPrototypeConfirmed: true,
          isDraft: false,
        }),
      })
    );
    const sub2Json: any = await sub2Res.json();
    expect(sub2Res.status).toBe(200);
    agriSubId = sub2Json.data.id;
    agriTrackingCode = sub2Json.data.trackingCode;

    // Admin passes Stage 0 screening (UNDER_REVIEW) for both
    await app.handle(
      new Request(`http://localhost/api/submissions/${engSubId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "UNDER_REVIEW" }),
      })
    );
    await app.handle(
      new Request(`http://localhost/api/submissions/${agriSubId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "UNDER_REVIEW" }),
      })
    );
  });

  test("POST /api/judging/judges creates a judge defaulting to general_public assigned to engineering_ai for year 2570", async () => {
    const createJudgeRes = await app.handle(
      new Request("http://localhost/api/judging/judges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          email: judgeEmail,
          password: "JudgePassword2027!",
          fullName: "รศ.ดร. กรรมการ วิศวกรรมและ AI",
          institution: "คณะวิศวกรรมศาสตร์ มจพ.",
          categories: ["engineering_ai"],
          year: 2570,
        }),
      })
    );
    expect(createJudgeRes.status).toBe(200);
    const createJudgeJson: any = await createJudgeRes.json();
    expect(createJudgeJson.success).toBe(true);
    expect(createJudgeJson.data.assignedCategories).toEqual(["engineering_ai"]);
    judgeId = createJudgeJson.data.id;

    const judgeUserDb = await prisma.user.findUnique({
      where: { id: judgeId },
      include: { educationLevel: true },
    });
    expect(judgeUserDb?.educationLevel.code).toBe("general_public");

    const listRes = await app.handle(
      new Request("http://localhost/api/judging/judges?year=2570", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(listRes.status).toBe(200);
    const listJson: any = await listRes.json();
    const found = listJson.data.find((j: any) => j.email === judgeEmail);
    expect(found).toBeDefined();
    expect(found.assignedCategories).toEqual(["engineering_ai"]);

    // Login as the newly created judge
    const loginRes = await app.handle(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: judgeEmail,
          password: "JudgePassword2027!",
        }),
      })
    );
    expect(loginRes.status).toBe(200);
    const loginJson: any = await loginRes.json();
    judgeToken = loginJson.token;
  });

  test("GET /api/judging/submissions exposes trophy metadata, filters by judge's assigned categories, and evaluates weighted rubric", async () => {
    const judgeListRes = await app.handle(
      new Request("http://localhost/api/judging/submissions?year=2570", {
        headers: { Authorization: `Bearer ${judgeToken}` },
      })
    );
    expect(judgeListRes.status).toBe(200);
    const judgeListJson: any = await judgeListRes.json();
    const judgeEngSub = judgeListJson.data.find((s: any) => s.id === engSubId);
    expect(judgeEngSub).toBeDefined();
    expect(judgeEngSub.isRoyalTrophy).toBe(true);
    expect(judgeEngSub.trophyShortTh).toBe("ถ้วยพระราชทานฯ");
    expect(judgeListJson.data.some((s: any) => s.id === agriSubId)).toBe(false);

    // Admin sees both tiers with distinct trophy metadata
    const adminListRes = await app.handle(
      new Request("http://localhost/api/judging/submissions?year=2570", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(adminListRes.status).toBe(200);
    const adminListJson: any = await adminListRes.json();
    const adminAgriSub = adminListJson.data.find((s: any) => s.id === agriSubId);
    expect(adminAgriSub).toBeDefined();
    expect(adminAgriSub.isRoyalTrophy).toBe(false);
    expect(adminAgriSub.trophyShortTh).toBe("ถ้วยรางวัล มจพ.");

    // Attempting to evaluate unassigned category (agri_food) returns 403
    const forbiddenEvalRes = await app.handle(
      new Request(`http://localhost/api/judging/submissions/${agriSubId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${judgeToken}`,
        },
        body: JSON.stringify({
          round: "ROUND_1",
          scores: {
            creativity: 5,
            prototype: 4,
            impact: 4,
            sustainability: 4,
            presentation: 5,
          },
          comment: "พยายามประเมินข้ามหมวด",
        }),
      })
    );
    expect(forbiddenEvalRes.status).toBe(403);

    // Evaluating assigned category (engineering_ai) in ROUND_1 succeeds
    // Weights: creativity(25)*5/5=25 + prototype(25)*4/5=20 + impact(20)*4/5=16 + sustainability(15)*4/5=12 + presentation(15)*5/5=15 = 88
    const r1EvalRes = await app.handle(
      new Request(`http://localhost/api/judging/submissions/${engSubId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${judgeToken}`,
        },
        body: JSON.stringify({
          round: "ROUND_1",
          scores: {
            creativity: 5,
            prototype: 4,
            impact: 4,
            sustainability: 4,
            presentation: 5,
          },
          comment: "ผลงานโดดเด่น ผ่านเกณฑ์รอบที่ 1",
        }),
      })
    );
    expect(r1EvalRes.status).toBe(200);
    const r1EvalJson: any = await r1EvalRes.json();
    expect(r1EvalJson.data.weightedTotal).toBe(88);

    // Contestant attaches POSTER for Round 2
    await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${engTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/robo-poster.pdf",
        }),
      })
    );

    // Evaluate ROUND_2 independently without overwriting ROUND_1 (all 5s => 100)
    const r2EvalRes = await app.handle(
      new Request(`http://localhost/api/judging/submissions/${engSubId}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${judgeToken}`,
        },
        body: JSON.stringify({
          round: "ROUND_2",
          scores: {
            creativity: 5,
            prototype: 5,
            impact: 5,
            sustainability: 5,
            presentation: 5,
          },
          comment: "โปสเตอร์และการนำเสนอออนไลน์ยอดเยี่ยม",
        }),
      })
    );
    expect(r2EvalRes.status).toBe(200);
    const r2EvalJson: any = await r2EvalRes.json();
    expect(r2EvalJson.data.weightedTotal).toBe(100);

    // Verify GET /api/judging/submissions has both ROUND_1 (88) and ROUND_2 (100) summaries and hasPoster = true
    const afterEvalRes = await app.handle(
      new Request("http://localhost/api/judging/submissions?year=2570", {
        headers: { Authorization: `Bearer ${judgeToken}` },
      })
    );
    const afterEvalJson: any = await afterEvalRes.json();
    const targetSub = afterEvalJson.data.find((s: any) => s.id === engSubId);
    expect(targetSub.hasPoster).toBe(true);
    expect(targetSub.roundSummaries.ROUND_1.avgScore).toBe(88);
    expect(targetSub.roundSummaries.ROUND_2.avgScore).toBe(100);
  });

  test("PATCH /api/submissions/:id/status auto-resolves Royal vs KMUTNB Trophy for GRAND_WINNER and POST /api/judging/publish-results mentions both trophies in ROUND_3", async () => {
    let r2AnnId = "";
    let r3AnnId = "";
    const year2570Before = await prisma.competitionYear.findUnique({
      where: { year: 2570 },
    });

    try {
      // Admin advances both submissions to FINALIST
      for (const subId of [engSubId, agriSubId]) {
        await app.handle(
          new Request(`http://localhost/api/submissions/${subId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              status: "FINALIST",
              round1Status: "PASSED",
              round2Status: "PASSED",
            }),
          })
        );
      }

      const pubRound2Res = await app.handle(
        new Request("http://localhost/api/judging/publish-results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            year: 2570,
            stage: "ROUND_2",
          }),
        })
      );
      expect(pubRound2Res.status).toBe(200);
      const pubRound2Json: any = await pubRound2Res.json();
      expect(pubRound2Json.success).toBe(true);
      expect(pubRound2Json.data.rosterCount).toBeGreaterThanOrEqual(2);
      r2AnnId = pubRound2Json.data.announcementId;

      // Manual round3Result override is respected when explicitly supplied
      const manualAwardRes = await app.handle(
        new Request(`http://localhost/api/submissions/${agriSubId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: "AWARDED",
            round3Status: "PASSED",
            awardTier: "GRAND_WINNER",
            round3Result: "รางวัลชนะเลิศกิตติมศักดิ์ (ถ้วยรางวัล มจพ.)",
          }),
        })
      );
      expect(manualAwardRes.status).toBe(200);
      const manualAwardJson: any = await manualAwardRes.json();
      expect(manualAwardJson.data.round3Result).toBe("รางวัลชนะเลิศกิตติมศักดิ์ (ถ้วยรางวัล มจพ.)");

      // Review Focus #5: Award GRAND_WINNER without manual round3Result / awardNameTh override
      // 1) general_public -> รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)
      const engAwardRes = await app.handle(
        new Request(`http://localhost/api/submissions/${engSubId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: "AWARDED",
            round3Status: "PASSED",
            awardTier: "GRAND_WINNER",
          }),
        })
      );
      expect(engAwardRes.status).toBe(200);
      const engAwardJson: any = await engAwardRes.json();
      expect(engAwardJson.data.round3Result).toBe("รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)");
      const engAwardDb = await prisma.submission.findUnique({ where: { id: engSubId } });
      expect(engAwardDb?.awardNameTh).toBe("รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)");

      // 2) higher_education -> รางวัลชนะเลิศ (ถ้วยรางวัล มจพ.)
      const agriAwardRes = await app.handle(
        new Request(`http://localhost/api/submissions/${agriSubId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: "AWARDED",
            round3Status: "PASSED",
            awardTier: "GRAND_WINNER",
          }),
        })
      );
      expect(agriAwardRes.status).toBe(200);
      const agriAwardJson: any = await agriAwardRes.json();
      expect(agriAwardJson.data.round3Result).toBe("รางวัลชนะเลิศ (ถ้วยรางวัล มจพ.)");
      const agriAwardDb = await prisma.submission.findUnique({ where: { id: agriSubId } });
      expect(agriAwardDb?.awardNameTh).toBe("รางวัลชนะเลิศ (ถ้วยรางวัล มจพ.)");

      // Publish ROUND_3 without custom title/abstract
      const pubRound3Res = await app.handle(
        new Request("http://localhost/api/judging/publish-results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            year: 2570,
            stage: "ROUND_3",
          }),
        })
      );
      expect(pubRound3Res.status).toBe(200);
      const pubRound3Json: any = await pubRound3Res.json();
      expect(pubRound3Json.success).toBe(true);
      expect(pubRound3Json.data.rosterCount).toBeGreaterThanOrEqual(2);
      r3AnnId = pubRound3Json.data.announcementId;

      const annCheckRes = await app.handle(
        new Request("http://localhost/api/announcements?year=2570")
      );
      const annCheckJson: any = await annCheckRes.json();
      expect(annCheckJson.data.some((a: any) => a.id === r2AnnId)).toBe(true);

      const r3Ann = annCheckJson.data.find((a: any) => a.id === r3AnnId);
      expect(r3Ann).toBeDefined();
      expect(r3Ann.title).toContain("ถ้วยพระราชทานฯ");
      expect(r3Ann.title).toContain("ถ้วยรางวัล มจพ.");
      expect(r3Ann.title).not.toContain("โล่");
      expect(r3Ann.abstract).toContain("ถ้วยพระราชทานฯ");
      expect(r3Ann.abstract).toContain("ถ้วยรางวัล มจพ.");
      expect(r3Ann.abstract).not.toContain("โล่");

      const engRoster = r3Ann.roster.find((r: any) => r.code === engTrackingCode);
      const agriRoster = r3Ann.roster.find((r: any) => r.code === agriTrackingCode);
      expect(engRoster?.awardTierText).toBe("รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)");
      expect(agriRoster?.awardTierText).toBe("รางวัลชนะเลิศ (ถ้วยรางวัล มจพ.)");
    } finally {
      if (r2AnnId) await prisma.announcement.deleteMany({ where: { id: r2AnnId } });
      if (r3AnnId) await prisma.announcement.deleteMany({ where: { id: r3AnnId } });
      await prisma.announcement.deleteMany({
        where: {
          badgeText: {
            in: ["ประกาศผู้เข้ารอบชิงชนะเลิศ • 2570", "ประกาศผลผู้ชนะเลิศ • 2570"],
          },
        },
      });
      if (year2570Before) {
        await prisma.competitionYear.update({
          where: { id: year2570Before.id },
          data: { status: year2570Before.status },
        });
      }
      await prisma.submission.deleteMany({
        where: { id: { in: [engSubId, agriSubId].filter(Boolean) } },
      });
    }
  });
});
