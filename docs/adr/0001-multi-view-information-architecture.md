# 0001. Multi-View Information Architecture and Guidelines Consolidation

Date: 2026-08-18

## Status

Accepted

## Context

The initial prototype placed all competition information (Hero, Eligibility, Checklist, 5 Innovation Domains, Timeline, Hall of Fame, Downloads, Contact) onto a single long landing page. As the project scope grew to include full competition standards, judging rubrics, and detailed award tiers, the single-page layout became excessively long and difficult for applicants to navigate efficiently.

Furthermore, having standalone top-level menu items for "คุณสมบัติ" and "หมวดหมู่นวัตกรรม" created menu clutter that risked wrapping into multiple lines.

## Decision

1. **Split into Dedicated Views with Instant Hash Navigation:**
   - `#/` — **หน้าแรก (Home):** High-impact summary, countdown, quick highlights, and portal entry.
   - `#/guidelines` — **รายละเอียดการแข่งขัน (Competition Guidelines):** Single consolidated hub containing:
     1. คุณสมบัติและเงื่อนไข (Eligibility & Rules)
     2. หมวดของผลงาน (5 Innovation Domains with high-clarity 3D artwork)
     3. รางวัลการประกวด (Royal Trophy, Cash Prizes, Honorable Mentions)
     4. มาตรฐานผลงาน (Submission Standards & Deliverables)
     5. หลักเกณฑ์การพิจารณา (Judging Criteria & Scoring Rubric)
   - `#/schedule` — **กำหนดการ (Schedule & Timeline):** Phase milestones, active indicator, and venue roadmap.
   - `#/announcements` — **ประกาศผล (Announcements & Results):** Official results hub, finalist rosters, award announcements, and PDF downloads.
   - `#/halloffame` — **คลังผลงาน (Hall of Fame):** Award archives and inspiration showcase.
   - `#/contact` — **ติดต่อ (Contact & Downloads):** Organizer directory, venue location, and official PDF downloads.

2. **Streamlined Single-Row Navbar:**
   - 6 focused links (`หน้าแรก`, `รายละเอียดการแข่งขัน`, `กำหนดการ`, `ประกาศผล`, `คลังผลงาน`, `ติดต่อ`) + 2 primary action buttons (`ตรวจสถานะ` and `สมัครประกวด`).
   - Remove standalone "หมวดหมู่นวัตกรรม" link from the top navbar.

3. **Sub-Navigation on Guidelines Page:**
   - Use sticky section anchor tabs (`คุณสมบัติ`, `หมวดหมู่นวัตกรรม`, `รางวัลการประกวด`, `มาตรฐานผลงาน`, `เกณฑ์การตัดสิน`) for effortless in-page jumping.

## Consequences

### Positive
- The landing page is lightweight, fast-loading, and visually impactful.
- Applicants have a dedicated, bookmarkable link (`#/guidelines`, `#/schedule`) for reading all technical requirements.
- Navbar fits cleanly on a single row without wrapping on standard screens.
- Clear separation between marketing summary and official regulatory details.

### Negative / Trade-offs
- Users need to switch views or click into `#/guidelines` to read the exhaustive rules rather than scrolling continuously from the hero.
