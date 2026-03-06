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
const CW = PW - 2 * MRG; // 9936

const NONE_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE_BORDER, bottom: NONE_BORDER, left: NONE_BORDER, right: NONE_BORDER };

// --- Helpers ---

function t(text, opts = {}) {
  return new TextRun({
    text,
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

function strip() {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        height: { value: 80, rule: 'exact' },
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blue },
            borders: NO_BORDERS,
            children: [new Paragraph('')],
          }),
        ],
      }),
    ],
  });
}

function sec(num, title) {
  const col1W = 800;
  const col2W = CW - col1W;
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: col1W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blue },
            borders: NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t(`  ${num}  `, { bold: true, color: C.white, size: 22 })] })],
          }),
          new TableCell({
            width: { size: col2W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blueMed },
            borders: NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [t(`  ${title}`, { bold: true, color: C.white, size: 22 })] })],
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
              top: NONE_BORDER,
              bottom: NONE_BORDER,
              right: NONE_BORDER,
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

function boxAllBorders(children, bgColor, borderColor) {
  const paragraphs = Array.isArray(children) ? children : [children];
  const contents = paragraphs.map((c) =>
    typeof c === 'string'
      ? new Paragraph({ spacing: { after: 80 }, children: [t(c)] })
      : c
  );
  const brd = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            borders: { top: brd, bottom: brd, left: brd, right: brd },
            margins: { top: 160, bottom: 160, left: 280, right: 240 },
            children: contents,
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

function steps4(items) {
  const colW = Math.floor(CW / 4);
  const cells = items.map((item, i) =>
    new TableCell({
      width: { size: colW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? C.blueLight : C.pageBg },
      borders: NO_BORDERS,
      margins: { top: 200, bottom: 200, left: 160, right: 160 },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [t(item.step, { bold: true, color: C.orange, size: 20 })] }),
        new Paragraph({ spacing: { after: 60 }, children: [t(item.title, { bold: true, size: 22 })] }),
        new Paragraph({ spacing: { after: 40 }, children: [t(item.body, { color: C.textMuted, size: 20 })] }),
      ],
    })
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: cells })],
  });
}

function kpis(items) {
  const colW = Math.floor(CW / items.length);
  const brd = { style: BorderStyle.SINGLE, size: 2, color: C.border };
  const cells = items.map((item) =>
    new TableCell({
      width: { size: colW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: C.blueLight },
      borders: { top: brd, bottom: brd, left: brd, right: brd },
      margins: { top: 200, bottom: 200, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t(item.val, { bold: true, color: C.orange, size: 52 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [t(item.label, { color: C.textMuted, size: 18 })] }),
      ],
    })
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: cells })],
  });
}

function problemCols(causas, consecuencias) {
  const colW = Math.floor(CW / 2);
  function bullets(items) {
    return items.map((item) => new Paragraph({ spacing: { after: 60 }, children: [t(`  \u2022  ${item}`, { size: 20 })] }));
  }
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
              new Paragraph({ spacing: { after: 100 }, children: [t('La informacion suele estar dispersa en:', { bold: true, color: C.blue, size: 20 })] }),
              ...bullets(causas),
            ],
          }),
          new TableCell({
            width: { size: colW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.pageBg },
            borders: NO_BORDERS,
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: [
              new Paragraph({ spacing: { after: 100 }, children: [t('El resultado son:', { bold: true, color: C.blue, size: 20 })] }),
              ...bullets(consecuencias),
            ],
          }),
        ],
      }),
    ],
  });
}

