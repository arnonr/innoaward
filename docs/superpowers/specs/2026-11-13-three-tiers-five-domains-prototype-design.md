# Multi-Year Competition Tiers (`CompetitionYearLevel`), 5 Updated Innovation Domains & Mandatory Prototype Gate — Design Spec

**Date:** 2026-11-13  
**Project:** KMUTNB Innovation Awards (`innoaward`)  
**Scope Size:** A project (Prisma schema extension `CompetitionYearLevel`, Elysia config/masters/submissions/judging APIs, year-scoped seed data preserving 2569 history, 3D Hero/Domain visual catalog, dynamic Guidelines/Prizes UI, and Submission Prototype confirmation gate)

---

## 1. Intent & Why

Update **โครงการประกวดสิ่งประดิษฐ์และนวัตกรรมพระจอมเกล้าพระนครเหนือ ประจำปี 2570 (KMUTNB Innovation Awards 2027)** to match the newly approved competition structure while making competition tiers and prize structures year-scoped in the database so historical years (2569 and earlier) remain intact and future years (2571+) can evolve without rewriting product code:

1. **Expand from 2 competition tiers to 3 competition tiers (ประเภทการแข่งขัน):**
   - **ประเภทที่ 1: บุคคลทั่วไป (`general_public`)** — ชิง **ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี** • เงินรางวัลรวม **105,000 บาท**
   - **ประเภทที่ 2: อุดมศึกษา (`higher_education`)** — ชิง **ถ้วยรางวัล มจพ.** • เงินรางวัลรวม **75,000 บาท**
   - **ประเภทที่ 3: ต่ำกว่าอุดมศึกษา (มัธยมศึกษา/อาชีวศึกษา) (`below_higher`)** — ชิง **ถ้วยรางวัล มจพ.** • เงินรางวัลรวม **75,000 บาท**
   - **ยอดเงินรางวัลรวมทั้งโครงการ:** **255,000 บาท** (รวมทั้งสิ้น 18 รางวัล • ประเภทละ 6 รางวัล)
2. **Enforce a mandatory Prototype baseline across all 3 tiers:**
   - ทั้ง 3 ประเภทการแข่งขัน **ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ** ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea Only)
3. **Restructure the 5 Innovation Categories (หมวดหมู่การแข่งขัน ๑–๕):**
   1. **ด้านการเกษตรและอุตสาหกรรมอาหาร** (`agri_food`)
   2. **ด้านการสาธารณสุข สุขภาพและเทคโนโลยีทางการแพทย์** (`health_medtech`)
   3. **ด้านวิศวกรรมศาสตร์ เทคโนโลยีปัญญาประดิษฐ์และอุปกรณ์อัจฉริยะ** (`engineering_ai`)
   4. **ด้านพลังงาน สิ่งแวดล้อม เทคโนโลยีวัสดุ และ BCG Economy Model** (`energy_env_material_bcg`)
   5. **ด้านคุณภาพชีวิต และ Soft Power** (`quality_of_life_soft_power`)

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Year-scoped Competition Tiers & Prizes (`CompetitionYearLevel`):**
  - Mirror the existing `CompetitionYearCategory` architecture by introducing `CompetitionYearLevel` linking `CompetitionYear` and `EducationLevel`, storing year-specific display names, eligibility criteria, trophy title (`ถ้วยพระราชทานฯ` vs `ถ้วยรางวัล มจพ.`), `isRoyalTrophy` flag, `totalPrizeAmount`, structured `prizeBreakdown` JSON, `requiresPrototype` flag, and `orderIndex`.
  - `GET /api/config` (and `?year=YYYY`) computes `educationLevels`, `totalPrizePool`, `totalAwardCount`, and `prizes` directly from active `CompetitionYearLevel` rows for that year (`255,000` THB / 3 tiers / 18 awards for `2570`; `180,000` THB / 2 tiers / 12 awards for `2569`).
  - `POST /api/config/levels` (Admin Only) allows adding/updating year-scoped competition tiers and prize structures, and `POST /api/config/years` clones both `CompetitionYearCategory` and `CompetitionYearLevel` rows when rolling over to a new competition year (e.g., `2571`).
