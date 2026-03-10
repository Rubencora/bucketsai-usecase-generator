import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ──
const GAMMA_API_URL = 'https://public-api.gamma.app/v1.0';
const GAMMA_API_KEY = process.env.GAMMA_API_KEY;

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

function buildGammaPrompt(d, empresa) {
  const sector = d.sector_label || 'la industria';
  const slides = [];

  // Slide 1 — Cover
  slides.push(`# BucketsAI para ${empresa}
**${d.cover_tagline}**
buckets-ai.com
[Layout: centered hero, dark navy background, large white title, tagline below]`);

  // Slide 2 — Problem
  slides.push(`# ${d.problem_headline}

**Lo que los equipos de ${sector} tienen:**
${(d.problem_has_items || []).map(i => `- ${i}`).join('\n')}

**Pero en el dia a dia:**
${(d.problem_but_items || []).map(i => `- ${i}`).join('\n')}

> ${d.problem_closing}
[Layout: two-column, bullet lists left, illustration right]`);

  // Slide 3 — Depth
  slides.push(`# ${d.depth_headline}

${(d.depth_reasons || []).map((r, i) => `**${i + 1}.** ${r}`).join('\n\n')}
[Layout: numbered list with icons, one column, generous spacing]`);

  // Slide 4 — Solution
  slides.push(`# ${d.solution_headline}

${d.solution_description}

${(d.solution_capabilities || []).map(c => `- **${c}**`).join('\n')}
[Layout: text left with capabilities as icon cards, product illustration right]`);

  // Slide 5 — How it works
  slides.push(`# Como funciona

**01** ${d.how_step1}

**02** ${d.how_step2}

**03** ${d.how_step3}
[Layout: three numbered columns side by side, large bold numbers, icon above each]`);

  // Slide 6 — Demo
  slides.push(`# ${d.demo_headline}

${d.demo_description}

**Usuario:** "${d.demo_user_message}"

**BucketsAI:** "${d.demo_ai_response}"
[Layout: text left, chat mockup illustration right]`);

  // Slide 7 — Two dimensions
  slides.push(`# Dos dimensiones de valor

**${d.dim_a_titulo}** — ${d.dim_a_rol}
${d.dim_a_desc}

**${d.dim_b_titulo}** — ${d.dim_b_rol}
${d.dim_b_desc}
[Layout: two side-by-side cards with icons]`);

  // Slide 8 — Before vs After
  slides.push(`# Antes vs Despues

**Antes:**
${(d.before_items || []).map(i => `- ${i}`).join('\n')}

**Despues con BucketsAI:**
${(d.after_items || []).map(i => `- ${i}`).join('\n')}
[Layout: two-column comparison, red accent left, green accent right]`);

  // Slide 9 — Impact metrics
  slides.push(`# ${d.impact_title}

${d.impact_subtitle}

**${d.impact_col1_title}:** ${d.impact_col1_before} → ${d.impact_col1_after} ${d.impact_col1_unit || ''}

**${d.impact_col2_title}:** ${d.impact_col2_before} → ${d.impact_col2_after} ${d.impact_col2_unit || ''}

**${d.impact_col3_title}:** ${d.impact_col3_before} → ${d.impact_col3_after} ${d.impact_col3_unit || ''}

${d.impact_closing}
[Layout: three large metric cards side by side, big bold numbers, small labels below]`);

  // Slide 10 — Comparison
  slides.push(`# ${d.comparison_headline}

| Criterio | BucketsAI | ChatGPT |
|----------|-----------|---------|
| Acceso por rol | Si | No |
| Gobernanza comercial | Si | No |
| Uso en equipos grandes | Si | Limitado |
| Trazabilidad | Completa | Ninguna |
| Politica de datos | Privada | Compartida |
| Exposicion de riesgo | Baja | Alta |
| Licenciamiento | Por equipo | Por usuario |
[Layout: clean comparison table, blue headers, checkmarks vs X marks]`);

  // Slide 11 — Security
  slides.push(`# Seguridad y control

**Privacidad de datos** — Informacion aislada por empresa

**Sin entrenamiento externo** — Tus datos nunca entrenan modelos

**Acceso por roles** — Permisos granulares por equipo

**Trazabilidad completa** — Registro de cada interaccion

**Alineado SOC 2 y GDPR** — Cumplimiento internacional
[Layout: five icon rows with descriptions, shield/lock icons, clean spacing]`);

  // Slide 12 — CTA
  slides.push(`# ${d.cta_question}

${d.cta_description}

**Agenda tu demo personalizada**

Sebastian Arce, Founder CSO
sebastian@hoytrabajas.com | +1(415) 653 9295
buckets-ai.com
[Layout: centered, dark navy background, large CTA button, contact info below]`);

  return slides.join('\n\n---\n\n');
}

function buildBrandInstructions() {
  return `CRITICAL RULES (highest priority):
1. TEXT CONTRAST: When text is placed on a colored background (blue, dark, navy), the text MUST be WHITE (#FFFFFF). Never use black or dark text on blue/dark backgrounds. This applies to cards, highlighted sections, and any colored containers.
2. Images must NEVER overlap text. Place images in dedicated zones with clear separation from text.
3. AI-generated images must NEVER contain any text, words, letters, or labels. Only abstract shapes, icons, and illustrations. No text inside images.
4. Use generous whitespace. Max 60% of slide area used. Wide margins.

TYPOGRAPHY:
- Titles: bold, dark color on light backgrounds, WHITE on dark backgrounds
- Body: 14-16pt minimum with good line spacing
- Metric numbers: 48-60pt bold
- RULE: Any text on blue/purple/dark background = white text. No exceptions.

LAYOUT:
- Card-based with rounded corners
- Numbered steps in three equal columns
- Metric cards side by side with big numbers
- Before/After: two columns, left=light background, right=colored background with WHITE text
- Comparison: clean table with alternating rows

COLOR:
- Brand blue #4470DC for icons, buttons, card backgrounds
- When using blue card backgrounds, ALL text inside must be white
- Light backgrounds for most content slides
- Dark navy only for cover and CTA slides

IMAGES: Abstract geometric illustrations only. NO text in images. No logos in AI images. Simple, clean, corporate style.

Language: Spanish`;
}

