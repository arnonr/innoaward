# UI/UX Homepage Review — KMUTNB Innovation Awards 2026

วันที่ตรวจ: 18 สิงหาคม 2569

## ภาพรวม

หน้าแรกมีทิศทาง visual ที่แข็งแรง: cinematic, มี hierarchy ของชื่อโครงการ/กำหนดส่ง/CTA ชัด และใช้ visual language ของ emerald, cyan และ royal gold ได้สม่ำเสมอ

รอบนี้จึงแก้ประเด็นที่มีผลต่อการใช้งานจริง โดยยังรักษา visual direction เดิมไว้: accessibility, responsive behavior, modal interaction, motion, deadline correctness, loading feedback, asset performance และ semantic HTML

## รายการที่ตรวจและแก้แล้ว

### Accessibility และ interaction

- เพิ่ม focus ring สำหรับ interactive controls ที่มองเห็นได้เมื่อใช้งานด้วย keyboard
- เพิ่มขนาด touch target ของ hamburger และปุ่มปิด modal ให้เหมาะกับ mobile
- เพิ่ม `role="dialog"`, `aria-modal` และ accessible labels ให้ modal
- เพิ่มการปิด modal ด้วยปุ่ม Escape
- เปลี่ยน clickable `div` เป็น semantic button สำหรับ brand, announcement และ winner cards
- เพิ่ม `aria-label` ให้ปุ่ม icon-only ที่จำเป็น
- เพิ่ม `aria-live` ให้สถานะ countdown และ loading feedback

### Mobile และ responsive

- ลดความแน่นของ header โดยเริ่มใช้ mobile navigation เร็วขึ้น
- ลดจำนวน action ที่แสดงพร้อมกันบนหน้าจอขนาดเล็ก
- ปรับปุ่มและ drawer ให้เหมาะกับการกดด้วยนิ้ว
- ป้องกัน horizontal overflow ในส่วนที่เป็น interactive strip

### Motion

- เพิ่ม `prefers-reduced-motion: reduce`
- ลด animation ต่อเนื่องที่ไม่จำเป็นสำหรับผู้ใช้ที่ขอให้ลด motion

### Deadline และ feedback

- เมื่อหมดเวลารับสมัครจะแสดงสถานะปิดรับสมัครแทนค่าตัวเลข placeholder
- ปิด CTA การส่งผลงานเมื่อหมดเวลา
- เพิ่ม loading state ให้ auth และ submission ป้องกันการกดซ้ำ

### Performance และ assets

- คืนการใช้ YouTube hero video ตัวเดิมตาม visual direction ของหน้าแรก พร้อมคงปุ่มเปิด/ปิดเสียงและ loop/autoplay behavior
- เพิ่ม `loading="lazy"` และ `decoding="async"` ให้รูปภาพที่อยู่ below the fold
- เปลี่ยน favicon จาก Vite เป็น favicon ของโปรเจกต์

### Visual consistency

- เปลี่ยน emoji ที่ทำหน้าที่เป็น UI icon เป็น Lucide icons
- ปรับข้อความ CTA หลักให้ชัดเจนสำหรับผู้ใช้ภาษาไทย

## รายการที่ควรติดตามต่อ

- ตรวจ contrast ด้วย automated accessibility tool ในทุก state ของ modal และ form
- ทดสอบจริงที่ viewport 320, 375, 414, 768, 1024 และ 1440px
- ทดสอบ keyboard navigation แบบครบ flow รวมถึง focus trap ใน modal
- พิจารณาแปลงภาพขนาดใหญ่เป็น WebP/AVIF และจัดทำ responsive image variants

## Verification

- `npm run build` ต้องผ่าน
- `npm run lint` ต้องไม่มี error

## Guidelines Page Review และรายการแก้ไขเพิ่มเติม

หน้าที่ตรวจ: `/#/guidelines`

### สิ่งที่แก้ไขแล้ว

- เปลี่ยนหัวข้อหลักของหน้า Guidelines เป็น `h1` และเปลี่ยนข้อความชื่อแบรนด์ใน navbar จาก `h1` เป็นองค์ประกอบแบรนด์ปกติ เพื่อให้ heading hierarchy ถูกต้อง
- เพิ่ม active state ของ sticky section navigation ด้วย `IntersectionObserver`
- เพิ่ม `aria-current="location"` ให้ section ที่กำลังอ่านอยู่
- รองรับ deep link รูปแบบ `#/guidelines#eligibility`, `#/guidelines#domains`, `#/guidelines#prizes`, `#/guidelines#standards` และ `#/guidelines#criteria`
- เพิ่ม `scroll-margin-top` เพื่อไม่ให้หัวข้อถูก sticky header บัง
- เพิ่ม touch target ขั้นต่ำ 44px ให้ปุ่ม sub-navigation และปุ่มสมัครใน domain card
- เปลี่ยน emoji ที่ทำหน้าที่เป็น icon ในรางวัลและ timeline เป็น Lucide icons
- เปลี่ยน checklist, general rules และ submission requirements เป็น semantic `ul`/`li`
- เพิ่มขนาดตัวอักษรของ checklist และคำอธิบาย domain card ให้อ่านภาษาไทยได้ดีขึ้น
- เปลี่ยนภาพพื้นหลังของ domain card เป็น `<img loading="lazy" decoding="async">` เพื่อไม่โหลดภาพ below-the-fold ทั้งหมดพร้อมกัน
- ลด blur และ shadow บน mobile เพื่อลด visual noise และลดภาระการ render ระหว่าง scroll
- ใช้ CSS variable `--header-height` ให้ sticky navigation สัมพันธ์กับความสูง navbar ในแต่ละ breakpoint

### ประเด็นที่ตรวจแล้วไม่พบปัญหาร้ายแรง

- มี viewport meta ที่ถูกต้องและไม่ปิดการ zoom
- มี focus ring ที่มองเห็นได้สำหรับ button, link และ form control
- มี `prefers-reduced-motion: reduce`
- ใช้ icon แบบ SVG จาก Lucide เป็นหลัก
- มีข้อความประกอบ progress bar จึงไม่ได้ใช้สีเพียงอย่างเดียวในการสื่อคะแนน

### รายการติดตามต่อ

- เพิ่ม automated contrast audit ใน light/dark และทุก state ของ modal/form
- ทดสอบจริงที่ viewport 320, 375, 414, 768, 1024 และ 1440px
- ทดสอบ keyboard flow ตั้งแต่ navbar → sticky section navigation → CTA → modal
- พิจารณาเพิ่มปุ่ม “กลับไปด้านบน” และ progress indicator สำหรับหน้าที่มีเนื้อหายาว

### Verification รอบ Guidelines

- `npm run build` ผ่าน
- ตรวจซ้ำไม่พบ emoji ที่ใช้เป็น structural UI icon ใน `client/src/App.jsx`
- เพิ่ม `role="progressbar"` และค่า ARIA ของเกณฑ์คะแนนทั้ง 4 รายการแล้ว