- **5 Official 2570 Innovation Categories with Full Official Scope:**
  - Seed and bind the 5 official 2570 categories (`orderIndex` 1..5) to year `2570` via `CompetitionYearCategory`, including the complete official Thai scope descriptions (๑–๕).
  - Remove the standalone `อื่นๆ (Others)` option from the active 2570 submission form and hero telemetry because each of the 5 official categories explicitly covers *"และอื่น ๆ ที่เกี่ยวข้อง"*.
  - Update `DOMAIN_CATALOG`, `HeroThreeStage.jsx`, `heroThreeStageConfig.js`, and `DomainLivingCardBg.jsx` with the 5 new categories, including generating cohesive 16:9 domain background visuals for the 2 newly themed domains (`engineering_ai` and `quality_of_life_soft_power`).
- **Mandatory Prototype Confirmation Gate (Soft Gate chosen by user):**
  - Explicitly state the minimum Prototype requirement (no Idea-only submissions) across all 3 eligibility cards, Submission Standards, Domain Detail modals, and Home Quick Checklist.
  - Add a mandatory confirmation checkbox (`hasPrototypeConfirmed`) in Step 3 of the Submission Form before final submission (`isDraft: false`). Saving a draft (`isDraft: true`) remains unrestricted so contestants can save progress early.
- **100% Preservation of Historical 2569 Hall of Fame & Announcements:**
  - Keep year `2569` bound to its historical categories (`energy_environment`, `food_agriculture`, `social_economy`, `medical_device`, `material`) and historical levels (`higher_and_above`, `below_higher`) so all 6 awarded 2569 entries (`KMUTNB-2569-0001`..`0006`) and 2569 official winner announcements display their exact historical titles, categories, and awards without corruption.
  - Ensure Hall of Fame filters and Domain Detail sample winner previews (`getDomainSampleWinners`) gracefully bridge 2570 domains with related 2569 winners.

### Non-Goals
- Adding separate multi-field prototype test-metrics tables to `Submission` (user explicitly chose Option 1: Guidelines rule + mandatory confirmation checkbox in the submission form alongside Proposal PDF, 2–3 min Video Pitch, and Prototype Image).
- Rewriting or regenerating external official PDF/DOCX attachments in `client/public/docs/` unless separately requested.

### Anti-Goals
- Mutating or overwriting `higher_and_above` or 2569 category records in-place in a way that changes 2569 Hall of Fame labels to 2570 names.
- Awarding or labeling `higher_education` or `below_higher` champions in 2570 as receiving `ถ้วยพระราชทานฯ` (only `general_public` receives the Royal Trophy in 2570; the other two receive `ถ้วยรางวัล มจพ.`).
- Mentioning plaques (`โล่รางวัล`) anywhere in prizes or announcements (strict existing brand invariant: trophies for champions + certificates, no plaques).

---

## 3. Constraints

- **Runtime & Stack:** Backend runs on Bun + Elysia + Prisma (`postgresql`), tested via `bun test`. Frontend runs on React 19 + Vite + Three.js (`client/`), unit-tested via `node --test`.
- **WebGL & Accessibility Restraint:** Keep `HeroThreeStage` and `DomainLivingCardBg` at exactly 5 domain slots (`0..4`) with zero additional WebGL contexts, preserving `prefers-reduced-motion` and Thai typography legibility (no `letter-spacing` on Thai text, WCAG AA contrast).
- **Draft Integrity:** Contestant draft saving (`isDraft: true`) must continue requiring only `titleTh` at minimum and must never fail due to an unchecked final-submission prototype checkbox.

---

## 4. Approaches Considered

### Approach 1: Additive Master Records + `isActive` Flag Without Schema Changes
- **How it works:** Keep the existing `EducationLevel` table unchanged, mark legacy `higher_and_above` as `isActive: false`, add `general_public` and `higher_education` as `isActive: true`, and hardcode the 3-tier prize breakdown in `config.controller.ts` and `App.jsx`.
- **Trade-offs:** Avoids a Prisma migration, but cannot represent year-by-year differences in competition tiers, trophies, or prize pools (`GET /api/config?year=2569` vs `?year=2570` vs `?year=2571`), leaving `EducationLevel` inconsistent with the year-scoped `CompetitionYearCategory` design.

