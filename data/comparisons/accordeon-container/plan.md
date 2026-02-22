# Deep Analysis Plan: Accordeon container

> **Playbook:** `docs/deep-analysis-playbook.md`
> **Status:** Ready for execution
> **Component:** Accordeon container

---

## Phase 0 — Input & Setup (Resolved)

### Input

```yaml
component: "Accordeon container"
```

### Confirmed pairs

3 confirmed-same pairs from `data/manual-review.json`:

| # | Pair key | Brand A | Component A | Brand B | Component B |
|---|----------|---------|-------------|---------|-------------|
| 1 | `fbto::Accordeon container::cb::Content accordion v1` | FBTO | Accordeon container | CB | Content accordion v1 |
| 2 | `fbto::Accordeon container::cb::Focus accordion v1` | FBTO | Accordeon container | CB | Focus accordion v1 |
| 3 | `fbto::Accordeon block::fbto::Accordeon container` | FBTO | Accordeon block | FBTO | Accordeon container |

### Component instances to analyze

| # | Brand | Component name | Selector | Usage count | Screenshot |
|---|-------|----------------|----------|-------------|------------|
| 1 | FBTO (`fbto`) | Accordeon container | `div.accordion` | 631 pages (578 unique) | `src/public/screenshots/fbto/accordeon-container.png` |
| 2 | FBTO (`fbto`) | Accordeon block | `div.accordion__item` | 3500 pages (578 unique) | `src/public/screenshots/fbto/accordeon-block.png` |
| 3 | CB (`cb`) | Content accordion v1 | `.strip.main-content.content-accordion` | 535 pages (403 unique) | `src/public/screenshots/cb/content-accordion-v1.png` |
| 4 | CB (`cb`) | Focus accordion v1 | `.strip.js-collapsable` | 196 pages (164 unique) | `src/public/screenshots/cb/focus-accordion-v1.png` |

### Sample URLs per component (3 per component)

**FBTO — Accordeon container / Accordeon block** (same pages, container wraps blocks):
1. https://www.fbto.nl/aanhangwagenverzekering
2. https://www.fbto.nl/aanhangwagenverzekering/schade-melden
3. https://www.fbto.nl/aanhangwagenverzekering/service

**CB — Content accordion v1:**
1. https://www.centraalbeheer.nl/account/app
2. https://www.centraalbeheer.nl/account/app/altijd-up-to-date
3. https://www.centraalbeheer.nl/account/hulp-bij-inloggen

**CB — Focus accordion v1:**
1. https://www.centraalbeheer.nl/artikelen/10-tips-proefrit-auto
2. https://www.centraalbeheer.nl/artikelen/10-verrassende-bespaartips
3. https://www.centraalbeheer.nl/artikelen/1e-hypotheek-afsluiten

### Similarity scores

| Brand A | Component A | Brand B | Component B | Score | Name | Visual | Structural |
|---------|-------------|---------|-------------|-------|------|--------|------------|
| FBTO | Accordeon block | CB | Content accordion v1 | 0.582 | 0.500 | 0.594 | 0.677 |
| FBTO | Accordeon container | CB | Content accordion v1 | 0.559 | 0.500 | 0.531 | 0.716 |
| FBTO | Accordeon container | CB | Focus accordion v1 | 0.463 | 0.500 | 0.484 | 0.356 |
| FBTO | Accordeon block | CB | Focus accordion v1 | 0.453 | 0.500 | 0.484 | 0.303 |

### Key observations from Phase 0

- **FBTO has a container/block relationship:** "Accordeon container" (`div.accordion`) wraps multiple "Accordeon block" items (`div.accordion__item`). These appear on the same pages — the container is the parent, the block is the repeatable child. This is a compound component.
- **CB has two distinct accordion types:** "Content accordion v1" (`.content-accordion`) and "Focus accordion v1" (`.js-collapsable`) are separate renderings. They may differ in visual style, behavior, or content model.
- **All name similarity = 0.5:** The word "accordion"/"accordeon" drives name matching across all pairs.
- **Structural similarity is highest for Accordeon container ↔ Content accordion v1** (0.716), suggesting these share the most DOM structure.
- **No screenshots are missing** — all 4 components have extracted PNGs.

