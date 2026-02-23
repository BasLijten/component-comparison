# Component Analysis: Accordion

> **Generated:** 2026-02-22
> **Brands:** FBTO, Centraal Beheer (CB)
> **Confirmed pairs:** 3
> **Agent:** GitHub Copilot CLI (playwright-cli + deep-analysis-playbook v1.0.0)

---

## Executive Summary

All four accordion instances (FBTO Accordeon container, FBTO Accordeon block, CB Content accordion v1, CB Focus accordion v1) serve the same fundamental purpose — collapsible content sections — but they use structurally incompatible implementations. FBTO uses a `<button aria-expanded>` + jQuery pattern with FAQ Schema.org markup, while both CB variants use a pure-CSS `<input type="checkbox">` + `<label>` pattern with no ARIA attributes. Unification is feasible at **medium complexity**: a single React compound component (`Accordion`) can replace all four instances, provided the CB checkbox/label pattern is replaced with a proper button-based accessible implementation.

---

## Component Instances

| # | Brand | Name in brand | Selector | Usage count | Sample URL | Screenshot |
|---|-------|--------------|----------|-------------|------------|-----------|
| 1 | FBTO | Accordeon container | `div.accordion` | 631 pages (578 unique) | [fbto.nl/aanhangwagenverzekering](https://www.fbto.nl/aanhangwagenverzekering) | [fbto-accordeon-container-component.png](gathered/fbto-accordeon-container-component.png) |
| 2 | FBTO | Accordeon block | `div.accordion__item` | 3500 pages (578 unique, child of container) | Same pages as container | [fbto-accordeon-block-component.png](gathered/fbto-accordeon-block-component.png) |
| 3 | CB | Content accordion v1 | `.strip.main-content.content-accordion` | 535 pages (403 unique) | [centraalbeheer.nl/account/app](https://www.centraalbeheer.nl/account/app) | [cb-content-accordion-v1-component.png](gathered/cb-content-accordion-v1-component.png) |
| 4 | CB | Focus accordion v1 | `.strip.js-collapsable` | 196 pages (164 unique) | [centraalbeheer.nl/artikelen/10-tips-proefrit-auto](https://www.centraalbeheer.nl/artikelen/10-tips-proefrit-auto) | [cb-focus-accordion-v1-component.png](gathered/cb-focus-accordion-v1-component.png) |

---

## Gathered Data

All artifacts are in `data/comparisons/accordeon-container/gathered/`.

| File | Description |
|------|-------------|
| `fbto-accordeon-container.html` | Full outerHTML of FBTO accordion (5 items) |
| `fbto-accordeon-block.html` | Single `accordion__item` outerHTML |
| `fbto-accordeon-container-styles.json` | Computed styles for FBTO accordion elements |
| `fbto-accordeon-container-component.png` | FBTO component screenshot @ 1440px |
| `fbto-accordeon-container-{320,768,1024,1440}.png` | FBTO responsive screenshots |
| `fbto-accordeon-container-expanded.png` | FBTO first item in expanded state |
| `fbto-accordeon-container-full-page.png` | FBTO full page screenshot |
| `cb-content-accordion-v1.html` | CB Content accordion outerHTML |
| `cb-content-accordion-v1-component.png` | CB Content accordion @ 1440px |
| `cb-content-accordion-v1-{320,768,1024,1440}.png` | CB Content accordion responsive screenshots |
| `cb-content-accordion-v1-full-page.png` | CB full page screenshot |
| `cb-focus-accordion-v1.html` | CB Focus accordion outerHTML |
| `cb-focus-accordion-v1-component.png` | CB Focus accordion @ 1440px |
| `cb-focus-accordion-v1-{320,768,1024,1440}.png` | CB Focus accordion responsive screenshots |
| `cb-focus-accordion-v1-full-page.png` | CB Focus accordion full page screenshot |

---

## Structure Analysis

### DOM structure per instance

#### FBTO — Accordeon container / Accordeon block

```html
<div class="accordion">                                    <!-- Container -->
  <div class="accordion__item"                            <!-- Block (repeatable) -->
       itemscope itemtype="https://schema.org/Question"
       itemprop="mainEntity">
    <div class="accordion__question">
      <h3>
        <button type="button" aria-expanded="false"
                itemprop="name">Question text</button>
      </h3>
      <div class="accordion__item-icon">
        <i class="icon icon-rf-chevron-down" aria-hidden="true"></i>
      </div>
    </div>
    <div class="accordion__answer"
         itemscope itemtype="https://schema.org/Answer"
         itemprop="acceptedAnswer">
      <div class="cms-content-wrapper" itemprop="text">
        <p>Answer content</p>
      </div>
    </div>
  </div>
  <!-- more accordion__item elements -->
</div>
```

**Semantic skeleton:** `div > (div > (div > (h3 > button) + div) + div)×N`

**Key facts:**
- Root: `<div class="accordion">` — not semantic (no `<section>`, no `<details>`)
- Trigger: `<button type="button">` inside `<h3>` — semantically strong
- ARIA: `aria-expanded` on button — **no `aria-controls`** linking to the answer panel
- Schema.org: FAQPage/Question/Answer markup — **no explicit `@type="FAQPage"` on the container**
- Icon: icon font class (`icon-rf-chevron-down`), `aria-hidden="true"` — correct
- The "Accordeon block" (`div.accordion__item`) IS the repeatable item; "Accordeon container" (`div.accordion`) is just the wrapper — they are one compound component, not two separate ones
- Content hidden via CSS `max-height: 0 / overflow: hidden` (not `display: none` or `hidden` attribute)

#### CB — Content accordion v1

```html
<article class="strip main-content content-accordion js-collapsable"
         qa-id="stappenplan">
  <div class="container">
    <div class="row">
      <div class="col-md-7">
        <div class="main-content__content ordered-collapsable ordered-collapsable--steps">
          <h2 class="title-large">Section title</h2>
          <div class="content-text">Intro text</div>

          <div class="collapsable collapsable--arrow collapsable--blue-arrow
                      collapsable--animated collapsable-unchecked"
               cb-collapsable="">
            <input type="checkbox"
                   id="[guid]_[sitecore-id]"
                   name="[sitecore-id]"
                   class="collapsable__input visually-hidden">
            <label class="collapsable__header js-collapsable-label"
                   for="[guid]_[sitecore-id]">
              <h3 class="title-small">Item title</h3>
              <span class="icon icon--s-arrow-down">
                <svg aria-hidden="true"><!-- chevron --></svg>
              </span>
            </label>
            <div class="collapsable__content js-collapsable-content"
                 style="--max-height: 75px">
              <div class="content-text">Answer content</div>
            </div>
          </div>
          <!-- more collapsable divs -->
        </div>
      </div>
    </div>
  </div>
</article>
```

**Key facts:**
- Root: `<article>` — semantic document-level element
- Trigger: `<label>` for a visually-hidden `<input type="checkbox">` — **NOT a button**
- ARIA: **None** — no `aria-expanded`, no `aria-controls`, no roles
- Schema.org: **None**
- Icon: inline SVG, `aria-hidden="true"` — correct
- CSS custom property `--max-height` used for animation
- `cb-collapsable=""` attribute hints at a custom Angular/Vue directive, but framework check showed **no Angular/Vue/jQuery** — appears to be a vanilla JS or CSS-only solution

#### CB — Focus accordion v1

```html
<article class="strip main-content ordered-collapsable ordered-collapsable--steps js-collapsable"
         qa-id="zomaaktueenproefrit">
  <div class="container">
    <div class="row">
      <div class="col-12 col-lg-10 col-lg-offset-1 col-xl-8 col-xl-offset-2">
        <div class="main-content__content">
          <h2 class="title-large">Section title</h2>

          <div class="collapsable collapsable--arrow collapsable--blue-arrow collapsable--animated">
            <input type="checkbox" id="[GUID]" name="Accordion"
                   checked="checked" class="collapsable__input visually-hidden">
            <label class="collapsable__header js-collapsable-label" for="[GUID]">
              <h3 class="title-medium">Item title</h3>
              <span class="icon icon--s-arrow-down">
                <svg aria-hidden="true"><!-- chevron --></svg>
              </span>
            </label>
            <div class="collapsable__content js-collapsable-content">
              <div class="content-text">Content</div>
            </div>
          </div>
          <!-- more collapsable divs -->
        </div>
      </div>
    </div>
  </div>
</article>
```

**Key facts:**
- Uses the **identical collapsable CSS pattern** as Content accordion v1
- Difference: `name="Accordion"` (shared name across items) vs. UUID per item
- First item has `checked="checked"` — expanded by default
- Heading uses `title-medium` (24px) vs. `title-small` (20px) in Content accordion
- Content panel has **no** `--max-height` inline style (shows as `max-height: none` = fully open by default)
- No `collapsable-unchecked` class (they start open)

### ARIA attribute comparison

| Attribute | FBTO | CB Content | CB Focus |
|-----------|------|-----------|---------|
| `aria-expanded` | ✅ on `<button>` | ❌ absent | ❌ absent |
| `aria-controls` | ❌ absent | ❌ absent | ❌ absent |
| `aria-labelledby` | ❌ absent | ❌ absent | ❌ absent |
| `role="region"` | ❌ absent | ❌ absent | ❌ absent |
| `aria-hidden` on icon | ✅ | ✅ | ✅ |
| Interactive element type | `<button>` ✅ | `<label>` ⚠️ | `<label>` ⚠️ |

### Content slots

| Slot | FBTO | CB Content | CB Focus |
|------|------|-----------|---------|
| Section heading | Absent (accordion stands alone) | `<h2>` section title + `<div>` intro text | `<h2>` section title |
| Item trigger/heading | `<h3>` containing `<button>` | `<label>` containing `<h3>` | `<label>` containing `<h3>` |
| Item body | `div.cms-content-wrapper` → HTML | `div.content-text` → HTML | `div.content-text` → HTML |
| Icon | Icon font (chevron-down) | Inline SVG (arrow-down) | Inline SVG (arrow-down) |

---

## Styling Analysis

### Typography

| Property | FBTO | CB Content | CB Focus |
|----------|------|-----------|---------|
| Font family | `circular, "Helvetica Neue", Arial` | `OpenSans, Arial, sans-serif` | `OpenSans, Arial, sans-serif` |
| Trigger font size | 17.4px | 20px (`title-small`) | 24px (`title-medium`) |
| Trigger font weight | **900** (Black) | 600 (SemiBold) | 600 (SemiBold) |
| Trigger text color | `rgb(0, 43, 102)` (FBTO dark blue) | `rgb(51, 51, 51)` (dark gray) | `rgb(51, 51, 51)` (dark gray) |
| Body font size | 16px (browser default) | 16px | 16px |

### Colors

| Surface | FBTO | CB Content | CB Focus |
|---------|------|-----------|---------|
| Item background | `rgb(239, 238, 235)` (warm beige) | `rgb(255, 255, 255)` (white) | `rgb(255, 255, 255)` (white) |
| Trigger background | `rgba(0,0,0,0)` (transparent) | `rgb(255, 255, 255)` (white) | `rgb(255, 255, 255)` (white) |
| Content area background | `rgba(0,0,0,0)` (transparent) | `rgba(0,0,0,0)` (transparent) | `rgba(0,0,0,0)` (transparent) |

### Animation

| Property | FBTO | CB Content | CB Focus |
|----------|------|-----------|---------|
| Transition | `max-height 0.3s cubic-bezier(0,1,0,1), opacity 0.3s ease-in-out` | `transform 0.3s, max-height 0.3s` | `transform 0.3s, max-height 0.3s` |
| Duration | 300ms | 300ms | 300ms |
| Easing | cubic-bezier (elastic) + ease-in-out | linear (default) | linear (default) |
| Overflow | `hidden` | `hidden` | `hidden` |

### Spacing

| Property | FBTO | CB Content | CB Focus |
|----------|------|-----------|---------|
| Trigger padding | `0px` (parent handles it) | `16px 32px 16px 0px` | `16px 32px 16px 0px` |
| Item padding | Within `.accordion__question` | Within `label` | Within `label` |

### Design token candidates (Category A)

| Difference | Component token | References semantic | FBTO value | CB value |
|------------|----------------|---------------------|------------|---------|
| Trigger text color | `--accordion-trigger-color` | `--text-interactive` | `rgb(0, 43, 102)` | `rgb(51, 51, 51)` |
| Item background | `--accordion-item-bg` | `--surface-secondary` | `rgb(239, 238, 235)` | `rgb(255, 255, 255)` |
| Font family | `--accordion-font-family` | `--font-family-base` | `circular, "Helvetica Neue", Arial` | `OpenSans, Arial, sans-serif` |
| Trigger font weight | `--accordion-trigger-font-weight` | `--font-weight-heading` | `900` | `600` |
| Trigger font size | `--accordion-trigger-font-size` | `--text-md` | `17.4px` | `20px` or `24px` |
| Animation easing | `--accordion-transition-easing` | `--easing-expand` | `cubic-bezier(0,1,0,1)` | `linear` |
| Animation duration | `--accordion-transition-duration` | `--duration-normal` | `300ms` | `300ms` |
| Icon type | `--accordion-icon` | (not a token; prop) | Icon font chevron | Inline SVG arrow |

---

## Interaction Analysis

### State machine

All four instances share this state machine conceptually:

```
COLLAPSED (default)
  → click trigger → EXPANDING (animation) → EXPANDED
EXPANDED
  → click trigger → COLLAPSING (animation) → COLLAPSED
```

### Behavior comparison

| Behavior | FBTO | CB Content | CB Focus |
|----------|------|-----------|---------|
| Trigger mechanism | `<button>` click + jQuery JS | `<label>` click → checkbox toggle (CSS) | `<label>` click → checkbox toggle (CSS) |
| Default state | All collapsed | All collapsed | First item expanded |
| Single-open | ❌ Multi-open | ❌ Multi-open (checkbox) | ❌ Multi-open (checkbox) |
| JS framework | jQuery (vanilla accordion) | None (CSS-only with `cb-collapsable` attr for optional JS) | None (CSS-only) |
| Same-name inputs | N/A | UUID per group (so all independent) | `name="Accordion"` (shared, but still checkboxes so multi-open) |
| Animation trigger | JS toggles `js-active` class + CSS max-height | CSS `:checked` selector + CSS max-height | CSS `:checked` selector + CSS max-height |

### Default expanded state

CB Focus accordion starts with the **first item pre-expanded** (`checked="checked"`). This is a component-level behavior difference: some accordions are designed to show the first answer immediately (common for "steps" and ordered content), while others start fully collapsed (common for FAQ).

### Keyboard navigation

| Test | FBTO | CB Content | CB Focus |
|------|------|-----------|---------|
| Tab to trigger | ✅ (button is focusable) | ⚠️ (label is focusable but behavior varies by browser) | ⚠️ same |
| Enter/Space to toggle | ✅ (button default behavior) | ⚠️ (Space works on label in some browsers) | ⚠️ same |
| Arrow keys between items | ❌ not implemented | ❌ not implemented | ❌ not implemented |

---

## Accessibility Audit

### ARIA assessment (without running axe-core)

| Issue | Severity | Brand | Description |
|-------|----------|-------|-------------|
| Missing `aria-controls` | Serious | FBTO | Button lacks `aria-controls` to reference its controlled panel |
| No `aria-expanded` | Critical | CB (both) | Screen readers cannot announce open/closed state |
| `<label>` as interactive trigger | Serious | CB (both) | Labels are not buttons; keyboard/SR behavior inconsistent across browsers |
| No panel `id` or `role` | Moderate | FBTO | Answer panel has no `id` so `aria-controls` cannot reference it |
| Missing `role="region"` on panels | Moderate | All | Content panels lack landmark roles |
| No `aria-labelledby` on panels | Moderate | All | Content panels not associated with their trigger heading |

### Keyboard navigation gaps

- **Arrow key navigation between items** is not implemented on any brand — WAI-ARIA Accordion pattern recommends `ArrowUp`/`ArrowDown` to move between headers
- **Escape to collapse** is not implemented
- **Home/End** to jump to first/last item is not implemented

### Screen reader experience

- **FBTO:** Screen reader announces "Ben ik verplicht... button, collapsed" — functional but incomplete (no connection to controlled region)
- **CB:** Screen reader announces "Download de app, unchecked checkbox" — deeply misleading; user has no idea it controls a collapsible content region

### Color contrast

| Brand | Text color | Background | Ratio (estimated) |
|-------|-----------|-----------|-------------------|
| FBTO | `rgb(0, 43, 102)` on `rgb(239, 238, 235)` | ~6.1:1 | ✅ WCAG AA |
| CB | `rgb(51, 51, 51)` on `rgb(255, 255, 255)` | ~13.2:1 | ✅ WCAG AAA |

---

## SEO & Content

### Heading hierarchy

- **FBTO:** `h3` for accordion item titles — correct when used below a page `h2`
- **CB Content accordion:** `h2` for section title + `h3` for items — correct hierarchy
- **CB Focus accordion:** `h2` for section title + `h3` or `h2` for items (varies by page context — `title-medium` is rendered as `h3`)

### Structured data

- **FBTO:** Has `itemscope`/`itemtype`/`itemprop` Schema.org FAQ markup on container and items. Missing the outer `@type: FAQPage` wrapper (only `Question`/`Answer` pairs). Items will be indexed by Google as FAQ fragments.
- **CB:** No structured data of any kind.

### Indexability

- **All brands:** Content is hidden via `max-height: 0; overflow: hidden` in CSS — **Googlebot renders and indexes the content** (it is in the DOM, not behind `display: none` or `visibility: hidden`). FAQ answers are crawlable.

### GEO readiness

- FBTO accordion content (FAQ format with Q&A pairs) is well-structured for AI search engines
- CB accordion lacks schema markup — opportunity to add `FAQPage` or `HowTo` JSON-LD

---

## Performance

### CLS (Cumulative Layout Shift)

- **FBTO:** Items start collapsed; no layout shift on load. If any item is expanded via URL hash on load, the max-height animation could cause minor shift (negligible).
- **CB:** First item in Focus accordion starts expanded (`checked`), so height is set at render time — no CLS.

### LCP (Largest Contentful Paint)

- Accordions are below the fold on the tested pages — not LCP candidates.

### JS bundle

- **FBTO:** jQuery drives the accordion toggle. jQuery is a significant dependency (~30kB gzipped) shared across all FBTO pages.
- **CB:** No JS needed for basic toggle (pure CSS checkbox). Optional `cb-collapsable` JS likely handles keyboard or ARIA augmentation.

### Image optimization

- No images within accordion items on tested pages.
- FBTO uses icon font (`icon-rf-chevron-down`) — renders as text, no image request.
- CB uses inline SVG — renders inline, no image request.

---

## Similarities

- All four instances serve **collapsible content sections** with header + body structure
- All use **chevron/arrow icon** that animates on expand/collapse
- All use **`max-height` transition** at 300ms for the animation
- All support **multi-open** (multiple items can be open simultaneously)
- All headings use **`<h3>`** for item titles (within a section that has an `<h2>`)
- All hide content via **`overflow: hidden` + `max-height: 0`** — content is accessible to search engines
- All use **inline SVG or icon font** with `aria-hidden="true"` for the toggle icon

---

## Differences

### Category A — Design Tokens (resolved via CSS custom properties)

| Difference | Component token | References semantic | FBTO value | CB value |
|------------|----------------|---------------------|------------|---------|
| Item background color | `--accordion-item-bg` | `--surface-secondary` | `#efeeeb` (warm beige) | `#ffffff` (white) |
| Trigger text color | `--accordion-trigger-color` | `--color-interactive` | `#002b66` (FBTO dark blue) | `#333333` (near-black) |
| Font family | `--accordion-font-family` | `--font-family-base` | `circular` | `OpenSans` |
| Trigger font weight | `--accordion-trigger-font-weight` | `--font-weight-strong` | `900` | `600` |
| Trigger font size | `--accordion-trigger-font-size` | `--text-body-md` | `17.4px` | `20px` (content) / `24px` (focus) |
| Animation easing (expand) | `--accordion-easing-expand` | `--easing-bounce` | `cubic-bezier(0,1,0,1)` | `linear` |
| Animation duration | `--accordion-duration` | `--duration-fast` | `300ms` | `300ms` |

### Category B — Component Props (resolved via React props)

| Prop | Type | Default | FBTO | CB Content | CB Focus | Notes |
|------|------|---------|------|-----------|---------|-------|
| `defaultOpenIndex` | `number \| null` | `null` | `null` (all closed) | `null` | `0` (first open) | Which item starts expanded |
| `allowMultiple` | `boolean` | `true` | `true` | `true` | `true` | All brands allow multiple open; keep as configurable prop |
| `sectionTitle` | `ReactNode \| null` | `null` | `null` | `ReactNode` | `ReactNode` | Optional `<h2>` + intro text above items |
| `sectionIntro` | `ReactNode \| null` | `null` | `null` | `ReactNode` | `null` | Optional intro paragraph after section title |
| `iconVariant` | `'chevron' \| 'arrow'` | `'chevron'` | `'chevron'` | `'arrow'` | `'arrow'` | Icon shape difference (tokenizable via CSS but prop is cleaner) |
| `schemaType` | `'FAQPage' \| 'HowTo' \| null` | `null` | `'FAQPage'` | Suggest `'FAQPage'` or `'HowTo'` | Suggest `'HowTo'` | Structured data output |

### Category C — Structural Divergence (requires architectural decision)

#### C1 — Interactive trigger element: `<button>` vs `<label>`/`<input>`

**FBTO** uses a `<button type="button">` with `aria-expanded`. **CB** uses a `<label>` + visually-hidden `<input type="checkbox">`. These are fundamentally different accessibility implementations.

**Decision:** The new React component **must** use `<button>` with `aria-expanded` and `aria-controls`. The CSS checkbox pattern cannot be used in React without significant workarounds and delivers a broken accessibility experience. CB will adopt the button pattern.

**Risk:** Low — CB's checkbox pattern is an implementation detail invisible to end users. The visual experience is identical. The CB team needs to accept that the new component requires a small amount of JavaScript for state management (React `useState`).

#### C2 — Schema.org markup presence

FBTO has FAQ Schema.org markup on every accordion item; CB has none. The new component needs to support optional JSON-LD output and Schema.org attributes.

**Decision:** Make Schema.org markup opt-in via the `schemaType` prop. When `schemaType="FAQPage"`, items render with `itemscope`/`itemtype`/`itemprop` attributes. When `null`, no schema attributes are rendered.

**Risk:** Low — additive feature, no breaking change.

#### C3 — Container/item separation (FBTO compound vs CB single component)

FBTO models this as two Sitecore components: "Accordeon container" (the `div.accordion` wrapper) and "Accordeon block" (each `div.accordion__item`). CB models this as a single Sitecore component containing all items.

**Decision:** Use the **compound component pattern** (`Accordion` + `Accordion.Item`) in React regardless of how the CMS models it. Sitecore can output any number of child items into the container. This is transparent to the React component.

**Risk:** Low — compound components are idiomatic React and map cleanly to both CMS models.

---

## Unified Component Design

### Name & Composition

**Proposed name:** `Accordion`

**Composition:** Compound component

```
Accordion (root container, manages open/closed state)
├── Accordion.Header (optional section-level title block)
│   ├── h2 (section title, optional)
│   └── p (intro text, optional)
└── Accordion.Item (repeatable, one per Q&A or step)
    ├── Accordion.Trigger (clickable heading button)
    │   ├── h3 (or configurable heading level)
    │   └── AccordionIcon (chevron/arrow SVG)
    └── Accordion.Content (collapsible body, animated)
```

`Accordion.Trigger` is potentially reusable in a future `Tabs` component.

### Props Interface

```typescript
interface AccordionItem {
  /** Unique identifier for this item */
  id: string;
  /** Trigger/header text (displayed in the button heading) */
  title: ReactNode;
  /** Collapsible body content */
  content: ReactNode;
  /** If true, this item is expanded on initial render */
  defaultOpen?: boolean;
}

interface AccordionProps {
  /** The list of accordion items */
  items: AccordionItem[];

  // ── Behavior ──────────────────────────────────────────────────
  /** Allow multiple items open simultaneously (default: true) */
  allowMultiple?: boolean;

  // ── Optional section block ────────────────────────────────────
  /** Section-level heading rendered as <h2> above items (CB pattern) */
  sectionTitle?: ReactNode;
  /** Section-level intro paragraph below sectionTitle (CB Content pattern) */
  sectionIntro?: ReactNode;
  /** Heading level for item triggers (default: 3) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;

  // ── Visual ────────────────────────────────────────────────────
  /** Icon variant for the expand/collapse indicator */
  iconVariant?: 'chevron' | 'arrow';

  // ── Structured data ───────────────────────────────────────────
  /** When set, renders JSON-LD and Schema.org microdata for SEO */
  schemaType?: 'FAQPage' | 'HowTo' | null;

  // ── Standard React ────────────────────────────────────────────
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
```

### Design Tokens

Three-tier token hierarchy:

```css
/* ── Tier 1: Global tokens (defined per brand) ─────────────── */

/* FBTO */
--color-primary: #002b66;
--color-neutral-100: #efeeeb;
--font-family-base: circular, "Helvetica Neue", Arial, sans-serif;
--font-weight-strong: 900;
--easing-bounce: cubic-bezier(0, 1, 0, 1);

/* CB */
--color-primary: #333333;
--color-neutral-100: #ffffff;
--font-family-base: OpenSans, Arial, sans-serif;
--font-weight-strong: 600;
--easing-bounce: linear;

/* Shared */
--duration-fast: 300ms;
--spacing-4: 1rem;    /* 16px */
--spacing-8: 2rem;    /* 32px */

/* ── Tier 2: Semantic tokens (shared across components) ─────── */
--surface-secondary: var(--color-neutral-100);
--text-interactive: var(--color-primary);
--font-family-body: var(--font-family-base);
--font-weight-heading: var(--font-weight-strong);
--easing-expand: var(--easing-bounce);
--duration-normal: var(--duration-fast);
--border-subtle: 1px solid var(--color-neutral-200);

/* ── Tier 3: Component tokens (accordion-specific) ──────────── */
--accordion-item-bg: var(--surface-secondary);
--accordion-trigger-color: var(--text-interactive);
--accordion-trigger-font-family: var(--font-family-body);
--accordion-trigger-font-weight: var(--font-weight-heading);
--accordion-trigger-font-size: var(--text-body-md);  /* 16px–24px range */
--accordion-content-bg: transparent;
--accordion-icon-color: var(--text-interactive);
--accordion-border: var(--border-subtle);
--accordion-duration: var(--duration-normal);
--accordion-easing: var(--easing-expand);
--accordion-item-padding-y: var(--spacing-4);
--accordion-item-padding-x: var(--spacing-8);
```

### Semantic HTML

```html
<!-- Accordion (schemaType="FAQPage") -->
<section aria-label="Veelgestelde vragen" class="accordion">
  <!-- JSON-LD inserted by React in <head> or as <script> -->

  <div class="accordion__item" itemscope itemtype="https://schema.org/Question">
    <h3 class="accordion__trigger-heading">
      <button
        type="button"
        id="accordion-trigger-1"
        aria-expanded="false"
        aria-controls="accordion-panel-1"
        itemprop="name"
        class="accordion__trigger"
      >
        Ben ik verplicht om mijn aanhangwagen te verzekeren?
        <span class="accordion__icon" aria-hidden="true">
          <svg><!-- chevron or arrow SVG --></svg>
        </span>
      </button>
    </h3>
    <div
      id="accordion-panel-1"
      role="region"
      aria-labelledby="accordion-trigger-1"
      class="accordion__panel"
      hidden
      itemscope
      itemtype="https://schema.org/Answer"
    >
      <div class="accordion__panel-inner" itemprop="text">
        <p>Answer text...</p>
      </div>
    </div>
  </div>

  <!-- more items -->
</section>

<!-- Accordion without schema (generic) -->
<section aria-label="Meer informatie" class="accordion">
  <!-- same structure, without itemscope/itemprop attributes -->
</section>
```

**Improvements over current implementations:**
- `aria-controls` linking button → panel ✅
- `role="region"` on panels ✅
- `aria-labelledby` on panels ✅
- `hidden` attribute managed by React (removes from AT when collapsed) — or `aria-hidden` + CSS for animated transitions

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Ben ik verplicht om mijn aanhangwagen te verzekeren?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nee, je bent niet verplicht..."
      }
    }
  ]
}
```

For CB step-by-step content, use `HowTo`:

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Snel aan de slag in 3 stappen",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Download de app",
      "text": "Je vindt 'm gratis in de Appstore of Google Play."
    }
  ]
}
```