### Approach 2: Year-Scoped `CompetitionYearLevel` Schema + Dynamic Tier & Prize Configuration (Selected)
- **How it works:** Add a `CompetitionYearLevel` join/config model in `server/prisma/schema.prisma` (parallel to `CompetitionYearCategory`) storing per-year tier metadata, trophy honors, prototype rules, and prize breakdowns; expose year-aware config/master endpoints and render Guidelines Eligibility & Prize sections dynamically from the year's configured levels.
- **Trade-offs:** Requires a Prisma schema update (`prisma db push` / migration) and updating server/client tests, in exchange for clean multi-year data isolation (2569 keeps its 2-tier 180,000 THB structure; 2570 gets its 3-tier 255,000 THB structure; 2571+ clones automatically via `/api/config/years`).
- **Why selected:** Explicitly chosen by the user (`2`) to maintain full multi-year architectural consistency across categories, levels, and prizes.

---

## 5. Detailed Design (Decisions & Architecture)

### 5.1 Competition Tiers, Eligibility & Prize Structure (Year 2570)

*(Note: Detailed eligibility wording and sub-prize breakdown for `higher_education` follow the defaults proposed during brainstorming and accepted by the user.)*

| Order | Code | ชื่อประเภท (`nameTh`) | กลุ่มผู้มีสิทธิ์สมัคร (`eligibleTh`) | ถ้วยเกียรติยศชนะเลิศ (`trophyTitleTh`) | `isRoyalTrophy` | เงินรางวัลรวม (`totalPrizeAmount`) | รายละเอียดรางวัลย่อย (`prizeBreakdown` — รวม 6 รางวัล/ประเภท) |
|---|---|---|---|---|---|---|---|
| 1 | `general_public` | บุคคลทั่วไป | อาจารย์, นักวิจัย, ผู้ประกอบการ, วิสาหกิจเริ่มต้น (Startup) และประชาชนทั่วไป (ส่งเดี่ยวหรือทีม 3–5 คน) | ถ้วยพระราชทาน สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี | `true` | `105,000` บาท | ชนะเลิศ (1): `40,000` บาท + ถ้วยพระราชทานฯ + เกียรติบัตร<br>รองอันดับ 1 (1): `30,000` บาท + เกียรติบัตร<br>รองอันดับ 2 (1): `20,000` บาท + เกียรติบัตร<br>ชมเชย (3): รางวัลละ `5,000` บาท (รวม `15,000` บาท) + เกียรติบัตร |
| 2 | `higher_education` | อุดมศึกษา | นิสิต นักศึกษาระดับปริญญาตรี ปริญญาโท และปริญญาเอก ทุกสถาบัน (ส่งเดี่ยวหรือทีม 3–5 คน) | ถ้วยรางวัล มจพ. | `false` | `75,000` บาท | ชนะเลิศ (1): `30,000` บาท + ถ้วยรางวัล มจพ. + เกียรติบัตร<br>รองอันดับ 1 (1): `20,000` บาท + เกียรติบัตร<br>รองอันดับ 2 (1): `10,000` บาท + เกียรติบัตร<br>ชมเชย (3): รางวัลละ `5,000` บาท (รวม `15,000` บาท) + เกียรติบัตร |
| 3 | `below_higher` | ต่ำกว่าอุดมศึกษา (มัธยมศึกษา/อาชีวศึกษา) | นักเรียนระดับมัธยมศึกษา และนักเรียน/นักศึกษาสายอาชีวศึกษา (ปวช. / ปวส. หรือเทียบเท่า) ต้องมีอาจารย์ที่ปรึกษารับรองอย่างน้อย 1 ท่าน | ถ้วยรางวัล มจพ. | `false` | `75,000` บาท | ชนะเลิศ (1): `30,000` บาท + ถ้วยรางวัล มจพ. + เกียรติบัตร<br>รองอันดับ 1 (1): `20,000` บาท + เกียรติบัตร<br>รองอันดับ 2 (1): `10,000` บาท + เกียรติบัตร<br>ชมเชย (3): รางวัลละ `5,000` บาท (รวม `15,000` บาท) + เกียรติบัตร |

