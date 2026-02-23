# Analysis Dimensions Checklist

Detailed checklist for each analysis dimension in Phase 2.

## 1. Structure Analysis

From extracted HTML:

- Map DOM tree hierarchy (nesting depth, parent-child relationships)
- Identify semantic elements: `<details>`, `<summary>`, `<button>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`
- List all ARIA attributes and roles (`role`, `aria-expanded`, `aria-controls`, `aria-labelledby`, `aria-hidden`)
- Identify content slots — where CMS-authored content goes (headings, body text, images, CTAs)
- Note heading hierarchy (`h1`–`h6`) within the component
- Flag non-semantic patterns (e.g., `<div>` with click handler instead of `<button>`, missing landmarks)
- Document data attributes used for JS behavior (e.g., `data-toggle`, `data-target`)

## 2. Styling Analysis

From computed styles:

- Classify styles as **brand-specific** (colors, fonts, specific spacing) vs **structural** (display, flex/grid, positioning)
- Group related styles into design token candidates
- Check if spacing follows a consistent scale (4px, 8px multiples)
- Note pseudo-elements (`::before`, `::after`) for decorative purposes (icons, dividers, arrows)
- Document CSS class naming convention (BEM, utility-first, etc.)
- Identify media query breakpoints and what changes at each
- Note any CSS custom properties already in use

## 3. Interaction Analysis

From behavior observations:

- Document the state machine: states → triggers → transitions
- Compare interactive behavior across brands (identical or different?)
- Identify JS framework dependencies (Angular directives, Vue components, jQuery plugins, vanilla JS)
- Check `prefers-reduced-motion` support
- Test focus management: where does focus go after state change?
- Document custom events emitted (GTM dataLayer pushes, custom DOM events)
- Note any async behavior (lazy-loaded content, API calls on expand)

## 4. Accessibility Audit

- Run axe-core on the page with component visible
- Document ARIA roles and properties present on each interactive element
- Map keyboard navigation path (Tab order through the component)
- Test Enter/Space activation on interactive elements
- Test Arrow key navigation (if applicable)
- Test Escape key behavior
- Check focus indicator visibility (outline, box-shadow, etc.)
- Measure color contrast ratios (text on background) — must meet WCAG AA (4.5:1 for text, 3:1 for large text)
- Assess screen reader announcements (state changes announced?)
- List violations with severity: critical, serious, moderate, minor

## 5. SEO & Content Analysis

- Check heading hierarchy in context of the full page (does component break h1-h6 flow?)
- Identify structured data opportunities: FAQPage, HowTo, Article schema
- Verify content is indexable (not hidden via `display: none` or `visibility: hidden` in default state)
- For accordions/tabs: is collapsed content in the DOM or injected on expand?
- Assess GEO readiness:
  - Clear entity/topic labels?
  - Question-answer patterns present?
  - Concise summaries available?
  - Structured lists used?

## 6. Performance Assessment

- **CLS contribution**: Does the component shift layout after initial render?
- **LCP candidacy**: Is the component above the fold with large images or text?
- **JS bundle size**: What scripts load specifically for this component? Estimate KB.
- **Image optimization**: Are images lazy-loaded? Proper format (WebP/AVIF)? Correct dimensions?
- **Render blocking**: Does the component delay First Contentful Paint?
- **Third-party impact**: Does the component load external scripts (analytics, chat, ads)?