---

## Migration

### JS libraries replaced

| Brand | Current | Replaced by |
|-------|---------|-------------|
| FBTO | jQuery accordion plugin (custom) | React `useState` / Radix UI Accordion |
| CB | Pure CSS checkbox hack + optional `cb-collapsable` JS | React `useState` / Radix UI Accordion |

### CMS field mapping (Sitecore → new props)

#### FBTO Accordeon container (Sitecore component)
| Sitecore field | New prop | Notes |
|----------------|----------|-------|
| `children: Accordeon block[]` | `items: AccordionItem[]` | Container wraps blocks; CMS maps each block to an item |

#### FBTO Accordeon block (Sitecore component, becomes AccordionItem)
| Sitecore field | New prop | Notes |
|----------------|----------|-------|
| Question text | `items[n].title` | Currently used as `button` text and `itemprop="name"` |
| Answer HTML | `items[n].content` | Rich text, rendered as `ReactNode` |

#### CB Content accordion v1
| Sitecore field | New prop | Notes |
|----------------|----------|-------|
| Section title | `sectionTitle` | Optional `h2` |
| Intro text | `sectionIntro` | Optional paragraph |
| `collapsable[]` items | `items[]` | Each `collapsable` div → one `AccordionItem` |
| Item title | `items[n].title` | Currently in `h3.title-small` inside `label` |
| Item content HTML | `items[n].content` | Currently in `.collapsable__content` |

