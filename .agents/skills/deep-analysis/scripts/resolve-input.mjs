#!/usr/bin/env node
/**
 * Resolves Phase 0 input data for a deep analysis.
 *
 * Usage: node resolve-input.mjs "Component Name"
 *
 * Reads manual-review.json, extracted-data.json, component-selectors.json,
 * and similarity.json to produce a JSON context object with all confirmed
 * pairs and their brand data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.resolve(__dirname, '..', '..', '..', '..', 'data');
const SRC_ROOT = path.resolve(__dirname, '..', '..', '..', '..', 'src');

const componentName = process.argv[2];
if (!componentName) {
  console.error('Usage: node resolve-input.mjs "Component Name"');
  process.exit(1);
}

// Read manual reviews
const reviewFile = path.join(DATA_ROOT, 'manual-review.json');
const reviews = JSON.parse(fs.readFileSync(reviewFile, 'utf-8'));

// Find confirmed pairs involving this component
const confirmedPairs = Object.entries(reviews.reviews)
  .filter(([, status]) => status === 'confirmed')
  .map(([key]) => key.split('::'))
  .filter(([, compA, , compB]) => compA === componentName || compB === componentName)
  .map(([brandA, compA, brandB, compB]) => ({ brandA, compA, brandB, compB }));

if (confirmedPairs.length === 0) {
  console.error(`No confirmed pairs found for "${componentName}"`);
  process.exit(1);
}

// Collect all unique brand+component combos
const instances = new Map();
instances.set(`${confirmedPairs[0].brandA}::${componentName}`, { brand: confirmedPairs[0].brandA, name: componentName });
for (const pair of confirmedPairs) {
  const otherBrand = pair.compA === componentName ? pair.brandB : pair.brandA;
  const otherName = pair.compA === componentName ? pair.compB : pair.compA;
  instances.set(`${otherBrand}::${otherName}`, { brand: otherBrand, name: otherName });
  // Also include the "self" side
  const selfBrand = pair.compA === componentName ? pair.brandA : pair.brandB;
  instances.set(`${selfBrand}::${componentName}`, { brand: selfBrand, name: componentName });
}

// Read brand data for each instance
const brandDataCache = {};
function getBrandData(brandId) {
  if (brandDataCache[brandId]) return brandDataCache[brandId];
  // Find brand directory
  const dirs = fs.readdirSync(DATA_ROOT).filter(d => d.endsWith('-report'));
  const dir = dirs.find(d => d.startsWith(brandId));
  if (!dir) return null;
  const fullDir = path.join(DATA_ROOT, dir);
  const report = JSON.parse(fs.readFileSync(path.join(fullDir, 'extracted-data.json'), 'utf-8'));
  let selectors = {};
  try {
    selectors = JSON.parse(fs.readFileSync(path.join(fullDir, 'component-selectors.json'), 'utf-8')).components;
  } catch { /* no selectors file */ }
  brandDataCache[brandId] = { report, selectors };
  return brandDataCache[brandId];
}

// Read similarity data
let similarityPairs = [];
try {
  const sim = JSON.parse(fs.readFileSync(path.join(DATA_ROOT, 'similarity.json'), 'utf-8'));
  const allNames = new Set([...instances.values()].map(i => i.name));
  similarityPairs = sim.pairs.filter(p => allNames.has(p.componentA) && allNames.has(p.componentB));
} catch { /* no similarity file */ }

// Build output
const result = {
  component: componentName,
  confirmedPairs: confirmedPairs.map(p => `${p.brandA}::${p.compA}::${p.brandB}::${p.compB}`),
  instances: [...instances.values()].map(({ brand, name }) => {
    const data = getBrandData(brand);
    const comp = data?.report?.components?.[name];
    const selector = data?.selectors?.[name];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const screenshotPath = path.join(SRC_ROOT, 'public', 'screenshots', brand, `${slug}.png`);
    return {
      brand,
      name,
      selector: selector?.selector ?? null,
      description: selector?.description ?? null,
      usageCount: comp?.count ?? 0,
      uniquePages: comp?.pages?.length ?? 0,
      sampleUrls: (comp?.pages ?? []).slice(0, 3).map(p => p.url),
      screenshotExists: fs.existsSync(screenshotPath),
      screenshotPath: `src/public/screenshots/${brand}/${slug}.png`,
    };
  }),
  similarityScores: similarityPairs.map(p => ({
    pair: `${p.brandA}::${p.componentA} ↔ ${p.brandB}::${p.componentB}`,
    score: p.score,
    signals: p.signals,
  })),
};

console.log(JSON.stringify(result, null, 2));
