import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { C } from './colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function h(color) { return `#${color}`; }

function buildHTML(c) {
  const empresa = c.empresa;

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: ${h(C.navyText)}; font-size: 11pt; line-height: 1.5; }
    .page { width: 100%; padding: 0; }
    .cover { background: ${h(C.blue)}; padding: 60px 70px; margin-bottom: 4px; }
    .cover h1 { color: white; font-size: 36pt; font-weight: bold; margin-bottom: 8px; }
    .cover .empresa { color: ${h(C.blueLight)}; font-size: 25pt; margin-bottom: 12px; }
    .cover .subtitle { color: ${h(C.blueLight)}; font-size: 11pt; margin-bottom: 8px; }
    .cover .tagline { color: white; font-size: 11pt; font-style: italic; }
    .strip { height: 4px; background: ${h(C.blue)}; margin-bottom: 20px; }
    .confidential { text-align: right; color: ${h(C.grayMid)}; font-style: italic; font-size: 9pt; margin: 0 70px 30px; }
    .content { padding: 0 70px; }
    .sec-header { display: flex; margin-bottom: 20px; margin-top: 30px; }
    .sec-num { background: ${h(C.blue)}; color: white; font-weight: bold; padding: 6px 16px; font-size: 11pt; }
    .sec-title { background: ${h(C.blueMed)}; color: white; font-weight: bold; padding: 6px 16px; font-size: 11pt; flex: 1; }
    .box { border-left: 4px solid ${h(C.blue)}; background: ${h(C.blueLight)}; padding: 16px 24px; margin: 16px 0; }
    .box-all { border: 1px solid ${h(C.blue)}; background: ${h(C.blueLight)}; padding: 16px 24px; margin: 16px 0; }
    .box-b { border-left: 4px solid ${h(C.blueMed)}; background: ${h(C.pageBg)}; padding: 16px 24px; margin: 16px 0; }
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin: 16px 0; }
    .step { padding: 20px 16px; }
    .step:nth-child(odd) { background: ${h(C.blueLight)}; }
    .step:nth-child(even) { background: ${h(C.pageBg)}; }
    .step-label { color: ${h(C.orange)}; font-weight: bold; font-size: 10pt; margin-bottom: 6px; }
    .step-title { font-weight: bold; font-size: 11pt; margin-bottom: 6px; }
    .step-body { color: ${h(C.textMuted)}; font-size: 10pt; }
    .kpi-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1px solid ${h(C.border)}; margin: 20px 0; }
    .kpi { background: ${h(C.blueLight)}; text-align: center; padding: 20px 12px; border-right: 1px solid ${h(C.border)}; }
    .kpi:last-child { border-right: none; }
    .kpi-val { color: ${h(C.orange)}; font-size: 26pt; font-weight: bold; }
    .kpi-label { color: ${h(C.textMuted)}; font-size: 9pt; margin-top: 4px; }
    .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 16px 0; }
    .problem-left { background: ${h(C.blueLight)}; padding: 20px; }
    .problem-right { background: ${h(C.pageBg)}; padding: 20px; }
    .problem-title { color: ${h(C.blue)}; font-weight: bold; font-size: 10pt; margin-bottom: 10px; }
    .dim-header { border-left: 4px solid ${h(C.blue)}; background: ${h(C.blueLight)}; padding: 20px 24px; margin: 24px 0 16px; }
    .dim-header.b { border-left-color: ${h(C.blueMed)}; }
    .dim-label { font-weight: bold; font-size: 10pt; margin-bottom: 4px; }
    .dim-label.a { color: ${h(C.blue)}; }
    .dim-label.b { color: ${h(C.blueMed)}; }
    .dim-title { font-weight: bold; font-size: 14pt; margin-bottom: 6px; }
    .dim-desc { color: ${h(C.textMuted)}; font-size: 10pt; }
    .sub-sec { display: flex; align-items: center; gap: 12px; margin: 20px 0 8px; }
    .sub-tag { padding: 4px 14px; color: white; font-weight: bold; font-size: 10pt; }
    .sub-tag.a { background: ${h(C.blue)}; }
    .sub-tag.b { background: ${h(C.blueMed)}; }
    .sub-title { font-weight: bold; font-size: 11pt; }
    .setup { color: ${h(C.textMuted)}; font-size: 10pt; margin-bottom: 8px; }
    .q-box { border-left: 4px solid ${h(C.blue)}; background: ${h(C.blueLight)}; padding: 14px 22px; margin: 8px 0 4px; }
    .q-box.b { border-left-color: ${h(C.blueMed)}; }
    .q-role { color: ${h(C.textMuted)}; font-size: 10pt; }
    .q-text { font-style: italic; font-size: 10pt; }
    .r-box { border-left: 4px solid ${h(C.blueMed)}; background: ${h(C.pageBg)}; padding: 14px 22px; margin: 0 0 16px; }
    .r-label { color: ${h(C.blue)}; font-weight: bold; font-size: 10pt; margin-bottom: 6px; }
    .r-label.b { color: ${h(C.blueMed)}; }
    .r-bullet { font-size: 10pt; margin: 3px 0; padding-left: 16px; }
    .r-bullet::before { content: "\\2022  "; }
    .prop-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .prop-table td { padding: 10px 16px; border: 1px solid ${h(C.border)}; font-size: 10pt; }
    .prop-table tr:nth-child(odd) td { background: ${h(C.blueLight)}; }
    .prop-table tr:nth-child(even) td { background: ${h(C.pageBg)}; }
    .prop-table td:first-child { font-weight: bold; width: 35%; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin: 20px 0; }
    .metric { text-align: center; padding: 24px 12px; }
    .metric:nth-child(odd) { background: ${h(C.blueLight)}; }
    .metric:nth-child(even) { background: ${h(C.pageBg)}; }
    .metric-val { color: ${h(C.orange)}; font-size: 32pt; font-weight: bold; }
    .metric-label { color: ${h(C.textMuted)}; font-size: 9pt; margin-top: 4px; }
    .closing { background: ${h(C.blue)}; padding: 40px 70px; text-align: center; margin-top: 30px; }
    .closing h2 { color: white; font-size: 23pt; font-weight: bold; margin-bottom: 10px; }
    .closing .tag1 { color: ${h(C.blueLight)}; font-style: italic; font-size: 11pt; }
    .closing .tag2 { color: white; font-weight: bold; font-size: 11pt; margin-bottom: 12px; }
    .closing .contact { color: ${h(C.blueLight)}; font-size: 10pt; }
    p { margin-bottom: 8px; }
  `;

  function bullets(arr) {
    return (arr || []).map(b => `<div class="r-bullet">${b}</div>`).join('');
  }

  function convoBlock(role, question, label, buls, isB = false) {
    const cls = isB ? 'b' : '';
    return `
      <div class="q-box ${cls}">
        <span class="q-role">${role}:</span> <span class="q-text">${question}</span>
      </div>
      <div class="r-box">
        <div class="r-label ${cls}">BucketsAI:</div>
        <div class="r-label ${cls}">${label}</div>
        ${bullets(buls)}
      </div>`;
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <h1>BucketsAI</h1>
    <div class="empresa">x  ${empresa}</div>
    <div class="subtitle">${c.titulo_caso}</div>
    <div class="tagline">All your knowledge, one conversation away.</div>
  </div>
  <div class="strip"></div>
  <div class="confidential">Confidencial | 2026 | buckets-ai.com</div>

  <div class="content">

    <!-- 01 -->
    <div class="sec-header"><div class="sec-num">01</div><div class="sec-title">Que es BucketsAI</div></div>
    <div class="box">
      <p>BucketsAI es una plataforma de inteligencia artificial que convierte el conocimiento interno de una empresa en un sistema de respuestas y decisiones en tiempo real para los equipos de trabajo.</p>
    </div>
    <p>En lugar de que los empleados tengan que buscar informacion en multiples documentos o sistemas, BucketsAI les permite hacer preguntas en lenguaje natural y recibir una respuesta clara basada en los documentos y reglas oficiales de la empresa.</p>
    <div class="box-all">
      <p>En terminos simples: <strong>${c.terminos_simples}</strong></p>
    </div>

    <!-- 02 -->
    <div class="sec-header"><div class="sec-num">02</div><div class="sec-title">Como funciona</div></div>
    <div class="steps">
      <div class="step"><div class="step-label">Paso 1</div><div class="step-title">Conecta el conocimiento interno</div><div class="step-body">${c.paso1_cuerpo}</div></div>
      <div class="step"><div class="step-label">Paso 2</div><div class="step-title">${c.paso2_titulo}</div><div class="step-body">${c.paso2_cuerpo}</div></div>
      <div class="step"><div class="step-label">Paso 3</div><div class="step-title">Aplica gobernanza y control de acceso</div><div class="step-body">${c.paso3_cuerpo}</div></div>
      <div class="step"><div class="step-label">Paso 4</div><div class="step-title">Responde preguntas en tiempo real</div><div class="step-body">${c.paso4_cuerpo}</div></div>
    </div>

    <!-- 03 -->
    <div class="sec-header"><div class="sec-num">03</div><div class="sec-title">Que problemas resuelve</div></div>
    <div class="box"><p><strong>${c.problema_headline}</strong></p></div>
    <div class="problem-grid">
      <div class="problem-left">
        <div class="problem-title">La informacion suele estar dispersa en:</div>
        <div class="r-bullet">PDFs y presentaciones sin estructurar</div>
        <div class="r-bullet">Carpetas compartidas con multiples versiones</div>
        <div class="r-bullet">Sistemas distintos sin conexion entre si</div>
        <div class="r-bullet">La cabeza de algunos expertos clave</div>
      </div>
      <div class="problem-right">
        <div class="problem-title">El resultado son:</div>
        <div class="r-bullet">Errores operativos por informacion desactualizada</div>
        <div class="r-bullet">Decisiones inconsistentes entre empleados</div>
        <div class="r-bullet">Entrenamiento lento y dependencia de supervisores</div>
        <div class="r-bullet">Baja productividad en la primera linea</div>
      </div>
    </div>
    <div class="box-b">
      <p><strong>${c.segunda_dimension_titulo || ''}</strong></p>
      <p>${c.segunda_dimension_cuerpo}</p>
    </div>

    <!-- 04 -->
    <div class="sec-header"><div class="sec-num">04</div><div class="sec-title">Caso de Uso: ${empresa}</div></div>
    <p>${c.intro_caso}</p>
    <div class="kpi-bar">
      ${(c.kpis || []).map(k => `<div class="kpi"><div class="kpi-val">${k.val}</div><div class="kpi-label">${k.label}</div></div>`).join('')}
    </div>

    <!-- DIM A -->
    <div class="dim-header">
      <div class="dim-label a">Dimension A</div>
      <div class="dim-title">${c.dim_a_titulo}</div>
      <div class="dim-desc">${c.dim_a_descripcion}</div>
    </div>

    <div class="sub-sec"><span class="sub-tag a">Caso A1</span><span class="sub-title">${c.a1_titulo}</span></div>
    <div class="setup">${c.a1_setup}</div>
    ${convoBlock(c.dim_a_rol, c.a1_pregunta, c.a1_label, c.a1_bullets)}

    <div class="sub-sec"><span class="sub-tag a">Caso A2</span><span class="sub-title">${c.a2_titulo}</span></div>
    <div class="setup">${c.a2_setup}</div>
    ${convoBlock(c.dim_a_rol, c.a2_pregunta, c.a2_label, c.a2_bullets)}

    <div class="sub-sec"><span class="sub-tag a">Caso A3</span><span class="sub-title">${c.a3_titulo}</span></div>
    <div class="setup">${c.a3_setup}</div>
    ${convoBlock(c.dim_a_rol, c.a3_pregunta, c.a3_label, c.a3_bullets)}

    <!-- DIM B -->
    <div class="dim-header b">
      <div class="dim-label b">Dimension B</div>
      <div class="dim-title">${c.dim_b_titulo}</div>
      <div class="dim-desc">${c.dim_b_descripcion}</div>
    </div>

    <div class="sub-sec"><span class="sub-tag b">Caso B1</span><span class="sub-title">${c.b1_titulo}</span></div>
    <div class="setup">${c.b1_setup}</div>
    ${convoBlock(c.b1_rol, c.b1_pregunta, c.b1_label, c.b1_bullets, true)}

    <div class="sub-sec"><span class="sub-tag b">Caso B2</span><span class="sub-title">${c.b2_titulo}</span></div>
    <div class="setup">${c.b2_setup}</div>
    ${convoBlock(c.b2_rol, c.b2_pregunta, c.b2_label, c.b2_bullets, true)}

    <div class="sub-sec"><span class="sub-tag b">Caso B3</span><span class="sub-title">${c.b3_titulo}</span></div>
    <div class="setup">${c.b3_setup}</div>
    ${convoBlock(c.b3_rol, c.b3_pregunta, c.b3_label, c.b3_bullets, true)}

    <!-- 05 -->
    <div class="sec-header"><div class="sec-num">05</div><div class="sec-title">Propuesta de valor para ${empresa}</div></div>
    <table class="prop-table">
      ${(c.propuesta || []).map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
    </table>

    <div class="metrics">
      <div class="metric"><div class="metric-val">98%</div><div class="metric-label">Dicen que BucketsAI es facil de usar</div></div>
      <div class="metric"><div class="metric-val">89%</div><div class="metric-label">Se sienten mas confiados ejecutando tareas</div></div>
      <div class="metric"><div class="metric-val">94%</div><div class="metric-label">Reportan que BucketsAI les ayuda a hacer mejor su trabajo</div></div>
    </div>

  </div>

  <!-- CLOSING -->
  <div class="closing">
    <h2>BucketsAI  x  ${empresa}</h2>
    <div class="tag1">Retail teams don't need more documents.</div>
    <div class="tag2">They need the right answers, at the moment of execution.</div>
    <div class="contact">ruben@buckets-ai.com  |  app.buckets-ai.com  |  buckets-ai.com</div>
  </div>

</div>
</body></html>`;
}

export async function generatePdf(content) {
  const html = buildHTML(content);
  const empresa = content.empresa;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputDir = join(__dirname, '..', 'output');
  mkdirSync(outputDir, { recursive: true });
  const fileName = `BucketsAI_${empresa.replace(/\s+/g, '_')}_CasoDeUso.pdf`;
  const outputPath = join(outputDir, fileName);

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    printBackground: true,
  });

  await browser.close();
  return outputPath;
}
