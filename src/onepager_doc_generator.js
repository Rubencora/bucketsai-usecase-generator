import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType,
  TableLayoutType, VerticalAlign, PageOrientation,
} from 'docx';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { C } from './colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PW = 12240;
const PH = 15840;
const MRG = 1152;
const CW = PW - 2 * MRG;

const NONE_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE_BORDER, bottom: NONE_BORDER, left: NONE_BORDER, right: NONE_BORDER };

// --- Helpers ---

function t(text, opts = {}) {
  return new TextRun({
    text: String(text || ''),
    font: 'Arial',
    bold: opts.bold || false,
    italics: opts.italics || false,
    size: opts.size || 22,
    color: opts.color || C.navyText,
    underline: opts.underline ? {} : undefined,
  });
}

function sp(n) {
  return new Paragraph({ spacing: { after: n } });
}

function strip(color = C.blue) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        height: { value: 80, rule: 'exact' },
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: color },
            borders: NO_BORDERS,
            children: [new Paragraph('')],
          }),
        ],
      }),
    ],
  });
}

function fw(children, bgColor) {
  const contents = children.map((c) =>
    typeof c === 'string'
      ? new Paragraph({ spacing: { after: 80 }, children: [t(c)] })
      : c
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            borders: NO_BORDERS,
            margins: { top: 400, bottom: 400, left: 500, right: 500 },
            children: contents,
          }),
        ],
      }),
    ],
  });
}

function box(children, bgColor, borderColor) {
  const paragraphs = Array.isArray(children) ? children : [children];
  const contents = paragraphs.map((c) =>
    typeof c === 'string'
      ? new Paragraph({ spacing: { after: 80 }, children: [t(c)] })
      : c
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            borders: {
              top: NONE_BORDER, bottom: NONE_BORDER, right: NONE_BORDER,
              left: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
            },
            margins: { top: 160, bottom: 160, left: 280, right: 240 },
            children: contents,
          }),
        ],
      }),
    ],
  });
}

function secHeader(title, subtitle) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [t(title, { bold: true, size: 28, color: C.navyText })] }),
    ...(subtitle ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [t(subtitle, { size: 20, color: C.grayMid })] })] : []),
  ];
}

function stripHtml(text) {
  if (!text) return '';
  return String(text).replace(/<[^>]+>/g, '');
}

function parseHtml(text) {
  if (!text) return [t('')];
  const parts = [];
  const regex = /<strong>(.*?)<\/strong>/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(String(text))) !== null) {
    if (match.index > lastIndex) {
      parts.push(t(text.slice(lastIndex, match.index)));
    }
    parts.push(t(match[1], { bold: true }));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < String(text).length) {
    parts.push(t(text.slice(lastIndex)));
  }
  return parts.length > 0 ? parts : [t(String(text))];
}

function painCards(painPoints) {
  const colW = Math.floor(CW / 2);
  const brd = { style: BorderStyle.SINGLE, size: 2, color: C.border };
  const rows = [];
  for (let i = 0; i < painPoints.length; i += 2) {
    const cells = painPoints.slice(i, i + 2).map((p, j) => {
      const isObj = typeof p === 'object';
      const bold = isObj ? p.bold : p;
      const desc = isObj ? p.desc : '';
      const isHighlight = (i + j) === 2;
      return new TableCell({
        width: { size: colW, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: isHighlight ? C.blueLight : C.pageBg },
        borders: { top: brd, bottom: brd, left: brd, right: brd },
        margins: { top: 140, bottom: 140, left: 160, right: 160 },
        children: [
          new Paragraph({ spacing: { after: 40 }, children: [t(bold, { bold: true, size: 20 })] }),
          ...(desc ? [new Paragraph({ children: [t(desc, { size: 18, color: C.textMuted })] })] : []),
        ],
      });
    });
    while (cells.length < 2) {
      cells.push(new TableCell({
        width: { size: colW, type: WidthType.DXA },
        borders: { top: brd, bottom: brd, left: brd, right: brd },
        children: [new Paragraph('')],
      }));
    }
    rows.push(new TableRow({ children: cells }));
  }
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows,
  });
}

function flowCards(steps) {
  const colW = Math.floor(CW / 4);
  const cells = steps.map((s, i) =>
    new TableCell({
      width: { size: colW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: i === 2 ? C.blueLight : C.pageBg },
      borders: NO_BORDERS,
      margins: { top: 160, bottom: 160, left: 120, right: 120 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t(s.titulo, { bold: true, size: 19, color: C.blue })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [t(s.desc, { size: 17, color: C.textMuted })] }),
      ],
    })
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: cells })],
  });
}