- **เงื่อนไขขั้นต่ำร่วมกันทั้ง 3 ประเภท:** `ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)`
- **Historical Year 2569 (`CompetitionYearLevel` bindings):**
  1. `higher_and_above` (`ระดับอุดมศึกษาและบุคคลทั่วไป`, `isRoyalTrophy: true`, `totalPrizeAmount: 105000`)
  2. `below_higher` (`ระดับต่ำกว่าอุดมศึกษา`, `isRoyalTrophy: true`, `totalPrizeAmount: 75000`)
  - Master `EducationLevel.isActive` is `true` for `general_public`, `higher_education`, `below_higher`, and `false` for legacy `higher_and_above` (while keeping `higher_and_above` in `education_levels` so 2569 submissions, `CompetitionYearLevel` for 2569, and legacy auth/test lookups resolve cleanly).

### 5.2 The 5 Official Innovation Categories (Year 2570)

Ordered `1..5` exactly as specified in the official announcement:

1. **`agri_food`** (`DOMAIN 01`)
   - **ชื่อภาษาไทย:** ด้านการเกษตรและอุตสาหกรรมอาหาร
   - **ชื่อภาษาอังกฤษ:** Agriculture & Food Industry
   - **คำอธิบายทางการฉบับเต็ม (`overview` / `descriptionTh`):**
     > เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ต่อการผลิตผลทางการเกษตร พืช ประมง ปศุสัตว์ ป่าไม้ แมลงเศรษฐกิจ สาหร่าย เทคโนโลยีการเกษตร เกษตรอัจฉริยะ การอนุรักษ์ดิน น้ำ และสิ่งแวดล้อมในระบบนิเวศเกษตร วิศวกรรมและเครื่องจักรกลการเกษตร ธุรกิจการเกษตร อุตสาหกรรมเกษตร เทคโนโลยีในกระบวนการผลิตแปรรูปอาหาร อาหารฟังก์ชัน (Functional Foods) บรรจุภัณฑ์ และจัดจำหน่ายไปยังผู้บริโภค ตลอดจนการใช้ประโยชน์จากผลพลอยได้ทางการเกษตร กากของเหลือหรือวัสดุเหลือทิ้งจากภาคการเกษตร และอื่น ๆ ที่เกี่ยวข้อง
   - **Visuals & Legacy Mapping:** Icon `Leaf`, Color `#16A34A`, Photo `/domain-food.jpg`, `relatedCategoryIds: ['agri_food', 'food_agriculture']`.

2. **`health_medtech`** (`DOMAIN 02`)
   - **ชื่อภาษาไทย:** ด้านการสาธารณสุข สุขภาพ และเทคโนโลยีทางการแพทย์
   - **ชื่อภาษาอังกฤษ:** Public Health, Healthcare & Medical Technology
   - **คำอธิบายทางการฉบับเต็ม (`overview` / `descriptionTh`):**
     > เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านส่งเสริมสุขภาพ ป้องกัน ดูแล รักษา บำบัดโรค ตรวจสอบและวินิจฉัยโรค อุปกรณ์ทางการแพทย์ อุปกรณ์กายภาพบำบัด สมุนไพร เทคโนโลยีสุขภาพ (Healthtech) เทคโนโลยีการแพทย์ (Medtech) เครื่องสำอาง ผลิตภัณฑ์สุขภาพ ผลิตภัณฑ์จากธรรมชาติ (Natural Products) ผลิตภัณฑ์เสริมอาหาร (Supplementary Products) การดูแลสุขภาพอย่างชาญฉลาด (Smart Healthcare) และการสร้างเสริมสุขภาพและคุณภาพชีวิตของผู้ป่วยและประชากร และอื่น ๆ ที่เกี่ยวข้อง
   - **Visuals & Legacy Mapping:** Icon `Activity`, Color `#E11D48`, Photo `/domain-medical.jpg`, `relatedCategoryIds: ['health_medtech', 'medical_device']`.

