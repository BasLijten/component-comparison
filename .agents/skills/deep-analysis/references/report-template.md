# Analysis Report Template

The analysis report must follow this structure exactly. Write to `data/comparisons/{component-slug}/analysis.md`.

```markdown
# Component Analysis: {Component Name}

> **Generated:** {ISO date}
> **Brands:** {Brand 1}, {Brand 2}, ...
> **Confirmed pairs:** {count}
> **Agent:** {agent name/version}

---

## Executive Summary

{2-3 sentences: Are these the same component? Can they be unified? Complexity level: low/medium/high.}

---

## Component Instances

| Brand | Name | Selector | Usage count | Sample URL |
|-------|------|----------|-------------|------------|
| | | | | |

---

## Gathered Data

{Embedded screenshots for each brand at desktop. Links to all artifacts in gathered/ directory.}

---

## Structure Analysis

{DOM tree comparison across brands. Semantic HTML audit. ARIA attributes table. Content slots identified.}

---

## Styling Analysis

{Design token mapping table (three-tier). Responsive behavior per breakpoint.}

---

## Interaction Analysis

{State machine diagram/table. Behavior comparison across brands. Animation details.}

---

## Accessibility Audit

### ARIA Comparison

| Attribute | Brand 1 | Brand 2 | ... |
|-----------|---------|---------|-----|
| `role` on root | | | |
| `aria-expanded` | | | |
| `aria-controls` | | | |
| Focus management | | | |
| Keyboard: Enter/Space | | | |
| Keyboard: Arrow keys | | | |

### Violations

| Rule | Severity | Component | Recommendation |
|------|----------|-----------|----------------|
| | | | |

---

## SEO & Content

{Heading hierarchy. Structured data opportunities. GEO readiness assessment.}

---

## Performance

| Metric | Brand 1 | Brand 2 | Target |
|--------|---------|---------|--------|
| CLS contribution | | | < 0.1 |
| LCP candidate? | | | — |
| JS bundle size | | | minimal |
| Images lazy-loaded? | | | yes |

---

## Similarities

{Bulleted list of confirmed identical/near-identical aspects across all brands.}

---

## Differences

### Category A — Design Tokens

| Difference | Component token | Semantic token | Brand 1 value | Brand 2 value |
|------------|-----------------|----------------|---------------|---------------|
| | | | | |

### Category B — Component Props

| Difference | Prop name | Type | Default | Brand 1 | Brand 2 |
|------------|-----------|------|---------|---------|---------|
| | | | | | |

### Category C — Structural Divergence

| # | Description | Impact | Risk | Resolution |
|---|-------------|--------|------|------------|
| | | | | |

---

## Unified Component Design

### Name & Composition

**Proposed name:** `ComponentName`

{Component tree diagram}

### Props Interface

{TypeScript interface}

### Design Tokens

{CSS custom properties — three-tier listing}

### Semantic HTML

{Proposed output HTML}

### Structured Data

{JSON-LD if applicable, otherwise "N/A"}

---

## Migration

| Dimension | Brand 1 | Brand 2 |
|-----------|---------|---------|
| Pages affected | | |
| JS framework replaced | | |
| Re-authoring effort | | |
| Rollback strategy | | |

### CMS Field Mapping

| Brand 1 field | Brand 2 field | Unified prop |
|---------------|---------------|--------------|
| | | |

### Analytics Event Mapping

| Event | Brand 1 | Brand 2 | Unified |
|-------|---------|---------|---------|
| | | | |

---

## Open Questions

{Unresolved items requiring human input before implementation.}
```
