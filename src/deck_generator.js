import PptxGenJS from 'pptxgenjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Brand Palette (BucketsAI Manual de Marca v7) ──
const C = {
  // Primary Colors
  navy:       '2E3E5C',   // Navy Mid — dark panels, premium backgrounds
  navyLight:  '3A4D6E',   // Slightly lighter navy for cards on dark
  blue:       '4470DC',   // Brand Blue — CTAs, highlights, top bars, logo
  blueMed:    '6B8FE8',   // Blue Medium — hover, secondary icons
  blueLight:  'E4EBF8',   // Blue Light — card backgrounds, chips
  bluePale:   'EEF0F6',   // Page BG — alternate section bg
  white:      'FFFFFF',
  offWhite:   'EEF0F6',   // Page background
  // Secondary
  gray:       '8A96B0',   // Gray Mid — muted text, captions
  grayLight:  'D8DCE8',   // Border — dividers
  textDark:   '0C1628',   // Dark Navy — text ONLY, never as fill
  textBody:   '5A6A88',   // Text Muted — body text on light backgrounds
  // Accents
  green:      '22B573',   // Positive metrics
  red:        'E74C3C',   // Negative/before items
  orange:     'FF6B35',   // Accent only — CTAs, metrics emphasis
};

const FONT_H = 'Arial';  // Inter/Arial — brand typography (headers)
const FONT_B = 'Arial';  // Inter/Arial — brand typography (body)
const W = 13.33;
const H = 7.5;

// ── Helpers ──
function imgBase64(relativePath) {
  try {
    const buf = readFileSync(join(__dirname, '..', 'public', relativePath));
    const ext = relativePath.split('.').pop().toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `image/${mime.split('/')[1]};base64,${buf.toString('base64')}`;
  } catch { return null; }
}

function deckImgBase64(name) {
  try {
    const buf = readFileSync(join(__dirname, '..', 'public', 'deck-assets', name));
    const ext = name.split('.').pop().toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `image/${mime.split('/')[1]};base64,${buf.toString('base64')}`;
  } catch { return null; }
}

function shadow() {
  return { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 135, opacity: 0.08 };
}

function cardShadow() {
  return { type: 'outer', color: '000000', blur: 4, offset: 1, angle: 135, opacity: 0.06 };
}

// Consistent footer strip on content slides
function addFooter(slide, pres) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 7.05, w: W, h: 0.45,
    fill: { color: C.offWhite },
  });
  const logo = imgBase64('logo.png');
  if (logo) {
    slide.addImage({ data: logo, x: 0.5, y: 7.1, w: 1.4, h: 0.3 });
  }
  slide.addText('buckets-ai.com', {
    x: 10.5, y: 7.1, w: 2.5, h: 0.3,
    fontSize: 9, fontFace: FONT_B, color: C.gray, align: 'right',
  });
}

// ── Slide Builders ──

function addSlide1Cover(pres, d, empresa) {
  const slide = pres.addSlide();
  slide.background = { color: C.navy };

  // Decorative gradient-like shapes
  slide.addShape(pres.shapes.OVAL, {
    x: -3, y: -2, w: 9, h: 11,
    fill: { color: C.blue, transparency: 92 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 8, y: 4, w: 8, h: 6,
    fill: { color: C.blue, transparency: 94 },
  });

  // Logo
  const logo = imgBase64('logo.png');
  if (logo) {
    slide.addImage({ data: logo, x: 0.7, y: 0.6, w: 2.4, h: 0.65 });
  }

  // Company label
  slide.addText(empresa.toUpperCase(), {
    x: 0.7, y: 1.8, w: 6, h: 0.4,
    fontSize: 13, fontFace: FONT_B, color: C.blue,
    charSpacing: 5, bold: true,
  });

  // Main tagline
  slide.addText(d.cover_tagline, {
    x: 0.7, y: 2.5, w: 7, h: 2.8,
    fontSize: 34, fontFace: FONT_H, color: C.white,
    bold: true, lineSpacingMultiple: 1.2,
  });

  // Hero phones
  const heroPhones = imgBase64('onepager-assets/hero-phones-clean.png');
  if (heroPhones) {
    slide.addImage({ data: heroPhones, x: 8.5, y: 1.2, w: 4.5, h: 3.5 });
  }

  // Bottom strip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 6.9, w: W, h: 0.6,
    fill: { color: C.blue, transparency: 75 },
  });
  slide.addText('buckets-ai.com', {
    x: 0.7, y: 7.0, w: 3, h: 0.35,
    fontSize: 11, fontFace: FONT_B, color: C.white, bold: true,
  });
}