3. **`engineering_ai`** (`DOMAIN 03`)
   - **ชื่อภาษาไทย:** ด้านวิศวกรรมศาสตร์ เทคโนโลยีปัญญาประดิษฐ์และอุปกรณ์อัจฉริยะ
   - **ชื่อภาษาอังกฤษ:** Engineering, AI & Smart Devices
   - **คำอธิบายทางการฉบับเต็ม (`overview` / `descriptionTh`):**
     > เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านวิศวกรรมศาสตร์ วิทยาศาสตร์ และอุตสาหกรรม เป็นผลงานทั้งประเภท Software และ Hardware การออกแบบและปรับปรุงกระบวนการผลิตและสภาวะแวดล้อม เช่น เทคโนโลยีหุ่นยนต์ (Robotics) เทคโนโลยีระบบราง เทคโนโลยีด้านการเงิน (Fintech) ธุรกิจพาณิชย์อิเล็กทรอนิกส์ (e-Commerce) อุปกรณ์เชื่อมต่อผ่านระบบอินเทอร์เน็ต (IoT) เทคโนโลยีการศึกษา (Edtech) Big Data ระบบอัตโนมัติ (Automation) Machine Learning ระบบควบคุมและเครื่องมือวัด (Control System and Instrument) ระบบเทคโนโลยีเสมือนจริง (Virtual Reality) และอื่น ๆ ที่เกี่ยวข้อง
   - **Visuals & Legacy Mapping:** Icon `Cpu`, Color `#06B6D4`, Photo `/domain-engineering.jpg` (newly generated 16:9 high-tech robotics/AI/engineering visual), `relatedCategoryIds: ['engineering_ai', 'social_economy']`.

4. **`energy_env_material_bcg`** (`DOMAIN 04`)
   - **ชื่อภาษาไทย:** ด้านพลังงาน สิ่งแวดล้อม เทคโนโลยีวัสดุ และ BCG Economy Model
   - **ชื่อภาษาอังกฤษ:** Energy, Environment, Materials & BCG Economy
   - **คำอธิบายทางการฉบับเต็ม (`overview` / `descriptionTh`):**
     > เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านพลังงานและสิ่งแวดล้อม การแก้ไข ฟื้นฟู บำรุงรักษา ปรับปรุงคุณภาพ ตรวจวิเคราะห์ทางพลังงานและสิ่งแวดล้อม การอนุรักษ์พลังงาน นวัตกรรมเพื่อการประหยัดพลังงาน พลังงานรูปแบบใหม่ เทคโนโลยียานยนต์ไฟฟ้า เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน การพัฒนาระบบพลังงานทางเลือก เช่น การผลิตพลังงานจากธรรมชาติ โซล่าเซลล์ พลังงานจากขยะ เป็นต้น เทคโนโลยีเพื่อสิ่งแวดล้อม เช่น การจัดการขยะ มลพิษทางอากาศ และน้ำเสีย เป็นต้น เซ็นเซอร์ทางสิ่งแวดล้อมและพลังงาน เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน เทคโนโลยีวัสดุ รวมถึงการพัฒนาเศรษฐกิจที่คำนึงถึงความยั่งยืนของทรัพยากรและสิ่งแวดล้อม (BCG Economy Model) ทั้งเศรษฐกิจชีวภาพ (Bio Economy) เศรษฐกิจหมุนเวียน (Circular Economy) และเศรษฐกิจสีเขียว (Green Economy) และอื่น ๆ ที่เกี่ยวข้อง
   - **Visuals & Legacy Mapping:** Icon `Zap`, Color `#059669`, Photo `/domain-energy.jpg`, `relatedCategoryIds: ['energy_env_material_bcg', 'energy_environment', 'material']`.

