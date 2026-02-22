# Component Comparison Template

**Purpose:** This template guides an agent through a deep comparison of UI components across brands to produce a unified React component that works for all brands via CSS design tokens only.

**Context:** We're migrating from ASP.NET Full Framework (Angular/Vue/vanilla JS) to Next.js + React. This is the opportunity to build components once and reuse them across all brand websites, reducing maintenance and development costs while preserving each brand's look and feel.

---

## Parameters

Fill in these parameters before executing the analysis:

```yaml
# Component identifiers (can be 2+ brands)
components:
  - brand: "fbto"
    name: "Accordeon block"
    url: "https://www.fbto.nl/page-with-accordion"
    selector: ".accordion"
  
  - brand: "cb"
    name: "Content accordion v1"
    url: "https://www.centraalbeheer.nl/page-with-accordion"
    selector: ".content-accordion"
  
  # Add more brands as needed
  # - brand: "brand-id"
  #   name: "Component Name"
  #   url: "https://..."
  #   selector: ".css-selector"

# Analysis configuration
output_path: "docs/comparisons/accordion-comparison.md"
generate_component_api: true  # Include proposed React API
```

---

## Analysis Workflow

### 1. Gather Component Instances

For each component in the `components` list:

- [ ] Navigate to the URL using Playwright
- [ ] Wait for page load (network idle)
- [ ] Locate the component using the provided selector
- [ ] Take a full-page screenshot
- [ ] Take a zoomed screenshot of just the component
- [ ] Extract the component's HTML (including all descendants)
- [ ] Extract all applied CSS styles (computed styles)
- [ ] Identify any JavaScript event listeners or interactions
- [ ] Document viewport/responsive variations (mobile, tablet, desktop)

**Deliverable:** Artifacts stored in `docs/comparisons/{component-slug}/gathered/`:
- `{brand}-{component-slug}-full.png`
- `{brand}-{component-slug}-component.png`
- `{brand}-{component-slug}.html`
- `{brand}-{component-slug}-styles.json` (computed styles)
- `{brand}-{component-slug}-interactions.json` (observed behaviors, state changes)

---

### 2. Analyze HTML Structure

Compare the HTML across all component instances:

- [ ] Identify semantic HTML elements used (e.g., `<details>`, `<button>`, `<article>`)
- [ ] Map the DOM tree structure (parent-child relationships)
- [ ] Document ARIA attributes and roles
- [ ] Check for proper heading hierarchy
- [ ] Identify content slots (where brand-specific content is injected)
- [ ] Note any deprecated or non-semantic elements (e.g., `<div>` for buttons)

**Analysis questions:**
- Is the HTML structure identical or similar?
- Which elements are structural (same across brands) vs. cosmetic (brand-specific)?
- Are there accessibility issues? (missing ARIA, poor semantics, keyboard nav)
- Can we use modern HTML elements (e.g., `<details>` for accordions)?

**Deliverable:** A structured comparison table in the report.

---

### 3. Analyze Styling

Compare visual presentation across all instances:

- [ ] Extract color values (text, background, borders, hover states)
- [ ] Extract typography (font-family, size, weight, line-height, letter-spacing)
- [ ] Extract spacing (margin, padding, gap)
- [ ] Extract sizing (width, height, min/max constraints)
- [ ] Extract borders & radius
- [ ] Extract shadows
- [ ] Extract transitions & animations
- [ ] Document responsive behavior (breakpoints, layout changes)
- [ ] Identify pseudo-element usage (::before, ::after for icons, decorations)

**Analysis questions:**
- Which styles are brand-specific (colors, fonts) vs. structural (layout, spacing patterns)?
- Can all visual differences be expressed as CSS custom properties (design tokens)?
- Are there any hardcoded values that should be tokenized?
- Do brands use the same spacing scale (e.g., 8px grid)?

**Deliverable:** A design token mapping table:

| Token Name | FBTO Value | CB Value | Notes |
|------------|------------|----------|-------|
| `--accordion-bg` | `#f5f5f5` | `#ffffff` | Panel background |
| `--accordion-border` | `1px solid #ddd` | `none` | Panel border |

---

### 4. Analyze Interactions

Compare behavior and state management:

