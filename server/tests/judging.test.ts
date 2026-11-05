import { test, expect, describe } from "bun:test";
import { app } from "../src/index";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";

describe("Judging, Weighted Rubric Evaluation & Result Publishing (/api/judging)", () => {
  const ts = Date.now();
  const adminEmail = `admin-judge-${ts}@kmutnb.ac.th`;
  const judgeEmail = `judge-energy-${ts}@kmutnb.ac.th`;
  const contestantEmail = `contestant-judge-${ts}@kmutnb.ac.th`;

  let adminToken = "";
  let judgeToken = "";
  let judgeId = "";
  let contestantToken = "";
  let energySubId = "";
  let energyTrackingCode = "";
  let foodSubId = "";

  test("Setup ADMIN and CONTESTANT and create 2 submissions in different categories", async () => {
    const adminReg = await app.handle(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: "AdminPassword2027!",
          fullName: "Admin Judging Tester",
          educationLevel: "higher_and_above",
        }),
      })
    );
    const adminJson = await adminReg.json();
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
          educationLevel: "higher_and_above",
        }),
      })
    );
    const contJson = await contReg.json();
    contestantToken = contJson.token;

    // Submission 1: energy_environment
    const sub1Res = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          titleTh: "ระบบโซลาร์เซลล์อัจฉริยะติดตามแสงอาทิตย์",
          titleEn: "Smart Dual-Axis Solar Tracker",
          category: "energy_environment",
          educationLevel: "higher_and_above",
          teamName: "SolarSmart",
          abstractTh: "ระบบควบคุมแผงโซลาร์เซลล์อัตโนมัติ",
          proposalPdfUrl: "https://drive.google.com/solar-proposal.pdf",
          videoUrl: "https://youtube.com/watch?v=solar123",
          coverImage: "/winner-solar.jpg",
          isDraft: false,
        }),
      })
    );
    const sub1Json = await sub1Res.json();
    expect(sub1Res.status).toBe(200);
    energySubId = sub1Json.data.id;
    energyTrackingCode = sub1Json.data.trackingCode;

    // Submission 2: food_agriculture
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
          category: "food_agriculture",
          educationLevel: "higher_and_above",
          teamName: "AgriSort",
          abstractTh: "เครื่องตรวจความหวานของผลไม้แบบไม่ทำลาย",
          proposalPdfUrl: "https://drive.google.com/agri-proposal.pdf",
          videoUrl: "https://youtube.com/watch?v=agri123",
          coverImage: "/winner-agri.jpg",
          isDraft: false,
        }),
      })
    );
    const sub2Json = await sub2Res.json();
    expect(sub2Res.status).toBe(200);
    foodSubId = sub2Json.data.id;

    // Admin passes Stage 0 screening (UNDER_REVIEW) for both
    await app.handle(
      new Request(`http://localhost/api/submissions/${energySubId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "UNDER_REVIEW" }),
      })
    );
    await app.handle(
      new Request(`http://localhost/api/submissions/${foodSubId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "UNDER_REVIEW" }),
      })
    );
  });

  test("POST /api/judging/judges creates a judge assigned to energy_environment for year 2570 and GET /api/judging/judges lists assignments", async () => {
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
          fullName: "รศ.ดร. กรรมการ พลังงาน",
          institution: "คณะวิศวกรรมศาสตร์ มจพ.",
          categories: ["energy_environment"],
          year: 2570,
        }),
      })
    );
    expect(createJudgeRes.status).toBe(200);
    const createJudgeJson = await createJudgeRes.json();
    expect(createJudgeJson.success).toBe(true);
    expect(createJudgeJson.data.assignedCategories).toEqual(["energy_environment"]);
    judgeId = createJudgeJson.data.id;

    const listRes = await app.handle(
      new Request("http://localhost/api/judging/judges?year=2570", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    const found = listJson.data.find((j: any) => j.email === judgeEmail);
    expect(found).toBeDefined();
    expect(found.assignedCategories).toEqual(["energy_environment"]);

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
    const loginJson = await loginRes.json();
    judgeToken = loginJson.token;
  });

  test("GET /api/judging/submissions filters by judge's assigned categories and POST /api/judging/submissions/:id/evaluate enforces category assignment and computes weighted score", async () => {
    const judgeListRes = await app.handle(
      new Request("http://localhost/api/judging/submissions?year=2570", {
        headers: { Authorization: `Bearer ${judgeToken}` },
      })
    );
    expect(judgeListRes.status).toBe(200);
    const judgeListJson = await judgeListRes.json();
    expect(judgeListJson.data.some((s: any) => s.id === energySubId)).toBe(true);
    expect(judgeListJson.data.some((s: any) => s.id === foodSubId)).toBe(false);

    // Attempting to evaluate unassigned category (food_agriculture) returns 403
    const forbiddenEvalRes = await app.handle(
      new Request(`http://localhost/api/judging/submissions/${foodSubId}/evaluate`, {
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

    // Evaluating assigned category (energy_environment) in ROUND_1 succeeds
    // Weights: creativity(25)*5/5=25 + prototype(25)*4/5=20 + impact(20)*4/5=16 + sustainability(15)*4/5=12 + presentation(15)*5/5=15 = 88
    const r1EvalRes = await app.handle(
      new Request(`http://localhost/api/judging/submissions/${energySubId}/evaluate`, {
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
    const r1EvalJson = await r1EvalRes.json();
    expect(r1EvalJson.data.weightedTotal).toBe(88);

    // Contestant attaches POSTER for Round 2
    await app.handle(
      new Request(`http://localhost/api/submissions/tracking/${energyTrackingCode}/artifacts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${contestantToken}`,
        },
        body: JSON.stringify({
          posterUrl: "https://drive.google.com/solar-poster.pdf",
        }),
      })
    );

    // Evaluate ROUND_2 independently without overwriting ROUND_1 (all 5s => 100)
    const r2EvalRes = await app.handle(
      new Request(`http://localhost/api/judging/submissions/${energySubId}/evaluate`, {
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
    const r2EvalJson = await r2EvalRes.json();
    expect(r2EvalJson.data.weightedTotal).toBe(100);

    // Verify GET /api/judging/submissions has both ROUND_1 (88) and ROUND_2 (100) summaries and hasPoster = true
    const afterEvalRes = await app.handle(
      new Request("http://localhost/api/judging/submissions?year=2570", {
        headers: { Authorization: `Bearer ${judgeToken}` },
      })
    );
    const afterEvalJson = await afterEvalRes.json();
    const targetSub = afterEvalJson.data.find((s: any) => s.id === energySubId);
    expect(targetSub.hasPoster).toBe(true);
    expect(targetSub.roundSummaries.ROUND_1.avgScore).toBe(88);
    expect(targetSub.roundSummaries.ROUND_2.avgScore).toBe(100);
  });

  test("POST /api/judging/publish-results publishes FINALISTS and WINNERS announcements with rosters", async () => {
    let r2AnnId = "";
    let r3AnnId = "";
    try {
      // Admin advances energySubId to FINALIST and then AWARDED
      await app.handle(
        new Request(`http://localhost/api/submissions/${energySubId}/status`, {
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
      const pubRound2Json = await pubRound2Res.json();
      expect(pubRound2Json.success).toBe(true);
      expect(pubRound2Json.data.rosterCount).toBeGreaterThanOrEqual(1);
      r2AnnId = pubRound2Json.data.announcementId;

      // Admin awards GRAND_WINNER in Round 3
      await app.handle(
        new Request(`http://localhost/api/submissions/${energySubId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            status: "AWARDED",
            round3Status: "PASSED",
            awardTier: "GRAND_WINNER",
            awardNameTh: "รางวัลชนะเลิศ ถ้วยพระราชทานฯ",
          }),
        })
      );

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
      const pubRound3Json = await pubRound3Res.json();
      expect(pubRound3Json.success).toBe(true);
      expect(pubRound3Json.data.rosterCount).toBeGreaterThanOrEqual(1);
      r3AnnId = pubRound3Json.data.announcementId;

      const annCheckRes = await app.handle(new Request("http://localhost/api/announcements?year=2570"));
      const annCheckJson = await annCheckRes.json();
      expect(annCheckJson.data.some((a: any) => a.id === r2AnnId)).toBe(true);
      expect(annCheckJson.data.some((a: any) => a.id === r3AnnId)).toBe(true);
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
      await prisma.submission.deleteMany({
        where: { id: { in: [energySubId, foodSubId].filter(Boolean) } },
      });
    }
  });
});