---

## Phase 1 — Gather

### 1.1 Navigate & capture

For each of the 9 sample URLs above (3 per FBTO, 3 per CB Content, 3 per CB Focus):

1. Open in Playwright at **1440×900** (desktop)
2. Wait for `networkidle`
3. Take full-page screenshot
4. Scroll to selector, take cropped component screenshot
5. Repeat at **320px** (mobile), **768px** (tablet), **1024px** (desktop small)

**FBTO note:** Use `div.accordion` to capture the container, then also capture individual `div.accordion__item` elements to understand the child component.

**CB note:** `.strip.main-content.content-accordion` and `.strip.js-collapsable` — verify these selectors still work on the live sites. If not, visually identify the accordion component.

### 1.2 Extract HTML

For each component instance:
- Extract `outerHTML` of the matched element
- Generate class-stripped skeleton HTML
- Count element types

**Special attention for FBTO:** Extract both the container-level HTML and a single accordion item to understand the parent-child relationship.

### 1.3 Extract CSS

Computed styles for each component + descendants:
- Layout properties (display, flex/grid, gap)
- Spacing (margin, padding)
- Typography (font-family, font-size, font-weight, line-height, color)
- Colors (background, border, text)
- Borders & radius
- Shadows, transitions, animations

### 1.4 Extract interactions

For each accordion:
- Click the first accordion item header — does it expand?
- Click a second header — does the first collapse (single-open) or stay open (multi-open)?
- Test keyboard: Tab to header, press Enter/Space — does it toggle?
- Test Arrow keys between headers
- Note animation duration and easing
- Check `prefers-reduced-motion` behavior
- Check focus management after expand/collapse

### 1.5 Responsive check

4 breakpoints per component: 320px, 768px, 1024px, 1440px.

### Artifacts directory

```
data/comparisons/accordeon-container/gathered/
  fbto-accordeon-container-component.png
  fbto-accordeon-container-full-page.png
  fbto-accordeon-container-320.png
  fbto-accordeon-container-768.png
  fbto-accordeon-container-1024.png
  fbto-accordeon-container-1440.png
  fbto-accordeon-container.html
  fbto-accordeon-container-skeleton.html
  fbto-accordeon-container-styles.json
  fbto-accordeon-container-interactions.json
  fbto-accordeon-block-component.png
  fbto-accordeon-block.html
  fbto-accordeon-block-skeleton.html
  fbto-accordeon-block-styles.json
  fbto-accordeon-block-interactions.json
  cb-content-accordion-v1-component.png
  cb-content-accordion-v1-full-page.png
  cb-content-accordion-v1-320.png
  cb-content-accordion-v1-768.png
  cb-content-accordion-v1-1024.png
  cb-content-accordion-v1-1440.png
  cb-content-accordion-v1.html
  cb-content-accordion-v1-skeleton.html
  cb-content-accordion-v1-styles.json
  cb-content-accordion-v1-interactions.json
  cb-focus-accordion-v1-component.png
  cb-focus-accordion-v1-full-page.png
  cb-focus-accordion-v1-320.png
  cb-focus-accordion-v1-768.png
  cb-focus-accordion-v1-1024.png
  cb-focus-accordion-v1-1440.png
  cb-focus-accordion-v1.html
  cb-focus-accordion-v1-skeleton.html
  cb-focus-accordion-v1-styles.json
  cb-focus-accordion-v1-interactions.json
```

---

## Phase 2 — Analyze

### 2.1 Structure analysis

Answer for each of the 4 component instances:
- What is the root element? (`<div>`, `<section>`, `<details>`, etc.)
- Does it use semantic `<details>`/`<summary>` or custom `<div>`+`<button>`?
- What ARIA attributes are present? (`role`, `aria-expanded`, `aria-controls`, `aria-labelledby`)
- How are content slots structured? (heading + body? icon + title + content?)
- What is the heading hierarchy within the accordion?