#### CB Focus accordion v1
| Sitecore field | New prop | Notes |
|----------------|----------|-------|
| Section title | `sectionTitle` | `h2` |
| `collapsable[]` items | `items[]` | Same as Content accordion |
| First item checked | `items[0].defaultOpen: true` | The `checked="checked"` default state |
| Heading size (`title-medium`) | Pass via `className` or `headingLevel` | Size difference is a visual variant; could be a CSS modifier class |

### Analytics event mapping

Current FBTO analytics tracking (observed from network requests to `collectie.fbto.nl`):
- XHR requests to `jsEvent.json` fire on page events (including likely accordion expand)
- New component should emit a `CustomEvent` on expand: `accordion:expand` with `{itemId, itemTitle, componentId}` for GTM to pick up
- CB analytics: no specific accordion events observed in network log

### Pages affected

| Brand | Component | Pages |
|-------|-----------|-------|
| FBTO | Accordeon container | 578 unique pages |
| FBTO | Accordeon block | Same 578 pages (as child) |
| CB | Content accordion v1 | 403 unique pages |
| CB | Focus accordion v1 | 164 unique pages |

**Total migration scope: ~1145 unique pages** (some may overlap between brands, none between brands).

### Rollback strategy

1. Ship the new React `Accordion` component behind a feature flag in the CMS template
2. Old Sitecore components remain in the CMS but are hidden from the component selector
3. Pages are migrated in batches by template type (e.g., all insurance product pages first)
4. A/B test on 10% of traffic for 2 weeks; roll back by switching the feature flag
5. Full rollout only after accessibility and performance regression tests pass

