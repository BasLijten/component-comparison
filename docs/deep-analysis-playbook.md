# Deep Analysis Playbook

**Purpose:** Step-by-step instructions for an AI agent to perform a fully automated deep analysis of a UI component across brands. The analysis produces a single Markdown report covering all confirmed-same counterparts, culminating in a unified React component design proposal.

**Context:** We are migrating from ASP.NET Full Framework (Angular/Vue/vanilla JS + Sitecore CMS) to Next.js + React with a multi-brand design system driven by CSS design tokens. Each component must work across all brands, preserving brand identity through tokens and props — not through separate codebases.

---

## How to Use This Playbook

1. An agent receives a **component name** as input
2. The agent resolves all **confirmed-same pairs** from the comparison tool's data
3. The agent executes **Phases 1–4** sequentially
4. The agent writes a single **Markdown report** to `data/comparisons/{component-slug}/analysis.md`

The agent should have access to: Playwright (browser automation), the project's data files, and a code execution environment.

---

## Phase 0 — Input & Setup

### Inputs

The agent receives:

```yaml
component: "Component Name"        # The component to analyze
```

### Resolution steps

1. Read `data/manual-review.json` — collect all pair keys where status = `"confirmed"` that involve this component
2. For each confirmed pair, read the counterpart's brand data from `data/{brand}-report/extracted-data.json`
3. Read CSS selectors from `data/{brand}-report/component-selectors.json`
4. Collect sample page URLs (at least 1 per brand, preferably 3 for coverage)
5. Locate existing screenshots in `src/public/screenshots/{brand}/`

### Output of Phase 0

A resolved context object containing:

- Component name per brand (they may differ)
- CSS selector per brand (may be `null`)
- Sample URLs per brand (up to 3)
- Screenshot paths per brand
- Similarity scores from `data/similarity.json`

---

## Phase 1 — Gather

> **Goal:** Collect raw data from the live websites for each brand instance of the component.

For **each brand** that has a confirmed instance of this component:

### 1.1 Navigate & capture

- Open each sample URL in Playwright (desktop viewport: 1440×900)
- Wait for network idle
- Take a full-page screenshot
- If a CSS selector is available: scroll to the component, take a cropped screenshot of just the component
- If no selector: attempt to identify the component visually by name/screenshot matching

### 1.2 Extract HTML

- Using the CSS selector (or identified element), extract:
  - The component's **outerHTML** (full DOM subtree)
  - A **simplified HTML tree** — strip all CSS classes, inline styles, and data attributes to reveal the semantic skeleton
  - Count of each element type used (e.g., 3× `<button>`, 2× `<div>`, 1× `<details>`)

### 1.3 Extract CSS

