import puppeteer from 'puppeteer';
import { mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { C } from './colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function h(c) { return `#${c}`; }

function toBase64(relativePath) {
  try {
    const fullPath = join(__dirname, '..', 'public', relativePath);
    const buf = readFileSync(fullPath);
    const ext = relativePath.split('.').pop().toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch { return ''; }
}

function buildOnePagerHTML(op, empresa, useCaseContent, idioma) {
  const logo = toBase64('logo.png');
  const heroPhones = toBase64('onepager-assets/hero-phones-clean.png');
  const chatPhone = toBase64('onepager-assets/chat-phone-clean.png');

  // Use case data enrichment (when available from full generation)
  const uc = useCaseContent || {};

  const isEN = idioma?.toLowerCase().includes('ingles') || idioma?.toLowerCase().includes('english');
  const L = isEN ? {
    painHeader: 'Today, <span>in actual operations:</span>',
    whatChanges: 'What <span>changes</span> for the business',
    whyNotChatGPT: 'Why BucketsAI and not ChatGPT',
    howItWorks: 'How it works',
    howSubtitle: 'Ready to operate in minutes',
    step1: 'Connect catalogs,<br>prices and business rules',
    step2: 'Define roles and access<br>levels per team',
    step3: 'Teams make decisions<br>in real time',
    noHaceTitle: 'What BucketsAI does NOT do',
    noHaceText: '<strong>Does NOT</strong> replace your CRM or current systems &middot; <strong>Does NOT</strong> require data migration<br><strong>Does NOT</strong> change your existing workflows',
    anchorTitle: 'Success Story: Tiendas Ara',
    anchorSubtitle: 'Over 4,000 employees use BucketsAI daily.',
    anchorResults: 'Results:',
    anchorItems: ['Shorter training time', 'Reduced learning curve', 'Lower early turnover', 'Fewer operational errors', 'Greater autonomy', 'Better adaptation from month one'],
    anchorConclusion: 'Training stopped depending on documents and started living in operations.',
    diffText: `ChatGPT answers questions. BucketsAI governs decisions for ${empresa}.`,
    implTitle: 'Frictionless implementation',
    implTime: 'Typical go-live time: hours, not days.',
    idealTitle: 'Ideal for companies that',
    caseUseHeader: 'Use Case: <span>',
    dimsIntro: `BucketsAI operates in 2 dimensions within ${empresa}, each generating value for a different role.`,
    compareAccess: 'Role-based access',
    compareGov: 'Commercial governance',
    compareLarge: 'Large team usage',
    compareTrace: 'Decision traceability',
    compareLic: 'Licensing',
    comparePer: 'Per person',
    compareUnlimited: 'Unlimited users',
  } : {
    painHeader: '<span>Hoy,</span> en la operacion real:',
    whatChanges: 'Que <span>cambia</span> para el negocio',
    whyNotChatGPT: 'Por que BucketsAI y no ChatGPT',
    howItWorks: 'Como funciona',
    howSubtitle: 'Listo para operar en minutos',
    step1: 'Conectas catalogos,<br>precios y reglas de negocio',
    step2: 'Defines roles y niveles de<br>acceso por equipo',
    step3: 'Los equipos deciden<br>en tiempo real',
    noHaceTitle: 'Lo que BucketsAI NO hace',
    noHaceText: '<strong>NO</strong> reemplaza tu CRM o sistemas actuales &middot; <strong>NO</strong> requiere migracion de datos<br><strong>NO</strong> cambia tus flujos de trabajo existentes',
    anchorTitle: 'Caso de Exito: Tiendas Ara',
    anchorSubtitle: 'Mas de 4.000 colaboradores usan BucketsAI diariamente.',
    anchorResults: 'Resultados:',
    anchorItems: ['Menor tiempo de entrenamiento', 'Menor curva de aprendizaje', 'Reduccion en rotacion temprana', 'Menos errores operativos', 'Mayor autonomia', 'Mejor adaptacion desde el primer mes'],
    anchorConclusion: 'La capacitacion dejo de depender de documentos y paso a vivir en la operacion.',
    diffText: `ChatGPT responde preguntas. BucketsAI gobierna decisiones de ${empresa.toLowerCase().includes('bucket') ? 'venta' : empresa}.`,
    implTitle: 'Implementacion sin friccion',
    implTime: 'Tiempo tipico de puesta en marcha: horas, no dias.',
    idealTitle: 'Ideal para empresas que',
    caseUseHeader: 'Caso de Uso: <span>',
    dimsIntro: `BucketsAI opera en 2 dimensiones dentro de ${empresa}, cada una generando valor para un rol diferente.`,
    compareAccess: 'Accesos por rol',
    compareGov: 'Gobernanza comercial',
    compareLarge: 'Uso por equipos grandes',
    compareTrace: 'Trazabilidad de decisiones',
    compareLic: 'Licenciamiento',
    comparePer: 'Por persona',
    compareUnlimited: 'Usuarios ilimitados',
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      color: ${h(C.navyText)};
      font-size: 9.5pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      background: #FFFFFF;
    }
    .page { width: 100%; }
    strong { font-weight: 700; }

    /* ===== HERO ===== */
    .hero {
      padding: 44px 52px 36px;
      display: flex;
      align-items: flex-start;
      gap: 32px;
    }
    .hero-left { flex: 1; min-width: 0; }
    .hero-logo { height: 34px; margin-bottom: 20px; }
    .hero-titulo {
      font-size: 28pt;
      font-weight: 900;
      line-height: 1.12;
      color: ${h(C.navyText)};
      margin-bottom: 16px;
      letter-spacing: -0.8px;
    }
    .hero-desc {
      font-size: 9.5pt;
      line-height: 1.65;
      color: #4A5568;
    }
    .hero-right {
      flex-shrink: 0;
      width: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-right img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* ===== PAIN SECTION ===== */
    .pain-section {
      padding: 30px 52px 28px;
      background: #F8FAFF;
    }
    .section-header {
      text-align: center;
      font-size: 16pt;
      font-weight: 700;
      margin-bottom: 20px;
      color: ${h(C.navyText)};
    }
    .section-header span { color: ${h(C.blue)}; }
    .pain-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .pain-card {
      background: #FFFFFF;
      border: 1px solid ${h(C.border)};
      border-radius: 10px;
      padding: 16px 14px;
      font-size: 8.5pt;
      line-height: 1.5;
      color: ${h(C.navyText)};
    }
    .pain-card strong { font-weight: 700; }
    .pain-card.highlight {
      border: 2px solid ${h(C.blue)};
      background: #F0F4FF;
    }
    .pain-quote {
      text-align: center;
      font-size: 8.5pt;
      color: ${h(C.grayMid)};
      font-style: italic;
      padding-top: 4px;
    }

    /* ===== VALUE PROP ===== */
    .value-section {
      padding: 32px 52px;
      display: flex;
      gap: 40px;
      align-items: flex-start;
    }
    .value-left { flex: 1; }
    .value-titulo {
      font-size: 18pt;
      font-weight: 800;
      line-height: 1.2;
      color: ${h(C.navyText)};
      margin-bottom: 14px;
    }
    .value-desc {
      font-size: 9pt;
      line-height: 1.6;
      color: #4A5568;
    }
    .value-right { flex: 1; }
    .knowledge-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .knowledge-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: ${h(C.blueLight)};
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .knowledge-icon svg {
      width: 16px;
      height: 16px;
      stroke: ${h(C.blue)};
      fill: none;
      stroke-width: 1.5;
    }
    .knowledge-text {
      font-size: 9.5pt;
      font-weight: 500;
      color: ${h(C.navyText)};
    }

    /* ===== FLOW ===== */
    .flow-section {
      padding: 28px 52px;
      background: #F8FAFF;
    }
    .flow-header {
      text-align: center;
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 22px;
      color: ${h(C.navyText)};
    }
    .flow-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 14px;
    }
    .flow-card {
      background: #FFFFFF;
      border: 2px solid ${h(C.blueLight)};
      border-radius: 14px;
      padding: 20px 14px;
      text-align: center;
    }
    .flow-card.highlight {
      border-color: ${h(C.blue)};
      background: ${h(C.blueLight)};
    }
    .flow-card-icon {
      width: 40px;
      height: 40px;
      margin: 0 auto 10px;
      background: ${h(C.blueLight)};
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .flow-card.highlight .flow-card-icon { background: #FFFFFF; }
    .flow-card-icon svg {
      width: 20px;
      height: 20px;
      stroke: ${h(C.blue)};
      fill: none;
      stroke-width: 1.5;
    }
    .flow-card-titulo {
      font-size: 9pt;
      font-weight: 700;
      color: ${h(C.navyText)};
      margin-bottom: 3px;
    }
    .flow-card-desc {
      font-size: 8pt;
      color: ${h(C.grayMid)};
      line-height: 1.4;
    }
    .flow-tagline {
      text-align: center;
      font-size: 8.5pt;
      color: ${h(C.grayMid)};
      font-style: italic;
    }

    /* ===== DIMENSIONS ===== */
    .dims-section {
      padding: 32px 52px;
    }
    .dims-intro {
      text-align: center;
      font-size: 10pt;
      color: ${h(C.grayMid)};
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .dims-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .dim-card {
      border-radius: 14px;
      overflow: hidden;
    }
    .dim-card.a { border: 2px solid ${h(C.blue)}; }
    .dim-card.b { border: 2px solid ${h(C.blueMed)}; }
    .dim-header {
      padding: 14px 18px;
      color: #FFFFFF;
    }
    .dim-card.a .dim-header { background: ${h(C.blue)}; }
    .dim-card.b .dim-header { background: ${h(C.blueMed)}; }
    .dim-header-titulo {
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .dim-header-rol {
      font-size: 8pt;
      opacity: 0.8;
    }
    .dim-body {
      padding: 16px 18px;
      background: #FFFFFF;
    }
    .dim-desc {
      font-size: 8.5pt;
      line-height: 1.5;
      color: ${h(C.grayMid)};
      margin-bottom: 12px;
    }
    .dim-caso-setup {
      font-size: 8pt;
      color: ${h(C.grayMid)};
      font-style: italic;
      margin-bottom: 8px;
    }
    .dim-q {
      background: ${h(C.blueLight)};
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 8pt;
      line-height: 1.5;
      color: ${h(C.navyText)};
      margin-bottom: 10px;
      font-style: italic;
    }
    .dim-a-label {
      font-size: 8pt;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .dim-card.a .dim-a-label { color: ${h(C.blue)}; }
    .dim-card.b .dim-a-label { color: ${h(C.blueMed)}; }
    .dim-bullet {
      font-size: 7.5pt;
      line-height: 1.5;
      color: ${h(C.navyText)};
      margin-bottom: 3px;
      padding-left: 12px;
      position: relative;
    }
    .dim-bullet::before {
      content: '•';
      position: absolute;
      left: 2px;
      font-weight: 700;
    }
    .dim-card.a .dim-bullet::before { color: ${h(C.blue)}; }
    .dim-card.b .dim-bullet::before { color: ${h(C.blueMed)}; }

    /* ===== CASE STUDY ===== */
    .case-section {
      padding: 32px 52px;
    }
    .case-header {
      text-align: center;
      font-size: 16pt;
      font-weight: 800;
      color: ${h(C.navyText)};
      margin-bottom: 22px;
    }
    .case-content {
      display: flex;
      gap: 20px;
      align-items: stretch;
    }
    .case-chat-wrapper {
      flex: 1.1;
      position: relative;
    }
    .case-chat-frame {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 22px 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      position: relative;
    }
    .case-chat-logo { height: 22px; margin-bottom: 16px; }
    .chat-q {
      background: ${h(C.blueLight)};
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 8.5pt;
      line-height: 1.6;
      color: ${h(C.navyText)};
      margin-bottom: 14px;
      font-style: italic;
    }
    .chat-a {
      background: #F7F8FC;
      border-left: 3px solid ${h(C.blue)};
      border-radius: 0 12px 12px 0;
      padding: 14px 16px;
      font-size: 8.5pt;
      line-height: 1.6;
      color: ${h(C.navyText)};
    }
    .case-results-box {
      flex: 0.9;
      background: ${h(C.blueLight)};
      border-radius: 16px;
      padding: 24px 22px;
      display: flex;
      flex-direction: column;
    }
    .case-results-titulo {
      font-size: 13pt;
      font-weight: 800;
      color: ${h(C.navyText)};
      margin-bottom: 16px;
    }
    .case-results-titulo span { color: ${h(C.blue)}; }
    .result-item {
      font-size: 8.5pt;
      line-height: 1.55;
      color: ${h(C.navyText)};
      margin-bottom: 8px;
      padding-left: 16px;
      position: relative;
    }
    .result-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      width: 7px;
      height: 7px;
      background: ${h(C.orange)};
      border-radius: 50%;
    }
    .case-conclusion {
      text-align: center;
      font-size: 9pt;
      color: ${h(C.grayMid)};
      font-style: italic;
      margin-top: 16px;
    }

    /* ===== COMPARISON TABLE ===== */
    .compare-section {
      padding: 32px 52px;
      background: #F8FAFF;
    }
    .compare-title {
      text-align: center;
      font-size: 16pt;
      font-weight: 800;
      color: ${h(C.navyText)};
      margin-bottom: 6px;
    }
    .compare-subtitle {
      text-align: center;
      font-size: 9pt;
      color: ${h(C.grayMid)};
      margin-bottom: 22px;
    }
    .compare-table {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      border-collapse: separate;
      border-spacing: 0;
    }
    .compare-table th {
      font-size: 10pt;
      font-weight: 700;
      padding: 10px 16px;
      text-align: center;
      color: ${h(C.navyText)};
    }
    .compare-table td {
      padding: 10px 16px;
      font-size: 9pt;
      border-top: 1px solid ${h(C.border)};
    }
    .compare-table td:first-child {
      font-weight: 600;
      color: ${h(C.navyText)};
      background: ${h(C.blueLight)};
      border-radius: 8px 0 0 8px;
    }
    .compare-table td:nth-child(2),
    .compare-table td:nth-child(3) {
      text-align: center;
      font-size: 14pt;
    }
    .x-mark { color: #E53E3E; }
    .check-mark { color: ${h(C.blue)}; }
    .compare-table tr:last-child td:first-child { border-radius: 8px 0 0 8px; }
    .compare-table tr td:nth-child(2) { color: #718096; font-size: 8pt; }

    /* ===== IMPLEMENTATION + IDEAL ===== */
    .impl-section {
      padding: 28px 52px;
      display: flex;
      gap: 16px;
    }
    .impl-box {
      flex: 1;
      border-radius: 16px;
      padding: 24px;
    }
    .impl-box.left { background: ${h(C.blueLight)}; }
    .impl-box.right { background: ${h(C.blue)}; }
    .impl-titulo {
      font-size: 12pt;
      font-weight: 700;
      margin-bottom: 14px;
    }
    .impl-box.left .impl-titulo { color: ${h(C.navyText)}; }
    .impl-box.right .impl-titulo { color: #FFFFFF; }
    .impl-bullet {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 8.5pt;
      line-height: 1.55;
    }
    .impl-box.left .impl-bullet { color: ${h(C.navyText)}; }
    .impl-box.right .impl-bullet { color: rgba(255,255,255,0.92); }
    .impl-dot {
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
    }
    .impl-box.left .impl-dot { background: ${h(C.blue)}; }
    .impl-box.right .impl-dot { background: ${h(C.orange)}; }
    .impl-time {
      font-size: 8pt;
      color: ${h(C.grayMid)};
      margin-top: 10px;
      font-style: italic;
    }
    .impl-box.right .impl-industries {
      font-size: 7.5pt;
      color: rgba(255,255,255,0.55);
      margin-top: 10px;
      line-height: 1.4;
    }

    /* ===== HOW IT WORKS 3 STEPS ===== */
    .steps-section { padding: 30px 52px; }
    .steps-title {
      text-align: center;
      font-size: 17pt;
      font-weight: 800;
      color: ${h(C.navyText)};
      margin-bottom: 4px;
    }
    .steps-subtitle {
      text-align: center;
      font-size: 10pt;
      color: ${h(C.grayMid)};
      margin-bottom: 22px;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 20px;
    }
    .step-item { text-align: center; }
    .step-num {
      font-size: 46pt;
      font-weight: 900;
      color: ${h(C.blueLight)};
      line-height: 1;
      margin-bottom: 8px;
    }
    .step-label {
      font-size: 9pt;
      font-weight: 600;
      color: ${h(C.navyText)};
      line-height: 1.45;
    }
    .no-hace-box {
      max-width: 500px;
      margin: 0 auto;
      background: ${h(C.navyText)};
      border-radius: 12px;
      padding: 14px 22px;
      text-align: center;
    }
    .no-hace-title {
      font-size: 9pt;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 5px;
    }
    .no-hace-text {
      font-size: 7.5pt;
      color: rgba(255,255,255,0.7);
      line-height: 1.55;
    }

    /* ===== ANCHOR CASE ===== */
    .anchor-section {
      padding: 28px 52px;
      background: #F8FAFF;
    }
    .anchor-title {
      text-align: center;
      font-size: 16pt;
      font-weight: 800;
      color: ${h(C.navyText)};
      margin-bottom: 4px;
    }
    .anchor-subtitle {
      text-align: center;
      font-size: 9pt;
      color: ${h(C.grayMid)};
      margin-bottom: 20px;
    }
    .anchor-content {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .anchor-phone {
      flex-shrink: 0;
      width: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .anchor-phone img {
      width: 100%;
      height: auto;
      display: block;
    }
    .anchor-results-box {
      flex: 1;
      background: ${h(C.blueLight)};
      border-radius: 14px;
      padding: 20px 22px;
    }
    .anchor-results-title {
      font-size: 11pt;
      font-weight: 700;
      color: ${h(C.orange)};
      margin-bottom: 12px;
    }
    .anchor-item {
      font-size: 8.5pt;
      line-height: 1.55;
      color: ${h(C.navyText)};
      margin-bottom: 6px;
      padding-left: 14px;
      position: relative;
    }
    .anchor-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      width: 6px;
      height: 6px;
      background: ${h(C.blue)};
      border-radius: 50%;
    }
    .anchor-conclusion {
      text-align: center;
      font-size: 8.5pt;
      color: ${h(C.grayMid)};
      font-style: italic;
      margin-top: 14px;
    }

    /* ===== DIFFERENTIATOR ===== */
    .diff-section {
      padding: 24px 52px;
      text-align: center;
    }
    .diff-text {
      font-size: 17pt;
      font-weight: 800;
      color: ${h(C.navyText)};
      line-height: 1.3;
    }

    /* ===== CTA ===== */
    .cta-section {
      padding: 24px 52px 32px;
      text-align: center;
    }
    .cta-badge {
      display: inline-block;
      background: ${h(C.orange)};
      color: #FFFFFF;
      font-size: 8pt;
      font-weight: 700;
      padding: 7px 20px;
      border-radius: 20px;
      margin-bottom: 12px;
      letter-spacing: 0.3px;
    }
    .cta-text {
      font-size: 14pt;
      font-weight: 700;
      color: ${h(C.navyText)};
      line-height: 1.4;
      max-width: 520px;
      margin: 0 auto;
    }
  `;

  // SVG Icons
  const icons = {
    search: `<svg viewBox="0 0 24 24"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>`,
    light: `<svg viewBox="0 0 24 24"><path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
    doc: `<svg viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    tag: `<svg viewBox="0 0 24 24"><path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path d="M6 6h.008v.008H6V6z"/></svg>`,
    shield: `<svg viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>`,
    list: `<svg viewBox="0 0 24 24"><path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>`,
  };
  const knowledgeIcons = [icons.doc, icons.tag, icons.shield, icons.list, icons.light, icons.search];
  const flowIcons = [icons.search, icons.light, icons.doc, icons.check];

  // Comparison table rows (static — from BucketsAI knowledge base)
  const compareRows = [
    [L.compareAccess, false, true],
    [L.compareGov, false, true],
    [L.compareLarge, false, true],
    [L.compareTrace, false, true],
    [L.compareLic, L.comparePer, L.compareUnlimited],
  ];

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="page">

  <!-- ===== HERO ===== -->
  <div class="hero">
    <div class="hero-left">
      ${logo ? `<img class="hero-logo" src="${logo}" />` : `<div style="font-size:24pt;font-weight:900;color:${h(C.blue)};margin-bottom:20px;">BucketsAi</div>`}
      <div class="hero-titulo">${op.hero_titulo}</div>
      <div class="hero-desc">${op.hero_descripcion}</div>
    </div>
    <div class="hero-right">
      ${heroPhones ? `<img src="${heroPhones}" />` : ''}
    </div>
  </div>

  <!-- ===== PAIN POINTS ===== -->
  <div class="pain-section">
    <div class="section-header">${L.painHeader}</div>
    <div class="pain-grid">
      ${(op.pain_points || []).map((p, i) => {
        const isObj = typeof p === 'object';
        const bold = isObj ? p.bold : p;
        const desc = isObj ? p.desc : '';
        return `<div class="pain-card ${i === 2 ? 'highlight' : ''}"><strong>${bold}</strong>${desc ? ' ' + desc : ''}</div>`;
      }).join('')}
    </div>
    <div class="pain-quote">${op.pain_quote}</div>
  </div>

  <!-- ===== VALUE PROPOSITION ===== -->
  <div class="value-section">
    <div class="value-left">
      <div class="value-titulo">${op.value_titulo}</div>
      <div class="value-desc">${op.value_descripcion}</div>
    </div>
    <div class="value-right">
      ${(op.knowledge_items || []).map((item, i) => `
        <div class="knowledge-item">
          <div class="knowledge-icon">${knowledgeIcons[i % knowledgeIcons.length]}</div>
          <div class="knowledge-text">${item}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- ===== FLOW ===== -->
  <div class="flow-section">
    <div class="flow-header">${op.flow_titulo}</div>
    <div class="flow-grid">
      ${(op.flow_steps || []).map((s, i) => `
        <div class="flow-card ${i === 2 ? 'highlight' : ''}">
          <div class="flow-card-icon">${flowIcons[i]}</div>
          <div class="flow-card-titulo">${s.titulo}</div>
          <div class="flow-card-desc">${s.desc}</div>
        </div>
      `).join('')}
    </div>
    <div class="flow-tagline">${op.flow_tagline}</div>
  </div>

  <!-- ===== DIMENSIONS ===== -->
  ${op.dim_a_titulo ? `
  <div class="dims-section">
    <div class="section-header">${L.caseUseHeader}${empresa}</span></div>
    <div class="dims-intro">${L.dimsIntro}</div>
    <div class="dims-grid">
      <div class="dim-card a">
        <div class="dim-header">
          <div class="dim-header-titulo">${op.dim_a_titulo}</div>
          <div class="dim-header-rol">${op.dim_a_rol}</div>
        </div>
        <div class="dim-body">
          <div class="dim-desc">${op.dim_a_desc}</div>
          ${op.dim_a_caso ? `
            <div class="dim-caso-setup">${op.dim_a_caso.setup}</div>
            <div class="dim-q">${op.dim_a_caso.pregunta}</div>
            <div class="dim-a-label">${op.dim_a_caso.respuesta_titulo}</div>
            ${(op.dim_a_caso.respuesta_bullets || []).map(b => `<div class="dim-bullet">${b}</div>`).join('')}
          ` : ''}
        </div>
      </div>
      <div class="dim-card b">
        <div class="dim-header">
          <div class="dim-header-titulo">${op.dim_b_titulo}</div>
          <div class="dim-header-rol">${op.dim_b_rol}</div>
        </div>
        <div class="dim-body">
          <div class="dim-desc">${op.dim_b_desc}</div>
          ${op.dim_b_caso ? `
            <div class="dim-caso-setup">${op.dim_b_caso.setup}</div>
            <div class="dim-q">${op.dim_b_caso.pregunta}</div>
            <div class="dim-a-label">${op.dim_b_caso.respuesta_titulo}</div>
            ${(op.dim_b_caso.respuesta_bullets || []).map(b => `<div class="dim-bullet">${b}</div>`).join('')}
          ` : ''}
        </div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- ===== CASE STUDY ===== -->
  <div class="case-section">
    <div class="case-header">${op.caso_titulo}</div>
    <div class="case-content">
      <div class="case-chat-wrapper">
        <div class="case-chat-frame">
          ${logo ? `<img class="case-chat-logo" src="${logo}" />` : ''}
          <div class="chat-q">${op.caso_pregunta}</div>
          <div class="chat-a">${op.caso_respuesta}</div>
        </div>
      </div>
      <div class="case-results-box">
        <div class="case-results-titulo">${L.whatChanges}</div>
        ${(op.caso_resultados || []).map(r => `
          <div class="result-item"><strong>${r.bold}</strong> ${r.desc}</div>
        `).join('')}
      </div>
    </div>
    <div class="case-conclusion">${op.caso_conclusion}</div>
  </div>

  <!-- ===== COMPARISON TABLE ===== -->
  <div class="compare-section">
    <div class="compare-title">${L.whyNotChatGPT}</div>
    <div class="compare-subtitle">${op.diferenciador_subtitulo || 'BucketsAi no es una IA generica. Es infraestructura comercial.'}</div>
    <table class="compare-table">
      <tr>
        <th></th>
        <th>ChatGPT</th>
        <th>BucketsAi</th>
      </tr>
      ${compareRows.map(([label, chatgpt, buckets]) => `
        <tr>
          <td>${label}</td>
          <td>${typeof chatgpt === 'boolean' ? (chatgpt ? '<span class="check-mark">&#10003;</span>' : '<span class="x-mark">&#10007;</span>') : `<span style="font-size:8pt;color:#718096">${chatgpt}</span>`}</td>
          <td>${typeof buckets === 'boolean' ? (buckets ? '<span class="check-mark">&#10003;</span>' : '<span class="x-mark">&#10007;</span>') : `<span style="font-size:8pt;color:${h(C.blue)};font-weight:600">${buckets}</span>`}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <!-- ===== HOW IT WORKS 3 STEPS ===== -->
  <div class="steps-section">
    <div class="steps-title">${L.howItWorks}</div>
    <div class="steps-subtitle">${L.howSubtitle}</div>
    <div class="steps-grid">
      <div class="step-item">
        <div class="step-num">01</div>
        <div class="step-label">${L.step1}</div>
      </div>
      <div class="step-item">
        <div class="step-num">02</div>
        <div class="step-label">${L.step2}</div>
      </div>
      <div class="step-item">
        <div class="step-num">03</div>
        <div class="step-label">${L.step3}</div>
      </div>
    </div>
    <div class="no-hace-box">
      <div class="no-hace-title">${L.noHaceTitle}</div>
      <div class="no-hace-text">
        ${L.noHaceText}
      </div>
    </div>
  </div>

  <!-- ===== ANCHOR CASE (Tiendas Ara) ===== -->
  <div class="anchor-section">
    <div class="anchor-title">${L.anchorTitle}</div>
    <div class="anchor-subtitle">${L.anchorSubtitle}</div>
    <div class="anchor-content">
      <div class="anchor-phone">
        ${chatPhone ? `<img src="${chatPhone}" />` : ''}
      </div>
      <div class="anchor-results-box">
        <div class="anchor-results-title">${L.anchorResults}</div>
        ${L.anchorItems.map(item => `<div class="anchor-item">${item}</div>`).join('')}
      </div>
    </div>
    <div class="anchor-conclusion">${L.anchorConclusion}</div>
  </div>

  <!-- ===== DIFFERENTIATOR ===== -->
  <div class="diff-section">
    <div class="diff-text">${L.diffText}</div>
  </div>

  <!-- ===== IMPLEMENTATION + IDEAL ===== -->
  <div class="impl-section">
    <div class="impl-box left">
      <div class="impl-titulo">${L.implTitle}</div>
      ${(op.implementacion || []).map(b => `
        <div class="impl-bullet">
          <div class="impl-dot"></div>
          <div>${b}</div>
        </div>
      `).join('')}
      <div class="impl-time">${L.implTime}</div>
    </div>
    <div class="impl-box right">
      <div class="impl-titulo">${L.idealTitle}</div>
      ${(op.ideal_para || []).map(b => `
        <div class="impl-bullet">
          <div class="impl-dot"></div>
          <div>${b}</div>
        </div>
      `).join('')}
      ${op.ideal_industrias ? `<div class="impl-industries">${op.ideal_industrias}</div>` : ''}
    </div>
  </div>

  <!-- ===== CTA ===== -->
  <div class="cta-section">
    <div class="cta-badge">${op.cta_badge}</div>
    <div class="cta-text">${op.cta_text}</div>
  </div>

</div></body></html>`;

  return html;
}

export async function generateOnePager(onepagerContent, empresa, useCaseContent, idioma) {
  const outDir = join(__dirname, '..', 'output');
  mkdirSync(outDir, { recursive: true });

  const safe = empresa.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const filename = `BucketsAI_${safe}_OnePager.pdf`;
  const outPath = join(outDir, filename);

  const html = buildOnePagerHTML(onepagerContent, empresa, useCaseContent, idioma);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

  // Get actual height for a single tall-page PDF
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

  await page.pdf({
    path: outPath,
    width: '816px',
    height: `${bodyHeight + 40}px`,
    printBackground: true,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
  });

  await browser.close();
  console.log(`   One-pager PDF saved: ${outPath}`);
  return outPath;
}