function dimHeader(label, title, desc, accentColor) {
  const brd = { style: BorderStyle.SINGLE, size: 8, color: accentColor };
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blueLight },
            borders: { top: NONE_BORDER, bottom: NONE_BORDER, right: NONE_BORDER, left: brd },
            margins: { top: 240, bottom: 240, left: 280, right: 240 },
            children: [
              new Paragraph({ spacing: { after: 60 }, children: [t(label, { bold: true, color: accentColor, size: 20 })] }),
              new Paragraph({ spacing: { after: 80 }, children: [t(title, { bold: true, size: 28 })] }),
              new Paragraph({ children: [t(desc, { color: C.textMuted, size: 20 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

function subSec(tag, title, color) {
  const tagW = 1200;
  const titleW = CW - tagW;
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: tagW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: color },
            borders: NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t(tag, { bold: true, color: C.white, size: 20 })] })],
          }),
          new TableCell({
            width: { size: titleW, type: WidthType.DXA },
            borders: NO_BORDERS,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 80, bottom: 80, left: 200, right: 120 },
            children: [new Paragraph({ children: [t(title, { bold: true, size: 22 })] })],
          }),
        ],
      }),
    ],
  });
}

function convo(question, label, bullets, roleLabel = 'Vendedor:') {
  const questionBox = new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blueLight },
            borders: {
              top: NONE_BORDER, bottom: NONE_BORDER, right: NONE_BORDER,
              left: { style: BorderStyle.SINGLE, size: 8, color: C.blue },
            },
            margins: { top: 160, bottom: 160, left: 280, right: 240 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  t(roleLabel + '  ', { color: C.textMuted, size: 20 }),
                  t(question, { italics: true, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const bulletParagraphs = bullets.map((b) =>
    new Paragraph({ spacing: { after: 60 }, children: [t(`  \u2022  ${b}`, { size: 20 })] })
  );

  const responseBox = new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.pageBg },
            borders: {
              top: NONE_BORDER, bottom: NONE_BORDER, right: NONE_BORDER,
              left: { style: BorderStyle.SINGLE, size: 8, color: C.blueMed },
            },
            margins: { top: 160, bottom: 160, left: 280, right: 240 },
            children: [
              new Paragraph({ spacing: { after: 40 }, children: [t('BucketsAI:', { bold: true, color: C.blue, size: 20 })] }),
              new Paragraph({ spacing: { after: 80 }, children: [t(label, { bold: true, color: C.blue, size: 20 })] }),
              ...bulletParagraphs,
            ],
          }),
        ],
      }),
    ],
  });

  return [questionBox, responseBox];
}

function convoB(roleLabel, question, label, bullets) {
  const questionBox = new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.blueLight },
            borders: {
              top: NONE_BORDER, bottom: NONE_BORDER, right: NONE_BORDER,
              left: { style: BorderStyle.SINGLE, size: 8, color: C.blueMed },
            },
            margins: { top: 160, bottom: 160, left: 280, right: 240 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  t(roleLabel + ':  ', { color: C.textMuted, size: 20 }),
                  t(question, { italics: true, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const bulletParagraphs = bullets.map((b) =>
    new Paragraph({ spacing: { after: 60 }, children: [t(`  \u2022  ${b}`, { size: 20 })] })
  );

  const responseBox = new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CW, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: C.pageBg },
            borders: {
              top: NONE_BORDER, bottom: NONE_BORDER, right: NONE_BORDER,
              left: { style: BorderStyle.SINGLE, size: 8, color: C.blueMed },
            },
            margins: { top: 160, bottom: 160, left: 280, right: 240 },
            children: [
              new Paragraph({ spacing: { after: 40 }, children: [t('BucketsAI:', { bold: true, color: C.blueMed, size: 20 })] }),
              new Paragraph({ spacing: { after: 80 }, children: [t(label, { bold: true, color: C.blueMed, size: 20 })] }),
              ...bulletParagraphs,
            ],
          }),
        ],
      }),
    ],
  });

  return [questionBox, responseBox];
}