- For the component and its descendants, collect **computed styles** for:
  - Layout: `display`, `flex-direction`, `grid-template-*`, `gap`, `align-items`, `justify-content`
  - Spacing: `margin`, `padding` (all sides)
  - Typography: `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `color`
  - Colors: `background-color`, `border-color`, text `color`
  - Borders: `border`, `border-radius`
  - Shadows: `box-shadow`, `text-shadow`
  - Transitions: `transition`, `animation`
- Extract all unique CSS class names used on the component and its children

### 1.4 Extract interactions

- Observe and document:
  - Click behavior (what happens when you click the component or its interactive children)
  - Hover states (style changes on `:hover`)
  - Keyboard navigation (Tab order, Enter/Space activation, Arrow key behavior)
  - State changes (e.g., expanded → collapsed, loading → loaded)
  - Any animations (note duration, easing, `prefers-reduced-motion` support)

### 1.5 Responsive check

- Resize viewport to 4 breakpoints and note layout changes:
  - **320px** (mobile small)
  - **768px** (tablet)
  - **1024px** (desktop small)
  - **1440px** (desktop large)
- Take a screenshot at each breakpoint (component only if selector is available)

### Artifacts from Phase 1

Save to `data/comparisons/{component-slug}/gathered/`:

```
{brand}-component.png           # Cropped component screenshot (desktop)
{brand}-full-page.png           # Full page screenshot
{brand}-320.png                 # Mobile screenshot
{brand}-768.png                 # Tablet screenshot
{brand}-1024.png                # Desktop small screenshot
{brand}-1440.png                # Desktop large screenshot
{brand}.html                    # Full outerHTML
{brand}-skeleton.html           # Class-stripped semantic HTML
{brand}-styles.json             # Computed styles per element
{brand}-interactions.json       # Observed behaviors
```

---

## Phase 2 — Analyze

> **Goal:** Derive structured findings from the raw data gathered in Phase 1.

### 2.1 Structure analysis

From the extracted HTML:

- Map the **DOM tree hierarchy** (nesting depth, parent-child relationships)
- Identify **semantic elements** (`<details>`, `<summary>`, `<button>`, `<article>`, `<section>`, `<nav>`, etc.)
- List **ARIA attributes** and roles
- Identify **content slots** — where does CMS-authored content go? (headings, body text, images, CTAs)
- Note heading hierarchy (`h1`–`h6`) within the component
- Flag non-semantic patterns (e.g., `<div>` used as a button, click handlers on non-interactive elements)

### 2.2 Styling analysis

From the computed styles:

- Identify which styles are **brand-specific** (colors, fonts, specific spacing values) vs. **structural** (layout system, grid/flex, positioning)
- Group related styles into **design token candidates** (e.g., all background colors → `--component-bg`, all font sizes → `--component-font-size`)
- Check if spacing follows a consistent scale (e.g., 4px/8px grid)
- Note pseudo-elements (`::before`, `::after`) used for decorative purposes

### 2.3 Interaction analysis

From the interaction observations:

- Document the **state machine** of the component (which states exist, what triggers transitions)
- Identify whether interactive behavior is identical across brands or differs
- Note any JavaScript framework dependencies (Angular directives, Vue components, jQuery plugins)
- Check `prefers-reduced-motion` support
- Test focus management (where does focus go after state changes?)

### 2.4 Accessibility audit

- Run **axe-core** (or equivalent) on the page with the component visible
- Document:
  - ARIA roles and properties present
  - Keyboard navigation path
  - Focus indicator visibility
  - Color contrast ratios (text on background)
  - Screen reader announcement quality (test with NVDA/VoiceOver if possible)
- List violations with severity (critical, serious, moderate, minor)

### 2.5 SEO & content analysis

- Check heading hierarchy in context of the full page
- Look for **structured data opportunities** (FAQ, HowTo, Article schema)
- Verify content is **indexable** (not hidden via `display: none` or `visibility: hidden`)
- Check if accordion/tab content is discoverable by search engines
- Assess **GEO readiness** — is content structured for AI search engines? (clear Q&A patterns, entity labels, concise summaries)

### 2.6 Performance assessment

- Measure or estimate:
  - **CLS contribution** (does the component shift layout after load?)
  - **LCP candidacy** (is the component above the fold with large visual elements?)
  - **JS bundle size** (what scripts are loaded specifically for this component?)
  - **Image optimization** (lazy loading, format, dimensions)
  - **Render blocking** (does the component delay page render?)

---

## Phase 3 — Compare

> **Goal:** Systematically compare findings across brands and classify every difference.

### 3.1 Build the comparison matrix

For each dimension analyzed in Phase 2, create a comparison across all brands. Use a table with one column per brand.

### 3.2 Identify similarities

List what is **identical or near-identical** across all brands:

- Same semantic HTML structure
- Same interaction model
- Same accessibility approach
- Same content model (same types of content slots)
- Same responsive behavior

### 3.3 Classify differences

Every difference must be classified into exactly one of three categories:

#### Category A — CSS Design Token

The difference can be resolved purely through CSS custom properties. The React component code is identical across brands; only the loaded token values change.

**Examples:** colors, fonts, spacing values, border-radius, shadow, animation duration, icon color/size.

**For each:** map through the three-tier token hierarchy (global → semantic → component). See Phase 4.4 for the full tiering strategy.

```
| Difference       | Component token          | Semantic token       | Global (Brand 1) | Global (Brand 2) |
|------------------|--------------------------|----------------------|-------------------|-------------------|
| Panel background | --accordion-content-bg   | --surface-primary    | #f5f5f5           | #ffffff           |
```

#### Category B — Component Prop / Configuration

The difference requires a different render path or behavioral toggle. These become React props.

**Examples:** single-open vs. multi-open, optional sections (render only if prop is provided), layout variants, different icon sets.

**For each:** propose a prop name, TypeScript type, default value, and which brand uses which value.

```
| Prop name      | Type                          | Default   | Brand 1 | Brand 2 |
|----------------|-------------------------------|-----------|---------|---------|
| allowMultiple  | boolean                       | false     | false   | true    |
| variant        | 'compact' | 'expanded'        | 'compact' | compact | expanded|
```

#### Category C — Structural Divergence

The difference is too fundamental to resolve with tokens or props. This may indicate these are not truly the same component, or that an architectural decision is needed.

**Examples:** completely different DOM structures, one brand embeds a sub-component that doesn't exist in the other, incompatible content models.

**For each:** describe the conflict clearly and flag for human review.

### 3.4 Risk assessment

For each Category C item, assess:

- Can the divergence be resolved by splitting into sub-components?
- Does it block unification entirely?
- What would be lost if we forced unification?

---

## Phase 4 — Design

> **Goal:** Synthesize the analysis into a concrete unified React component design.

### 4.1 Component naming

Propose a clear, English component name that describes the function (not the brand-specific name).

### 4.2 Component composition

Determine if this is:

- **Atomic** — a single component (e.g., `Button`, `Badge`)
- **Compound** — multiple sub-components (e.g., `Accordion` = `Accordion.Root` + `Accordion.Item` + `Accordion.Trigger` + `Accordion.Content`)

Draw the component tree:

```
ComponentName
├── SubComponent1
│   ├── ChildA
│   └── ChildB
└── SubComponent2
```

Consider if sub-components are reusable elsewhere (e.g., `AccordionTrigger` might be useful in `Tabs`).

### 4.3 Props interface

Define the TypeScript props interface. It must:

- Include all Category B differences as props with defaults
- Support all content slots identified in Phase 2
- Follow React conventions (`className`, `children`, event handlers)
- Be accessible by default (ARIA attributes built in, not optional)

```typescript
interface ComponentNameProps {
  // Content
  items: Array<{ id: string; title: string; content: ReactNode }>;
  
