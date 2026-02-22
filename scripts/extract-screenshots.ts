/**
 * Extracts embedded base64 PNG screenshots from report.html files.
 * Saves them to data/{brand}-report/screenshots/{slug}.png
 * and also copies them to src/public/screenshots/{brand}/{slug}.png for the Next.js app.
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

const DATA_ROOT = path.join(process.cwd(), 'data');
const PUBLIC_DIR = path.join(process.cwd(), 'src', 'public', 'screenshots');
const BRANDS = [
  { id: 'fbto', dataDir: 'fbto-report' },
  { id: 'cb', dataDir: 'cb-report' },
];

export interface ExtractedScreenshot {
  brand: string;
  componentName: string;
  slug: string;
  pngPath: string;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function extractScreenshots(): ExtractedScreenshot[] {
  const results: ExtractedScreenshot[] = [];

  for (const brand of BRANDS) {
    const reportPath = path.join(DATA_ROOT, brand.dataDir, 'report.html');
    const screenshotsDir = path.join(DATA_ROOT, brand.dataDir, 'screenshots');
    const publicBrandDir = path.join(PUBLIC_DIR, brand.id);
    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(publicBrandDir, { recursive: true });

    const html = fs.readFileSync(reportPath, 'utf-8');
    const root = parse(html);

    const detailDivs = root.querySelectorAll('.component-detail');
    for (const div of detailDivs) {
      const titleEl = div.querySelector('.detail-title');
      if (!titleEl) continue;
      const name = titleEl.text.trim();

      const imgEl = div.querySelector('img[src^="data:image/png;base64,"]');
      if (!imgEl) continue;

      const src = imgEl.getAttribute('src') ?? '';
      const base64Data = src.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const slug = slugify(name);
      const pngPath = path.join(screenshotsDir, `${slug}.png`);
      fs.writeFileSync(pngPath, buffer);

      // Also copy to Next.js public folder
      fs.writeFileSync(path.join(publicBrandDir, `${slug}.png`), buffer);

      results.push({ brand: brand.id, componentName: name, slug, pngPath });
    }

    console.log(`[${brand.id}] Extracted ${results.filter(r => r.brand === brand.id).length} screenshots`);
  }

  return results;
}

// Run directly
if (process.argv[1] === import.meta.url.replace('file:///', '').replace(/\//g, '\\') ||
    process.argv[1].endsWith('extract-screenshots.ts')) {
  extractScreenshots();
}
