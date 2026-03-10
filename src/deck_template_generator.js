import { Automizer, modify } from 'pptx-automizer';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_DIR = join(__dirname, '..', 'templates');
const OUTPUT_DIR = join(__dirname, '..', 'output');

// Helper: replace text in a named element
function replaceIn(modify, name, value) {
  return (slide) => {
    try {
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: String(value || '') } }]),
      ]);
    } catch {
      // Element might not exist in template — skip silently
    }
  };
}

export async function generateDeckTemplate(deckContent, empresa) {
  const d = deckContent;
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const pres = new Automizer({
    templateDir: TEMPLATE_DIR,
    outputDir: OUTPUT_DIR,
    removeExistingSlides: true,
    cleanup: true,
  });

  pres.loadRoot('deck_template.pptx');
  pres.load('deck_template.pptx', 'tpl');

  // ── Slide 1: Cover ──
  pres.addSlide('tpl', 1, (slide) => {
    slide.modifyElement('cover_empresa', [
      modify.replaceText([{ replace: 'empresa', by: { text: empresa.toUpperCase() } }]),
    ]);
    slide.modifyElement('cover_tagline', [
      modify.replaceText([{ replace: 'tagline', by: { text: d.cover_tagline } }]),
    ]);
  });

  // ── Slide 2: Problem ──
  pres.addSlide('tpl', 2, (slide) => {
    slide.modifyElement('problem_headline', [
      modify.replaceText([{ replace: 'problem_headline', by: { text: d.problem_headline } }]),
    ]);
    (d.problem_has_items || []).forEach((item, i) => {
      const name = `problem_has_${i + 1}`;
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: item } }]),
      ]);
    });
    (d.problem_but_items || []).forEach((item, i) => {
      const name = `problem_but_${i + 1}`;
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: item } }]),
      ]);
    });
    slide.modifyElement('problem_closing', [
      modify.replaceText([{ replace: 'problem_closing', by: { text: d.problem_closing } }]),
    ]);
  });

  // ── Slide 3: Depth ──
  pres.addSlide('tpl', 3, (slide) => {
    slide.modifyElement('depth_headline', [
      modify.replaceText([{ replace: 'depth_headline', by: { text: d.depth_headline } }]),
    ]);
    (d.depth_reasons || []).forEach((reason, i) => {
      const name = `depth_reason_${i + 1}`;
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: reason } }]),
      ]);
    });
  });

  // ── Slide 4: Solution ──
  pres.addSlide('tpl', 4, (slide) => {
    slide.modifyElement('solution_headline', [
      modify.replaceText([{ replace: 'solution_headline', by: { text: d.solution_headline } }]),
    ]);
    slide.modifyElement('solution_description', [
      modify.replaceText([{ replace: 'solution_description', by: { text: d.solution_description } }]),
    ]);
    (d.solution_capabilities || []).forEach((cap, i) => {
      const name = `solution_cap_${i + 1}`;
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: cap } }]),
      ]);
    });
  });

  // ── Slide 5: How It Works ──
  pres.addSlide('tpl', 5, (slide) => {
    slide.modifyElement('how_step_1', [
      modify.replaceText([{ replace: 'how_step_1', by: { text: d.how_step1 } }]),
    ]);
    slide.modifyElement('how_step_2', [
      modify.replaceText([{ replace: 'how_step_2', by: { text: d.how_step2 } }]),
    ]);
    slide.modifyElement('how_step_3', [
      modify.replaceText([{ replace: 'how_step_3', by: { text: d.how_step3 } }]),
    ]);
    slide.modifyElement('how_not_items', [
      modify.replaceText([{ replace: 'how_not_items', by: { text: (d.how_not_items || []).join('   |   ') } }]),
    ]);
  });

  // ── Slide 6: Demo ──
  pres.addSlide('tpl', 6, (slide) => {
    slide.modifyElement('demo_headline', [
      modify.replaceText([{ replace: 'demo_headline', by: { text: d.demo_headline } }]),
    ]);
    slide.modifyElement('demo_description', [
      modify.replaceText([{ replace: 'demo_description', by: { text: d.demo_description } }]),
    ]);
    slide.modifyElement('demo_user_message', [
      modify.replaceText([{ replace: 'demo_user_message', by: { text: d.demo_user_message } }]),
    ]);
    slide.modifyElement('demo_ai_response', [
      modify.replaceText([{ replace: 'demo_ai_response', by: { text: d.demo_ai_response } }]),
    ]);
  });

  // ── Slide 7: Dimensions ──
  pres.addSlide('tpl', 7, (slide) => {
    slide.modifyElement('dim_a_label', [
      modify.replaceText([{ replace: 'dim_a_label', by: { text: 'DIMENSION A' } }]),
    ]);
    slide.modifyElement('dim_a_titulo', [
      modify.replaceText([{ replace: 'dim_a_titulo', by: { text: d.dim_a_titulo } }]),
    ]);
    slide.modifyElement('dim_a_rol', [
      modify.replaceText([{ replace: 'dim_a_rol', by: { text: `Rol: ${d.dim_a_rol}` } }]),
    ]);
    slide.modifyElement('dim_a_desc', [
      modify.replaceText([{ replace: 'dim_a_desc', by: { text: d.dim_a_desc } }]),
    ]);
    slide.modifyElement('dim_b_label', [
      modify.replaceText([{ replace: 'dim_b_label', by: { text: 'DIMENSION B' } }]),
    ]);
    slide.modifyElement('dim_b_titulo', [
      modify.replaceText([{ replace: 'dim_b_titulo', by: { text: d.dim_b_titulo } }]),
    ]);
    slide.modifyElement('dim_b_rol', [
      modify.replaceText([{ replace: 'dim_b_rol', by: { text: `Rol: ${d.dim_b_rol}` } }]),
    ]);
    slide.modifyElement('dim_b_desc', [
      modify.replaceText([{ replace: 'dim_b_desc', by: { text: d.dim_b_desc } }]),
    ]);
  });

  // ── Slide 8: Before/After ──
  pres.addSlide('tpl', 8, (slide) => {
    slide.modifyElement('beforeafter_title', [
      modify.replaceText([{ replace: 'beforeafter_title', by: { text: 'Antes vs Despues' } }]),
    ]);
    (d.before_items || []).forEach((item, i) => {
      const name = `before_${i + 1}`;
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: item } }]),
      ]);
    });
    (d.after_items || []).forEach((item, i) => {
      const name = `after_${i + 1}`;
      slide.modifyElement(name, [
        modify.replaceText([{ replace: name, by: { text: item } }]),
      ]);
    });
  });

  // ── Slide 9: Impact ──
  pres.addSlide('tpl', 9, (slide) => {
    slide.modifyElement('impact_title', [
      modify.replaceText([{ replace: 'impact_title', by: { text: d.impact_title } }]),
    ]);
    slide.modifyElement('impact_subtitle', [
      modify.replaceText([{ replace: 'impact_subtitle', by: { text: d.impact_subtitle } }]),
    ]);
    // 3 metric columns
    const cols = [
      { n: 1, title: d.impact_col1_title, metric: d.impact_col1_metric, before: d.impact_col1_before, after: d.impact_col1_after, unit: d.impact_col1_unit },
      { n: 2, title: d.impact_col2_title, metric: d.impact_col2_metric, before: d.impact_col2_before, after: d.impact_col2_after, unit: d.impact_col2_unit },
      { n: 3, title: d.impact_col3_title, metric: d.impact_col3_metric, before: d.impact_col3_before, after: d.impact_col3_after, unit: d.impact_col3_unit },
    ];
    cols.forEach(({ n, title, metric, before, after, unit }) => {
      slide.modifyElement(`impact_${n}_title`, [
        modify.replaceText([{ replace: `impact_${n}_title`, by: { text: title } }]),
      ]);
      slide.modifyElement(`impact_${n}_metric`, [
        modify.replaceText([{ replace: `impact_${n}_metric`, by: { text: metric } }]),
      ]);
      slide.modifyElement(`impact_${n}_before_val`, [
        modify.replaceText([{ replace: `impact_${n}_before_val`, by: { text: String(before || '') } }]),
      ]);
      slide.modifyElement(`impact_${n}_after_val`, [
        modify.replaceText([{ replace: `impact_${n}_after_val`, by: { text: String(after || '') } }]),
      ]);
      slide.modifyElement(`impact_${n}_unit`, [
        modify.replaceText([{ replace: `impact_${n}_unit`, by: { text: unit || '' } }]),
      ]);
    });
    slide.modifyElement('impact_closing', [
      modify.replaceText([{ replace: 'impact_closing', by: { text: d.impact_closing } }]),
    ]);
  });

  // ── Slide 10: Comparison ──
  // Table data is pre-filled in template — only headline is dynamic
  pres.addSlide('tpl', 10, (slide) => {
    slide.modifyElement('comparison_headline', [
      modify.replaceText([{ replace: 'comparison_headline', by: { text: d.comparison_headline } }]),
    ]);
  });

  // ── Slide 11: Security ──
  pres.addSlide('tpl', 11, (slide) => {
    slide.modifyElement('security_subtitle', [
      modify.replaceText([{ replace: 'security_subtitle', by: { text: 'Disenado para entornos empresariales' } }]),
    ]);
    const pillars = [
      { label: 'PRIVACIDAD', desc: 'Datos no salen\nde tu entorno' },
      { label: 'AISLAMIENTO', desc: 'No se entrenan\nmodelos externos' },
      { label: 'CONTROL', desc: 'Accesos\npor rol' },
      { label: 'AUDITORIA', desc: 'Trazabilidad\ncompleta' },
      { label: 'CUMPLIMIENTO', desc: 'Alineado con\nSOC 2 y GDPR' },
    ];
    pillars.forEach((p, i) => {
      slide.modifyElement(`security_label_${i + 1}`, [
        modify.replaceText([{ replace: `security_label_${i + 1}`, by: { text: p.label } }]),
      ]);
      slide.modifyElement(`security_desc_${i + 1}`, [
        modify.replaceText([{ replace: `security_desc_${i + 1}`, by: { text: p.desc } }]),
      ]);
    });
  });

  // ── Slide 12: CTA ──
  pres.addSlide('tpl', 12, (slide) => {
    slide.modifyElement('cta_question', [
      modify.replaceText([{ replace: 'cta_question', by: { text: d.cta_question } }]),
    ]);
    slide.modifyElement('cta_description', [
      modify.replaceText([{ replace: 'cta_description', by: { text: d.cta_description } }]),
    ]);
    slide.modifyElement('cta_button', [
      modify.replaceText([{ replace: 'cta_button', by: { text: 'Agenda tu demo personalizada' } }]),
    ]);
    slide.modifyElement('cta_name', [
      modify.replaceText([{ replace: 'cta_name', by: { text: 'Sebastian Arce' } }]),
    ]);
    slide.modifyElement('cta_role', [
      modify.replaceText([{ replace: 'cta_role', by: { text: 'Founder CSO' } }]),
    ]);
    slide.modifyElement('cta_email', [
      modify.replaceText([{ replace: 'cta_email', by: { text: 'sebastian@hoytrabajas.com' } }]),
    ]);
    slide.modifyElement('cta_phone', [
      modify.replaceText([{ replace: 'cta_phone', by: { text: '+1(415) 653 9295' } }]),
    ]);
    slide.modifyElement('cta_url', [
      modify.replaceText([{ replace: 'cta_url', by: { text: 'buckets-ai.com' } }]),
    ]);
  });

  // ── Write output ──
  const safe = empresa.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const fileName = `BucketsAI_${safe}_Deck_Template.pptx`;

  const result = await pres.write(fileName);
  const outputPath = join(OUTPUT_DIR, fileName);

  console.log(`   Template deck saved: ${outputPath} (${result.slides} slides)`);
  return outputPath;
}
