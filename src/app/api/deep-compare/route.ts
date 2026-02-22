import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getBrandData } from '@/lib/data';
import { BRANDS } from '@/lib/brands';

const DATA_ROOT = path.join(process.cwd(), '..', 'data');
const COMPARISONS_DIR = path.join(DATA_ROOT, 'comparisons');

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function dirForPair(brandA: string, compA: string, brandB: string, compB: string): string {
  return path.join(COMPARISONS_DIR, `${brandA}--${slugify(compA)}--${brandB}--${slugify(compB)}`);
}

export async function POST(request: NextRequest) {
  const { pairKey } = (await request.json()) as { pairKey: string };
  if (!pairKey) return NextResponse.json({ error: 'Missing pairKey' }, { status: 400 });

  const parts = pairKey.split('::');
  if (parts.length !== 4) return NextResponse.json({ error: 'Invalid pairKey' }, { status: 400 });
  const [brandA, compA, brandB, compB] = parts;

  const dataA = getBrandData(brandA);
  const dataB = getBrandData(brandB);
  if (!dataA || !dataB) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

  const brandNameA = BRANDS.find((b) => b.id === brandA)?.name ?? brandA;
  const brandNameB = BRANDS.find((b) => b.id === brandB)?.name ?? brandB;

  const compDataA = dataA.report.components[compA];
  const compDataB = dataB.report.components[compB];
  const selA = dataA.selectors[compA];
  const selB = dataB.selectors[compB];

  const samplePageA = compDataA?.pages?.[0]?.url ?? null;
  const samplePageB = compDataB?.pages?.[0]?.url ?? null;

  const now = new Date().toISOString();

  const MAX_PAGES = 10;

  const pagesA = (compDataA?.pages ?? []).slice(0, MAX_PAGES).map((p) => `- ${p.url}`).join('\n');
  const pagesB = (compDataB?.pages ?? []).slice(0, MAX_PAGES).map((p) => `- ${p.url}`).join('\n');

  const content = `# Deep Comparison: ${compA} ↔ ${compB}

> Generated: ${now}
> **Methodology:** This document is a generic, reusable analysis framework. Section 1 is pre-filled with real component data. Sections 2–19 contain structured tables and \`<!-- analyse: -->\` directives intended to be completed by a Copilot agent or developer following the same rigorous pattern for every deep comparison.

---

## 1. Component Identity

### Component A

| Field | Value |
|-------|-------|
| **Name** | ${compA} |
| **Brand** | ${brandNameA} (\`${brandA}\`) |
| **Selector** | \`${selA?.selector ?? 'not mapped'}\` |
| **Description** | ${selA?.description || '—'} |
| **Usage count** | ${compDataA?.count ?? '—'} pages |
| **Sample page** | ${samplePageA ? `[${samplePageA}](${samplePageA})` : '—'} |
| **Screenshot** | \`public/screenshots/${brandA}/${slugify(compA)}.png\` |

${(compDataA?.pages?.length ?? 0) > 1 ? `<details>\n<summary>Sample pages (up to ${MAX_PAGES} of ${compDataA.pages.length})</summary>\n\n${pagesA}\n\n</details>` : ''}

### Component B

| Field | Value |
|-------|-------|
| **Name** | ${compB} |
| **Brand** | ${brandNameB} (\`${brandB}\`) |
| **Selector** | \`${selB?.selector ?? 'not mapped'}\` |
| **Description** | ${selB?.description || '—'} |
| **Usage count** | ${compDataB?.count ?? '—'} pages |
| **Sample page** | ${samplePageB ? `[${samplePageB}](${samplePageB})` : '—'} |
| **Screenshot** | \`public/screenshots/${brandB}/${slugify(compB)}.png\` |

${(compDataB?.pages?.length ?? 0) > 1 ? `<details>\n<summary>Sample pages (up to ${MAX_PAGES} of ${compDataB.pages.length})</summary>\n\n${pagesB}\n\n</details>` : ''}

---

## 2. HTML Structure

<!-- analyse: Navigate to the sample pages above. Use the selector for each component to locate it in the DOM. Extract the full outerHTML. Paste the simplified (class-stripped) HTML tree for each component below. Then fill the delta table. -->

### Component A — extracted HTML

\`\`\`html
<!-- paste extracted HTML here -->
\`\`\`

### Component B — extracted HTML

\`\`\`html
<!-- paste extracted HTML here -->
\`\`\`

### HTML delta

| Element / Pattern | Component A | Component B | Notes |
|-------------------|-------------|-------------|-------|
| Root element | | | |
| Heading level | | | |
| List structure | | | |
| Interactive elements | | | |
| Slot / child components | | | |
| Data attributes | | | |
| ARIA attributes | | | |

---

## 3. CSS & Visual Styling

<!-- analyse: For each component, collect all applied CSS classes and their computed values for: layout (display, flex/grid props), spacing (margin, padding), typography (font-family, size, weight, line-height), colours (foreground, background, border). Map brand-specific values to design token candidates. -->

| Property | Component A value | Component B value | Proposed token name |
|----------|------------------|------------------|---------------------|
| Layout / display | | | |
| Gap / spacing | | | |
| Font family | | | |
| Font size | | | |
| Font weight | | | |
| Line height | | | |
| Foreground colour | | | |
| Background colour | | | |
| Border / radius | | | |
| Shadow / elevation | | | |
| Transition / animation | | | |

---

## 4. Responsive Behaviour

<!-- analyse: Test each component at 320px, 768px, 1024px, and 1440px viewport widths. Document layout changes, hidden/shown elements, and touch-target sizes. -->

| Breakpoint | Component A behaviour | Component B behaviour | Delta |
|------------|-----------------------|-----------------------|-------|
| 320px (mobile S) | | | |
| 768px (tablet) | | | |
| 1024px (desktop S) | | | |
| 1440px (desktop L) | | | |

---

## 5. Interactive Behaviour

<!-- analyse: Identify all interactive states and JavaScript-driven behaviour. Include: expand/collapse, hover, focus, click, keyboard shortcuts, custom events emitted. Note any animations or transitions. -->

| Interaction | Component A | Component B | Delta |
|-------------|-------------|-------------|-------|
| Default state | | | |
| Trigger (click / key) | | | |
| State transitions | | | |
| Animation / duration | | | |
| Events emitted | | | |
| Keyboard shortcuts | | | |
| Touch / swipe behaviour | | | |

---

## 6. Accessibility

<!-- analyse: For each component, run axe-core (browser extension or axe-playwright). Document ARIA roles, labels, and keyboard navigation flow. List any violations found. -->

### ARIA comparison

| Attribute | Component A | Component B |
|-----------|-------------|-------------|
| \`role\` on root | | |
| \`aria-label\` / \`aria-labelledby\` | | |
| \`aria-expanded\` | | |
| \`aria-controls\` | | |
| Focus management | | |
| Keyboard: Enter / Space | | |
| Keyboard: Arrow keys | | |
| Keyboard: Escape | | |

### axe-core violations

| Rule | Severity | Affects | Component |
|------|----------|---------|-----------|
| | | | |

---

## 7. SEO & Structured Data

<!-- analyse: Inspect heading hierarchy (h1–h6) in context of the full page. Check for FAQ / HowTo / Article schema opportunities. Verify canonical, meta description, og: tags are unaffected by the component. -->

| Aspect | Component A | Component B | Recommendation |
|--------|-------------|-------------|----------------|
| Heading levels used | | | |
| Heading text (sample) | | | |
| Landmark role | | | |
| JSON-LD present? | | | |
| Schema type | | | |
| Crawlable content? | | | |
| Canonical / indexable | | | |

---

## 8. GEO — Generative Engine Optimization

<!-- analyse: Assess how well this component's content is likely to be understood and cited by AI search engines (Perplexity, SearchGPT, Gemini AI Overviews). Check: clear entity labelling, question-answer patterns, FAQ schema, concise summaries, structured lists. -->

| GEO dimension | Component A | Component B | Recommendation |
|---------------|-------------|-------------|----------------|
| Clear entity / topic label | | | |
| Question-answer pattern | | | |
| FAQ schema eligible? | | | |
| Concise summary available? | | | |
| Structured list usage | | | |
| Language clarity (NL) | | | |

---

## 9. CMS Content Model (Sitecore)

<!-- analyse: In Sitecore, look up the rendering for each component. Document datasource template fields, rendering parameters, and placeholder nesting. Flag fields that differ — these drive migration complexity. -->

### Component A — Sitecore rendering

| Field | Value |
|-------|-------|
| Rendering name | |
| Datasource template | |
| Placeholder location | |
| Rendering parameters | |

### Component B — Sitecore rendering

| Field | Value |
|-------|-------|
| Rendering name | |
| Datasource template | |
| Placeholder location | |
| Rendering parameters | |

### CMS field mapping

| Logical field | Component A field | Component B field | Unified field name |
|---------------|------------------|------------------|--------------------|
| | | | |

---

## 10. Analytics & Event Tracking

<!-- analyse: Inspect the GTM dataLayer pushes triggered by the component. Look for data-tracking-* attributes, ga4 events, and custom event names. The tracking contract must be preserved in the unified component. -->

| Event / attribute | Component A | Component B | Unified |
|-------------------|-------------|-------------|---------|
| dataLayer event name | | | |
| data-tracking-* attrs | | | |
| Trigger condition | | | |
| Data payload | | | |

---

## 11. Component Variants

<!-- analyse: Enumerate all visual and functional variants (e.g. dark/light mode, compact/expanded, icon present/absent). The unified component must support the union of all variants via props. -->

| Variant / configuration | Component A | Component B | Include in unified? |
|-------------------------|-------------|-------------|---------------------|
| | | | |

---

## 12. Performance

<!-- analyse: Using DevTools / WebPageTest / Lighthouse, measure CLS and LCP contribution of the component. Estimate JS bundle size (if any). Note lazy-loading strategies. High-usage components amplify any performance issue. -->

| Metric | Component A | Component B | Target |
|--------|-------------|-------------|--------|
| CLS contribution | | | < 0.1 |
| LCP candidate? | | | — |
| JS bundle size | | | minimal |
| Images lazy-loaded? | | | yes |
| Web font impact | | | — |

---

## 13. Dependencies & Browser Compatibility

<!-- analyse: List all external libraries, polyfills, or web components this component depends on. Check browser support for CSS features used (caniuse.com). Note any IE11 / older browser constraints. -->

| Dependency | Component A | Component B | Conflict risk |
|------------|-------------|-------------|---------------|
| JS libraries | | | |
| CSS features (caniuse) | | | |
| Polyfills required | | | |
| Browser floor | | | |

---

## 14. Error / Empty / Loading States

<!-- analyse: Trigger edge cases: empty datasource, missing image, slow network (throttle to 3G), server error. Document how each component behaves. Divergence here often causes regressions post-merge. -->

| State | Component A | Component B | Delta |
|-------|-------------|-------------|-------|
| Empty content | | | |
| Missing image | | | |
| Loading / skeleton | | | |
| Error / fallback | | | |
| Max content length | | | |

---

## 15. Differences Summary

> ⚠️ This is the most critical section. Breaking differences block unification; minor differences can be handled via props or design tokens.

<!-- analyse: Based on all sections above, list every difference found. Classify as "breaking" (requires architecture decision) or "minor" (handled by a prop or token). -->

### Breaking differences

| # | Dimension | Description | Impact | Decision needed |
|---|-----------|-------------|--------|-----------------|
| 1 | | | | |

### Minor differences

| # | Dimension | Description | Resolution |
|---|-----------|-------------|------------|
| 1 | | | |

### Similarities (confirmed shared behaviour)

- 

---

## 16. Unified Component Proposal

<!-- analyse: Based on sections 2–15, propose the unified component. Define the TypeScript props interface, composition pattern, recommended semantic HTML, and JSON-LD output. This is the deliverable. -->

### Proposed name

\`\`\`
UnifiedComponentName
\`\`\`

### TypeScript props interface

\`\`\`typescript
interface UnifiedComponentProps {
  // fill in
}
\`\`\`

### Composition pattern

<!-- Describe: is this a compound component, a single element, does it use slots/children? -->

### Recommended semantic HTML

\`\`\`html
<!-- paste proposed output HTML here -->
\`\`\`

### JSON-LD output (if applicable)

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": ""
}
\`\`\`

---

## 17. Migration Risk Assessment

<!-- analyse: For each brand, count pages affected, estimate re-authoring effort in the CMS, and describe the rollback strategy. Flag high-traffic pages separately. -->

| Dimension | ${brandNameA} | ${brandNameB} |
|-----------|${'-'.repeat(brandNameA.length + 2)}|${'-'.repeat(brandNameB.length + 2)}|
| Pages affected | ${compDataA?.count ?? '—'} | ${compDataB?.count ?? '—'} |
| Re-authoring effort | | |
| Rollback strategy | | |
| High-traffic pages | | |
| Estimated risk level | | |

---

## 18. Decision Log

<!-- Record every architectural decision made during the analysis. Include the rationale and who decided. -->

| Date | Decision | Rationale | Decided by |
|------|----------|-----------|------------|
| | | | |

---

## 19. Open Questions

<!-- List unresolved questions that need input from stakeholders, designers, or developers before implementation can begin. -->

- 

---

*Generated by component-comparison deep-compare API. Regenerate via the UI to reset sections.*
`;

  const dir = dirForPair(brandA, compA, brandB, compB);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'plan.md');
  fs.writeFileSync(filePath, content, 'utf-8');

  const relativePath = path.relative(path.join(process.cwd(), '..'), filePath).replace(/\\/g, '/');
  return NextResponse.json({ ok: true, path: relativePath });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairKey = searchParams.get('pairKey');
  if (!pairKey) return NextResponse.json({ exists: false });

  const parts = pairKey.split('::');
  if (parts.length !== 4) return NextResponse.json({ exists: false });
  const [brandA, compA, brandB, compB] = parts;

  const filePath = path.join(dirForPair(brandA, compA, brandB, compB), 'plan.md');
  const exists = fs.existsSync(filePath);
  const relativePath = path.relative(path.join(process.cwd(), '..'), filePath).replace(/\\/g, '/');
  return NextResponse.json({ exists, path: exists ? relativePath : null });
}