5. **`quality_of_life_soft_power`** (`DOMAIN 05`)
   - **ชื่อภาษาไทย:** ด้านคุณภาพชีวิต และ Soft Power
   - **ชื่อภาษาอังกฤษ:** Quality of Life & Soft Power
   - **คำอธิบายทางการฉบับเต็ม (`overview` / `descriptionTh`):**
     > เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์และการสร้างมูลค่าจากการออกแบบ ความคิดสร้างสรรค์ ศิลปะ วัฒนธรรม และภูมิปัญญาท้องถิ่น เช่น การออกแบบสถาปัตยกรรม ออกแบบภายใน การออกแบบผลิตภัณฑ์หรือบรรจุภัณฑ์ การออกแบบเครื่องแต่งกาย ออกแบบเครื่องประดับ สื่อมัลติมีเดีย สื่อการเรียนการสอนและสื่อการเรียนรู้ การออกแบบศิลปะ การแสดง และงานศิลป์อื่น ๆ ธุรกิจไลฟ์สไตล์ (Lifestyle Business) เทคโนโลยีการท่องเที่ยว (Traveltech) รูปแบบการท่องเที่ยว การเพิ่มประสิทธิภาพการบริการ (Service Enhancing) โดยเฉพาะผลงานที่ทำให้เกิดผลผลิตที่เป็นนวัตกรรมที่เกี่ยวข้องกับอุตสาหกรรมสร้างสรรค์ 11 สาขา (อาหาร กีฬา งานเทศกาล ท่องเที่ยว ดนตรี หนังสือ ภาพยนตร์ เกม ศิลปะ การออกแบบ และแฟชั่น) ซึ่งจะนำไปสู่การพัฒนา Soft Power
   - **Visuals & Legacy Mapping:** Icon `Sparkles`, Color `#D97706`, Photo `/domain-softpower.jpg` (newly generated 16:9 creative design & Thai Soft Power innovation visual), `relatedCategoryIds: ['quality_of_life_soft_power']`.

### 5.3 Prisma Schema & Backend API Changes

1. **`server/prisma/schema.prisma`:**
   - Add `CompetitionYearLevel`:
     ```prisma
     model CompetitionYearLevel {
       id                String          @id @default(cuid())
       competitionYearId String
       competitionYear   CompetitionYear @relation(fields: [competitionYearId], references: [id], onDelete: Cascade)
       educationLevelId  String
       educationLevel    EducationLevel  @relation(fields: [educationLevelId], references: [id], onDelete: Cascade)

       customNameTh      String?
       customNameEn      String?
       customEligibleTh  String?         @db.Text
       trophyTitleTh     String          @default("ถ้วยรางวัล มจพ.")
       trophyShortTh     String          @default("ถ้วยรางวัล มจพ.")
       isRoyalTrophy     Boolean         @default(false)
       totalPrizeAmount  Int             @default(75000)
       prizeBreakdown    Json?
       requiresPrototype Boolean         @default(true)
       prototypeRuleTh   String?         @default("ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ไม่รับพิจารณาผลงานที่มีเพียงแนวคิด (Idea)")
       isActive          Boolean         @default(true)
       orderIndex        Int             @default(0)

       submissions       Submission[]
       createdAt         DateTime        @default(now())
       updatedAt         DateTime        @updatedAt

       @@unique([competitionYearId, educationLevelId])
       @@map("competition_year_levels")
     }
     ```
   - Add `levels CompetitionYearLevel[]` on `CompetitionYear`, `yearLevels CompetitionYearLevel[]` on `EducationLevel`, and optional `competitionYearLevelId String?` + `competitionYearLevel CompetitionYearLevel?` (with `@@index([competitionYearLevelId])`) on `Submission`.