function addSlide2Problem(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Headline across full width
  slide.addText(d.problem_headline, {
    x: 0.6, y: 0.4, w: 12, h: 1.2,
    fontSize: 28, fontFace: FONT_H, color: C.textDark, bold: true,
    lineSpacingMultiple: 1.15,
  });

  // Left column: "Tus equipos tienen:"
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.9, w: 5.8, h: 4.2,
    fill: { color: C.bluePale },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.9, w: 5.8, h: 0.06,
    fill: { color: C.blue },
  });
  slide.addText('Tus equipos tienen:', {
    x: 0.9, y: 2.1, w: 5.2, h: 0.4,
    fontSize: 15, fontFace: FONT_H, color: C.textDark, bold: true,
  });

  const hasItems = (d.problem_has_items || []).map((item) => ({
    text: item,
    options: { bullet: { code: '25CF', color: C.blue }, breakLine: true, fontSize: 13, fontFace: FONT_B, color: C.textBody, paraSpaceAfter: 8 },
  }));
  slide.addText(hasItems, { x: 1.1, y: 2.7, w: 5.0, h: 3.0 });

  // Right column: "Pero en la ejecucion real:"
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.9, y: 1.9, w: 5.8, h: 4.2,
    fill: { color: 'FFF5F5' },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.9, y: 1.9, w: 5.8, h: 0.06,
    fill: { color: C.red },
  });
  slide.addText('Pero en la ejecucion real:', {
    x: 7.2, y: 2.1, w: 5.2, h: 0.4,
    fontSize: 15, fontFace: FONT_H, color: C.textDark, bold: true,
  });

  const butItems = (d.problem_but_items || []).map((item) => ({
    text: item,
    options: { bullet: { code: '25CF', color: C.red }, breakLine: true, fontSize: 13, fontFace: FONT_B, color: C.textBody, paraSpaceAfter: 8 },
  }));
  slide.addText(butItems, { x: 7.4, y: 2.7, w: 5.0, h: 3.0 });

  // Closing bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 6.4, w: 12.1, h: 0.5,
    fill: { color: C.navy },
  });
  slide.addText(d.problem_closing, {
    x: 0.8, y: 6.42, w: 11.7, h: 0.45,
    fontSize: 13, fontFace: FONT_B, color: C.white, bold: true, align: 'center', valign: 'middle',
  });

  addFooter(slide, pres);
}

function addSlide3Depth(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Full-width dark left panel (split layout)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 5.5, h: H,
    fill: { color: C.navy },
  });

  slide.addText(d.depth_headline, {
    x: 0.5, y: 1.5, w: 4.5, h: 3.5,
    fontSize: 30, fontFace: FONT_H, color: C.white, bold: true,
    lineSpacingMultiple: 1.2,
  });

  // Stock image (right side)
  const stockImg = deckImgBase64('frustrated-person.png');
  if (stockImg) {
    slide.addImage({ data: stockImg, x: 5.5, y: 0, w: 7.83, h: H,
      sizing: { type: 'cover', w: 7.83, h: H } });
  }

  // Semi-transparent overlay for readability
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 0, w: 7.83, h: H,
    fill: { color: C.white, transparency: 25 },
  });

  // Reason cards stacked vertically on right
  const reasons = d.depth_reasons || [];
  const cardX = 6.2;
  const cardW = 6.5;
  const cardH = 0.85;
  const startY = 0.6;
  const gap = 0.25;

  reasons.forEach((reason, i) => {
    const y = startY + i * (cardH + gap);
    // Card with left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cardX, y, w: cardW, h: cardH,
      fill: { color: C.white },
      shadow: cardShadow(),
    });
    // Left accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cardX, y, w: 0.06, h: cardH,
      fill: { color: C.blue },
    });
    // Number
    slide.addText(`${i + 1}`, {
      x: cardX + 0.25, y, w: 0.4, h: cardH,
      fontSize: 18, fontFace: FONT_H, color: C.blue, bold: true, valign: 'middle',
    });
    slide.addText(reason, {
      x: cardX + 0.65, y, w: cardW - 0.9, h: cardH,
      fontSize: 13, fontFace: FONT_B, color: C.textDark, bold: true,
      valign: 'middle', lineSpacingMultiple: 1.15,
    });
  });
}

