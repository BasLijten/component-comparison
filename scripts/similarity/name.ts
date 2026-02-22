/**
 * Computes semantic name similarity between two component names.
 * Uses token-level Jaccard similarity with domain keyword bonuses.
 */

// Common suffixes/noise words to strip for better matching
const NOISE_TOKENS = new Set([
  'v1', 'v2', 'v3', 'v4', 'v5', 'block', 'container', 'component',
  'widget', 'module', 'section', 'strip', 'item', 'row', 'card',
  'de', 'het', 'een', 'en', 'van', 'met', 'the', 'a', 'an', 'of', 'with',
]);

// Dutch→English normalization (maps Dutch tokens to their English equivalents)
const SYNONYMS: Record<string, string> = {
  accordeon: 'accordion',
  afbeelding: 'image',
  knop: 'button',
  knoppen: 'button',
  tekst: 'text',
  tabel: 'table',
  tabellen: 'table',
  tegel: 'tile',
  tegels: 'tile',
  tiles: 'tile',
  navigatie: 'navigation',
  navigatiezuil: 'navigation',
  koptekst: 'header',
  voettekst: 'footer',
  zoeken: 'search',
  formulier: 'form',
  video: 'video',
  audio: 'audio',
  contact: 'contact',
  carousel: 'carousel',
  overzicht: 'overview',
  beoordeling: 'review',
  beoordelingen: 'review',
  paragraaf: 'paragraph',
  kolom: 'column',
  kolommen: 'column',
  links: 'link',
  linkkolom: 'link',
  linkkolommen: 'link',
  citaat: 'quote',
  stap: 'step',
  proces: 'process',
  lijst: 'list',
  media: 'media',
  melding: 'notification',
  intro: 'intro',
  inhoud: 'content',
  vergelijk: 'compare',
  vergelijken: 'compare',
};

// Domain keywords that carry strong semantic meaning
const DOMAIN_KEYWORDS = [
  'accordion', 'header', 'footer', 'navigation', 'nav',
  'hero', 'banner', 'carousel', 'slider', 'video', 'image',
  'contact', 'chat', 'form', 'table', 'tile',
  'link', 'button', 'cta', 'call', 'action', 'search',
  'sidebar', 'menu', 'breadcrumb', 'anchor', 'tab', 'drawer',
  'review', 'quote', 'media', 'audio', 'podcast',
  'intro', 'content', 'text', 'column',
  'process', 'step', 'list',
  'product', 'price', 'compare',
  'notification', 'overview', 'paragraph',
];

function normalize(token: string): string {
  return SYNONYMS[token] ?? token;
}

function tokenize(name: string): Set<string> {
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !NOISE_TOKENS.has(t))
    .map(normalize);
  return new Set(tokens);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return intersection.size / union.size;
}

function domainKeywordBonus(tokensA: Set<string>, tokensB: Set<string>): number {
  for (const kw of DOMAIN_KEYWORDS) {
    const inA = [...tokensA].some(t => t === kw || t.includes(kw) || kw.includes(t));
    const inB = [...tokensB].some(t => t === kw || t.includes(kw) || kw.includes(t));
    if (inA && inB) return 0.2;
  }
  return 0;
}

export function nameScore(nameA: string, nameB: string): number {
  const tokensA = tokenize(nameA);
  const tokensB = tokenize(nameB);
  const base = jaccard(tokensA, tokensB);
  const bonus = base > 0 ? 0 : domainKeywordBonus(tokensA, tokensB); // only add bonus if no direct overlap
  return Math.min(1, base + bonus);
}