function dimCard(titulo, rol, desc, caso, accentColor) {
  const elements = [];
  // Header
  elements.push(
    new Table({
      width: { size: CW, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: CW, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: accentColor },
              borders: NO_BORDERS,
              margins: { top: 160, bottom: 160, left: 240, right: 240 },
              children: [
                new Paragraph({ spacing: { after: 40 }, children: [t(titulo, { bold: true, color: C.white, size: 24 })] }),
                new Paragraph({ children: [t(rol, { color: C.white, size: 18 })] }),
              ],
            }),
          ],
        }),
      ],
    })
  );
  elements.push(sp(80));
  // Description
  elements.push(new Paragraph({ spacing: { after: 120 }, children: [t(desc, { color: C.textMuted, size: 20 })] }));
  // Conversation case
  if (caso) {
    elements.push(new Paragraph({ spacing: { after: 60 }, children: [t(caso.setup, { italics: true, color: C.grayMid, size: 18 })] }));
    // Question
    elements.push(
      box([
        new Paragraph({ children: [t(caso.pregunta, { italics: true, size: 20 })] }),
      ], C.blueLight, accentColor)
    );
    elements.push(sp(80));
    // Response
    elements.push(new Paragraph({ spacing: { after: 60 }, children: [t(caso.respuesta_titulo, { bold: true, color: accentColor, size: 20 })] }));
    (caso.respuesta_bullets || []).forEach(b => {
      elements.push(new Paragraph({ spacing: { after: 40 }, children: [t(`  \u2022  ${b}`, { size: 19 })] }));
    });
  }
  return elements;
}

function compareTable() {
  const brd = { style: BorderStyle.SINGLE, size: 2, color: C.border };
  const colW1 = 4000;
  const colW2 = Math.floor((CW - colW1) / 2);
  const rows = [
    ['', 'ChatGPT', 'BucketsAi'],
    ['Accesos por rol', '\u2717', '\u2713'],
    ['Gobernanza comercial', '\u2717', '\u2713'],
    ['Uso por equipos grandes', '\u2717', '\u2713'],
    ['Trazabilidad de decisiones', '\u2717', '\u2713'],
    ['Licenciamiento', 'Por persona', 'Usuarios ilimitados'],
  ];
  const tableRows = rows.map((row, i) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: colW1, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i === 0 ? C.blue : (i % 2 === 0 ? C.blueLight : C.pageBg) },
          borders: { top: brd, bottom: brd, left: brd, right: brd },
          margins: { top: 100, bottom: 100, left: 160, right: 100 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [t(row[0], { bold: true, size: 20, color: i === 0 ? C.white : C.navyText })] })],
        }),
        new TableCell({
          width: { size: colW2, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i === 0 ? C.grayMid : (i % 2 === 0 ? C.blueLight : C.pageBg) },
          borders: { top: brd, bottom: brd, left: brd, right: brd },
          margins: { top: 100, bottom: 100, left: 60, right: 60 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t(row[1], { bold: i === 0, size: i === 0 ? 20 : (row[1].length > 3 ? 18 : 24), color: i === 0 ? C.white : (row[1] === '\u2717' ? 'E53E3E' : C.textMuted) })] })],
        }),
        new TableCell({
          width: { size: colW2, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i === 0 ? C.blue : (i % 2 === 0 ? C.blueLight : C.pageBg) },
          borders: { top: brd, bottom: brd, left: brd, right: brd },
          margins: { top: 100, bottom: 100, left: 60, right: 60 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t(row[2], { bold: i === 0, size: i === 0 ? 20 : (row[2].length > 3 ? 18 : 24), color: i === 0 ? C.white : C.blue })] })],
        }),
      ],
    })
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: tableRows,
  });
}