function addSlide4Solution(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.offWhite };

  // Left content
  slide.addText(d.solution_headline, {
    x: 0.6, y: 0.5, w: 5.5, h: 2,
    fontSize: 28, fontFace: FONT_H, color: C.textDark, bold: true,
    lineSpacingMultiple: 1.15,
  });

  slide.addText(d.solution_description, {
    x: 0.6, y: 2.8, w: 5.5, h: 1.5,
    fontSize: 15, fontFace: FONT_B, color: C.textBody,
    lineSpacingMultiple: 1.35,
  });

  // Chat phone image (center)
  const chatPhone = imgBase64('onepager-assets/chat-phone-clean.png');
  if (chatPhone) {
    slide.addImage({ data: chatPhone, x: 5.8, y: 0.3, w: 3.2, h: 6.5,
      sizing: { type: 'contain', w: 3.2, h: 6.5 } });
  }

  // Right dark panel with capabilities
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 9.3, y: 0, w: 4.03, h: H,
    fill: { color: C.navy },
  });

  slide.addText('Le permite a los equipos:', {
    x: 9.6, y: 0.5, w: 3.5, h: 0.4,
    fontSize: 14, fontFace: FONT_H, color: C.white, bold: true,
  });

  const capItems = (d.solution_capabilities || []).map((cap, i) => ({
    text: cap,
    options: { bullet: { code: '2713', color: C.blue }, breakLine: true, fontSize: 13, fontFace: FONT_B, color: C.white, paraSpaceAfter: 14 },
  }));
  slide.addText(capItems, { x: 9.8, y: 1.2, w: 3.3, h: 5.5 });
}

function addSlide5HowItWorks(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText('Como funciona', {
    x: 0.6, y: 0.4, w: 12, h: 0.6,
    fontSize: 28, fontFace: FONT_H, color: C.textDark, bold: true, align: 'center',
  });
  slide.addText('Listo para operar en horas', {
    x: 0.6, y: 1.0, w: 12, h: 0.35,
    fontSize: 14, fontFace: FONT_B, color: C.gray, align: 'center',
  });

  // 3 step cards
  const steps = [d.how_step1, d.how_step2, d.how_step3];
  const nums = ['01', '02', '03'];
  const colors = [C.blue, C.green, C.orange];
  const colW = 3.5;
  const startX = 1.2;
  const gapX = 0.9;

  steps.forEach((step, i) => {
    const x = startX + i * (colW + gapX);
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.8, w: colW, h: 3.5,
      fill: { color: C.white },
      shadow: shadow(),
    });
    // Top color accent bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.8, w: colW, h: 0.06,
      fill: { color: colors[i] },
    });
    // Number in colored circle
    slide.addShape(pres.shapes.OVAL, {
      x: x + colW / 2 - 0.45, y: 2.2, w: 0.9, h: 0.9,
      fill: { color: colors[i] },
    });
    slide.addText(nums[i], {
      x: x + colW / 2 - 0.45, y: 2.2, w: 0.9, h: 0.9,
      fontSize: 24, fontFace: FONT_H, color: C.white, bold: true,
      align: 'center', valign: 'middle',
    });
    // Step text
    slide.addText(step, {
      x: x + 0.3, y: 3.4, w: colW - 0.6, h: 1.6,
      fontSize: 14, fontFace: FONT_B, color: C.textBody,
      align: 'center', lineSpacingMultiple: 1.3, valign: 'top',
    });
  });

  // "Lo que NO hace" section
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.2, y: 5.7, w: 10.9, h: 1.0,
    fill: { color: C.bluePale },
  });
  slide.addText('Lo que BucketsAi NO hace', {
    x: 1.4, y: 5.8, w: 10.5, h: 0.35,
    fontSize: 13, fontFace: FONT_H, color: C.textDark, bold: true, align: 'center',
  });
  const notItems = (d.how_not_items || []).join('   |   ');
  slide.addText(notItems, {
    x: 1.4, y: 6.2, w: 10.5, h: 0.4,
    fontSize: 12, fontFace: FONT_B, color: C.textBody, align: 'center',
  });

  addFooter(slide, pres);
}

