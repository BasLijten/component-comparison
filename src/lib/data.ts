import fs from 'fs';
import path from 'path';
import { BRANDS } from './brands';
import type { BrandConfig, BrandData, BrandReport, ComponentSelector, SimilarityPair, SimilarityData } from './types';

const DATA_ROOT = path.join(process.cwd(), '..', 'data');

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function loadBrandData(config: BrandConfig): BrandData {
  const dir = path.join(DATA_ROOT, config.dataDir);
  const report = readJson<BrandReport>(path.join(dir, 'extracted-data.json'));
  const selectors = readJson<{ components: Record<string, ComponentSelector> }>(
    path.join(dir, 'component-selectors.json')
  ).components;
  return { config, report, selectors };
}

export function getAllBrandsData(): BrandData[] {
  return BRANDS.map(loadBrandData);
}

export function getBrandData(id: string): BrandData | undefined {
  const config = BRANDS.find((b) => b.id === id);
  if (!config) return undefined;
  return loadBrandData(config);
}

let similarityCache: SimilarityData | null = null;

export function getSimilarityData(): SimilarityData {
  if (similarityCache) return similarityCache;
  const filePath = path.join(DATA_ROOT, 'similarity.json');
  try {
    similarityCache = readJson<SimilarityData>(filePath);
  } catch {
    similarityCache = { generatedAt: '', totalPairs: 0, pairs: [] };
  }
  return similarityCache;
}

/** Get all similar pairs for a given brand+component, sorted by score descending */
export function getSimilarPairs(brand: string, componentName: string): SimilarityPair[] {
  const data = getSimilarityData();
  return data.pairs
    .filter(
      (p) =>
        (p.brandA === brand && p.componentA === componentName) ||
        (p.brandB === brand && p.componentB === componentName)
    )
    .sort((a, b) => b.score - a.score);
}

/** Returns the public URL path for a component screenshot, or null if the file doesn't exist */
export function getScreenshotUrl(brand: string, componentName: string): string | null {
  const slug = componentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filePath = path.join(process.cwd(), 'public', 'screenshots', brand, `${slug}.png`);
  if (!fs.existsSync(filePath)) return null;
  return `/screenshots/${brand}/${slug}.png`;
}

/** Canonical key for a similarity pair (always in stored order) */
export function buildPairKey(pair: SimilarityPair): string {
  return `${pair.brandA}::${pair.componentA}::${pair.brandB}::${pair.componentB}`;
}

/** Build a lookup: componentKey ("brand::name") -> similarity pairs */
export function buildSimilarityLookup(): Map<string, SimilarityPair[]> {
  const data = getSimilarityData();
  const lookup = new Map<string, SimilarityPair[]>();
  for (const pair of data.pairs) {
    const keyA = `${pair.brandA}::${pair.componentA}`;
    const keyB = `${pair.brandB}::${pair.componentB}`;
    if (!lookup.has(keyA)) lookup.set(keyA, []);
    if (!lookup.has(keyB)) lookup.set(keyB, []);
    lookup.get(keyA)!.push(pair);
    lookup.get(keyB)!.push(pair);
  }
  return lookup;
}
