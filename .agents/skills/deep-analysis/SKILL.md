---
name: deep-analysis
description: Perform automated deep analysis of UI components across brands to design unified React components. Use this skill when asked to "deep analyze", "compare components across brands", "design a unified component", or when working with confirmed-same component pairs from the comparison tool. Triggers on tasks involving cross-brand component comparison, design token mapping, or multi-brand unification analysis. Requires Playwright for browser automation.
---

# Deep Analysis

Perform end-to-end deep analysis of a UI component across multiple brands. Extract HTML, CSS, interactions, and accessibility data from live websites, compare across brands, classify differences, and propose a unified React component design with design tokens.

## Context

We are migrating from ASP.NET Full Framework (Angular/Vue/vanilla JS + Sitecore CMS) to Next.js + React with a multi-brand design system. Components must work across all brands via CSS design tokens and props — not separate codebases.

## Workflow

Execute phases sequentially. Each phase builds on the previous.

### Phase 0 — Resolve Input

Input: a component name.

1. Read `data/manual-review.json` — collect all pair keys where status = `"confirmed"` involving this component
2. For each confirmed pair, read brand data from `data/{brand}-report/extracted-data.json`
3. Read CSS selectors from `data/{brand}-report/component-selectors.json`
4. Collect sample page URLs (at least 1, preferably 3 per brand)
5. Locate screenshots in `src/public/screenshots/{brand}/`
6. Read similarity scores from `data/similarity.json`

Output: component name per brand, CSS selector per brand, sample URLs, screenshot paths, similarity scores.

### Phase 1 — Gather

Use Playwright to visit live sites and extract raw data for each brand instance.

For each brand/component:

1. **Navigate & capture** — Open sample URLs at 1440×900. Wait for network idle. Take full-page and component-cropped screenshots. Repeat at 320px, 768px, 1024px.
2. **Extract HTML** — Extract component `outerHTML` via selector. Generate a class-stripped semantic skeleton. Count element types.
3. **Extract CSS** — Collect computed styles: layout, spacing, typography, colors, borders, shadows, transitions.
4. **Extract interactions** — Test click, hover, keyboard (Tab/Enter/Space/Arrows). Document state transitions, animations, focus management.

Save artifacts to `data/comparisons/{component-slug}/gathered/`. See [references/artifacts.md](references/artifacts.md) for file naming conventions.

### Phase 2 — Analyze

Derive findings from gathered data. See [references/analysis-dimensions.md](references/analysis-dimensions.md) for the full checklist per dimension.

Six dimensions:

1. **Structure** — DOM hierarchy, semantic elements, ARIA attributes, content slots, heading levels
2. **Styling** — Brand-specific vs structural styles, token candidates, spacing scale, pseudo-elements
3. **Interactions** — State machine, framework dependencies, `prefers-reduced-motion`, focus management
4. **Accessibility** — Run axe-core, document ARIA, keyboard nav, focus indicators, contrast ratios
5. **SEO & Content** — Heading hierarchy, structured data opportunities (FAQ/HowTo), indexability, GEO readiness
6. **Performance** — CLS contribution, LCP candidacy, JS bundle size, image optimization

### Phase 3 — Compare

Build a comparison matrix across all brands (one column per brand) for each dimension.

1. **Identify similarities** — List what is identical or near-identical across brands
2. **Classify every difference** into exactly one category:

| Category | Resolution | Example |
|----------|-----------|---------|
| **A — Design Token** | CSS custom property, code identical across brands | Colors, fonts, spacing, border-radius, shadows |
| **B — Component Prop** | React prop with per-brand default | single-open vs multi-open, layout variants |
| **C — Structural Divergence** | Needs human decision, may block unification | Incompatible DOM structure, missing sub-components |

For Category A: map through the three-tier token hierarchy. See [references/token-strategy.md](references/token-strategy.md).

For Category B: propose prop name, TypeScript type, default value, per-brand values.

For Category C: describe conflict, assess whether splitting into sub-components resolves it.

### Phase 4 — Design

Synthesize into a unified React component proposal:

1. **Name** — Clear English name describing function
2. **Composition** — Atomic or compound? Draw component tree. Consider sub-component reuse.
3. **Props interface** — TypeScript interface covering all Category B items, content slots, accessibility
4. **Design tokens** — Three-tier mapping (global → semantic → component) for all Category A items
5. **Semantic HTML** — Proposed output HTML. Prioritize native elements > ARIA > custom JS.
6. **Structured data** — JSON-LD if applicable (FAQ, HowTo, Article)
7. **Migration notes** — JS library replacements, CMS field mapping, analytics event mapping, pages affected

## Output

Write a single Markdown report to:

```
data/comparisons/{component-slug}/analysis.md
```

See [references/report-template.md](references/report-template.md) for the required report structure.

## Acceptance Criteria

- All confirmed brand instances visited and data extracted
- Screenshots at desktop + mobile per brand
- HTML extracted and simplified for all instances
- Computed styles mapped to token candidates
- Interactions documented, accessibility audited (axe-core)
- Every difference classified as A, B, or C with proposed resolution
- TypeScript props interface defined
- Three-tier design token mapping complete
- Semantic HTML proposed
- No `TODO`, `TBD`, or empty table cells in the report
