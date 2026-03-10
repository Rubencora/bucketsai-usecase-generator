import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ──
const PRESENTON_API_URL = process.env.PRESENTON_API_URL || 'https://api.presenton.ai';
const PRESENTON_API_KEY = process.env.PRESENTON_API_KEY;

async function callPresenton(endpoint, body) {
  const url = `${PRESENTON_API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (PRESENTON_API_KEY) {
    headers['Authorization'] = `Bearer ${PRESENTON_API_KEY}`;
  }

  console.log(`   Calling Presenton API: ${endpoint}...`);
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Presenton API error (${res.status}): ${text}`);
  }

  return res.json();
}

async function downloadFile(url, outputPath) {
  // Handle relative paths from self-hosted or absolute URLs from cloud
  const fullUrl = url.startsWith('http') ? url : `${PRESENTON_API_URL}${url}`;

  console.log(`   Downloading: ${fullUrl}`);

  // Don't send auth headers to external URLs (S3, etc.) — only to Presenton API
  const isPresenton = fullUrl.startsWith(PRESENTON_API_URL);
  const headers = {};
  if (isPresenton && PRESENTON_API_KEY) {
    headers['Authorization'] = `Bearer ${PRESENTON_API_KEY}`;
  }

  const res = await fetch(fullUrl, { headers });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${await res.text().catch(() => 'unknown error')}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(outputPath, buffer);
  return outputPath;
}

function buildDeckPrompt(d, empresa) {
  const sector = d.sector_label || 'la industria';
  return `Create a professional, visually stunning discovery sales deck for BucketsAI targeting ${empresa} (sector: ${sector}).

This is a B2B SaaS discovery presentation. The content focuses on INDUSTRY-WIDE challenges in ${sector}, NOT on the company's specific problems (since we don't know them yet). The design should be modern, clean, and executive-level.

BRAND GUIDELINES (MUST FOLLOW):
- Primary color: Brand Blue #4470DC (use for CTAs, highlights, icons, accent bars)
- Secondary: Blue Medium #6B8FE8 (hover states, secondary elements)
- Card backgrounds: Blue Light #E4EBF8
- Page background: #EEF0F6 (light gray-blue)
- Dark panels: Navy Mid #2E3E5C (for cover, closing, premium sections)
- Text: Dark Navy #0C1628 (headings on light bg), Text Muted #5A6A88 (body text)
- White #FFFFFF for content areas and chat bubbles
- Typography: Inter or Arial font family throughout, clean hierarchy
- Style: Card-based layouts, clean spacing, blue accent bars on cards
- DO NOT use #1A1B3A or #4C65FF — those are NOT brand colors
- Orange #FF6B35 is ACCENT ONLY for CTAs and critical metrics emphasis, never as background

Here is the exact content for each slide:

SLIDE 1 - COVER (dark background):
- Company: ${empresa}
- Tagline: "${d.cover_tagline}"
- Website: buckets-ai.com

SLIDE 2 - INDUSTRY PROBLEM:
- Headline: "${d.problem_headline}"
- Left column "What teams in ${sector} typically have":
${(d.problem_has_items || []).map(i => `  - ${i}`).join('\n')}
- Right column "But in day-to-day execution":
${(d.problem_but_items || []).map(i => `  - ${i}`).join('\n')}
- Closing statement: "${d.problem_closing}"

SLIDE 3 - WHY THIS CHALLENGE PERSISTS IN ${sector.toUpperCase()}:
- Headline: "${d.depth_headline}"
- Key reasons (display as numbered cards):
${(d.depth_reasons || []).map((r, i) => `  ${i + 1}. ${r}`).join('\n')}

SLIDE 4 - THE SOLUTION FOR ${sector.toUpperCase()}:
- Headline: "${d.solution_headline}"
- Description: "${d.solution_description}"
- Key capabilities (checklist style):
${(d.solution_capabilities || []).map(c => `  ✓ ${c}`).join('\n')}

SLIDE 5 - HOW IT WORKS (3-step process):
- Step 1: "${d.how_step1}"
- Step 2: "${d.how_step2}"
- Step 3: "${d.how_step3}"
- Note: "${(d.how_not_items || []).join(' | ')}"

SLIDE 6 - EXAMPLE USE CASE FOR ${empresa.toUpperCase()}:
- Headline: "${d.demo_headline}"
- Description: "${d.demo_description}"
- User message: "${d.demo_user_message}"
- AI response: "${d.demo_ai_response}"
Design this as a chat interface mockup. This slide IS company-specific.

SLIDE 7 - TWO DIMENSIONS OF VALUE:
- Dimension A: "${d.dim_a_titulo}" — Role: ${d.dim_a_rol}
  Description: "${d.dim_a_desc}"
- Dimension B: "${d.dim_b_titulo}" — Role: ${d.dim_b_rol}
  Description: "${d.dim_b_desc}"

SLIDE 8 - BEFORE VS AFTER:
- Before:
${(d.before_items || []).map(i => `  ✗ ${i}`).join('\n')}
- After:
${(d.after_items || []).map(i => `  ✓ ${i}`).join('\n')}

SLIDE 9 - IMPACT METRICS (bar charts showing before vs after):
- Title: "${d.impact_title}"
- Subtitle: "${d.impact_subtitle}"
- Metric 1: ${d.impact_col1_title} — Before: ${d.impact_col1_before} → After: ${d.impact_col1_after} (${d.impact_col1_unit || ''}) — Summary: ${d.impact_col1_metric}
- Metric 2: ${d.impact_col2_title} — Before: ${d.impact_col2_before} → After: ${d.impact_col2_after} (${d.impact_col2_unit || ''}) — Summary: ${d.impact_col2_metric}
- Metric 3: ${d.impact_col3_title} — Before: ${d.impact_col3_before} → After: ${d.impact_col3_after} (${d.impact_col3_unit || ''}) — Summary: ${d.impact_col3_metric}
- Closing: "${d.impact_closing}"
IMPORTANT: Display each metric as a bar chart comparing Before (red/muted) vs After (colored) values.

SLIDE 10 - COMPARISON TABLE (BucketsAi vs ChatGPT):
- Headline: "${d.comparison_headline}"
- Features: Role-based access, Commercial governance, Large team usage, Decision traceability, Data training policy, Risk exposure, Licensing model

SLIDE 11 - SECURITY & COMPLIANCE:
- Title: "Seguridad y control"
- 5 pillars: Data stays in your environment, No external model training, Role-based access, Full traceability, SOC 2 & GDPR aligned

SLIDE 12 - CALL TO ACTION (dark background):
- Question: "${d.cta_question}"
- Description: "${d.cta_description}"
- CTA: "Agenda tu demo personalizada"
- Contact: Sebastian Arce, Founder CSO
- Email: sebastian@hoytrabajas.com
- Phone: +1(415) 653 9295
- Web: buckets-ai.com`;
}