  // Behavior (from Category B differences)
  allowMultiple?: boolean;    // default: false
  
  // Styling
  className?: string;
  
  // Accessibility
  'aria-label'?: string;
}
```

### 4.4 Design tokens

Map all Category A differences to a **three-tier token hierarchy**. Component tokens reference semantic tokens, semantic tokens reference global tokens. This prevents token sprawl and keeps the system composable.

#### Tier 1 — Global tokens

Brand-level primitives. These are the raw values defined once per brand.

```css
/* Global tokens — raw brand values */
--color-primary: #003366;
--color-neutral-100: #f5f5f5;
--font-family-base: 'Brand Sans', sans-serif;
--spacing-4: 1rem;
--radius-md: 8px;
```

#### Tier 2 — Semantic tokens

Purpose-driven aliases that reference global tokens. Shared across all components.

```css
/* Semantic tokens — reference globals */
--surface-primary: var(--color-neutral-100);
--surface-secondary: var(--color-neutral-50);
--text-primary: var(--color-neutral-900);
--text-secondary: var(--color-neutral-600);
--border-default: var(--color-neutral-200);
--interactive-bg: var(--color-primary);
```

#### Tier 3 — Component tokens

Component-specific tokens that reference semantic tokens. Only introduce these when a component needs a value that doesn't map cleanly to an existing semantic token.

```css
/* Component tokens — reference semantic tokens */
--accordion-header-bg: var(--surface-secondary);
--accordion-header-text: var(--text-primary);
--accordion-border: var(--border-default);
--accordion-content-bg: var(--surface-primary);
```

#### Token mapping table

For each Category A difference, the agent must produce a mapping across all three tiers:

```
| Category A difference | Component token          | References semantic    | Global (Brand 1) | Global (Brand 2) |
|-----------------------|--------------------------|------------------------|-------------------|-------------------|
| Header background     | --accordion-header-bg    | --surface-secondary    | #f5f5f5           | #ffffff           |
| Header text color     | --accordion-header-text  | --text-primary         | #1a1a1a           | #333333           |
```

**Rules:**
- Always try to map to an existing semantic token first — only create a component token when necessary
- If multiple components share the same visual pattern, promote the token to semantic tier
- Component tokens must never reference global tokens directly — always go through semantic tier

### 4.5 Semantic HTML

Propose the output HTML structure:

```html
<section aria-label="...">
  <!-- proposed semantic HTML -->