function implBoxes(implementacion, idealPara, idealIndustrias) {
  const colW = Math.floor(CW / 2);
  const implBullets = (implementacion || []).map(b =>
    new Paragraph({ spacing: { after: 80 }, children: parseHtml(`  \u2022  ${b}`) })
  );
  const idealBullets = (idealPara || []).map(b =>
    new Paragraph({ spacing: { after: 80 }, children: parseHtml(`  \u2022  ${b}`).map(r => {
      r.color = C.white; return r;
    }) })
  );
  // Workaround: since we can't easily restyle TextRun after creation, rebuild for white text
  const idealBulletsWhite = (idealPara || []).map(b => {
    const clean = stripHtml(b);
    return new Paragraph({ spacing: { after: 80 }, children: [t(`  \u2022  ${clean}`, { size: 20, color: C.white })] });
  });
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: colW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blueLight },
            borders: NO_BORDERS,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: [
              new Paragraph({ spacing: { after: 120 }, children: [t('Implementacion sin friccion', { bold: true, size: 24 })] }),
              ...implBullets,
              new Paragraph({ spacing: { before: 80 }, children: [t('Tiempo tipico de puesta en marcha: horas, no dias.', { italics: true, color: C.grayMid, size: 18 })] }),
            ],
          }),
          new TableCell({
            width: { size: colW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blue },
            borders: NO_BORDERS,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: [
              new Paragraph({ spacing: { after: 120 }, children: [t('Ideal para empresas que', { bold: true, size: 24, color: C.white })] }),
              ...idealBulletsWhite,
              ...(idealIndustrias ? [new Paragraph({ spacing: { before: 80 }, children: [t(idealIndustrias, { color: C.blueLight, size: 16 })] })] : []),
            ],
          }),
        ],
      }),
    ],
  });
}

// --- Main generator ---