- [ ] Document user interactions (click, hover, focus, keyboard)
- [ ] Map state transitions (collapsed → expanded, loading → loaded)
- [ ] Identify animations (expand/collapse duration, easing)
- [ ] Check focus management (where focus goes on expand/collapse)
- [ ] Document any async behavior (lazy-loading content, API calls)
- [ ] Test keyboard navigation (Tab, Enter, Space, Arrow keys)
- [ ] Test screen reader announcements (NVDA/JAWS)

**Analysis questions:**
- Is the interaction model identical or different?
- Can differences be expressed as configuration (e.g., `allowMultipleOpen: boolean`)?
- Are there accessibility issues in keyboard or screen reader support?
- Do animations respect `prefers-reduced-motion`?

**Deliverable:** Interaction comparison table + accessibility audit.

---

### 5. SEO & Structured Data

- [ ] Check for JSON-LD structured data (FAQ, HowTo, etc.)
- [ ] Document heading hierarchy (H1-H6 usage)
- [ ] Check for meta content (if component renders in `<head>`)
- [ ] Assess content indexability (hidden content in accordions, tabs)
- [ ] Check for Generative Engine Optimization (GEO) hints (e.g., clear questions/answers for LLMs)

**Analysis questions:**
- Should the component emit schema.org markup? (e.g., FAQPage for accordions)
- Are headings semantically correct?
- Is content hidden from search engines unintentionally (CSS `display: none`)?

**Deliverable:** SEO/GEO recommendations section.

---

### 6. Identify Similarities

Document what is **identical or nearly identical** across brands:

- [ ] HTML structure (same tag hierarchy)
- [ ] Semantic patterns (e.g., all use `<button>` for toggles)
- [ ] Interaction model (e.g., click to expand, one-at-a-time vs. multiple open)
- [ ] Accessibility approach (ARIA attributes, keyboard support)
- [ ] Content model (e.g., title + body in each panel)

**Deliverable:** Similarities section in the report.

---

### 7. Identify Differences

Document what **varies** across brands. Classify every difference into one of three resolution categories:

#### Category A: Resolvable via CSS Design Token
Differences that can be handled purely through CSS custom properties. The React component code is identical; only the loaded token set changes per brand.

Examples:
- Colors (text, background, borders, hover states)
- Typography (font-family, size, weight)
- Spacing (padding, margin, gap)
- Border radius, shadows
- Icon color or size (when using the same icon component)
- Animation duration, easing

**For each difference, propose a token name and the per-brand values.**

#### Category B: Resolvable via Component Props / Configuration
Differences that require a different render path or behavioral toggle in React. These become component props.

Examples:
- Allow multiple panels open vs. single-open accordion → `allowMultiple: boolean`
- Show/hide an optional section based on whether a CMS field has a value → conditional render on prop presence
- Different icon sets per brand → `icon: ReactNode` prop
- Layout variation (horizontal vs. vertical) → `variant: 'horizontal' | 'vertical'`

**For each difference, propose a prop name, type, and default value.**

#### Category C: Structural Divergence (Requires Discussion)
Differences too fundamental to resolve with tokens or props — may indicate these are not the same component, or that architectural decisions are needed.

Examples:
- Completely different DOM structure (e.g., one uses `<table>`, the other uses `<div>` grid)
- One brand embeds a sub-component that doesn't exist in the other
- Different content models that can't be mapped (e.g., one uses a flat list, the other uses nested groups)

**Flag these for human review with a clear description of the conflict.**

**Deliverable:** Differences section in the report with each difference classified as A, B, or C.

---

### 🔍 Human Review Gate

> **⚠️ STOP HERE.** Before proceeding to steps 8–10, present the analysis (steps 1–7) to a human reviewer.

The agent should pause and request human input on:

1. **Difference classifications** — Are the Category A/B/C assignments correct? Should any B become A (via a smarter token)? Should any C block unification?
2. **Component composition** — Based on the similarities and differences, does the human agree these should become a single unified component?
3. **Behavioral conflicts** — Where brands differ in behavior (e.g., single-open vs. multi-open), which should be the default? Should both be supported?
4. **Content model** — When CMS field structures differ, which model should the unified component follow?
5. **Scope decision** — Should the agent proceed with the component API proposal, or are the differences too significant?

**Only proceed to step 8 after human approval.**

---

### 8. Assess Component Composition

