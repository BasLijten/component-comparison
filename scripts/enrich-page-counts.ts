import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';

const DATA_ROOT = path.join(process.cwd(), 'data');

const BRANDS = [
  { id: 'fbto', dataDir: 'fbto-report' },
  { id: 'cb', dataDir: 'cb-report' },
];

type ExtractedData = {
  components: Record<
    string,
    {
      name: string;
      count: number;
      pages: Array<{ url: string; filename: string; occurrences?: number }>;
    }
  >;
};

function normalizeName(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function buildComponentPageCounts(reportHtml: string): Map<string, Map<string, number>> {
  const root = parse(reportHtml);
  const byComponent = new Map<string, Map<string, number>>();

  for (const detail of root.querySelectorAll('.component-detail')) {
    const titleEl = detail.querySelector('.detail-title');
    if (!titleEl) continue;

    const rawTitle = titleEl.textContent;
    const componentName = normalizeName(rawTitle.replace(/⚠️\s*Selector needed/gi, ''));
    if (!componentName) continue;

    const pageCounts = new Map<string, number>();
    for (const anchor of detail.querySelectorAll('.page-item a')) {
      const url = anchor.getAttribute('href')?.trim();
      if (!url) continue;
      pageCounts.set(url, (pageCounts.get(url) ?? 0) + 1);
    }
    byComponent.set(componentName, pageCounts);
  }

  return byComponent;
}

function enrichBrand(brandDir: string): { componentCount: number; pageEntries: number; updatedEntries: number } {
  const reportPath = path.join(DATA_ROOT, brandDir, 'report.html');
  const extractedPath = path.join(DATA_ROOT, brandDir, 'extracted-data.json');

  const reportHtml = fs.readFileSync(reportPath, 'utf-8');
  const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf-8')) as ExtractedData;
  const pageCountsByComponent = buildComponentPageCounts(reportHtml);

  let pageEntries = 0;
  let updatedEntries = 0;

  for (const component of Object.values(extracted.components)) {
    const counts = pageCountsByComponent.get(normalizeName(component.name));
    for (const page of component.pages) {
      pageEntries += 1;
      const occurrences = counts?.get(page.url) ?? 1;
      page.occurrences = occurrences;
      if (occurrences > 1) updatedEntries += 1;
    }
  }

  fs.writeFileSync(extractedPath, JSON.stringify(extracted, null, 2), 'utf-8');
  return {
    componentCount: Object.keys(extracted.components).length,
    pageEntries,
    updatedEntries,
  };
}

function main() {
  for (const brand of BRANDS) {
    const stats = enrichBrand(brand.dataDir);
    console.log(
      `${brand.id}: components=${stats.componentCount}, pageEntries=${stats.pageEntries}, occurrences>1=${stats.updatedEntries}`
    );
  }
}

main();
