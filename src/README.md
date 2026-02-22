# Component Comparison — Next.js App

This is the web frontend for the component comparison tool. It visualizes and compares UI components across brand websites.

## Getting Started

```bash
# From the repo root, run the similarity analysis first (required on first run)
cd ..
npm install
npm run analyze

# Then start the dev server
cd src
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What You'll See

- **Overview page** (`/`): Stat cards per brand + a comparison table with component thumbnails, usage counts, and similarity hints
- **Detail page** (`/components/[name]`): Screenshots, CSS selectors, and page usage per brand, plus similar components from other brands with confidence scores

## Adding a New Brand

See `AGENTS.md` at the repo root.

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `src/` | Start development server |
| `npm run build` | `src/` | Production build |
| `npm run analyze` | repo root | Re-run similarity analysis |