export async function generateDeckPresenton(deckContent, empresa) {
  if (!PRESENTON_API_KEY) {
    throw new Error('PRESENTON_API_KEY not set in .env. Get your key at https://presenton.ai/api-key');
  }

  const d = deckContent;
  const prompt = buildDeckPrompt(d, empresa);

  console.log('   Generating deck via Presenton API...');
  const result = await callPresenton('/api/v1/ppt/presentation/generate', {
    content: prompt,
    n_slides: 12,
    language: 'Spanish',
    template: 'neo-modern',
    export_as: 'pptx',
  });

  console.log(`   Presenton ID: ${result.presentation_id}`);

  // Download the generated file
  const outputDir = join(__dirname, '..', 'output');
  mkdirSync(outputDir, { recursive: true });

  const safe = empresa.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const fileName = `BucketsAI_${safe}_Deck_Presenton.pptx`;
  const outputPath = join(outputDir, fileName);

  await downloadFile(result.path, outputPath);

  // Post-process: inject brand images via python script
  const injectorScript = join(__dirname, 'deck_image_injector.py');
  try {
    console.log('   Injecting brand images...');
    execFileSync('python3', [injectorScript, outputPath, outputPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log('   Brand images injected');
  } catch (injErr) {
    console.error('   Image injection failed (non-fatal):', injErr.message);
  }

  console.log(`   Deck saved: ${outputPath}`);
  return {
    path: outputPath,
    presentationId: result.presentation_id,
    editUrl: result.edit_path,
  };
}