function addSlide6Demo(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.offWhite };

  // Title
  slide.addText(d.demo_headline, {
    x: 0.6, y: 0.4, w: 6, h: 1.2,
    fontSize: 26, fontFace: FONT_H, color: C.textDark, bold: true,
    lineSpacingMultiple: 1.15,
  });

  // Description
  slide.addText(d.demo_description, {
    x: 0.6, y: 1.8, w: 5.5, h: 1.5,
    fontSize: 14, fontFace: FONT_B, color: C.textBody,
    lineSpacingMultiple: 1.35,
  });

  // Chat mockup card (right side)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.8, y: 0.4, w: 6, h: 6.2,
    fill: { color: C.white },
    shadow: shadow(),
  });

  // Chat header bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.8, y: 0.4, w: 6, h: 0.5,
    fill: { color: C.navy },
  });
  slide.addText('BucketsAi Chat', {
    x: 7.1, y: 0.42, w: 4, h: 0.46,
    fontSize: 12, fontFace: FONT_B, color: C.white, bold: true, valign: 'middle',
  });

  // User message bubble
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 8.2, y: 1.2, w: 4.3, h: 2.2,
    fill: { color: C.blueLight },
  });
  slide.addText('Tu', {
    x: 11.6, y: 1.25, w: 0.7, h: 0.25,
    fontSize: 10, fontFace: FONT_B, color: C.blue, bold: true, align: 'right',
  });
  slide.addText(d.demo_user_message, {
    x: 8.4, y: 1.5, w: 3.9, h: 1.8,
    fontSize: 11, fontFace: FONT_B, color: C.textDark,
    lineSpacingMultiple: 1.25,
  });

  // AI response bubble
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 7.1, y: 3.7, w: 4.3, h: 2.7,
    fill: { color: C.white },
    line: { color: C.grayLight, width: 0.5 },
  });
  slide.addText([
    { text: 'BucketsAi', options: { bold: true, color: C.blue, fontSize: 10, breakLine: true } },
    { text: '', options: { breakLine: true, fontSize: 4 } },
    { text: d.demo_ai_response, options: { fontSize: 11, color: C.textDark } },
  ], {
    x: 7.3, y: 3.85, w: 3.9, h: 2.4,
    fontFace: FONT_B, lineSpacingMultiple: 1.25,
  });

  addFooter(slide, pres);
}

function addSlide7BeforeAfter(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText([
    { text: 'Antes ', options: { fontSize: 28, bold: true, color: C.red } },
    { text: 'vs ', options: { fontSize: 28, bold: true, color: C.gray } },
    { text: 'Despues', options: { fontSize: 28, bold: true, color: C.green } },
  ], { x: 0.6, y: 0.3, w: 12, h: 0.6, fontFace: FONT_H, align: 'center' });

  // Before column
  const bx = 0.6;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: bx, y: 1.2, w: 5.8, h: 5.2,
    fill: { color: 'FFF5F5' },
  });
  // Red top bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: bx, y: 1.2, w: 5.8, h: 0.06,
    fill: { color: C.red },
  });
  slide.addText('ANTES', {
    x: bx, y: 1.4, w: 5.8, h: 0.4,
    fontSize: 13, fontFace: FONT_H, color: C.red, bold: true, align: 'center',
    charSpacing: 3,
  });

  (d.before_items || []).forEach((item, i) => {
    const y = 2.2 + i * 1.4;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: bx + 0.4, y, w: 5, h: 1.0,
      fill: { color: C.white },
      shadow: cardShadow(),
    });
    // X icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: bx + 0.6, y: y + 0.2, w: 0.5, h: 0.5,
      fill: { color: C.red, transparency: 85 },
    });
    slide.addText('X', {
      x: bx + 0.6, y: y + 0.2, w: 0.5, h: 0.5,
      fontSize: 14, fontFace: FONT_H, color: C.red, bold: true,
      align: 'center', valign: 'middle',
    });
    slide.addText(item, {
      x: bx + 1.3, y: y + 0.05, w: 3.9, h: 0.9,
      fontSize: 13, fontFace: FONT_B, color: C.textDark, valign: 'middle',
    });
  });

  // Arrow between columns
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.5, y: 3.3, w: 0.35, h: 0.06,
    fill: { color: C.blue },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.65, y: 3.1, w: 0.06, h: 0.5,
    fill: { color: C.blue },
  });

  // After column
  const ax = 6.95;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: ax, y: 1.2, w: 5.8, h: 5.2,
    fill: { color: 'F0FFF5' },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: ax, y: 1.2, w: 5.8, h: 0.06,
    fill: { color: C.green },
  });
  slide.addText('DESPUES', {
    x: ax, y: 1.4, w: 5.8, h: 0.4,
    fontSize: 13, fontFace: FONT_H, color: C.green, bold: true, align: 'center',
    charSpacing: 3,
  });

  (d.after_items || []).forEach((item, i) => {
    const y = 2.2 + i * 1.4;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: ax + 0.4, y, w: 5, h: 1.0,
      fill: { color: C.white },
      shadow: cardShadow(),
    });
    // Check icon circle
    slide.addShape(pres.shapes.OVAL, {
      x: ax + 0.6, y: y + 0.2, w: 0.5, h: 0.5,
      fill: { color: C.green, transparency: 85 },
    });
    slide.addText('✓', {
      x: ax + 0.6, y: y + 0.2, w: 0.5, h: 0.5,
      fontSize: 16, fontFace: FONT_H, color: C.green, bold: true,
      align: 'center', valign: 'middle',
    });
    slide.addText(item, {
      x: ax + 1.3, y: y + 0.05, w: 3.9, h: 0.9,
      fontSize: 13, fontFace: FONT_B, color: C.textDark, valign: 'middle',
    });
  });

  addFooter(slide, pres);
}