function twoCol(rows, col1Width = 3200) {
  const col2Width = CW - col1Width;
  const brd = { style: BorderStyle.SINGLE, size: 2, color: C.border };
  const tableRows = rows.map((row, i) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: col1Width, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? C.blueLight : C.pageBg },
          borders: { top: brd, bottom: brd, left: brd, right: brd },
          margins: { top: 120, bottom: 120, left: 200, right: 160 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [t(row[0], { bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: col2Width, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? C.blueLight : C.pageBg },
          borders: { top: brd, bottom: brd, left: brd, right: brd },
          margins: { top: 120, bottom: 120, left: 200, right: 160 },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [t(row[1], { size: 20 })] })],
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

function metrics3(items) {
  const colW = Math.floor(CW / 3);
  const cells = items.map((item, i) =>
    new TableCell({
      width: { size: colW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: i === 1 ? C.pageBg : C.blueLight },
      borders: NO_BORDERS,
      margins: { top: 240, bottom: 240, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t(item.val, { bold: true, color: C.orange, size: 64 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [t(item.label, { color: C.textMuted, size: 18 })] }),
      ],
    })
  );
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: cells })],
  });
}

// --- Main generator ---

export async function generateDocx(content) {
  const c = content;
  const empresa = c.empresa;

  const sections = [];

  // 1. PORTADA
  sections.push(
    fw([
      new Paragraph({ spacing: { after: 120 }, children: [t('BucketsAI', { bold: true, color: C.white, size: 72 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [t(`x  ${empresa}`, { size: 50, color: C.blueLight })] }),
      new Paragraph({ spacing: { after: 80 }, children: [t(c.titulo_caso, { size: 22, color: C.blueLight })] }),
      new Paragraph({ children: [t('All your knowledge, one conversation away.', { italics: true, color: C.white, size: 22 })] }),
    ], C.blue),
    strip(),
    sp(40),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 200 }, children: [t('Confidencial | 2026 | buckets-ai.com', { italics: true, color: C.grayMid, size: 18 })] }),
  );

  // 2. Que es BucketsAI
  sections.push(
    sec('01', 'Que es BucketsAI'),
    sp(200),
    box([
      new Paragraph({ spacing: { after: 80 }, children: [
        t('BucketsAI es una plataforma de inteligencia artificial que convierte el conocimiento interno de una empresa en un sistema de respuestas y decisiones en tiempo real para los equipos de trabajo.'),
      ] }),
    ], C.blueLight, C.blue),
    sp(160),
    new Paragraph({ spacing: { after: 160 }, children: [
      t('En lugar de que los empleados tengan que buscar informacion en multiples documentos o sistemas, BucketsAI les permite hacer preguntas en lenguaje natural y recibir una respuesta clara basada en los documentos y reglas oficiales de la empresa.'),
    ] }),
    boxAllBorders([
      new Paragraph({ children: [
        t('En terminos simples: ', { color: C.blue, size: 22 }),
        t(c.terminos_simples, { bold: true, size: 22 }),
      ] }),
    ], C.blueLight, C.blue),
    sp(200),
  );

  // 3. Como funciona
  sections.push(
    sec('02', 'Como funciona'),
    sp(200),
    steps4([
      { step: 'Paso 1', title: 'Conecta el conocimiento interno', body: c.paso1_cuerpo },
      { step: 'Paso 2', title: c.paso2_titulo, body: c.paso2_cuerpo },
      { step: 'Paso 3', title: 'Aplica gobernanza y control de acceso', body: c.paso3_cuerpo },
      { step: 'Paso 4', title: 'Responde preguntas en tiempo real', body: c.paso4_cuerpo },
    ]),
    sp(200),
  );

  // 4. Que problemas resuelve
  sections.push(
    sec('03', 'Que problemas resuelve'),
    sp(200),
    box([
      new Paragraph({ children: [t(c.problema_headline, { bold: true, size: 22 })] }),
    ], C.blueLight, C.blue),
    sp(160),
    problemCols(
      [
        'PDFs y presentaciones sin estructurar',
        'Carpetas compartidas con multiples versiones',
        'Sistemas distintos sin conexion entre si',
        'La cabeza de algunos expertos clave',
      ],
      [
        'Errores operativos por informacion desactualizada',
        'Decisiones inconsistentes entre empleados',
        'Entrenamiento lento y dependencia de supervisores',
        'Baja productividad en la primera linea',
      ]
    ),
    sp(160),
    box([
      new Paragraph({ spacing: { after: 60 }, children: [t(c.segunda_dimension_titulo || 'Existe una segunda dimension del problema:', { bold: true, size: 22 })] }),
      new Paragraph({ children: [t(c.segunda_dimension_cuerpo, { size: 20 })] }),
    ], C.pageBg, C.blueMed),
    sp(200),
  );

  // 5. Caso de Uso
  const caseChildren = [
    sec('04', `Caso de Uso: ${empresa}`),
    sp(200),
    new Paragraph({ spacing: { after: 200 }, children: [t(c.intro_caso)] }),
    kpis(c.kpis),
    sp(240),

    // Dimension A
    dimHeader('Dimension A', c.dim_a_titulo, c.dim_a_descripcion, C.blue),
    sp(200),

    // A1
    subSec('Caso A1', c.a1_titulo, C.blue),
    sp(80),
    new Paragraph({ spacing: { after: 120 }, children: [t(c.a1_setup, { color: C.textMuted, size: 20 })] }),
    ...convo(c.a1_pregunta, c.a1_label, c.a1_bullets, c.dim_a_rol + ':'),
    sp(200),

    // A2
    subSec('Caso A2', c.a2_titulo, C.blue),
    sp(80),
    new Paragraph({ spacing: { after: 120 }, children: [t(c.a2_setup, { color: C.textMuted, size: 20 })] }),
    ...convo(c.a2_pregunta, c.a2_label, c.a2_bullets, c.dim_a_rol + ':'),
    sp(200),

    // A3
    subSec('Caso A3', c.a3_titulo, C.blue),
    sp(80),
    new Paragraph({ spacing: { after: 120 }, children: [t(c.a3_setup, { color: C.textMuted, size: 20 })] }),
    ...convo(c.a3_pregunta, c.a3_label, c.a3_bullets, c.dim_a_rol + ':'),
    sp(240),

    // Dimension B
    dimHeader('Dimension B', c.dim_b_titulo, c.dim_b_descripcion, C.blueMed),
    sp(200),

    // B1
    subSec('Caso B1', c.b1_titulo, C.blueMed),
    sp(80),
    new Paragraph({ spacing: { after: 120 }, children: [t(c.b1_setup, { color: C.textMuted, size: 20 })] }),
    ...convoB(c.b1_rol, c.b1_pregunta, c.b1_label, c.b1_bullets),
    sp(200),

    // B2
    subSec('Caso B2', c.b2_titulo, C.blueMed),
    sp(80),
    new Paragraph({ spacing: { after: 120 }, children: [t(c.b2_setup, { color: C.textMuted, size: 20 })] }),
    ...convoB(c.b2_rol, c.b2_pregunta, c.b2_label, c.b2_bullets),
    sp(200),

    // B3
    subSec('Caso B3', c.b3_titulo, C.blueMed),
    sp(80),
    new Paragraph({ spacing: { after: 120 }, children: [t(c.b3_setup, { color: C.textMuted, size: 20 })] }),
    ...convoB(c.b3_rol, c.b3_pregunta, c.b3_label, c.b3_bullets),
    sp(240),
  ];
  sections.push(...caseChildren);

  // 6. Propuesta de valor
  sections.push(
    sec('05', `Propuesta de valor para ${empresa}`),
    sp(200),
    twoCol(c.propuesta, 3200),
    sp(200),
    metrics3([
      { val: '98%', label: 'Dicen que BucketsAI es facil de usar' },
      { val: '89%', label: 'Se sienten mas confiados ejecutando tareas' },
      { val: '94%', label: 'Reportan que BucketsAI les ayuda a hacer mejor su trabajo' },
    ]),
    sp(240),
  );

  // Cierre
  sections.push(
    fw([
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [t(`BucketsAI  x  ${empresa}`, { bold: true, color: C.white, size: 46 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [t("Retail teams don't need more documents.", { italics: true, color: C.blueLight, size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [t('They need the right answers, at the moment of execution.', { bold: true, color: C.white, size: 22 })] }),
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
  const fileName = `BucketsAI_${empresa.replace(/\s+/g, '_')}_CasoDeUso.docx`;
  const outputPath = join(outputDir, fileName);

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);

  return outputPath;
}
