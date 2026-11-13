// Structured catalog of the 5 official 2570 innovation domains (๑–๕) with full official scope, mandatory Prototype baseline & legacy 2569 mapping

export const DOMAIN_CATALOG = Object.freeze([
  {
    id: 'agri_food',
    indexLabel: 'DOMAIN 01',
    nameTh: 'ด้านการเกษตรและอุตสาหกรรมอาหาร',
    nameEn: 'Agriculture & Food Industry',
    titleTh: 'ด้านการเกษตรและอุตสาหกรรมอาหาร',
    titleEn: 'Agriculture & Food Industry',
    desc: 'นวัตกรรมการเกษตรอัจฉริยะ พืช ประมง ปศุสัตว์ แมลงเศรษฐกิจ การแปรรูปอาหาร อาหารฟังก์ชัน และการเพิ่มมูลค่าวัสดุเหลือทิ้งทางการเกษตร',
    overview:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ต่อการผลิตผลทางการเกษตร พืช ประมง ปศุสัตว์ ป่าไม้ แมลงเศรษฐกิจ สาหร่าย เทคโนโลยีการเกษตร เกษตรอัจฉริยะ การอนุรักษ์ดิน น้ำ และสิ่งแวดล้อมในระบบนิเวศเกษตร วิศวกรรมและเครื่องจักรกลการเกษตร ธุรกิจการเกษตร อุตสาหกรรมเกษตร เทคโนโลยีในกระบวนการผลิตแปรรูปอาหาร อาหารฟังก์ชัน (Functional Foods) บรรจุภัณฑ์ และจัดจำหน่ายไปยังผู้บริโภค ตลอดจนการใช้ประโยชน์จากผลพลอยได้ทางการเกษตร กากของเหลือหรือวัสดุเหลือทิ้งจากภาคการเกษตร และอื่น ๆ ที่เกี่ยวข้อง',
    subTopics: [
      {
        title: 'เกษตรอัจฉริยะและผลิตผลชีวภาพเศรษฐกิจ (Smart Agriculture & Bio-Production)',
        detail:
          'พืช ประมง ปศุสัตว์ ป่าไม้ แมลงเศรษฐกิจ สาหร่าย เทคโนโลยีการเกษตร เกษตรอัจฉริยะ และการอนุรักษ์ดิน น้ำ และสิ่งแวดล้อมในระบบนิเวศเกษตร',
      },
      {
        title: 'วิศวกรรมเกษตร การแปรรูป และอาหารฟังก์ชัน (Agri-Machinery & Functional Foods)',
        detail:
          'วิศวกรรมและเครื่องจักรกลการเกษตร ธุรกิจและอุตสาหกรรมเกษตร กระบวนการผลิตแปรรูปอาหาร อาหารฟังก์ชัน (Functional Foods) บรรจุภัณฑ์ และการจัดจำหน่าย',
      },
      {
        title: 'การเพิ่มมูลค่าผลพลอยได้และวัสดุเหลือทิ้งภาคเกษตร (Agri-Byproduct Valorization)',
        detail:
          'การใช้ประโยชน์จากผลพลอยได้ทางการเกษตร กากของเหลือ หรือวัสดุเหลือทิ้งจากภาคการเกษตรเพื่อสร้างมูลค่าเพิ่มอย่างยั่งยืน',
      },
    ],
    initialCriteria: [
      {
        title: 'ความพร้อมของชิ้นงานต้นแบบขั้นต่ำ (Mandatory Prototype Readiness)',
        detail:
          'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ เช่น ผลิตภัณฑ์อาหารตัวอย่าง เครื่องจักร/อุปกรณ์การเกษตรต้นแบบ หรือชุดทดสอบที่มีผลยืนยันได้จริง ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)',
      },
      {
        title: 'ผลลัพธ์และคุณค่าเชิงประจักษ์ (Measurable Agricultural & Food Impact)',
        detail:
          'แสดงผลการทดสอบประสิทธิภาพ ความปลอดภัยต่อผู้บริโภค การเพิ่มผลผลิต ลดต้นทุน หรือสร้างมูลค่าเพิ่มให้ผลผลิตและวัสดุเหลือทิ้งทางการเกษตร',
      },
      {
        title: 'เอกสารและสื่อประกอบการพิจารณา (Submission Deliverables)',
        detail:
          'เอกสารข้อเสนอโครงการ (Proposal PDF ไม่เกิน 10 หน้า A4) ภาพถ่ายชิ้นงานต้นแบบ (Prototype) และลิงก์คลิปวิดีโอสาธิตการทำงานความยาว 2–3 นาที',
      },
    ],
    relatedCategoryIds: Object.freeze(['agri_food', 'food_agriculture']),
    color: '#16A34A',
    bgImage: '/domain-food.jpg',
  },
  {
    id: 'health_medtech',
    indexLabel: 'DOMAIN 02',
    nameTh: 'ด้านการสาธารณสุข สุขภาพ และเทคโนโลยีทางการแพทย์',
    nameEn: 'Public Health, Healthcare & Medical Technology',
    titleTh: 'ด้านการสาธารณสุข สุขภาพ และเทคโนโลยีทางการแพทย์',
    titleEn: 'Public Health, Healthcare & Medical Technology',
    desc: 'นวัตกรรมส่งเสริมสุขภาพ การป้องกัน วินิจฉัย และบำบัดโรค อุปกรณ์การแพทย์ กายภาพบำบัด สมุนไพร Healthtech, Medtech และ Smart Healthcare',
    overview:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านส่งเสริมสุขภาพ ป้องกัน ดูแล รักษา บำบัดโรค ตรวจสอบและวินิจฉัยโรค อุปกรณ์ทางการแพทย์ อุปกรณ์กายภาพบำบัด สมุนไพร เทคโนโลยีสุขภาพ (Healthtech) เทคโนโลยีการแพทย์ (Medtech) เครื่องสำอาง ผลิตภัณฑ์สุขภาพ ผลิตภัณฑ์จากธรรมชาติ (Natural Products) ผลิตภัณฑ์เสริมอาหาร (Supplementary Products) การดูแลสุขภาพอย่างชาญฉลาด (Smart Healthcare) และการสร้างเสริมสุขภาพและคุณภาพชีวิตของผู้ป่วยและประชากร และอื่น ๆ ที่เกี่ยวข้อง',
    subTopics: [
      {
        title: 'อุปกรณ์การแพทย์ การวินิจฉัย และกายภาพบำบัด (Medtech, Diagnostics & Rehab)',
        detail:
          'นวัตกรรมตรวจสอบและวินิจฉัยโรค การป้องกัน ดูแล รักษา บำบัดโรค อุปกรณ์ทางการแพทย์ และอุปกรณ์กายภาพบำบัดเพื่อฟื้นฟูผู้ป่วย',
      },
      {
        title: 'เทคโนโลยีสุขภาพและระบบดูแลสุขภาพอัจฉริยะ (Healthtech & Smart Healthcare)',
        detail:
          'เทคโนโลยีสุขภาพ (Healthtech) เทคโนโลยีการแพทย์ (Medtech) การดูแลสุขภาพอย่างชาญฉลาด (Smart Healthcare) และการยกระดับคุณภาพชีวิตของผู้ป่วยและประชากร',
      },
      {
        title: 'สมุนไพร ผลิตภัณฑ์ธรรมชาติ และผลิตภัณฑ์สุขภาพ (Natural & Health Products)',
        detail:
          'สมุนไพร เครื่องสำอาง ผลิตภัณฑ์สุขภาพ ผลิตภัณฑ์จากธรรมชาติ (Natural Products) และผลิตภัณฑ์เสริมอาหาร (Supplementary Products)',
      },
    ],
    initialCriteria: [
      {
        title: 'ความพร้อมของชิ้นงานต้นแบบขั้นต่ำ (Mandatory Prototype Readiness)',
        detail:
          'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ เช่น อุปกรณ์ทางการแพทย์ต้นแบบ ระบบคัดกรอง หรือผลิตภัณฑ์ต้นแบบที่มีผลการทดสอบความแม่นยำและความปลอดภัยเบื้องต้น ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)',
      },
      {
        title: 'ผลลัพธ์และประโยชน์ต่อระบบสุขภาพ (Clinical & Healthcare Impact)',
        detail:
          'ช่วยเพิ่มประสิทธิภาพในการป้องกัน วินิจฉัย รักษา หรือฟื้นฟูผู้ป่วย ลดภาระบุคลากรทางการแพทย์ หรือเพิ่มการเข้าถึงบริการสาธารณสุข',
      },
      {
        title: 'เอกสารและสื่อประกอบการพิจารณา (Submission Deliverables)',
        detail:
          'เอกสารข้อเสนอโครงการ (Proposal PDF ไม่เกิน 10 หน้า A4) ภาพถ่ายชิ้นงานต้นแบบ (Prototype) และลิงก์คลิปวิดีโอสาธิตการทำงานความยาว 2–3 นาที',
      },
    ],
    relatedCategoryIds: Object.freeze(['health_medtech', 'medical_device']),
    color: '#E11D48',
    bgImage: '/domain-medical.jpg',
  },
  {
    id: 'engineering_ai',
    indexLabel: 'DOMAIN 03',
    nameTh: 'ด้านวิศวกรรมศาสตร์ เทคโนโลยีปัญญาประดิษฐ์และอุปกรณ์อัจฉริยะ',
    nameEn: 'Engineering, AI & Smart Devices',
    titleTh: 'ด้านวิศวกรรมศาสตร์ เทคโนโลยีปัญญาประดิษฐ์และอุปกรณ์อัจฉริยะ',
    titleEn: 'Engineering, AI & Smart Devices',
    desc: 'นวัตกรรมวิศวกรรมและอุตสาหกรรมทั้ง Software และ Hardware หุ่นยนต์ ระบบราง IoT, Automation, Big Data, Machine Learning และระบบอัจฉริยะ',
    overview:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านวิศวกรรมศาสตร์ วิทยาศาสตร์ และอุตสาหกรรม เป็นผลงานทั้งประเภท Software และ Hardware การออกแบบและปรับปรุงกระบวนการผลิตและสภาวะแวดล้อม เช่น เทคโนโลยีหุ่นยนต์ (Robotics) เทคโนโลยีระบบราง เทคโนโลยีด้านการเงิน (Fintech) ธุรกิจพาณิชย์อิเล็กทรอนิกส์ (e-Commerce) อุปกรณ์เชื่อมต่อผ่านระบบอินเทอร์เน็ต (IoT) เทคโนโลยีการศึกษา (Edtech) Big Data ระบบอัตโนมัติ (Automation) Machine Learning ระบบควบคุมและเครื่องมือวัด (Control System and Instrument) ระบบเทคโนโลยีเสมือนจริง (Virtual Reality) และอื่น ๆ ที่เกี่ยวข้อง',
    subTopics: [
      {
        title: 'หุ่นยนต์ ระบบอัตโนมัติ และวิศวกรรมระบบราง (Robotics, Automation & Rail Tech)',
        detail:
          'เทคโนโลยีหุ่นยนต์ (Robotics) ระบบอัตโนมัติ (Automation) ระบบควบคุมและเครื่องมือวัด (Control System and Instrument) เทคโนโลยีระบบราง และกระบวนการผลิตอุตสาหกรรม',
      },
      {
        title: 'ปัญญาประดิษฐ์ ข้อมูลขนาดใหญ่ และอุปกรณ์อัจฉริยะ (AI, Machine Learning & IoT)',
        detail:
          'Machine Learning, Big Data และอุปกรณ์เชื่อมต่อผ่านระบบอินเทอร์เน็ต (IoT) ทั้งประเภท Software และ Hardware เพื่อการวิเคราะห์และควบคุมอัจฉริยะ',
      },
      {
        title: 'แพลตฟอร์มดิจิทัลและเทคโนโลยีเสมือนจริง (Fintech, Edtech, e-Commerce & VR)',
        detail:
          'เทคโนโลยีด้านการเงิน (Fintech) ธุรกิจพาณิชย์อิเล็กทรอนิกส์ (e-Commerce) เทคโนโลยีการศึกษา (Edtech) และระบบเทคโนโลยีเสมือนจริง (Virtual Reality)',
      },
    ],
    initialCriteria: [
      {
        title: 'ความพร้อมของชิ้นงานต้นแบบขั้นต่ำ (Mandatory Prototype Readiness)',
        detail:
          'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ ทั้งประเภท Hardware หรือ Software ที่สามารถสาธิตการทำงานจริงและแสดงผลการทดสอบได้ ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)',
      },
      {
        title: 'ประสิทธิภาพทางวิศวกรรมและความพร้อมขยายผล (Technical Performance & Scalability)',
        detail:
          'แสดงตัวชี้วัดความแม่นยำ ความเสถียรของระบบ การลดต้นทุนหรือเวลาในกระบวนการผลิต และศักยภาพในการประยุกต์ใช้งานจริงในภาคอุตสาหกรรมหรือบริการ',
      },
      {
        title: 'เอกสารและสื่อประกอบการพิจารณา (Submission Deliverables)',
        detail:
          'เอกสารข้อเสนอโครงการ (Proposal PDF ไม่เกิน 10 หน้า A4) ภาพถ่ายหรือหน้าจอชิ้นงานต้นแบบ (Prototype) และลิงก์คลิปวิดีโอสาธิตการทำงานความยาว 2–3 นาที',
      },
    ],
    relatedCategoryIds: Object.freeze(['engineering_ai', 'social_economy']),
    color: '#06B6D4',
    bgImage: '/domain-engineering.jpg',
  },
  {
    id: 'energy_env_material_bcg',
    indexLabel: 'DOMAIN 04',
    nameTh: 'ด้านพลังงาน สิ่งแวดล้อม เทคโนโลยีวัสดุ และ BCG Economy Model',
    nameEn: 'Energy, Environment, Materials & BCG Economy',
    titleTh: 'ด้านพลังงาน สิ่งแวดล้อม เทคโนโลยีวัสดุ และ BCG Economy Model',
    titleEn: 'Energy, Environment, Materials & BCG Economy',
    desc: 'นวัตกรรมพลังงานสะอาด ยานยนต์ไฟฟ้า แบตเตอรี่ การจัดการขยะ มลพิษและน้ำเสีย เทคโนโลยีวัสดุ และเศรษฐกิจชีวภาพ-หมุนเวียน-สีเขียว (BCG)',
    overview:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์ด้านพลังงานและสิ่งแวดล้อม การแก้ไข ฟื้นฟู บำรุงรักษา ปรับปรุงคุณภาพ ตรวจวิเคราะห์ทางพลังงานและสิ่งแวดล้อม การอนุรักษ์พลังงาน นวัตกรรมเพื่อการประหยัดพลังงาน พลังงานรูปแบบใหม่ เทคโนโลยียานยนต์ไฟฟ้า เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน การพัฒนาระบบพลังงานทางเลือก เช่น การผลิตพลังงานจากธรรมชาติ โซล่าเซลล์ พลังงานจากขยะ เป็นต้น เทคโนโลยีเพื่อสิ่งแวดล้อม เช่น การจัดการขยะ มลพิษทางอากาศ และน้ำเสีย เป็นต้น เซ็นเซอร์ทางสิ่งแวดล้อมและพลังงาน เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน เทคโนโลยีวัสดุ รวมถึงการพัฒนาเศรษฐกิจที่คำนึงถึงความยั่งยืนของทรัพยากรและสิ่งแวดล้อม (BCG Economy Model) ทั้งเศรษฐกิจชีวภาพ (Bio Economy) เศรษฐกิจหมุนเวียน (Circular Economy) และเศรษฐกิจสีเขียว (Green Economy) และอื่น ๆ ที่เกี่ยวข้อง',
    subTopics: [
      {
        title: 'พลังงานทางเลือก ยานยนต์ไฟฟ้า และการอนุรักษ์พลังงาน (Clean Energy & EV)',
        detail:
          'โซล่าเซลล์ พลังงานจากขยะ พลังงานรูปแบบใหม่ นวัตกรรมเพื่อการประหยัดพลังงาน เทคโนโลยียานยนต์ไฟฟ้า และการตรวจวิเคราะห์ทางพลังงาน',
      },
      {
        title: 'เทคโนโลยีวัสดุและวัสดุกักเก็บพลังงาน (Advanced & Energy Materials)',
        detail:
          'เทคโนโลยีแบตเตอรี่และวัสดุพลังงาน เทคโนโลยีวัสดุวิศวกรรมสมรรถนะสูง และวัสดุทางเลือกที่เป็นมิตรต่อสิ่งแวดล้อม',
      },
      {
        title: 'สิ่งแวดล้อมและโมเดลเศรษฐกิจความยั่งยืน (Environment & BCG Economy Model)',
        detail:
          'การจัดการขยะ มลพิษทางอากาศ น้ำเสีย เซ็นเซอร์ทางสิ่งแวดล้อม และการพัฒนา BCG Economy Model (Bio Economy, Circular Economy และ Green Economy)',
      },
    ],
    initialCriteria: [
      {
        title: 'ความพร้อมของชิ้นงานต้นแบบขั้นต่ำ (Mandatory Prototype Readiness)',
        detail:
          'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ เช่น ระบบพลังงานต้นแบบ ชิ้นงานวัสดุตัวอย่าง หรือชุดบำบัดมลพิษที่มีผลการทดสอบประสิทธิภาพเบื้องต้น ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)',
      },
      {
        title: 'ผลกระทบด้านพลังงาน สิ่งแวดล้อม และความยั่งยืน (Measurable BCG & Sustainability Impact)',
        detail:
          'แสดงข้อมูลเชิงประจักษ์ด้านการประหยัดพลังงาน คุณสมบัติของวัสดุ การลดของเสียหรือมลพิษ และความสอดคล้องกับแนวทาง BCG Economy Model',
      },
      {
        title: 'เอกสารและสื่อประกอบการพิจารณา (Submission Deliverables)',
        detail:
          'เอกสารข้อเสนอโครงการ (Proposal PDF ไม่เกิน 10 หน้า A4) ภาพถ่ายชิ้นงานต้นแบบ (Prototype) และลิงก์คลิปวิดีโอสาธิตการทำงานความยาว 2–3 นาที',
      },
    ],
    relatedCategoryIds: Object.freeze(['energy_env_material_bcg', 'energy_environment', 'material']),
    color: '#059669',
    bgImage: '/domain-energy.jpg',
  },
  {
    id: 'quality_of_life_soft_power',
    indexLabel: 'DOMAIN 05',
    nameTh: 'ด้านคุณภาพชีวิต และ Soft Power',
    nameEn: 'Quality of Life & Soft Power',
    titleTh: 'ด้านคุณภาพชีวิต และ Soft Power',
    titleEn: 'Quality of Life & Soft Power',
    desc: 'นวัตกรรมการออกแบบ ความคิดสร้างสรรค์ ศิลปะ วัฒนธรรม ภูมิปัญญาท้องถิ่น สื่อมัลติมีเดีย Traveltech และอุตสาหกรรมสร้างสรรค์ 11 สาขาเพื่อพัฒนา Soft Power',
    overview:
      'เป็นผลงานนวัตกรรมที่ออกแบบและพัฒนาเพื่อการใช้ประโยชน์และการสร้างมูลค่าจากการออกแบบ ความคิดสร้างสรรค์ ศิลปะ วัฒนธรรม และภูมิปัญญาท้องถิ่น เช่น การออกแบบสถาปัตยกรรม ออกแบบภายใน การออกแบบผลิตภัณฑ์หรือบรรจุภัณฑ์ การออกแบบเครื่องแต่งกาย ออกแบบเครื่องประดับ สื่อมัลติมีเดีย สื่อการเรียนการสอนและสื่อการเรียนรู้ การออกแบบศิลปะ การแสดง และงานศิลป์อื่น ๆ ธุรกิจไลฟ์สไตล์ (Lifestyle Business) เทคโนโลยีการท่องเที่ยว (Traveltech) รูปแบบการท่องเที่ยว การเพิ่มประสิทธิภาพการบริการ (Service Enhancing) โดยเฉพาะผลงานที่ทำให้เกิดผลผลิตที่เป็นนวัตกรรมที่เกี่ยวข้องกับอุตสาหกรรมสร้างสรรค์ 11 สาขา (อาหาร กีฬา งานเทศกาล ท่องเที่ยว ดนตรี หนังสือ ภาพยนตร์ เกม ศิลปะ การออกแบบ และแฟชั่น) ซึ่งจะนำไปสู่การพัฒนา Soft Power',
    subTopics: [
      {
        title: 'นวัตกรรมการออกแบบและภูมิปัญญาสร้างสรรค์ (Creative Design & Cultural Craft)',
        detail:
          'การออกแบบสถาปัตยกรรม ออกแบบภายใน ผลิตภัณฑ์ บรรจุภัณฑ์ เครื่องแต่งกาย เครื่องประดับ และการต่อยอดศิลปะ วัฒนธรรม และภูมิปัญญาท้องถิ่น',
      },
      {
        title: 'สื่อมัลติมีเดีย การเรียนรู้ และเทคโนโลยีบริการ (Multimedia, Learning & Traveltech)',
        detail:
          'สื่อมัลติมีเดีย สื่อการเรียนรู้ ธุรกิจไลฟ์สไตล์ (Lifestyle Business) เทคโนโลยีการท่องเที่ยว (Traveltech) และการเพิ่มประสิทธิภาพการบริการ (Service Enhancing)',
      },
      {
        title: 'อุตสาหกรรมสร้างสรรค์ 11 สาขาเพื่อ Soft Power (11 Creative Industries & Soft Power)',
        detail:
          'นวัตกรรมที่สร้างมูลค่าในอุตสาหกรรมสร้างสรรค์ 11 สาขา ได้แก่ อาหาร กีฬา งานเทศกาล ท่องเที่ยว ดนตรี หนังสือ ภาพยนตร์ เกม ศิลปะ การออกแบบ และแฟชั่น',
      },
    ],
    initialCriteria: [
      {
        title: 'ความพร้อมของชิ้นงานต้นแบบขั้นต่ำ (Mandatory Prototype Readiness)',
        detail:
          'ต้องมีชิ้นงานต้นแบบ (Prototype) เป็นขั้นต่ำ เช่น ผลิตภัณฑ์ต้นแบบ งานออกแบบที่สร้างจริง สื่อดิจิทัล หรือระบบบริการที่ทดลองใช้งานได้จริง ไม่รับพิจารณาผลงานที่เป็นเพียงแนวคิด (Idea)',
      },
      {
        title: 'การสร้างมูลค่าเพิ่มและศักยภาพ Soft Power (Creative Value & Quality of Life Impact)',
        detail:
          'แสดงเอกลักษณ์ความคิดสร้างสรรค์ การยกระดับคุณภาพชีวิต ประสบการณ์ผู้ใช้ หรือศักยภาพเชิงพาณิชย์ในการขับเคลื่อน Soft Power',
      },
      {
        title: 'เอกสารและสื่อประกอบการพิจารณา (Submission Deliverables)',
        detail:
          'เอกสารข้อเสนอโครงการ (Proposal PDF ไม่เกิน 10 หน้า A4) ภาพถ่ายชิ้นงานต้นแบบ (Prototype) และลิงก์คลิปวิดีโอสาธิตผลงานความยาว 2–3 นาที',
      },
    ],
    relatedCategoryIds: Object.freeze(['quality_of_life_soft_power']),
    color: '#D97706',
    bgImage: '/domain-softpower.jpg',
  },
]);

export function getDomainById(domainId) {
  if (typeof domainId !== 'string' || !domainId) {
    return null;
  }
  return DOMAIN_CATALOG.find((domain) => domain.id === domainId) || null;
}

export function getDomainSampleWinners(domainId, winnersList, limit = 2) {
  if (
    typeof domainId !== 'string' ||
    !domainId ||
    !Array.isArray(winnersList) ||
    !Number.isFinite(limit) ||
    limit <= 0
  ) {
    return [];
  }
  const safeLimit = Math.floor(limit);
  if (safeLimit <= 0) {
    return [];
  }
  const domain = getDomainById(domainId);
  const relatedIds = Array.isArray(domain?.relatedCategoryIds) ? domain.relatedCategoryIds : [];
  return winnersList
    .filter((item) =>
      Boolean(
        item &&
          typeof item === 'object' &&
          typeof item.category === 'string' &&
          (item.category === domainId || relatedIds.includes(item.category))
      )
    )
    .slice(0, safeLimit);
}
