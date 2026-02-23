# Three-Tier Token Strategy

Map all Category A differences through three tiers. Component tokens reference semantic tokens, semantic tokens reference global tokens. This prevents token sprawl.

## Tier 1 — Global Tokens

Brand-level primitives. Raw values defined once per brand theme.

```css
/* Examples */
--color-primary: #003366;
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-600: #525252;
--color-neutral-900: #171717;
--font-family-base: 'Brand Sans', sans-serif;
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-4: 1rem;
--spacing-6: 1.5rem;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

## Tier 2 — Semantic Tokens

Purpose-driven aliases referencing global tokens. Shared across all components.

```css
/* Examples */
--surface-primary: var(--color-neutral-100);
--surface-secondary: var(--color-neutral-50);
--text-primary: var(--color-neutral-900);
--text-secondary: var(--color-neutral-600);
--border-default: var(--color-neutral-200);
--interactive-bg: var(--color-primary);
--interactive-text: var(--color-neutral-50);
--focus-ring: var(--color-primary);
```

## Tier 3 — Component Tokens

Component-specific tokens referencing semantic tokens. Only create when a value doesn't map to an existing semantic token.

```css
/* Examples — only when semantic tokens don't suffice */
--accordion-header-bg: var(--surface-secondary);
--accordion-header-text: var(--text-primary);
--accordion-border: var(--border-default);
--accordion-content-bg: var(--surface-primary);
--accordion-icon-color: var(--text-secondary);
```

## Token Mapping Table Format

For each Category A difference, produce this mapping:

| Category A difference | Component token | References semantic | Global (Brand 1) | Global (Brand 2) |
|-----------------------|-----------------|---------------------|-------------------|-------------------|
| Header background | `--accordion-header-bg` | `--surface-secondary` | `#f5f5f5` | `#ffffff` |
| Header text color | `--accordion-header-text` | `--text-primary` | `#1a1a1a` | `#333333` |
| Border color | `--accordion-border` | `--border-default` | `#e5e5e5` | `#d4d4d4` |

## Rules

1. Always map to an existing semantic token first — only create a component token when necessary
2. If multiple components share the same visual pattern, promote the token to semantic tier
3. Component tokens must never reference global tokens directly — always go through semantic tier
4. Prefer semantic token names that describe purpose (`--surface-secondary`) over appearance (`--light-gray`)
5. When in doubt, fewer component tokens is better — use semantic tokens directly in CSS
