import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { C } from './colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function h(color) { return `#${color}`; }

function buildHTML(c) {
  const empresa = c.empresa;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      color: ${h(C.navyText)};
      font-size: 8.5pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .page { width: 100%; }
    p { margin-bottom: 5px; }

    .page-break { page-break-before: always; }
    .no-break { page-break-inside: avoid; }

    /* ===== COVER ===== */
    .cover {
      background: linear-gradient(145deg, ${h(C.blue)} 0%, #3358B8 55%, #1E3A8A 100%);
      padding: 56px 56px 40px;
      margin-top: -48px;
      position: relative;
      overflow: hidden;
    }
    .cover::before {
      content: '';
      position: absolute;
      top: -80px; right: -60px;
      width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
      border-radius: 50%;
    }
    .cover-badge {
      display: inline-block;
      background: rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.8);
      font-size: 6.5pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .cover h1 {
      color: white;
      font-size: 34pt;
      font-weight: 800;
      letter-spacing: -1.5px;
      margin-bottom: 2px;
    }
    .cover .empresa {
      color: rgba(255,255,255,0.65);
      font-size: 22pt;
      font-weight: 300;
      letter-spacing: -0.5px;
      margin-bottom: 14px;
    }
    .cover .subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 9pt;
      font-weight: 400;
      line-height: 1.5;
      max-width: 420px;
    }
    .cover .tagline {
      color: rgba(255,255,255,0.38);
      font-size: 7.5pt;
      font-style: italic;
      margin-top: 24px;
      letter-spacing: 0.3px;
    }

    .meta-bar {
      display: flex;
      justify-content: space-between;
      padding: 7px 56px;
      background: ${h(C.navyText)};
      color: rgba(255,255,255,0.45);
      font-size: 6.5pt;
      font-weight: 500;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    .content { padding: 0 44px; }

    /* ===== SECTION HEADERS ===== */
    .sec-header {
      display: flex;
      align-items: center;
      margin: 16px 0 8px;
      page-break-after: avoid;
    }
    .sec-header.first { margin-top: 6px; }
    .sec-num {
      color: ${h(C.orange)};
      font-size: 9pt;
      font-weight: 800;
      margin-right: 10px;
    }
    .sec-title {
      font-size: 12pt;
      font-weight: 700;
      color: ${h(C.navyText)};
      letter-spacing: -0.3px;
    }
    .sec-line {
      flex: 1;
      height: 1px;
      background: ${h(C.border)};
      margin-left: 14px;
    }

    /* ===== BOXES ===== */
    .box-primary {
      background: linear-gradient(135deg, ${h(C.blueLight)} 0%, #F0F4FC 100%);
      border-left: 3px solid ${h(C.blue)};
      border-radius: 0 8px 8px 0;
      padding: 8px 14px;
      margin: 6px 0;
      page-break-inside: avoid;
    }
    .box-outline {
      border: 1.5px solid ${h(C.blue)};
      border-radius: 8px;
      padding: 8px 14px;
      margin: 6px 0;
      background: white;
      page-break-inside: avoid;
    }
    .box-accent {
      background: ${h(C.pageBg)};
      border-left: 3px solid ${h(C.blueMed)};
      border-radius: 0 8px 8px 0;
      padding: 8px 14px;
      margin: 6px 0;
      page-break-inside: avoid;
    }

    /* ===== STEPS ===== */
    .steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin: 8px 0;
      page-break-inside: avoid;
    }
    .step {
      background: white;
      border: 1.5px solid ${h(C.border)};
      border-radius: 8px;
      padding: 10px 8px;
    }
    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px; height: 20px;
      background: ${h(C.blue)};
      color: white;
      font-size: 7.5pt;
      font-weight: 700;
      border-radius: 5px;
      margin-bottom: 6px;
    }
    .step-title {
      font-weight: 700;
      font-size: 7.5pt;
      color: ${h(C.navyText)};
      margin-bottom: 3px;
      line-height: 1.25;
    }
    .step-body {
      color: ${h(C.textMuted)};
      font-size: 7pt;
      line-height: 1.4;
    }

    /* ===== KPI BAR ===== */
    .kpi-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    .kpi {
      background: white;
      border: 1.5px solid ${h(C.border)};
      border-radius: 8px;
      text-align: center;
      padding: 8px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .kpi-val {
      color: ${h(C.orange)};
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: -0.3px;
      line-height: 1.2;
      margin-bottom: 2px;
    }
    .kpi-label {
      color: ${h(C.textMuted)};
      font-size: 6pt;
      font-weight: 500;
      margin-top: 1px;
      line-height: 1.25;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }

    /* ===== PROBLEM GRID ===== */
    .problem-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin: 8px 0;
      page-break-inside: avoid;
    }
    .problem-card {
      background: white;
      border: 1.5px solid ${h(C.border)};
      border-radius: 8px;
      padding: 10px 12px;
    }
    .problem-card-title {
      color: ${h(C.blue)};
      font-weight: 700;
      font-size: 7.5pt;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .problem-card-title .dot {
      width: 4px; height: 4px;
      background: ${h(C.blue)};
      border-radius: 50%;
      flex-shrink: 0;
    }
    .problem-card.alt .problem-card-title { color: ${h(C.orange)}; }
    .problem-card.alt .problem-card-title .dot { background: ${h(C.orange)}; }

    /* ===== DIMENSION HEADERS ===== */
    .dim-header {
      background: white;
      border: 1.5px solid ${h(C.blue)};
      border-radius: 8px;
      padding: 10px 14px;
      margin: 12px 0 6px;
      page-break-inside: avoid;
      page-break-after: avoid;
      position: relative;
      overflow: hidden;
    }
    .dim-header::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 2px;
      background: ${h(C.blue)};
    }
    .dim-header.b { border-color: ${h(C.blueMed)}; }
    .dim-header.b::before { background: ${h(C.blueMed)}; }
    .dim-chip {
      display: inline-block;
      font-size: 6pt;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 3px;
    }
    .dim-chip.a { background: ${h(C.blueLight)}; color: ${h(C.blue)}; }
    .dim-chip.b { background: #E8EDFA; color: ${h(C.blueMed)}; }
    .dim-title {
      font-weight: 800;
      font-size: 11pt;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
    }
    .dim-desc {
      color: ${h(C.textMuted)};
      font-size: 7.5pt;
      line-height: 1.4;
    }

    /* ===== CASE BLOCKS ===== */
    .case-block {
      page-break-inside: avoid;
      margin-bottom: 6px;
    }
    .sub-sec {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0 2px;
      page-break-after: avoid;
    }
    .sub-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 8px;
      color: white;
      font-weight: 700;
      font-size: 6.5pt;
      border-radius: 4px;
      letter-spacing: 0.3px;
    }
    .sub-tag.a { background: ${h(C.blue)}; }
    .sub-tag.b { background: ${h(C.blueMed)}; }
    .sub-title { font-weight: 700; font-size: 8.5pt; }
    .setup {
      color: ${h(C.textMuted)};
      font-size: 7pt;
      margin-bottom: 4px;
      padding-left: 2px;
    }

    /* ===== CONVERSATION ===== */
    .convo-wrapper {
      background: ${h(C.pageBg)};
      border-radius: 8px;
      padding: 8px;
      margin: 2px 0 4px;
    }
    .q-block {
      background: white;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 5px;
      border: 1px solid ${h(C.border)};
    }
    .q-role {
      color: ${h(C.textMuted)};
      font-size: 6pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1px;
      display: block;
    }
    .q-text {
      font-size: 8pt;
      font-style: italic;
      color: ${h(C.navyText)};
      line-height: 1.4;
    }
    .r-block {
      background: linear-gradient(135deg, ${h(C.blueLight)} 0%, #F0F4FC 100%);
      border-radius: 6px;
      padding: 6px 10px;
      border: 1px solid rgba(68,112,220,0.12);
    }
    .r-block.b {
      background: linear-gradient(135deg, #E8EDFA 0%, #F0F2FA 100%);
      border-color: rgba(107,143,232,0.12);
    }
    .r-header {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 4px;
    }
    .r-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px; height: 16px;
      background: ${h(C.blue)};
      border-radius: 4px;
      color: white;
      font-size: 6.5pt;
      font-weight: 800;
    }
    .r-block.b .r-logo { background: ${h(C.blueMed)}; }
    .r-label {
      color: ${h(C.blue)};
      font-weight: 700;
      font-size: 7.5pt;
    }
    .r-block.b .r-label { color: ${h(C.blueMed)}; }
    .r-bullet {
      font-size: 7.5pt;
      margin: 2px 0;
      padding-left: 12px;
      position: relative;
      line-height: 1.4;
      color: ${h(C.navyText)};
    }
    .r-bullet::before {
      content: '';
      position: absolute;
      left: 2px; top: 5px;
      width: 3px; height: 3px;
      background: ${h(C.blue)};
      border-radius: 50%;
    }
    .r-block.b .r-bullet::before { background: ${h(C.blueMed)}; }

    /* ===== PROP GRID ===== */
    .prop-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin: 8px 0;
    }
    .prop-card {
      background: white;
      border: 1.5px solid ${h(C.border)};
      border-radius: 8px;
      padding: 8px 10px;
      page-break-inside: avoid;
    }
    .prop-card-title {
      font-weight: 700;
      font-size: 8pt;
      color: ${h(C.blue)};
      margin-bottom: 2px;
    }
    .prop-card-desc {
      font-size: 7pt;
      color: ${h(C.textMuted)};
      line-height: 1.4;
    }

    /* ===== METRICS ===== */
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    .metric {
      text-align: center;
      background: white;
      border: 1.5px solid ${h(C.border)};
      border-radius: 8px;
      padding: 12px 10px;
    }
    .metric-val {
      color: ${h(C.orange)};
      font-size: 18pt;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .metric-label {
      color: ${h(C.textMuted)};
      font-size: 6.5pt;
      font-weight: 500;
      margin-top: 2px;
      line-height: 1.3;
    }

    /* ===== CLOSING ===== */
    .closing-wrapper {
      page-break-before: always;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(145deg, ${h(C.blue)} 0%, #3358B8 50%, #1E3A8A 100%);
      margin-top: -48px;
      margin-bottom: -36px;
      padding-top: 48px;
      padding-bottom: 36px;
      position: relative;
      overflow: hidden;
    }
    .closing-wrapper::before {
      content: '';
      position: absolute;
      top: 20%; right: -10%;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%);
      border-radius: 50%;
    }
    .closing {
      padding: 40px 56px;
      text-align: center;
      width: 100%;
      position: relative;
    }
    .closing-chip {
      display: inline-block;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.65);
      font-size: 6.5pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 4px 16px;
      border-radius: 20px;
      margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .closing h2 {
      color: white;
      font-size: 22pt;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 10px;
    }
    .closing .tag1 {
      color: rgba(255,255,255,0.5);
      font-style: italic;
      font-size: 9pt;
      font-weight: 300;
    }
    .closing .tag2 {
      color: white;
      font-weight: 600;
      font-size: 9pt;
      margin-bottom: 28px;
    }
    .closing-divider {
      width: 40px; height: 1px;
      background: rgba(255,255,255,0.18);
      margin: 0 auto 12px;
    }
    .closing .contact {
      color: rgba(255,255,255,0.35);
      font-size: 7.5pt;
      letter-spacing: 0.3px;
    }
  `;

  function bullets(arr) {
    return (arr || []).map(b => `<div class="r-bullet">${b}</div>`).join('');
  }

  function convoBlock(role, question, label, buls, isB = false) {
    const cls = isB ? ' b' : '';
    return `
      <div class="convo-wrapper">
        <div class="q-block">
          <span class="q-role">${role}</span>
          <span class="q-text">${question}</span>
        </div>
        <div class="r-block${cls}">
          <div class="r-header">
            <span class="r-logo">B</span>
            <span class="r-label">${label}</span>
          </div>
          ${bullets(buls)}
        </div>
      </div>`;
  }

  function caseBlock(tag, tagCls, title, setup, convoHtml) {
    return `
    <div class="case-block">
      <div class="sub-sec"><span class="sub-tag ${tagCls}">${tag}</span><span class="sub-title">${title}</span></div>
      <div class="setup">${setup}</div>
      ${convoHtml}
    </div>`;
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${css}</style></head><body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-badge">Caso de uso personalizado</div>
    <h1>BucketsAI</h1>
    <div class="empresa">x  ${empresa}</div>
    <div class="subtitle">${c.titulo_caso}</div>
    <div class="tagline">All your knowledge, one conversation away.</div>
  </div>
  <div class="meta-bar">
    <span>Confidencial</span>
    <span>2026</span>
    <span>buckets-ai.com</span>
  </div>

  <div class="content">

    <!-- 01 -->
    <div class="sec-header first">
      <div class="sec-num">01</div>
      <div class="sec-title">Que es BucketsAI</div>
      <div class="sec-line"></div>
    </div>
    <div class="box-primary">
      <p>BucketsAI es una plataforma de inteligencia artificial que convierte el conocimiento interno de una empresa en un sistema de respuestas y decisiones en tiempo real para los equipos de trabajo.</p>
    </div>
    <p>En lugar de que los empleados tengan que buscar informacion en multiples documentos o sistemas, BucketsAI les permite hacer preguntas en lenguaje natural y recibir una respuesta clara basada en los documentos y reglas oficiales de la empresa.</p>
    <div class="box-outline">
      <p>En terminos simples: <strong>${c.terminos_simples}</strong></p>
    </div>

    <!-- 02 -->
    <div class="sec-header">
      <div class="sec-num">02</div>
      <div class="sec-title">Como funciona</div>
      <div class="sec-line"></div>
    </div>
    <div class="steps">
      <div class="step"><div class="step-num">1</div><div class="step-title">Conecta el conocimiento interno</div><div class="step-body">${c.paso1_cuerpo}</div></div>
      <div class="step"><div class="step-num">2</div><div class="step-title">${c.paso2_titulo}</div><div class="step-body">${c.paso2_cuerpo}</div></div>
      <div class="step"><div class="step-num">3</div><div class="step-title">Aplica gobernanza y control de acceso</div><div class="step-body">${c.paso3_cuerpo}</div></div>
      <div class="step"><div class="step-num">4</div><div class="step-title">Responde preguntas en tiempo real</div><div class="step-body">${c.paso4_cuerpo}</div></div>
    </div>

    <!-- 03 -->
    <div class="sec-header">
      <div class="sec-num">03</div>
      <div class="sec-title">Que problemas resuelve</div>
      <div class="sec-line"></div>
    </div>
    <div class="box-primary"><p><strong>${c.problema_headline}</strong></p></div>
    <div class="problem-grid">
      <div class="problem-card">
        <div class="problem-card-title"><span class="dot"></span> La informacion suele estar dispersa en:</div>
        <div class="r-bullet">PDFs y presentaciones sin estructurar</div>
        <div class="r-bullet">Carpetas compartidas con multiples versiones</div>
        <div class="r-bullet">Sistemas distintos sin conexion entre si</div>
        <div class="r-bullet">La cabeza de algunos expertos clave</div>
      </div>
      <div class="problem-card alt">
        <div class="problem-card-title"><span class="dot"></span> El resultado son:</div>
        <div class="r-bullet">Errores operativos por informacion desactualizada</div>
        <div class="r-bullet">Decisiones inconsistentes entre empleados</div>
        <div class="r-bullet">Entrenamiento lento y dependencia de supervisores</div>
        <div class="r-bullet">Baja productividad en la primera linea</div>
      </div>
    </div>
    <div class="box-accent">
      <p><strong>${c.segunda_dimension_titulo || ''}</strong></p>
      <p>${c.segunda_dimension_cuerpo}</p>
    </div>

    <!-- 04 -->
    <div class="sec-header">
      <div class="sec-num">04</div>
      <div class="sec-title">Caso de Uso: ${empresa}</div>
      <div class="sec-line"></div>
    </div>
    <p>${c.intro_caso}</p>
    <div class="kpi-bar">
      ${(c.kpis || []).map(k => `<div class="kpi"><div class="kpi-val">${k.val}</div><div class="kpi-label">${k.label}</div></div>`).join('')}
    </div>

    <!-- DIM A -->
    <div class="dim-header">
      <div class="dim-chip a">Dimension A</div>
      <div class="dim-title">${c.dim_a_titulo}</div>
      <div class="dim-desc">${c.dim_a_descripcion}</div>
    </div>
    ${caseBlock('A1', 'a', c.a1_titulo, c.a1_setup, convoBlock(c.dim_a_rol, c.a1_pregunta, c.a1_label, c.a1_bullets))}
    ${caseBlock('A2', 'a', c.a2_titulo, c.a2_setup, convoBlock(c.dim_a_rol, c.a2_pregunta, c.a2_label, c.a2_bullets))}
    ${caseBlock('A3', 'a', c.a3_titulo, c.a3_setup, convoBlock(c.dim_a_rol, c.a3_pregunta, c.a3_label, c.a3_bullets))}

    <!-- DIM B -->
    <div class="dim-header b">
      <div class="dim-chip b">Dimension B</div>
      <div class="dim-title">${c.dim_b_titulo}</div>
      <div class="dim-desc">${c.dim_b_descripcion}</div>
    </div>
    ${caseBlock('B1', 'b', c.b1_titulo, c.b1_setup, convoBlock(c.b1_rol, c.b1_pregunta, c.b1_label, c.b1_bullets, true))}
    ${caseBlock('B2', 'b', c.b2_titulo, c.b2_setup, convoBlock(c.b2_rol, c.b2_pregunta, c.b2_label, c.b2_bullets, true))}
    ${caseBlock('B3', 'b', c.b3_titulo, c.b3_setup, convoBlock(c.b3_rol, c.b3_pregunta, c.b3_label, c.b3_bullets, true))}

    <!-- 05 -->
    <div class="sec-header">
      <div class="sec-num">05</div>
      <div class="sec-title">Propuesta de valor para ${empresa}</div>
      <div class="sec-line"></div>
    </div>
    <div class="prop-grid">
      ${(c.propuesta || []).map(r => `<div class="prop-card"><div class="prop-card-title">${r[0]}</div><div class="prop-card-desc">${r[1]}</div></div>`).join('')}
    </div>
    <div class="metrics">
      <div class="metric"><div class="metric-val">98%</div><div class="metric-label">Dicen que BucketsAI es facil de usar</div></div>
      <div class="metric"><div class="metric-val">89%</div><div class="metric-label">Se sienten mas confiados ejecutando tareas</div></div>
      <div class="metric"><div class="metric-val">94%</div><div class="metric-label">Reportan que BucketsAI les ayuda a hacer mejor su trabajo</div></div>
    </div>

  </div>

  <!-- CLOSING -->
  <div class="closing-wrapper">
    <div class="closing">
      <div class="closing-chip">Siguiente paso</div>
      <h2>BucketsAI  x  ${empresa}</h2>
      <div class="tag1">Your teams don't need more documents.</div>
      <div class="tag2">They need the right answers, at the moment of execution.</div>
      <div class="closing-divider"></div>
      <div class="contact">ruben@buckets-ai.com  |  app.buckets-ai.com  |  buckets-ai.com</div>
    </div>
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
    margin: { top: '48px', bottom: '36px', left: '0', right: '0' },
    printBackground: true,
  });

  await browser.close();
  return outputPath;
}
