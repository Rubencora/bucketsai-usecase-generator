// ── BucketsAI Brand Guidelines (Manual de Marca v7) ──
// Source: BucketsAI_ManualDeMarca_v7.docx

// Color Palette — Official
export const BRAND = {
  // Primary Colors
  darkNavy:    '0C1628',   // Text ONLY — never as background fill
  brandBlue:   '4470DC',   // CTAs, highlights, logo, links, active icons
  blueMedium:  '6B8FE8',   // Hover states, secondary icons, active card borders
  blueLight:   'E4EBF8',   // Card backgrounds, metric chips, highlighted sections
  white:       'FFFFFF',   // Content backgrounds, chat bubbles, visual rest areas

  // Secondary Colors
  pageBg:      'EEF0F6',   // Page background
  grayMid:     '8A96B0',   // Muted text, captions
  navyMid:     '2E3E5C',   // Dark panels, premium backgrounds, presentation slides
  border:      'D8DCE8',   // Borders, dividers
  textMuted:   '5A6A88',   // Secondary text

  // Accent (from one-pager and brand usage)
  green:       '22B573',   // Positive metrics, "after" items
  red:         'E74C3C',   // Negative metrics, "before" items
  orange:      'FF6B35',   // CTAs, metrics, critical emphasis (accent only, never as bg)
};

// Typography — Inter / Arial system
export const FONT = {
  primary: 'Arial',        // Inter preferred but Arial as safe fallback in PPTX
  // Hierarchy from brand manual:
  // H1: 32-40pt Bold — Covers, hero sections, slide titles
  // H2: 24-28pt Bold — Section headers, card titles
  // H3: 18-22pt SemiBold — Subtitles, category labels
  // Body: 14-16pt Regular — Paragraphs, descriptions
  // Caption: 11-12pt Regular — Footnotes, sources, metadata
  // CTA: 16pt Bold — Buttons, calls to action
};

// Brand voice summary for AI prompts
export const BRAND_VOICE = `
BucketsAI Brand Guidelines Summary:
- Name: Always "BucketsAI" (no space, AI capitalized)
- Tagline: "All your knowledge, one conversation away"
- Voice: Clear, reliable, human, action-oriented
- Colors: Brand Blue #4470DC, Blue Medium #6B8FE8, Blue Light #E4EBF8, Navy Mid #2E3E5C, Page BG #EEF0F6, White #FFFFFF
- Dark Navy #0C1628 is for TEXT only, never as background fill
- Orange is accent only for CTAs and critical emphasis — never as background
- Typography: Inter or Arial, 6-level hierarchy (H1 32-40pt Bold → Caption 11-12pt Regular)
- Photography: Real people in work contexts, diverse, moments of clarity and action
- Design: Clean, modern, card-based layouts with blue accents. Light backgrounds with navy panels for premium sections.
`;