---

## Open Questions

1. **Should `allowMultiple` default to `false`?** The WAI-ARIA Accordion pattern defaults to single-open (pressing a trigger closes the previous item). All current brand implementations allow multi-open. Product/UX decision needed.

2. **CB Focus accordion heading size:** The `title-medium` (24px) vs `title-small` (20px) difference — is this a variant prop (e.g., `size="compact" | "expanded"`) or should the consumer control it via CSS?

3. **Icon standardization:** FBTO uses an icon font; CB uses inline SVG. The new design system needs to decide on the icon delivery mechanism (icon font vs SVG sprite vs inline SVG). This affects the `iconVariant` prop design.

4. **`<details>`/`<summary>` vs custom button:** Should we use native `<details>`/`<summary>` HTML? Pro: no JS needed for basic toggle. Con: animation is hard to implement, and the pattern is less customizable (can't easily manage `aria-controls`). Recommendation: **stick with custom `<button>`** + React state.

5. **CB `cb-collapsable` custom directive:** Does this attribute trigger any additional JavaScript behavior (analytics, lazy load)? Needs investigation with CB dev team before migration.

6. **Schema.org on CB:** CB has zero structured data today. Is there a legal/compliance reason, or is it simply not implemented? Adding FAQ/HowTo schema may require legal review.

7. **FBTO `aria-controls` gap:** On migration, the FBTO Sitecore content currently does not store unique IDs for accordion panels. The new React component will generate IDs automatically using a React `useId` hook — verify this is acceptable with the FBTO SEO team.
