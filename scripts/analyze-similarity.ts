/**
 * Main similarity analysis script.
 * Compares all components across brands using three signals and writes data/similarity.json.
 *
 * Run: npm run analyze
 */
import fs from 'fs';
import path from 'path';
import { extractScreenshots, slugify } from './extract-screenshots.js';
import { nameScore } from './similarity/name.js';
import { visualScore } from './similarity/visual.js';
import { structuralScore } from './similarity/structural.js';

const DATA_ROOT = path.join(process.cwd(), 'data');

// Weights for each signal (must sum to 1 when all signals are available)
const WEIGHTS = { name: 0.3, visual: 0.5, structural: 0.2 };
const MIN_SCORE = 0.4;

interface SimilarityPair {
  brandA: string;
  componentA: string;
  brandB: string;
  componentB: string;
  score: number;
  signals: { name: number; visual: number | null; structural: number | null };
}

interface SimilarityOutput {
  generatedAt: string;
  totalPairs: number;
  pairs: SimilarityPair[];
}

function buildScreenshotIndex(screenshots: ReturnType<typeof extractScreenshots>) {
  const index = new Map<string, string>(); // "brand::slug" -> pngPath
  for (const s of screenshots) {
    index.set(`${s.brand}::${s.slug}`, s.pngPath);
  }
  return index;
}

function getScreenshotPath(index: Map<string, string>, brand: string, name: string): string | null {
  return index.get(`${brand}::${slugify(name)}`) ?? null;
}

function weightedScore(
  name: number,
  visual: number | null,
  structural: number | null
): number {
  let totalWeight = 0;
  let score = 0;

  score += WEIGHTS.name * name;
  totalWeight += WEIGHTS.name;

  if (visual !== null && visual >= 0) {
    score += WEIGHTS.visual * visual;
    totalWeight += WEIGHTS.visual;
  }
  if (structural !== null && structural >= 0) {
    score += WEIGHTS.structural * structural;
    totalWeight += WEIGHTS.structural;
  }

  return totalWeight > 0 ? score / totalWeight : 0;
}

async function main() {
  console.log('Step 1: Extracting screenshots...');
  const screenshots = extractScreenshots();
  const screenshotIndex = buildScreenshotIndex(screenshots);
  console.log(`  Total screenshots: ${screenshots.length}`);

  // Load all brand component lists
  const brandDirs = [
    { id: 'fbto', dataDir: 'fbto-report' },
    { id: 'cb', dataDir: 'cb-report' },
  ];

  const brandComponents = new Map<string, string[]>();
  for (const brand of brandDirs) {
    const dataPath = path.join(DATA_ROOT, brand.dataDir, 'extracted-data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    brandComponents.set(brand.id, Object.keys(data.components));
    console.log(`  ${brand.id}: ${Object.keys(data.components).length} components`);
  }

  // Compare all pairs across brands (not same brand vs same brand)
  const brandIds = [...brandComponents.keys()];
  const pairs: SimilarityPair[] = [];
  let compared = 0;

  for (let i = 0; i < brandIds.length; i++) {
    for (let j = i + 1; j < brandIds.length; j++) {
      const brandA = brandIds[i];
      const brandB = brandIds[j];
      const componentsA = brandComponents.get(brandA)!;
      const componentsB = brandComponents.get(brandB)!;

      console.log(`\nStep 2: Comparing ${brandA} (${componentsA.length}) vs ${brandB} (${componentsB.length})...`);
      const total = componentsA.length * componentsB.length;

      for (const compA of componentsA) {
        for (const compB of componentsB) {
          // Quick pre-filter: skip if name score is very low (saves time)
          const nScore = nameScore(compA, compB);

          const pathA = getScreenshotPath(screenshotIndex, brandA, compA);
          const pathB = getScreenshotPath(screenshotIndex, brandB, compB);
          const vScore = (pathA && pathB) ? await visualScore(pathA, pathB) : null;

          // Only compute structural if we have a chance (name or visual already promising)
          const preScore = weightedScore(nScore, vScore, null);
          let sScore: number | null = null;
          if (preScore >= 0.25) {
            sScore = structuralScore(brandA, compA, brandB, compB);
          }

          const final = weightedScore(nScore, vScore, sScore);

          if (final >= MIN_SCORE) {
            pairs.push({
              brandA,
              componentA: compA,
              brandB,
              componentB: compB,
              score: Math.round(final * 1000) / 1000,
              signals: {
                name: Math.round(nScore * 1000) / 1000,
                visual: vScore !== null ? Math.round(vScore * 1000) / 1000 : null,
                structural: sScore !== null ? Math.round(sScore * 1000) / 1000 : null,
              },
            });
          }

          compared++;
          if (compared % 500 === 0) {
            process.stdout.write(`  ${compared}/${total} pairs compared, ${pairs.length} matches so far...\r`);
          }
        }
      }
    }
  }

  // Sort by score descending
  pairs.sort((a, b) => b.score - a.score);

  const output: SimilarityOutput = {
    generatedAt: new Date().toISOString(),
    totalPairs: pairs.length,
    pairs,
  };

  const outPath = path.join(DATA_ROOT, 'similarity.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\n\nDone! Found ${pairs.length} similar pairs (score >= ${MIN_SCORE})`);
  console.log(`Output written to ${outPath}`);

  // Show top 10 matches
  console.log('\nTop 10 matches:');
  for (const p of pairs.slice(0, 10)) {
    console.log(`  [${p.score.toFixed(2)}] ${p.brandA}/${p.componentA}  <->  ${p.brandB}/${p.componentB}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