**Key question for FBTO:** Is "Accordeon container" purely a wrapper (`div.accordion`) or does it have its own content/heading beyond wrapping "Accordeon block" items?

### 2.2 Styling analysis

Compare computed styles across the 4 instances. Map brand-specific values to token candidates using the three-tier hierarchy:
- **Tier 1 (global):** Raw brand color/font/spacing values
- **Tier 2 (semantic):** Purpose-driven aliases (e.g., `--surface-secondary`, `--text-primary`)
- **Tier 3 (component):** Accordion-specific tokens referencing semantic tier

### 2.3 Interaction analysis

Document the state machine for each accordion:
- States: collapsed (default), expanded, hover, focus, disabled (if applicable)
- Transitions: what triggers expand/collapse?
- Single-open vs. multi-open?
- Animation: slide? fade? instant? duration?
- Events: does it emit GTM/analytics events on expand?

### 2.4 Accessibility audit

Run axe-core on pages containing each accordion. Document:
- ARIA roles and properties
- Keyboard navigation (Tab, Enter, Space, Arrow keys, Escape)
- Focus indicators
- Color contrast of header text on background
- Screen reader announcements

### 2.5 SEO & content analysis

- Are accordion contents hidden from search engines? (`display: none` vs. `visibility: hidden` vs. rendered but collapsed)
- Is FAQ schema present or possible?
- Heading hierarchy in page context

### 2.6 Performance assessment

- CLS: does the accordion shift layout on load?
- JS: what framework/library drives the accordion? (Angular? Vue? jQuery? Vanilla?)
- Bundle size estimate for accordion-specific JS

---

## Phase 3 — Compare

### 3.1 Comparison matrix

Build tables with columns: FBTO Accordeon container | FBTO Accordeon block | CB Content accordion v1 | CB Focus accordion v1

### 3.2 Expected similarities to verify

Based on Phase 0 scores:
- Structural similarity is high (0.716 for container ↔ content accordion) — likely similar DOM patterns
- All share the accordion interaction pattern (expand/collapse)
- All serve FAQ-like or collapsible content purpose

### 3.3 Expected differences to classify

Likely Category A (tokens):
- Brand colors, fonts, spacing
- Border styles, radius
- Icon style (chevron, plus/minus, etc.)

Likely Category B (props):
- Single-open vs. multi-open behavior
- Default expanded state
- Animation style/duration
- Whether to show item count or numbering

Likely Category C (structural divergence):
- FBTO has container/block separation (compound component) vs. CB which may be a single rendering
- CB "Focus accordion v1" uses `.js-collapsable` — may be a fundamentally different component (focus panel vs. accordion)

### 3.4 Risk assessment

Key risks to evaluate:
- Is CB "Focus accordion v1" actually an accordion or a different collapsible pattern? The low structural similarity (0.356) suggests it may be structurally different.
- Can FBTO's container/block relationship be preserved in a compound React component?

---

## Phase 4 — Design

### 4.1 Proposed component name

`Accordion` (English, descriptive)

### 4.2 Expected composition

```
Accordion (root container)
├── Accordion.Item (repeatable)
│   ├── Accordion.Trigger (clickable header)
│   └── Accordion.Content (collapsible body)
```

### 4.3–4.7

To be completed after Phases 1–3 are executed. The agent will:
- Define the TypeScript props interface based on Category B findings
- Define the three-tier token mapping based on Category A findings
- Propose semantic HTML (prefer `<details>`/`<summary>` if viable)
- Add FAQ schema if accordion contains Q&A content
- Document migration notes (Sitecore field mapping, analytics events, pages affected)

---

## Execution output

The final analysis report will be written to:

```
data/comparisons/accordeon-container/analysis.md
```

Gathered artifacts will be saved to:

```
data/comparisons/accordeon-container/gathered/
```