Determine if this "component" is actually multiple components:

- [ ] Is it atomic (e.g., a Button) or composite (e.g., Accordion = AccordionPanel + AccordionButton + AccordionContent)?
- [ ] Could sub-components be reused elsewhere? (e.g., AccordionPanel might be used in Tabs)
- [ ] Should we build one component or a component system?

**Deliverable:** Component hierarchy recommendation.

---

### 9. Define Component API

Based on the analysis, propose a unified React component API:

**Props Interface:**
```typescript
interface AccordionProps {
  items: Array<{
    id: string;
    title: string;
    content: ReactNode;
  }>;
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
  // ... other props
}
```

**Design Tokens Required:**
```css
/* Brand-specific tokens */
--accordion-bg
--accordion-border
--accordion-text-color
--accordion-title-font-size
/* ... */
```

**Slots/Projection:**
- Does the component need named slots for brand-specific content?
- Example: `<Accordion.Panel icon={<CustomIcon />}>`

**Accessibility Requirements:**
- ARIA attributes to include
- Keyboard behavior
- Focus management

**Deliverable:** Component API section in the report.

---

### 10. Highlight Migration Considerations

Document challenges for the Next.js/React migration:

- [ ] Which existing JS libraries/frameworks need to be replaced?
- [ ] Are there dependencies on global state (e.g., Vuex, Angular services)?
- [ ] Are there CMS-specific APIs to abstract (Sitecore field rendering)?
- [ ] Are there analytics/tracking differences per brand?

**Deliverable:** Migration notes section.

---

## Output Template

The agent should produce a Markdown report at `output_path` with the following structure:

```markdown
# Component Comparison: [Component Name]

**Date:** YYYY-MM-DD  
**Brands Analyzed:** FBTO, Centraal Beheer, [others]  
**Analyst:** [Agent name/version]

---

## 1. Executive Summary

[2-3 sentence summary: Are these components equivalent? Can they be unified? What's the complexity?]

---

## 2. Component Instances

| Brand | Component Name | URL | Selector |
|-------|----------------|-----|----------|
| FBTO  | Accordeon block | https://... | `.accordion` |
| CB    | Content accordion v1 | https://... | `.content-accordion` |

---

## 3. HTML Structure Analysis

### DOM Comparison

[Visual tree comparison or table]

### Semantic HTML

[Analysis of semantic elements, ARIA, headings]

### Accessibility Audit

- ✅ **Passes:** [What works well]
- ⚠️ **Issues:** [Problems found]
- 🔧 **Recommendations:** [How to fix]

---

## 4. Styling Analysis

### Visual Comparison

[Side-by-side screenshots]

### Design Token Mapping

| Token Name | FBTO Value | CB Value | Proposed Token |
|------------|------------|----------|----------------|
| `--accordion-bg` | `#f5f5f5` | `#ffffff` | `--surface-secondary` |

### Responsive Behavior

[Breakpoints, layout changes]

---

## 5. Interaction Analysis

### Behavior Comparison

| Feature | FBTO | CB |
|---------|------|-----|
| Allow multiple open | No | Yes |
| Auto-collapse on outside click | No | No |
| Keyboard navigation | Partial | Full |

### Animation & Transitions

[Duration, easing, prefers-reduced-motion support]

---

## 6. SEO & Structured Data

### Current State

[What exists today per brand]

### Recommendations

- [ ] Add FAQPage schema for accordion components
- [ ] Ensure content is indexable (avoid `display: none`)
- [ ] Use proper heading hierarchy

---

## 7. Similarities

[Bulleted list of identical or near-identical aspects]

---

## 8. Differences

### Category A: CSS Design Tokens

| Difference | Token Name | FBTO Value | CB Value | Proposed Semantic Token |
|------------|------------|------------|----------|------------------------|
| Panel background | `--accordion-bg` | `#f5f5f5` | `#ffffff` | `--surface-secondary` |

### Category B: Component Props

| Difference | Prop Name | Type | Default | FBTO | CB |
|------------|-----------|------|---------|------|-----|
| Multi-open | `allowMultiple` | `boolean` | `false` | `false` | `true` |

### Category C: Structural Divergence ⚠️

[Flag items that need human decision before proceeding]

---

## 9. Component Composition

[Is this one component or multiple? Show hierarchy]

