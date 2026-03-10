# BucketsAI Use Case Generator

Generates personalized B2B sales materials for BucketsAI prospects — use cases, one-pagers, and commercial decks — using AI-powered content and research.

## What it generates

| Document | Format | Description |
|----------|--------|-------------|
| **Use Case** | PDF + DOCX | 12-page detailed use case with two dimensions of value, conversational examples, and value proposition |
| **One-Pager** | PDF + DOCX | Single-page sales sheet with pain points, demo example, and CTA |
| **Commercial Deck** | PPTX | 12-slide presentation via Gamma.app (with Presenton and template fallbacks) |

## Architecture

```
User Input (empresa, pais, enfoque)
        |
        v
  [1] Research (Tavily + Firecrawl + OpenAI)
        |
        v
  [2] Content Generation (OpenAI GPT-4o, 3-6 calls)
        |
        v
  [3] Document Generation
        ├── Use Case: PDF (Puppeteer) + DOCX (docx lib)
        ├── One-Pager: PDF (Puppeteer) + DOCX
        └── Deck: Gamma → Presenton → Template → PptxGenJS
                    |
                    v
              [4] Post-process: inject brand images (logo, QR, photos)
```

## Deck generation fallback chain

1. **Gamma.app** (requires `GAMMA_API_KEY`, admin or `gamma_enabled` user) — uses custom theme `ga8n78b6ffil1z0`, no AI images, brand image injection
2. **Presenton AI** (requires `PRESENTON_API_KEY`) — AI-generated slides with full image injection
3. **Template** — PPTX template-based generation
4. **PptxGenJS** — programmatic slide creation (last resort)

## Key files

```
src/
  researcher.js          — Company research (Tavily search + Firecrawl crawl + OpenAI synthesis)
  content_builder.js     — Content generation (use case, one-pager, deck content via GPT-4o)
  gamma_deck_generator.js — Gamma.app API integration (theme, polling, PPTX download)
  presenton_deck_generator.js — Presenton API integration
  deck_template_generator.js  — Template-based PPTX generation
  deck_image_injector.py — Post-process PPTX to inject brand images (Python/python-pptx)
  onepager_generator.js  — One-pager PDF generation
  pdf_generator.js       — Use case PDF generation
  auth.js                — JWT authentication
  db.js                  — PostgreSQL connection

app/
  api/generate/route.js  — Main generation endpoint (SSE streaming)
  api/auth/              — Auth endpoints (login, register, forgot-password)
  api/admin/             — Admin endpoints (users, invites, use case history)

public/
  deck-assets/           — Brand images for deck injection (logo, QR, photos)
  onepager-assets/       — Brand images for one-pager

context/
  bucketsai_knowledge.md — Product knowledge base used in all prompts
```

## Setup

```bash
npm install
cp .env.example .env  # fill in API keys
npm run dev           # development (port 3004)
npm run build && npm start  # production
```

## Deployment (VPS)

```bash
scp src/*.js src/*.py root@SERVER:/var/www/bucketsai-usecase-generator/src/
ssh root@SERVER "cd /var/www/bucketsai-usecase-generator && npm run build && pm2 restart bucketsai"
```

## Cost per generation

| Document | OpenAI | Gamma | Total |
|----------|--------|-------|-------|
| Use Case (PDF+DOCX) | ~$0.17 | — | ~$0.17 |
| One-Pager (PDF+DOCX) | ~$0.10 | — | ~$0.10 |
| Deck (Gamma, no AI images) | ~$0.05 | ~$0.07 | ~$0.12 |
| **All 3 together** | ~$0.27 | ~$0.07 | **~$0.34** |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | GPT-4o for research and content |
| `TAVILY_API_KEY` | No | Search API (falls back to DuckDuckGo) |
| `FIRECRAWL_API_KEY` | No | Web crawling for company websites |
| `GAMMA_API_KEY` | No | Gamma.app Pro for premium decks |
| `PRESENTON_API_KEY` | No | Presenton AI for deck generation |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Token signing for auth |