function addSlide8Impact(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.navy };

  // Title (white on dark)
  slide.addText(d.impact_title, {
    x: 0.6, y: 0.4, w: 12, h: 0.7,
    fontSize: 28, fontFace: FONT_H, color: C.white, bold: true, align: 'center',
  });
  slide.addText(d.impact_subtitle, {
    x: 0.6, y: 1.1, w: 12, h: 0.35,
    fontSize: 14, fontFace: FONT_B, color: C.gray, align: 'center',
  });

  // 3 bar chart cards with before/after comparison
  const cols = [
    {
      title: d.impact_col1_title, metric: d.impact_col1_metric, color: C.blue,
      before: d.impact_col1_before, after: d.impact_col1_after, unit: d.impact_col1_unit,
    },
    {
      title: d.impact_col2_title, metric: d.impact_col2_metric, color: C.green,
      before: d.impact_col2_before, after: d.impact_col2_after, unit: d.impact_col2_unit,
    },
    {
      title: d.impact_col3_title, metric: d.impact_col3_metric, color: C.orange,
      before: d.impact_col3_before, after: d.impact_col3_after, unit: d.impact_col3_unit,
    },
  ];

  cols.forEach((col, i) => {
    const x = 0.8 + i * 4.2;
    // Card background
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.7, w: 3.8, h: 4.8,
      fill: { color: C.navyLight },
    });
    // Color top bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.7, w: 3.8, h: 0.06,
      fill: { color: col.color },
    });
    // Title
    slide.addText(col.title, {
      x, y: 1.85, w: 3.8, h: 0.4,
      fontSize: 15, fontFace: FONT_H, color: C.white, bold: true, align: 'center',
    });

    // Bar chart: Before/After bars
    const hasBars = col.before != null && col.after != null;
    if (hasBars) {
      const beforeVal = parseFloat(col.before) || 0;
      const afterVal = parseFloat(col.after) || 0;
      const maxVal = Math.max(beforeVal, afterVal, 1);
      const barAreaX = x + 0.5;
      const barAreaW = 2.8;
      const maxBarH = 2.6;

      // Before bar
      const beforeH = (beforeVal / maxVal) * maxBarH;
      const beforeBarX = barAreaX + 0.3;
      const barW = 1.0;
      const barBaseY = 2.5 + maxBarH;

      slide.addShape(pres.shapes.RECTANGLE, {
        x: beforeBarX, y: barBaseY - beforeH, w: barW, h: beforeH,
        fill: { color: C.red, transparency: 30 },
      });
      slide.addText(`${beforeVal}`, {
        x: beforeBarX, y: barBaseY - beforeH - 0.35, w: barW, h: 0.3,
        fontSize: 14, fontFace: FONT_H, color: C.red, bold: true, align: 'center',
      });
      slide.addText('Antes', {
        x: beforeBarX, y: barBaseY + 0.05, w: barW, h: 0.25,
        fontSize: 10, fontFace: FONT_B, color: C.gray, align: 'center',
      });

      // After bar
      const afterH = (afterVal / maxVal) * maxBarH;
      const afterBarX = barAreaX + barAreaW - 1.3;

      slide.addShape(pres.shapes.RECTANGLE, {
        x: afterBarX, y: barBaseY - afterH, w: barW, h: afterH,
        fill: { color: col.color },
      });
      slide.addText(`${afterVal}`, {
        x: afterBarX, y: barBaseY - afterH - 0.35, w: barW, h: 0.3,
        fontSize: 14, fontFace: FONT_H, color: col.color, bold: true, align: 'center',
      });
      slide.addText('Despues', {
        x: afterBarX, y: barBaseY + 0.05, w: barW, h: 0.25,
        fontSize: 10, fontFace: FONT_B, color: C.gray, align: 'center',
      });

      // Unit label
      if (col.unit) {
        slide.addText(col.unit, {
          x, y: barBaseY + 0.35, w: 3.8, h: 0.25,
          fontSize: 9, fontFace: FONT_B, color: C.gray, align: 'center', italic: true,
        });
      }
    } else {
      // Fallback: show metric as large callout if no bar data
      slide.addText(col.metric, {
        x, y: 2.8, w: 3.8, h: 1.8,
        fontSize: 36, fontFace: FONT_H, color: col.color, bold: true,
        align: 'center', valign: 'middle',
      });
    }

    // Metric summary at bottom of card
    slide.addText(col.metric, {
      x, y: 5.85, w: 3.8, h: 0.4,
      fontSize: 13, fontFace: FONT_B, color: col.color, bold: true, align: 'center',
    });
  });

  // Closing
  slide.addText(d.impact_closing, {
    x: 1.5, y: 6.7, w: 10.3, h: 0.4,
    fontSize: 14, fontFace: FONT_B, color: C.gray, italic: true, align: 'center',
  });
}