2. **Backend Endpoints:**
   - **`GET /api/config` (`config.controller.ts`):**
     - Include active `levels` (`include: { educationLevel: true }`, ordered by `orderIndex: 'asc'`) when loading `targetYear`.
     - Map `educationLevels` from `targetYear.levels` (falling back to active `EducationLevel` rows if a year has none), returning: `id` (`code`), `code`, `educationLevelId`, `nameTh`, `nameEn`, `eligible`, `trophyTitleTh`, `trophyShortTh`, `isRoyalTrophy`, `totalPrizeAmount`, `requiresPrototype`, `prototypeRuleTh`, and `prizeBreakdown`.
     - Compute `totalPrizePool` dynamically as the sum of `totalPrizeAmount` across active `targetYear.levels` (`255000` for 2570; `180000` for 2569) and `totalAwardCount` (`18` for 2570; `12` for 2569).
     - Build `prizes` summary strings dynamically from `targetYear.levels`.
   - **`POST /api/config/levels` (`config.controller.ts`, Admin Only):**
     - Upserts an `EducationLevel` + `CompetitionYearLevel` for a target competition year (`code`, `nameTh`, `nameEn`, `eligibleTh`, `trophyTitleTh`, `trophyShortTh`, `isRoyalTrophy`, `totalPrizeAmount`, `prizeBreakdown`, `requiresPrototype`, `isActive`, `orderIndex`).
   - **`POST /api/config/years` (`config.controller.ts`, Admin Only):**
     - Clones both `CompetitionYearCategory` and `CompetitionYearLevel` rows from `previousCurrent` into the newly created/activated `CompetitionYear`.
   - **`GET /api/masters/years/:year/levels` (`masters.controller.ts`):**
     - Returns active `CompetitionYearLevel` rows (with `educationLevel`) for a given competition year, mirroring `GET /api/masters/years/:year/categories`.
     - `GET /api/masters/education-levels` continues returning `EducationLevel` rows where `isActive: true` (`general_public`, `higher_education`, `below_higher` — 3 levels).
   - **`POST /api/submissions` (`submissions.controller.ts` & `submissions.schema.ts`):**
     - Accept optional `hasPrototypeConfirmed?: boolean`.
     - Resolve `yearLevel` from `CompetitionYearLevel` for `(compYear.id, educationLevel.id)` and store `competitionYearLevelId: yearLevel?.id` on `Submission`.
     - Reject inactive/unlinked levels for the target year unless `currentUser?.role === Role.ADMIN` or legacy fallback applies, and if `!isDraft && payload.hasPrototypeConfirmed === false`, return `400` with `'กรุณายืนยันว่าผลงานมีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำตามเกณฑ์การแข่งขัน'`.
   - **Trophy-aware Admin Awarding & Result Publishing (`judging.controller.ts` & `App.jsx`):**
     - When awarding `GRAND_WINNER` to a submission, derive the default champion badge/result from the submission's `CompetitionYearLevel` (`รางวัลชนะเลิศ (ถ้วยพระราชทานฯ)` when `isRoyalTrophy === true`, and `รางวัลชนะเลิศ (${trophyShortTh})` e.g. `รางวัลชนะเลิศ (ถ้วยรางวัล มจพ.)` when `isRoyalTrophy === false`).
     - Update `POST /api/judging/publish-results` (`ROUND_3`) default announcement title/abstract to honor both the Royal Trophy (บุคคลทั่วไป) and KMUTNB Trophies (อุดมศึกษา & ต่ำกว่าอุดมศึกษา).

### 5.4 Frontend, 3D Hero & Submission Form Changes

1. **Domain Catalog & 3D Shader Stage (`domainCatalog.js`, `heroThreeStageConfig.js`, `HeroThreeStage.jsx`):**
   - Replace the 5 entries in `DOMAIN_CATALOG` with the 5 new 2570 domains (`agri_food`, `health_medtech`, `engineering_ai`, `energy_env_material_bcg`, `quality_of_life_soft_power`), each containing:
     - Full official Thai overview text (๑–๕), concise card `desc`, 3 structured `subTopics` distilled directly from the official paragraph, and 3 `initialCriteria` emphasizing mandatory Prototype readiness (no Idea-only entries).
     - `relatedCategoryIds` so `getDomainSampleWinners` matches both new 2570 codes and corresponding 2569 winner codes.
   - Update `DOMAIN_IDS`, `DOMAIN_ORBIT_COLORS`, `DOMAIN_PHOTO_URLS`, and the 5 shader accent branches in `heroThreeStageConfig.js` to match the new 1..5 domain order (`0: agri_food`, `1: health_medtech`, `2: engineering_ai`, `3: energy_env_material_bcg`, `4: quality_of_life_soft_power`).
   - Update `HeroThreeStage.jsx` HUD copy:
     - Top bar: `['5 หมวดการแข่งขัน', 'ต้องมี Prototype ขั้นต่ำ', 'เงินรางวัลรวม 255,000 บาท']`
     - Bottom telemetry cards:
       1. `ถ้วยพระราชทานฯ & ถ้วย มจพ.` (`สูงสุดแห่งเกียรติยศ 3 ประเภทการแข่งขัน`)
       2. `255,000 THB` (`เงินรางวัลรวม 3 ประเภท (18 รางวัล)`)
       3. `5 หมวดนวัตกรรม` (`ต้องมีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำ`)
     - Breakthrough headline subtitle: `'5 หมวดนวัตกรรมเป้าหมาย • ชิงถ้วยพระราชทานฯ ถ้วยรางวัล มจพ. และเงินรางวัลรวม 255,000 บาท'`