</section>
```

Prioritize: native HTML elements > ARIA > custom JS behavior.

### 4.6 Structured data

If applicable, define the JSON-LD the component should emit:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}
```

### 4.7 Migration notes

Document:

- What existing JS libraries/frameworks this replaces
- CMS field mapping (old Sitecore fields → new props)
- Analytics event mapping (preserve tracking contracts)
- Pages affected per brand and estimated migration complexity
- Rollback strategy

---

## Output Format

The agent must produce a single Markdown file at:

```
data/comparisons/{component-slug}/analysis.md
```

Where `{component-slug}` is the component name lowercased, non-alphanumeric characters replaced with hyphens.

The report must follow this structure:

```markdown
# Component Analysis: {Component Name}

> **Generated:** {ISO date}
> **Brands:** {Brand 1}, {Brand 2}, ...
> **Confirmed pairs:** {count}
> **Agent:** {agent name/version}

---

## Executive Summary

{2-3 sentences: Are these the same component? Can they be unified? What's the complexity level (low/medium/high)?}

---

## Component Instances

{Table: brand, name in that brand, selector, usage count, sample URL, screenshot}

---

## Gathered Data

{Links to artifacts in gathered/ directory, screenshots embedded}

---

## Structure Analysis

{DOM comparison, semantic HTML audit, ARIA attributes, content slots}

---

## Styling Analysis

{Visual comparison, design token mapping table, responsive behavior}

---

## Interaction Analysis

{State machine, behavior comparison, animation details}

---

## Accessibility Audit

{ARIA comparison, axe-core violations, keyboard navigation, focus management}

---

## SEO & Content

{Heading hierarchy, structured data opportunities, GEO readiness}

---

## Performance

{CLS, LCP, bundle size, lazy loading}

---

## Similarities

{Bulleted list of confirmed shared aspects}

---

## Differences

### Category A — Design Tokens
{Token mapping table}

### Category B — Component Props
{Prop definition table}

### Category C — Structural Divergence
{Flagged items with descriptions and risk assessment}

---

## Unified Component Design

### Name & Composition
{Proposed name, component tree}

### Props Interface
{TypeScript interface}

### Design Tokens
{CSS custom properties list}

### Semantic HTML
{Proposed output HTML}

### Structured Data
{JSON-LD if applicable}

---

## Migration

{CMS field mapping, analytics mapping, pages affected, rollback strategy}

---

## Open Questions

{Unresolved items that need human input}
```

---

## Acceptance Criteria

The analysis report is complete when:

- [ ] All confirmed-same brand instances have been visited and data extracted
- [ ] Screenshots captured at desktop + at least mobile viewport per brand
- [ ] HTML extracted and simplified for all instances
- [ ] Computed styles extracted and mapped to token candidates
- [ ] Interactions documented for all instances
- [ ] Accessibility audit performed (axe-core or equivalent)
- [ ] Every difference is classified as Category A, B, or C
- [ ] All Category A items have a proposed token name and per-brand values
- [ ] All Category B items have a proposed prop name, type, and default
- [ ] All Category C items are clearly described with risk assessment
- [ ] TypeScript props interface is defined
- [ ] Design tokens list is complete
- [ ] Semantic HTML structure is proposed
- [ ] No placeholder text (`TODO`, `TBD`, empty table cells) remains
- [ ] All artifacts saved to `data/comparisons/{component-slug}/gathered/`

---

## Playbook Metadata

**Version:** 1.0.0  
**See also:** `docs/comparison-template.md` (earlier concept version, kept for reference)