function addSlide9Comparison(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Headline
  slide.addText(d.comparison_headline, {
    x: 0.6, y: 0.3, w: 12, h: 0.8,
    fontSize: 22, fontFace: FONT_H, color: C.textDark, bold: true, align: 'center',
    lineSpacingMultiple: 1.15,
  });

  // Comparison table
  const tableRows = [
    [
      { text: '', options: { fill: { color: C.offWhite } } },
      { text: 'ChatGPT', options: { bold: true, fontSize: 15, color: C.textDark, align: 'center', fill: { color: C.offWhite } } },
      { text: 'BucketsAi', options: { bold: true, fontSize: 15, color: C.blue, align: 'center', fill: { color: C.blueLight } } },
    ],
    ...([
      ['Accesos por rol', 'X', 'V'],
      ['Gobernanza comercial', 'X', 'V'],
      ['Uso por equipos grandes', 'X', 'V'],
      ['Trazabilidad de decisiones', 'X', 'V'],
      ['Entrena tus datos', 'Si, tus datos entrenan modelos que otros usan', 'No, tus datos quedan en tu entorno'],
      ['Riesgo de exposicion', 'Alto', 'Controlado'],
      ['Licenciamiento', 'Por persona', 'Por equipo'],
    ].map(([feature, chatgpt, buckets]) => [
      { text: feature, options: { bold: true, fontSize: 12, color: C.textDark, fill: { color: C.offWhite } } },
      { text: chatgpt === 'X' ? 'X' : chatgpt, options: { fontSize: 12, color: chatgpt === 'X' ? C.red : C.textBody, align: 'center', fill: { color: C.white } } },
      { text: buckets === 'V' ? '✓' : buckets, options: { fontSize: 12, color: buckets === 'V' ? C.green : C.textDark, align: 'center', bold: buckets === 'V', fill: { color: C.bluePale } } },
    ])),
  ];

  slide.addTable(tableRows, {
    x: 1.2, y: 1.4, w: 10.9,
    colW: [3.5, 3.7, 3.7],
    border: { pt: 0.5, color: C.grayLight },
    rowH: 0.62,
    fontSize: 12,
    fontFace: FONT_B,
    margin: [4, 8, 4, 8],
  });

  addFooter(slide, pres);
}

function addSlide10Security(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.offWhite };

  // Title
  slide.addText('Seguridad y control', {
    x: 0.6, y: 0.4, w: 12, h: 0.7,
    fontSize: 28, fontFace: FONT_H, color: C.textDark, bold: true, align: 'center',
  });
  slide.addText('Disenado para entornos empresariales', {
    x: 0.6, y: 1.1, w: 12, h: 0.35,
    fontSize: 14, fontFace: FONT_B, color: C.gray, align: 'center',
  });

  // 5 security pillars as cards in a row
  const pillars = [
    { title: 'Datos no salen\nde tu entorno', label: 'PRIVACIDAD' },
    { title: 'No se entrenan\nmodelos externos', label: 'AISLAMIENTO' },
    { title: 'Accesos\npor rol', label: 'CONTROL' },
    { title: 'Trazabilidad\ncompleta', label: 'AUDITORIA' },
    { title: 'Alineado con\nSOC 2 y GDPR', label: 'CUMPLIMIENTO' },
  ];

  const cardW = 2.2;
  const gap = 0.25;
  const totalW = pillars.length * cardW + (pillars.length - 1) * gap;
  const startX = (W - totalW) / 2;

  pillars.forEach((pillar, i) => {
    const x = startX + i * (cardW + gap);
    const y = 2.0;
    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cardW, h: 3.8,
      fill: { color: C.white },
      shadow: cardShadow(),
    });
    // Top accent bar with varying blue shades
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cardW, h: 0.06,
      fill: { color: C.blue },
    });
    // Circle with number
    slide.addShape(pres.shapes.OVAL, {
      x: x + cardW / 2 - 0.4, y: y + 0.5, w: 0.8, h: 0.8,
      fill: { color: C.blueLight },
    });
    slide.addText(`${i + 1}`, {
      x: x + cardW / 2 - 0.4, y: y + 0.5, w: 0.8, h: 0.8,
      fontSize: 22, fontFace: FONT_H, color: C.blue, bold: true,
      align: 'center', valign: 'middle',
    });
    // Label
    slide.addText(pillar.label, {
      x, y: y + 1.5, w: cardW, h: 0.3,
      fontSize: 9, fontFace: FONT_B, color: C.blue, bold: true, align: 'center',
      charSpacing: 2,
    });
    // Title
    slide.addText(pillar.title, {
      x: x + 0.15, y: y + 2.0, w: cardW - 0.3, h: 1.2,
      fontSize: 14, fontFace: FONT_B, color: C.textDark, align: 'center',
      lineSpacingMultiple: 1.2, bold: true,
    });
  });

  addFooter(slide, pres);
}