async function callGammaGenerate(inputText, additionalInstructions) {
  const url = `${GAMMA_API_URL}/generations`;

  console.log('   Calling Gamma Generate API...');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': GAMMA_API_KEY,
    },
    body: JSON.stringify({
      inputText,
      textMode: 'preserve',
      format: 'presentation',
      numCards: 12,
      exportAs: 'pptx',
      themeId: 'ga8n78b6ffil1z0',
      cardSplit: 'inputTextBreaks',
      cardOptions: {
        dimensions: '16x9',
        headerFooter: {
          topRight: { type: 'image', source: 'themeLogo', size: 'sm' },
          hideFromFirstCard: true,
          hideFromLastCard: true,
        },
      },
      textOptions: {
        language: 'es',
        amount: 'detailed',
        tone: 'professional, executive, modern B2B SaaS',
        audience: 'C-level executives, HR directors, sales leaders',
      },
      imageOptions: {
        source: 'noImages',
      },
      additionalInstructions,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gamma API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log(`   Gamma generation started: ${data.generationId}`);
  return data;
}

async function pollGeneration(generationId) {
  const url = `${GAMMA_API_URL}/generations/${generationId}`;

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    const res = await fetch(url, {
      headers: { 'X-API-KEY': GAMMA_API_KEY },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gamma poll error (${res.status}): ${text}`);
    }

    const data = await res.json();
    console.log(`   Poll ${attempt}/${MAX_POLL_ATTEMPTS}: status=${data.status}`);

    if (data.status === 'completed') {
      console.log(`   Gamma credits used: ${data.credits?.deducted || '?'}, remaining: ${data.credits?.remaining || '?'}`);
      return data;
    }

    if (data.status === 'failed') {
      throw new Error(`Gamma generation failed: ${data.error?.message || 'unknown error'}`);
    }
  }

  throw new Error(`Gamma generation timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
}

async function downloadExport(gammaUrl, generationId, outputPath) {
  // Try the direct export URL pattern first
  const pptxUrl = `${gammaUrl}/export/pptx`;

  console.log(`   Downloading PPTX from Gamma...`);
  const res = await fetch(pptxUrl, {
    headers: { 'X-API-KEY': GAMMA_API_KEY },
    redirect: 'follow',
  });

  if (!res.ok) {
    // Fallback: try fetching from the generation endpoint for export URLs
    console.log(`   Direct export failed (${res.status}), trying generation endpoint...`);
    const genRes = await fetch(`${GAMMA_API_URL}/generations/${generationId}`, {
      headers: { 'X-API-KEY': GAMMA_API_KEY },
    });
    const genData = await genRes.json();

    // Look for export URL in various possible response fields
    const exportUrl = genData.pptxUrl || genData.exportUrl || genData.exports?.pptx;
    if (!exportUrl) {
      throw new Error('No PPTX export URL found in Gamma response. gammaUrl: ' + gammaUrl);
    }

    const dlRes = await fetch(exportUrl, { redirect: 'follow' });
    if (!dlRes.ok) {
      throw new Error(`Gamma PPTX download failed (${dlRes.status})`);
    }

    const buffer = Buffer.from(await dlRes.arrayBuffer());
    writeFileSync(outputPath, buffer);
    return outputPath;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  return outputPath;
}

export async function generateDeckGamma(deckContent, empresa) {
  if (!GAMMA_API_KEY) {
    throw new Error('GAMMA_API_KEY not set in .env. Get your key at https://gamma.app/settings (requires Pro plan)');
  }

  const prompt = buildGammaPrompt(deckContent, empresa);
  const brandInstructions = buildBrandInstructions();

  // Step 1: Start generation
  const { generationId } = await callGammaGenerate(prompt, brandInstructions);

  // Step 2: Poll until complete
  const result = await pollGeneration(generationId);
  const gammaUrl = result.gammaUrl;

  // Step 3: Download PPTX
  const outputDir = join(__dirname, '..', 'output');
  mkdirSync(outputDir, { recursive: true });

  const safe = empresa.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const fileName = `BucketsAI_${safe}_Deck_Gamma.pptx`;
  const outputPath = join(outputDir, fileName);

  await downloadExport(gammaUrl, generationId, outputPath);

  // Step 4: Post-process — inject brand images (gamma mode: only logo + CTA)
  const injectorScript = join(__dirname, 'deck_image_injector.py');
  try {
    console.log('   Injecting brand images (gamma mode)...');
    execFileSync('python3', [injectorScript, outputPath, outputPath, '--mode', 'gamma'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log('   Brand images injected');
  } catch (injErr) {
    console.error('   Image injection failed (non-fatal):', injErr.message);
  }

  console.log(`   Gamma deck saved: ${outputPath}`);
  return {
    path: outputPath,
    generationId,
    gammaUrl,
  };
}