export async function generateOnePagerDocx(op, empresa) {
  const sections = [];

  // 1. HERO / Cover
  sections.push(
    fw([
      new Paragraph({ spacing: { after: 120 }, children: [t('BucketsAI', { bold: true, color: C.white, size: 72 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [t(`x  ${empresa}`, { size: 50, color: C.blueLight })] }),
      new Paragraph({ spacing: { after: 80 }, children: [t(stripHtml(op.hero_titulo), { size: 28, color: C.blueLight, bold: true })] }),
      new Paragraph({ children: [t('All your knowledge, one conversation away.', { italics: true, color: C.white, size: 22 })] }),
    ], C.blue),
    strip(),
    sp(40),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 200 }, children: [t('Confidencial | 2026 | buckets-ai.com', { italics: true, color: C.grayMid, size: 18 })] }),
  );

  // 2. Hero description
  sections.push(
    new Paragraph({ spacing: { after: 200 }, children: parseHtml(op.hero_descripcion) }),
    sp(80),
  );

  // 3. Pain Points
  sections.push(
    ...secHeader('Hoy, en la operacion real:', null),
    painCards(op.pain_points || []),
    sp(80),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [t(op.pain_quote, { italics: true, color: C.grayMid, size: 20 })] }),
  );

  // 4. Value Proposition
  sections.push(
    ...secHeader(stripHtml(op.value_titulo), null),
    new Paragraph({ spacing: { after: 160 }, children: parseHtml(op.value_descripcion) }),
  );
  // Knowledge items as bullet list
  (op.knowledge_items || []).forEach(item => {
    sections.push(new Paragraph({ spacing: { after: 60 }, children: [t(`  \u2022  ${item}`, { size: 20 })] }));
  });
  sections.push(sp(200));

  // 5. Flow
  sections.push(
    ...secHeader(op.flow_titulo, null),
    flowCards(op.flow_steps || []),
    sp(80),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [t(op.flow_tagline, { italics: true, color: C.grayMid, size: 20 })] }),
  );

  // 6. Dimensions
  if (op.dim_a_titulo) {
    sections.push(
      ...secHeader(`Caso de Uso: ${empresa}`, `BucketsAI opera en 2 dimensiones dentro de ${empresa}, cada una generando valor para un rol diferente.`),
    );
    // Dimension A
    sections.push(
      new Paragraph({ spacing: { after: 80 }, children: [t('DIMENSION A', { bold: true, color: C.blue, size: 20 })] }),
      ...dimCard(op.dim_a_titulo, op.dim_a_rol, op.dim_a_desc, op.dim_a_caso, C.blue),
      sp(240),
    );
    // Dimension B
    sections.push(
      new Paragraph({ spacing: { after: 80 }, children: [t('DIMENSION B', { bold: true, color: C.blueMed, size: 20 })] }),
      ...dimCard(op.dim_b_titulo, op.dim_b_rol, op.dim_b_desc, op.dim_b_caso, C.blueMed),
      sp(240),
    );
  }

  // 7. Case Study
  sections.push(
    ...secHeader(op.caso_titulo, null),
    box([
      new Paragraph({ spacing: { after: 60 }, children: [t('Pregunta:', { bold: true, color: C.grayMid, size: 18 })] }),
      new Paragraph({ children: [t(op.caso_pregunta, { italics: true, size: 20 })] }),
    ], C.blueLight, C.blue),
    sp(120),
    box([
      new Paragraph({ spacing: { after: 60 }, children: [t('BucketsAI responde:', { bold: true, color: C.blue, size: 20 })] }),
      new Paragraph({ children: [t(op.caso_respuesta, { size: 20 })] }),
    ], C.pageBg, C.blueMed),
    sp(160),
  );
  // Results
  sections.push(
    new Paragraph({ spacing: { after: 120 }, children: [t('Que cambia para el negocio', { bold: true, size: 24, color: C.blue })] }),
  );
  (op.caso_resultados || []).forEach(r => {
    sections.push(new Paragraph({ spacing: { after: 60 }, children: [
      t(`  \u2022  ${r.bold} `, { bold: true, size: 20, color: C.orange }),
      t(r.desc, { size: 20 }),
    ] }));
  });
  sections.push(
    sp(80),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [t(op.caso_conclusion, { italics: true, color: C.grayMid, size: 20 })] }),
  );

  // 8. Comparison Table
  sections.push(
    ...secHeader('Por que BucketsAI y no ChatGPT', op.diferenciador_subtitulo),
    compareTable(),
    sp(240),
  );

  // 9. How it works (3 steps)
  sections.push(
    ...secHeader('Como funciona', 'Listo para operar en minutos'),
  );
  const stepsData = [
    { num: '01', label: 'Conectas catalogos, precios y reglas de negocio' },
    { num: '02', label: 'Defines roles y niveles de acceso por equipo' },
    { num: '03', label: 'Los equipos deciden en tiempo real' },
  ];
  const stepColW = Math.floor(CW / 3);
  sections.push(
    new Table({
      width: { size: CW, type: WidthType.DXA },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: stepsData.map((s, i) =>
            new TableCell({
              width: { size: stepColW, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: i === 1 ? C.pageBg : C.blueLight },
              borders: NO_BORDERS,
              margins: { top: 200, bottom: 200, left: 100, right: 100 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [t(s.num, { bold: true, color: C.blueLight, size: 56 })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [t(s.label, { size: 19, color: C.navyText })] }),
              ],
            })
          ),
        }),
      ],
    }),
    sp(200),
  );

  // 10. Anchor Case (Tiendas Ara)
  sections.push(
    ...secHeader('Caso de Exito: Tiendas Ara', 'Mas de 4.000 colaboradores usan BucketsAI diariamente.'),
  );
  const araResults = [
    'Menor tiempo de entrenamiento',
    'Menor curva de aprendizaje',
    'Reduccion en rotacion temprana',
    'Menos errores operativos',
    'Mayor autonomia',
    'Mejor adaptacion desde el primer mes',
  ];
  araResults.forEach(r => {
    sections.push(new Paragraph({ spacing: { after: 60 }, children: [t(`  \u2022  ${r}`, { size: 20 })] }));
  });
  sections.push(
    sp(80),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [t('La capacitacion dejo de depender de documentos y paso a vivir en la operacion.', { italics: true, color: C.grayMid, size: 20 })] }),
  );

  // 11. Implementation + Ideal Para
  sections.push(
    implBoxes(op.implementacion, op.ideal_para, op.ideal_industrias),
    sp(200),
  );

  // 12. CTA / Cierre
  sections.push(
    fw([
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [t(stripHtml(op.cta_badge), { bold: true, color: C.orange, size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [t(stripHtml(op.cta_text), { bold: true, color: C.white, size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [t('ruben@buckets-ai.com  |  app.buckets-ai.com  |  buckets-ai.com', { color: C.blueLight, size: 20 })] }),
    ], C.blue),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PW, height: PH, orientation: PageOrientation.PORTRAIT },
            margin: { top: MRG, bottom: MRG, left: MRG, right: MRG },
          },
        },
        children: sections,
      },
    ],
  });

  const outputDir = join(__dirname, '..', 'output');
  mkdirSync(outputDir, { recursive: true });
  const safe = empresa.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const fileName = `BucketsAI_${safe}_OnePager.docx`;
  const outputPath = join(outputDir, fileName);

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);

  console.log(`   One-pager DOCX saved: ${outputPath}`);
  return outputPath;
}