function addSlide11Dimensions(pres, d) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Title
  slide.addText('Dos dimensiones de valor', {
    x: 0.6, y: 0.3, w: 12, h: 0.6,
    fontSize: 28, fontFace: FONT_H, color: C.textDark, bold: true, align: 'center',
  });

  // Dimension A card
  const dimCardW = 5.8;
  const dimCardH = 5.8;
  const dimAx = 0.6;
  const dimBx = 6.93;
  const dimY = 1.2;

  // Card A
  slide.addShape(pres.shapes.RECTANGLE, {
    x: dimAx, y: dimY, w: dimCardW, h: dimCardH,
    fill: { color: C.offWhite },
    shadow: shadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: dimAx, y: dimY, w: dimCardW, h: 0.06,
    fill: { color: C.blue },
  });

  slide.addText('DIMENSION A', {
    x: dimAx + 0.4, y: dimY + 0.3, w: 2, h: 0.25,
    fontSize: 9, fontFace: FONT_B, color: C.blue, bold: true, charSpacing: 3,
  });
  slide.addText(d.dim_a_titulo, {
    x: dimAx + 0.4, y: dimY + 0.65, w: dimCardW - 0.8, h: 0.5,
    fontSize: 17, fontFace: FONT_H, color: C.textDark, bold: true,
  });
  slide.addText(`Rol: ${d.dim_a_rol}`, {
    x: dimAx + 0.4, y: dimY + 1.2, w: dimCardW - 0.8, h: 0.3,
    fontSize: 11, fontFace: FONT_B, color: C.gray, italic: true,
  });
  // Divider
  slide.addShape(pres.shapes.LINE, {
    x: dimAx + 0.4, y: dimY + 1.7, w: dimCardW - 0.8, h: 0,
    line: { color: C.grayLight, width: 0.5 },
  });
  slide.addText(d.dim_a_desc, {
    x: dimAx + 0.4, y: dimY + 1.9, w: dimCardW - 0.8, h: 3.2,
    fontSize: 13, fontFace: FONT_B, color: C.textBody,
    lineSpacingMultiple: 1.35,
  });

  // Card B
  slide.addShape(pres.shapes.RECTANGLE, {
    x: dimBx, y: dimY, w: dimCardW, h: dimCardH,
    fill: { color: C.offWhite },
    shadow: shadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: dimBx, y: dimY, w: dimCardW, h: 0.06,
    fill: { color: C.orange },
  });

  slide.addText('DIMENSION B', {
    x: dimBx + 0.4, y: dimY + 0.3, w: 2, h: 0.25,
    fontSize: 9, fontFace: FONT_B, color: C.orange, bold: true, charSpacing: 3,
  });
  slide.addText(d.dim_b_titulo, {
    x: dimBx + 0.4, y: dimY + 0.65, w: dimCardW - 0.8, h: 0.5,
    fontSize: 17, fontFace: FONT_H, color: C.textDark, bold: true,
  });
  slide.addText(`Rol: ${d.dim_b_rol}`, {
    x: dimBx + 0.4, y: dimY + 1.2, w: dimCardW - 0.8, h: 0.3,
    fontSize: 11, fontFace: FONT_B, color: C.gray, italic: true,
  });
  slide.addShape(pres.shapes.LINE, {
    x: dimBx + 0.4, y: dimY + 1.7, w: dimCardW - 0.8, h: 0,
    line: { color: C.grayLight, width: 0.5 },
  });
  slide.addText(d.dim_b_desc, {
    x: dimBx + 0.4, y: dimY + 1.9, w: dimCardW - 0.8, h: 3.2,
    fontSize: 13, fontFace: FONT_B, color: C.textBody,
    lineSpacingMultiple: 1.35,
  });

  addFooter(slide, pres);
}

