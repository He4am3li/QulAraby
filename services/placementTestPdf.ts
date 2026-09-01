import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PlacementQuestion, PLACEMENT_TEST_80_QUESTIONS } from './placementTestPdfData';

export function generate80QuestionsHTML(teacherName: string = 'المعلم', autoPrint: boolean = false): string {
  const skillsGrouped = [
    { id: 1, name: '1. مهارة الأصوات والحروف والتعرف البصري', items: PLACEMENT_TEST_80_QUESTIONS.slice(0, 10) },
    { id: 2, name: '2. مهارة المفردات والحقول الدلالية', items: PLACEMENT_TEST_80_QUESTIONS.slice(10, 20) },
    { id: 3, name: '3. مهارة القواعد والتراكيب والنحو', items: PLACEMENT_TEST_80_QUESTIONS.slice(20, 30) },
    { id: 4, name: '4. مهارة الترجمة والفهم اللغوي المزدوج', items: PLACEMENT_TEST_80_QUESTIONS.slice(30, 40) },
    { id: 5, name: '5. مهارة الاستماع والفهم المسموع', items: PLACEMENT_TEST_80_QUESTIONS.slice(40, 50) },
    { id: 6, name: '6. مهارة التحدث والتعبير الشفهي والتواصل', items: PLACEMENT_TEST_80_QUESTIONS.slice(50, 60) },
    { id: 7, name: '7. مهارة الاستيعاب القرائي وتحليل النصوص', items: PLACEMENT_TEST_80_QUESTIONS.slice(60, 70) },
    { id: 8, name: '8. مهارة التعبير الكتابي والإملاء والدقة اللغوية', items: PLACEMENT_TEST_80_QUESTIONS.slice(70, 80) }
  ];

  const totalPages = 19;
  let currentPageNum = 1;

  // Helper to render a question card with perfectly centered text and options
  const renderQuestionCard = (q: PlacementQuestion) => `
    <div class="question-card">
      <div class="q-meta">
        <div class="q-meta-right">
          <span class="q-num">سؤال ${q.id}</span>
          <span class="q-subskill">${q.subSkillAr}</span>
        </div>
        <span class="cefr-badge">${q.cefr}</span>
      </div>
      <div class="q-text">${q.question}</div>
      <div class="options-grid">
        <div class="option-item">
          <span class="opt-letter">أ</span>
          <span class="opt-text">${q.options[0]}</span>
        </div>
        <div class="option-item">
          <span class="opt-letter">ب</span>
          <span class="opt-text">${q.options[1]}</span>
        </div>
        <div class="option-item">
          <span class="opt-letter">ج</span>
          <span class="opt-text">${q.options[2]}</span>
        </div>
        <div class="option-item">
          <span class="opt-letter">د</span>
          <span class="opt-text">${q.options[3]}</span>
        </div>
      </div>
    </div>
  `;

  // Page 1: Cover Page with 3 well-distributed boxes, platform logo, and updated titles
  const page1HTML = `
    <div class="a4-page page-cover">
      <div class="page-content-wrapper cover-wrapper">
        <!-- Box 1: Document Header Box -->
        <div class="doc-header">
          <div class="header-brand-row">
            <div class="brand-logo-emblem">
              <div class="emblem-inner">
                <span class="emblem-en">QUL</span>
                <span class="emblem-ar">قُلْ</span>
              </div>
            </div>
            <div class="brand-text-col">
              <div class="doc-logo">منصة قُل</div>
              <div class="brand-tagline">المنصة الرائدة لتعليم اللغة العربية للناطقين بغيرها</div>
            </div>
          </div>

          <div class="doc-title-divider"></div>

          <div class="doc-subtitle">اختبار تحديد المستوى في اللغة العربية للناطقين بغير العربية</div>
          
          <div class="doc-meta">
            <div class="meta-chip"><b>عدد الأسئلة:</b> 80 سؤالاً موضوعياً</div>
            <div class="meta-chip"><b>الزمن المقترح:</b> 60 دقيقة</div>
            <div class="meta-chip"><b>الدرجة الكلية:</b> 80 درجة</div>
            <div class="meta-chip"><b>إعداد:</b> ${teacherName}</div>
          </div>
        </div>

        <!-- Box 2: Instructions Box -->
        <div class="instructions-box">
          <div class="instructions-title">💡 تعليمات وتوجيهات للمعلم والطالب:</div>
          <ul class="instructions-list">
            <li>يتكون هذا الاختبار التشخيصي من 80 سؤالاً موزعاً بالتساوي على ثماني مهارات رئيسية (10 أسئلة لكل مهارة).</li>
            <li>لكل سؤال أربعة خيارات (أ، ب، ج، د) خيار واحد منها فقط صحيح.</li>
            <li>يُقاس التقدم والتحصيل اللغوي وفق الإطار الأوروبي المرجعي الموحد للغات (CEFR: A1, A2, B1, B2).</li>
          </ul>
        </div>

        <!-- Box 3: Student Identification Card -->
        <div class="student-id-card">
          <div class="student-id-title">بيانات الطالب (تُملأ قبل بدء الاختبار):</div>
          <div class="student-id-grid">
            <div class="id-field">
              <span class="id-label">اسم الطالب:</span>
              <span class="id-line">...........................................................................</span>
            </div>
            <div class="id-field">
              <span class="id-label">الرقم الأكاديمي / الهوية:</span>
              <span class="id-line">......................................................</span>
            </div>
            <div class="id-field">
              <span class="id-label">المجموعة / الصف:</span>
              <span class="id-line">...................................................................</span>
            </div>
            <div class="id-field">
              <span class="id-label">تاريخ إجراء الاختبار:</span>
              <span class="id-line">......................................................</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span class="footer-brand">منصة قُل | التميز اللغوي الذكي</span>
        <span class="footer-page">صفحة 1 من ${totalPages}</span>
      </div>
    </div>
  `;

  // Pages 2 to 17: Questions (5 per page)
  const questionPagesHTML = skillsGrouped.map((group) => {
    // Part 1: Q 1-5 of this skill (Has Black Header)
    currentPageNum++;
    const pageNum1 = currentPageNum;
    const part1Questions = group.items.slice(0, 5);
    const pagePart1 = `
      <div class="a4-page">
        <div class="page-content-wrapper">
          <div class="skill-header clearfix">
            <span class="skill-title">${group.name}</span>
            <span class="skill-badge">
              <span>10 أسئلة</span>
              <span class="badge-sep">|</span>
              <span class="badge-cefr" dir="ltr">CEFR (A1 - B2)</span>
            </span>
          </div>
          <div class="questions-container">
            ${part1Questions.map(renderQuestionCard).join('')}
          </div>
        </div>
        <div class="page-footer">
          <span class="footer-brand">اختبار تحديد المستوى - ${group.name.split('.')[1] || group.name}</span>
          <span class="footer-page">صفحة ${pageNum1} من ${totalPages}</span>
        </div>
      </div>
    `;

    // Part 2: Q 6-10 of this skill (Without Black Header)
    currentPageNum++;
    const pageNum2 = currentPageNum;
    const part2Questions = group.items.slice(5, 10);
    const pagePart2 = `
      <div class="a4-page">
        <div class="page-content-wrapper">
          <div class="questions-container">
            ${part2Questions.map(renderQuestionCard).join('')}
          </div>
        </div>
        <div class="page-footer">
          <span class="footer-brand">اختبار تحديد المستوى - ${group.name.split('.')[1] || group.name} (تابع)</span>
          <span class="footer-page">صفحة ${pageNum2} من ${totalPages}</span>
        </div>
      </div>
    `;

    return pagePart1 + pagePart2;
  }).join('');

  // Page 18: Answer Key Part 1 (Questions 1 to 40)
  currentPageNum++;
  const page18Num = currentPageNum;
  const answerRowsPart1 = PLACEMENT_TEST_80_QUESTIONS.slice(0, 40).map(q => `
    <tr>
      <td class="text-center font-bold">${q.id}</td>
      <td class="font-semibold">${q.skillAr} - ${q.subSkillAr}</td>
      <td class="text-center font-bold text-blue" dir="ltr">${q.cefr}</td>
      <td class="text-center font-black text-emerald">${['أ', 'ب', 'ج', 'د'][q.correctIndex]} (${q.options[q.correctIndex]})</td>
      <td class="text-slate">${q.explanationAr}</td>
    </tr>
  `).join('');

  const page18HTML = `
    <div class="a4-page answer-key-page">
      <div class="page-content-wrapper answer-key-wrapper">
        <div class="section-main-title">نموذج الإجابات الصحيحة ومصفوفة التصحيح التشخيصية (الجزء الأول: أسئلة 1 - 40)</div>
        
        <div class="cefr-matrix-box">
          <div class="cefr-card a1">
            <span class="cefr-card-title">A1 مبتدئ</span>
            <span class="cefr-card-score">0 - 25 درجة</span>
          </div>
          <div class="cefr-card a2">
            <span class="cefr-card-title">A2 أساسي</span>
            <span class="cefr-card-score">26 - 45 درجة</span>
          </div>
          <div class="cefr-card b1">
            <span class="cefr-card-title">B1 متوسط</span>
            <span class="cefr-card-score">46 - 65 درجة</span>
          </div>
          <div class="cefr-card b2">
            <span class="cefr-card-title">B2 متقدم</span>
            <span class="cefr-card-score">66 - 80 درجة</span>
          </div>
        </div>

        <table class="answers-table">
          <thead>
            <tr>
              <th style="width: 4%;">#</th>
              <th style="width: 25%;">المهارة والفرع التشخيصي</th>
              <th style="width: 7%;">CEFR</th>
              <th style="width: 21%;">الإجابة الصحيحة</th>
              <th style="width: 43%;">التعليل والربط التشخيصي</th>
            </tr>
          </thead>
          <tbody>
            ${answerRowsPart1}
          </tbody>
        </table>
      </div>
      <div class="page-footer">
        <span class="footer-brand">نموذج الإجابات المعتمد - الجزء الأول (أسئلة 1 - 40)</span>
        <span class="footer-page">صفحة ${page18Num} من ${totalPages}</span>
      </div>
    </div>
  `;

  // Page 19: Answer Key Part 2 (Questions 41 to 80)
  currentPageNum++;
  const page19Num = currentPageNum;
  const answerRowsPart2 = PLACEMENT_TEST_80_QUESTIONS.slice(40, 80).map(q => `
    <tr>
      <td class="text-center font-bold">${q.id}</td>
      <td class="font-semibold">${q.skillAr} - ${q.subSkillAr}</td>
      <td class="text-center font-bold text-blue" dir="ltr">${q.cefr}</td>
      <td class="text-center font-black text-emerald">${['أ', 'ب', 'ج', 'د'][q.correctIndex]} (${q.options[q.correctIndex]})</td>
      <td class="text-slate">${q.explanationAr}</td>
    </tr>
  `).join('');

  const page19HTML = `
    <div class="a4-page answer-key-page">
      <div class="page-content-wrapper answer-key-wrapper">
        <div class="section-main-title">نموذج الإجابات الصحيحة ومصفوفة التصحيح التشخيصية (الجزء الثاني: أسئلة 41 - 80)</div>
        
        <table class="answers-table">
          <thead>
            <tr>
              <th style="width: 4%;">#</th>
              <th style="width: 25%;">المهارة والفرع التشخيصي</th>
              <th style="width: 7%;">CEFR</th>
              <th style="width: 21%;">الإجابة الصحيحة</th>
              <th style="width: 43%;">التعليل والربط التشخيصي</th>
            </tr>
          </thead>
          <tbody>
            ${answerRowsPart2}
          </tbody>
        </table>

        <div class="evaluation-summary-box">
          <div class="eval-title">توصيات التوجيه اللغوي والمسار التعليمي:</div>
          <p class="eval-desc">يُحدد المسار التعليمي للطالب بناءً على مجموع الدرجات والمهارات النوعية الضعيفة في هذا الاختبار لإدراجه في البرامج الإثرائية أو الخطط العلاجية المتخصصة في منصة قُلْ.</p>
        </div>
      </div>
      <div class="page-footer">
        <span class="footer-brand">نموذج الإجابات المعتمد - الجزء الثاني (أسئلة 41 - 80)</span>
        <span class="footer-page">صفحة ${page19Num} من ${totalPages}</span>
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>اختبار تحديد المستوى في اللغة العربية للناطقين بغير العربية</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap">
  <style>
    *, *:before, *:after {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f1f5f9;
      color: #0f172a;
      direction: rtl !important;
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif !important;
      font-size: 9pt;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
    }

    body {
      padding: 20px 10px;
    }

    .clearfix::after {
      content: "";
      clear: both;
      display: table;
    }

    .pages-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
    }

    /* Discrete A4 Sheet */
    .a4-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      margin: 0 auto 20px auto;
      padding: 10mm 13mm 8mm 13mm;
      background: #ffffff;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      border-radius: 6px;
      box-sizing: border-box;
      position: relative;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .page-content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    /* Cover Page Custom Layout - 3 balanced expanded boxes filling the page elegantly */
    .page-cover {
      padding: 6mm 13mm 6mm 13mm !important;
    }

    .cover-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 0;
      box-sizing: border-box;
      gap: 12px;
    }

    /* Box 1: Document Header - expanded vertically to fill space */
    .doc-header {
      flex: 1.1;
      border: 2px solid #2563eb;
      border-radius: 16px;
      padding: 18px 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
      text-align: center;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.06);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .header-brand-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .brand-logo-emblem {
      width: 52px;
      height: 52px;
      background: #0f172a;
      border-radius: 14px;
      padding: 3px;
      border: 2px solid #334155;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
    }

    .emblem-inner {
      width: 100%;
      height: 100%;
      background: #000000;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .emblem-en {
      font-size: 8.5pt;
      font-weight: 900;
      color: #60a5fa;
      letter-spacing: 0.5px;
    }

    .emblem-ar {
      font-size: 13pt;
      font-weight: 900;
      color: #34d399;
      margin-top: 1px;
      letter-spacing: normal !important;
    }

    .brand-text-col {
      text-align: right;
      letter-spacing: normal !important;
    }

    .doc-logo {
      font-size: 20pt;
      font-weight: 900;
      color: #1e40af;
      line-height: 1.2;
      letter-spacing: normal !important;
      font-feature-settings: "liga" 1, "calt" 1 !important;
    }

    .brand-tagline {
      font-size: 8.5pt;
      font-weight: 700;
      color: #64748b;
      margin-top: 2px;
      letter-spacing: normal !important;
    }

    .doc-title-divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #bfdbfe, #3b82f6, #bfdbfe, transparent);
      margin: 12px 0 16px 0;
      width: 100%;
    }

    .doc-subtitle {
      font-size: 12.5pt;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 16px;
      line-height: 1.4;
      letter-spacing: normal !important;
    }

    .doc-meta {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      width: 100%;
    }

    .meta-chip {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 9pt;
      font-weight: 700;
      color: #1e293b;
      background: #ffffff;
      padding: 7px 14px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      line-height: 1;
    }

    /* Box 2: Instructions Box - expanded vertically to fill page comfortably */
    .instructions-box {
      flex: 1.2;
      background: #fefce8;
      border: 2px solid #fde047;
      border-radius: 16px;
      padding: 20px 26px;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 4px 12px rgba(234, 179, 8, 0.06);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .instructions-title {
      font-weight: 900;
      color: #854d0e;
      font-size: 11pt;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.2;
    }

    .instructions-list {
      margin: 0;
      padding-right: 22px;
      font-size: 9.5pt;
      color: #713f12;
      font-weight: 700;
      line-height: 1.75;
    }

    .instructions-list li {
      margin-bottom: 10px;
    }

    .instructions-list li:last-child {
      margin-bottom: 0;
    }

    /* Box 3: Student Identification Box - expanded vertically to complete layout */
    .student-id-card {
      flex: 0.95;
      border: 2px dashed #94a3b8;
      border-radius: 16px;
      padding: 20px 26px;
      background: #f8fafc;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .student-id-title {
      font-size: 10.5pt;
      font-weight: 800;
      color: #334155;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .student-id-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
    }

    .id-field {
      display: flex !important;
      align-items: center !important;
      gap: 8px;
      font-size: 9.5pt;
      font-weight: 700;
      color: #334155;
      min-height: 32px;
    }

    .id-label {
      white-space: nowrap;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
    }

    .id-line {
      flex: 1;
      border-bottom: 1.5px dotted #94a3b8;
      height: 18px;
    }

    /* Skill Header Bar */
    .skill-header {
      background: #0f172a !important;
      color: #ffffff !important;
      padding: 0 16px !important;
      height: 36px !important;
      border-radius: 8px !important;
      margin-bottom: 8px !important;
      width: 100% !important;
      box-sizing: border-box !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }

    .skill-title {
      font-weight: 900 !important;
      font-size: 10pt !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      line-height: 1 !important;
      margin: 0 !important;
    }

    .skill-badge {
      background: #1e293b !important;
      color: #38bdf8 !important;
      font-size: 8pt !important;
      font-weight: 800 !important;
      padding: 0 10px !important;
      height: 24px !important;
      border-radius: 6px !important;
      border: 1px solid #334155 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      line-height: 1 !important;
      direction: rtl !important;
    }

    .badge-sep {
      color: #64748b !important;
      font-weight: 400 !important;
    }

    .badge-cefr {
      direction: ltr !important;
      display: inline-block !important;
      unicode-bidi: isolate !important;
      font-weight: 800 !important;
    }

    /* Questions Layout (5 questions per page) */
    .questions-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
      justify-content: space-between;
    }

    .question-card {
      border: 1px solid #cbd5e1 !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
      background: #ffffff !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      gap: 5px !important;
    }

    .q-meta {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      width: 100% !important;
      height: 22px !important;
    }

    .q-meta-right {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .q-num {
      background: #eff6ff !important;
      color: #1d4ed8 !important;
      font-size: 8pt !important;
      font-weight: 800 !important;
      padding: 0 8px !important;
      border-radius: 4px !important;
      border: 1px solid #bfdbfe !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 20px !important;
      line-height: 1 !important;
    }

    .q-subskill {
      font-size: 8pt !important;
      color: #64748b !important;
      font-weight: 700 !important;
      display: inline-flex !important;
      align-items: center !important;
      line-height: 1 !important;
    }

    .cefr-badge {
      background: #f1f5f9 !important;
      color: #475569 !important;
      font-size: 7.5pt !important;
      font-weight: 800 !important;
      padding: 0 8px !important;
      border-radius: 4px !important;
      border: 1px solid #e2e8f0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 20px !important;
      line-height: 1 !important;
    }

    .q-text {
      font-weight: 800 !important;
      font-size: 9.5pt !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 2px 0 !important;
      line-height: 1.35 !important;
      display: flex !important;
      align-items: center !important;
      word-wrap: break-word !important;
    }

    /* Vertically Centered Options Grid */
    .options-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 6px 10px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .option-item {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 6px !important;
      padding: 0 10px !important;
      background: #f8fafc !important;
      height: 32px !important;
      min-height: 32px !important;
      box-sizing: border-box !important;
    }

    .opt-letter {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 22px !important;
      height: 22px !important;
      border-radius: 50% !important;
      background: #e2e8f0 !important;
      color: #1e293b !important;
      font-size: 8.5pt !important;
      font-weight: 800 !important;
      margin-left: 8px !important;
      flex-shrink: 0 !important;
      line-height: 1 !important;
    }

    .opt-text {
      font-weight: 700 !important;
      color: #1e293b !important;
      font-size: 8.5pt !important;
      line-height: 1.2 !important;
      flex: 1 !important;
      display: flex !important;
      align-items: center !important;
      word-wrap: break-word !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Answer Key Section (Pages 18 & 19 - Exactly 40 questions per page) */
    .answer-key-page {
      padding: 6mm 10mm 5mm 10mm !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      overflow: hidden !important;
    }

    .answer-key-wrapper {
      display: flex !important;
      flex-direction: column !important;
      height: auto !important;
      flex: 1 !important;
      justify-content: flex-start !important;
      gap: 3px !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }

    .section-main-title {
      font-size: 9.2pt !important;
      font-weight: 900 !important;
      color: #0f172a !important;
      text-align: center !important;
      margin-bottom: 2px !important;
      border-bottom: 1.5px solid #2563eb !important;
      padding-bottom: 2px !important;
      line-height: 1.2 !important;
    }

    .cefr-matrix-box {
      display: flex !important;
      width: 100% !important;
      gap: 6px !important;
      margin-bottom: 2px !important;
    }

    .cefr-card {
      flex: 1 !important;
      border-radius: 4px !important;
      padding: 1.5px 6px !important;
      text-align: center !important;
      border: 1px solid !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      height: 17px !important;
    }

    .cefr-card.a1 { background: #eff6ff !important; border-color: #bfdbfe !important; color: #1e40af !important; }
    .cefr-card.a2 { background: #f0fdf4 !important; border-color: #bbf7d0 !important; color: #166534 !important; }
    .cefr-card.b1 { background: #fefce8 !important; border-color: #fef08a !important; color: #854d0e !important; }
    .cefr-card.b2 { background: #faf5ff !important; border-color: #e9d5ff !important; color: #6b21a8 !important; }

    .cefr-card-title { font-weight: 900 !important; font-size: 7.2pt !important; line-height: 1 !important; }
    .cefr-card-score { font-weight: 800 !important; font-size: 6.8pt !important; line-height: 1 !important; }

    table.answers-table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 7.0pt !important;
      table-layout: fixed !important;
      line-height: 1.18 !important;
      margin: 0 !important;
    }

    table.answers-table th {
      background: #0f172a !important;
      color: #ffffff !important;
      padding: 2.2px 4px !important;
      font-weight: 800 !important;
      border: 1px solid #334155 !important;
      text-align: right !important;
      font-size: 7.2pt !important;
      vertical-align: middle !important;
      height: 16px !important;
      line-height: 1 !important;
    }

    table.answers-table td {
      padding: 1.85px 4px !important;
      border: 1px solid #cbd5e1 !important;
      text-align: right !important;
      vertical-align: middle !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      font-size: 7.0pt !important;
      line-height: 1.18 !important;
    }

    table.answers-table tr:nth-child(even) {
      background-color: #f8fafc !important;
    }

    .evaluation-summary-box {
      background: #f0fdf4 !important;
      border: 1.2px solid #bbf7d0 !important;
      border-radius: 5px !important;
      padding: 2.5px 8px !important;
      margin-top: 2px !important;
    }

    .eval-title {
      font-weight: 900 !important;
      font-size: 7.0pt !important;
      color: #166534 !important;
      margin-bottom: 1px !important;
      line-height: 1.15 !important;
    }

    .eval-desc {
      font-weight: 700 !important;
      font-size: 6.2pt !important;
      color: #14532d !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }

    .text-center { text-align: center !important; }
    .font-bold { font-weight: 700 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-black { font-weight: 900 !important; }
    .text-blue { color: #2563eb !important; }
    .text-emerald { color: #059669 !important; }
    .text-slate { color: #475569 !important; }

    /* Page Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      margin-top: 4px;
      font-size: 7.5pt;
      color: #94a3b8;
      font-weight: 700;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      html, body {
        padding: 0 !important;
        margin: 0 !important;
        background: #ffffff !important;
        width: 100% !important;
        direction: rtl !important;
      }
      .pages-container {
        max-width: 100% !important;
      }
      .a4-page {
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        margin: 0 !important;
        padding: 10mm 13mm 8mm 13mm !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .page-cover {
        padding: 6mm 13mm 6mm 13mm !important;
      }
      .answer-key-page {
        padding: 6mm 10mm 5mm 10mm !important;
      }
    }
  </style>
</head>
<body>

  <div class="pages-container">
    ${page1HTML}
    ${questionPagesHTML}
    ${page18HTML}
    ${page19HTML}
  </div>

  ${autoPrint ? `
  <script>
    window.addEventListener('load', function() {
      if (document.fonts) {
        document.fonts.ready.then(function() {
          setTimeout(function() {
            window.print();
          }, 300);
        });
      } else {
        setTimeout(function() {
          window.print();
        }, 600);
      }
    });
  </script>` : ''}
</body>
</html>
`;
}

export async function downloadPlacementTestPDF(teacherName: string = 'المعلم'): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';

  const htmlContent = generate80QuestionsHTML(teacherName, false);
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // Allow fonts & styles to settle
  await new Promise((resolve) => setTimeout(resolve, 400));

  try {
    const pageElements = container.querySelectorAll<HTMLElement>('.a4-page');
    if (!pageElements || pageElements.length === 0) {
      throw new Error('No pages found');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      const pageEl = pageElements[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save('اختبار_تحديد_المستوى_في_اللغة_العربية_للناطقين_بغير_العربية.pdf');
  } catch (err) {
    console.error('PDF Generation failed, fallback to print:', err);
    window.print();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