```
Accordion (container)
├── AccordionItem (repeatable)
│   ├── AccordionTrigger (button)
│   └── AccordionContent (panel)
```

---

## 10. Proposed Component API

### Props Interface

```typescript
interface AccordionProps {
  // ...
}
```

### Design Tokens

```css
/* Required tokens */
--accordion-bg
--accordion-border
/* ... */
```

### Slots & Composition

[How brands customize content]

### Accessibility Requirements

- ARIA attributes: `aria-expanded`, `aria-controls`, `role="region"`
- Keyboard: `Tab`, `Enter`, `Space`, `Arrow keys`
- Focus management: Focus moves to expanded panel

---

## 11. Migration Considerations

### Technical Challenges

[JS library replacements, CMS abstractions, state management]

### CMS Field Mapping

| FBTO Field | CB Field | Unified Prop |
|------------|----------|--------------|
| `accordion_title` | `heading` | `title` |

### Analytics Hooks

[How each brand tracks interactions]

---

## 12. Recommendations

### Build Strategy

- ✅ **Recommended:** Build a single unified component with CSS tokens
- ⚠️ **Alternative:** Build separate components (not recommended unless differences are extreme)

### Token Strategy

[Use semantic tokens (--surface-primary) vs. component tokens (--accordion-bg)]

### Testing Strategy

[Visual regression per brand, a11y testing, interaction testing]

---

## 13. Next Steps

- [ ] Review this analysis with design/dev teams
- [ ] Finalize design token taxonomy
- [ ] Build React component in Storybook
- [ ] Create visual regression tests per brand
- [ ] Migrate pilot pages

---

## Appendices

### A. Screenshots

[Embedded images]

### B. Extracted HTML

[Collapsible code blocks per brand]

### C. Computed Styles

[JSON dumps or styled tables]

### D. References

- WCAG 2.2 AA guidelines
- Radix UI Accordion (headless component reference)
- [Internal design system docs]
```

---

## Usage Instructions for Agents

1. **Input:** Receive a filled-in parameter block (YAML or JSON)
2. **Execute:** Follow the workflow steps 1–7 sequentially
3. **Pause:** Present the analysis to a human reviewer (see Human Review Gate)
4. **Continue:** After human approval, complete steps 8–10
5. **Output:** Generate a Markdown report at `output_path` using the template above
6. **Artifacts:** Save screenshots, HTML, and style dumps to `docs/comparisons/{component-slug}/gathered/`

**Tools required:**
- Playwright (for browser automation)
- Sharp or similar (for image processing)
- CSS parser (for extracting computed styles)
- ARIA/a11y auditing tool (e.g., axe-core)

---

## Acceptance Criteria

The comparison report is considered **complete** when all of the following are met:

### Analysis Quality
- [ ] All brands have component screenshots (at least the component-level crop)
- [ ] HTML has been extracted and compared for all brand instances
- [ ] All computed styles are extracted and mapped to proposed tokens
- [ ] Interaction behavior is observed and documented for all brands
- [ ] SEO/structured data analysis is complete

### Difference Classification
- [ ] Every identified difference is classified as Category A (token), B (prop), or C (structural divergence)
- [ ] All Category A differences have a proposed token name and per-brand values
- [ ] All Category B differences have a proposed prop name, type, and default value
- [ ] All Category C differences are clearly described with the conflict explained

### Human Review
- [ ] Human reviewer has approved the analysis (steps 1–7) before API proposal
- [ ] Human has confirmed or corrected difference classifications
- [ ] Human has made decisions on behavioral conflicts

### Completeness
- [ ] No "TODO", "[TBD]", or placeholder text remains in the report
- [ ] All tables are fully populated (no empty cells unless genuinely N/A)
- [ ] Accessibility audit has been performed and all findings documented
- [ ] Component API proposal (if included) covers all Category A tokens and Category B props
- [ ] Report follows the output template structure exactly

### Artifacts
- [ ] All screenshots saved to `docs/comparisons/{component-slug}/gathered/`
- [ ] Extracted HTML saved per brand
- [ ] Computed styles saved per brand

---

## Template Metadata

**Version:** 1.1.0  
**Last Updated:** 2026-02-22  
**Maintained By:** Component Comparison Tool Project  
**License:** Internal Use Only