function addSlide12CTA(pres, d, empresa) {
  const slide = pres.addSlide();
  slide.background = { color: C.navy };

  // Decorative shapes
  slide.addShape(pres.shapes.OVAL, {
    x: 9, y: -2, w: 7, h: 7,
    fill: { color: C.blue, transparency: 92 },
  });

  // CTA question
  slide.addText(d.cta_question, {
    x: 0.7, y: 0.8, w: 7, h: 1.5,
    fontSize: 24, fontFace: FONT_H, color: C.white, bold: true,
    lineSpacingMultiple: 1.2,
  });

  slide.addText(d.cta_description, {
    x: 0.7, y: 2.5, w: 6, h: 1.0,
    fontSize: 14, fontFace: FONT_B, color: C.gray,
    lineSpacingMultiple: 1.3,
  });

  // CTA button
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 8.5, y: 1.0, w: 4.2, h: 0.65,
    fill: { color: C.blue },
  });
  slide.addText('Agenda tu demo personalizada', {
    x: 8.5, y: 1.0, w: 4.2, h: 0.65,
    fontSize: 14, fontFace: FONT_B, color: C.white, bold: true,
    align: 'center', valign: 'middle',
  });

  // QR Code
  const qr = deckImgBase64('qr.png');
  if (qr) {
    slide.addImage({ data: qr, x: 9.7, y: 2.0, w: 1.4, h: 1.4 });
  }

  // Contact section (bottom)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 4.2, w: W, h: 3.3,
    fill: { color: C.navyLight },
  });

  // Contact photo
  const photo = deckImgBase64('sebastian.png');
  if (photo) {
    slide.addImage({ data: photo, x: 1.5, y: 4.8, w: 1.1, h: 1.1, rounding: true });
  }

  slide.addText('Sebastian Arce', {
    x: 2.8, y: 4.9, w: 2.5, h: 0.3,
    fontSize: 15, fontFace: FONT_H, color: C.white, bold: true,
  });
  slide.addText('Founder CSO', {
    x: 2.8, y: 5.2, w: 2.5, h: 0.25,
    fontSize: 12, fontFace: FONT_B, color: C.gray,
  });

  slide.addText([
    { text: 'sebastian@hoytrabajas.com', options: { breakLine: true } },
    { text: 'sebastian@talentropy.ai', options: {} },
  ], {
    x: 5.5, y: 4.9, w: 3, h: 0.6,
    fontSize: 12, fontFace: FONT_B, color: C.white,
    lineSpacingMultiple: 1.3,
  });

  slide.addText('+1(415) 653 9295', {
    x: 9, y: 4.9, w: 2.5, h: 0.3,
    fontSize: 13, fontFace: FONT_B, color: C.white,
  });

  slide.addText('buckets-ai.com', {
    x: 9, y: 5.2, w: 2.5, h: 0.25,
    fontSize: 12, fontFace: FONT_B, color: C.blue, bold: true,
  });

  // Logo at bottom
  const logo = imgBase64('logo.png');
  if (logo) {
    slide.addImage({ data: logo, x: 5.5, y: 6.3, w: 2.3, h: 0.6 });
  }
}

// ── Main Export ──
export async function generateDeck(deckContent, empresa) {
  const d = deckContent;
  const pres = new PptxGenJS();

  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'BucketsAI';
  pres.title = `BucketsAI - ${empresa} - Deck Comercial`;

  // Build all slides (Dimensions moved to slot 7, before BeforeAfter)
  addSlide1Cover(pres, d, empresa);       // 1. Cover
  addSlide2Problem(pres, d);              // 2. Problem (industry)
  addSlide3Depth(pres, d);                // 3. Depth (industry)
  addSlide4Solution(pres, d);             // 4. Solution (industry)
  addSlide5HowItWorks(pres, d);           // 5. How It Works
  addSlide6Demo(pres, d);                 // 6. Demo (company-specific)
  addSlide11Dimensions(pres, d);          // 7. Two Dimensions of Value
  addSlide7BeforeAfter(pres, d);          // 8. Before vs After
  addSlide8Impact(pres, d);               // 9. Impact (bar charts)
  addSlide9Comparison(pres, d);           // 10. Comparison
  addSlide10Security(pres, d);            // 11. Security
  addSlide12CTA(pres, d, empresa);        // 12. CTA

  // Save
  const safe = empresa.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const outputDir = join(__dirname, '..', 'output');
  const { mkdirSync } = await import('fs');
  mkdirSync(outputDir, { recursive: true });
  const fileName = `BucketsAI_${safe}_Deck.pptx`;
  const outputPath = join(outputDir, fileName);

  await pres.writeFile({ fileName: outputPath });
  return outputPath;
}