2. **Landing Page, Guidelines (`#/guidelines`), Hall of Fame & Judging UI (`App.jsx`):**
   - **Home Overview & Checklist:** Update prize total (`255,000 บาท`, 3 ประเภท, 18 รางวัล), trophy copy (ถ้วยพระราชทานฯ สำหรับประเภทบุคคลทั่วไป และถ้วยรางวัล มจพ. สำหรับประเภทอุดมศึกษาและต่ำกว่าอุดมศึกษา), and Quick Checklist to highlight mandatory Prototype readiness.
   - **Guidelines Section 01 (Eligibility) & Section 03 (Prizes & Awards):** Render dynamically from the active year's `educationLevels` (`CompetitionYearLevel` data from `/api/config`, with offline fallback constants matching 2570's 3 tiers). Gold Royal Trophy styling applies where `isRoyalTrophy === true` (`บุคคลทั่วไป`), while Sapphire/Cyan KMUTNB Trophy styling applies where `isRoyalTrophy === false` (`อุดมศึกษา`, `ต่ำกว่าอุดมศึกษา`). Every tier card displays the mandatory Prototype rule.
   - **Submission Portal (`App.jsx` & `submissionDossierUtils.js`):**
     - Populate the Category `<select>` strictly from active year categories (5 categories for 2570; do not auto-append `others`).
     - Populate the Competition Tier `<select>` dynamically from active year `educationLevels` (3 tiers for 2570), clearly showing each tier's eligible group and trophy/prize pool.
     - Add a prominent confirmation checkbox in Step 3 (`hasPrototypeConfirmed`):
       *"ข้าพเจ้ายืนยันว่าผลงานที่ส่งเข้าประกวดมีชิ้นงานต้นแบบ (Prototype) ขั้นต่ำที่สามารถสาธิตการทำงานหรือผลการทดสอบได้จริง ไม่ใช่เพียงแนวคิด (Idea)"*
     - Enforce `hasPrototypeConfirmed === true` in `validateSubmissionStep(form, 3, false)` when submitting (`isDraft === false`), while keeping draft saves (`isDraft === true`) frictionless.
   - **Hall of Fame & Judging Filters:**
     - Support filtering across both 2570 categories/levels and historical 2569 categories/levels (`CATEGORY_LABELS_TH` and `LEVEL_LABELS_TH` include both 2570 and 2569 codes so historical badges and filters never show raw codes).
     - Add a compact Competition Tiers summary/editor in Admin `setup` tab (`POST /api/config/levels`) alongside the existing Dynamic Categories manager.

3. **Project Documentation Sync:**
   - Update `CONTEXT.md` and `PRODUCT.md` to reflect the 3 competition tiers, `255,000` THB total prize pool, Royal Trophy vs KMUTNB Trophy distinction, mandatory Prototype rule, and the 5 new innovation categories.

---

## 6. What Is Left to the Builder

- Exact responsive CSS grid adjustments for displaying 3 Eligibility cards side-by-side on desktop (stacking cleanly on tablet/mobile) while maintaining `44px` touch targets and WCAG AA contrast.
- Visual art direction prompts for generating `/domain-engineering.jpg` and `/domain-softpower.jpg` via `image-generator` so their lighting/palette harmonizes with `/domain-food.jpg`, `/domain-medical.jpg`, and `/domain-energy.jpg` in the Three.js Living Photo shader.
- Exact JSON shape details of `prizeBreakdown` helper utilities and migration/seed ordering in `server/prisma/seed.ts`, provided all existing and updated tests in `server/tests/*.test.ts` and `client/src/components/*.test.mjs` pass cleanly.
