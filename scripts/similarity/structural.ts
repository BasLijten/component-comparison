/**
 * Computes structural DOM similarity between two components.
 * Extracts tag sequences from report.html component sections and computes Jaccard similarity.
 */
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import { slugify } from '../extract-screenshots.js';

const DATA_ROOT = path.join(process.cwd(), 'data');

// Cache parsed reports to avoid re-reading large files
const reportCache = new Map<string, ReturnType<typeof parse>>();

function getReport(brand: string, dataDir: string) {
  if (reportCache.has(brand)) return reportCache.get(brand)!;
  const reportPath = path.join(DATA_ROOT, dataDir, 'report.html');
  const html = fs.readFileSync(reportPath, 'utf-8');
  const root = parse(html);
  reportCache.set(brand, root);
  return root;
}

/** Extract a tag-path multiset from an HTML element (ignoring text, classes, ids) */
function extractTagSequence(htmlStr: string): string[] {
  // Simple regex approach: find all opening tags
  const tagPattern = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const tags: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tagPattern.exec(htmlStr)) !== null) {
    const tag = m[1].toLowerCase();
    // Skip script, style, img
    if (!['script', 'style', 'img', 'svg', 'path', 'circle', 'rect'].includes(tag)) {
      tags.push(tag);
    }
  }
  return tags;
}

function jaccardTags(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 && tagsB.length === 0) return 1;
  const countA = new Map<string, number>();
  const countB = new Map<string, number>();
  tagsA.forEach(t => countA.set(t, (countA.get(t) ?? 0) + 1));
  tagsB.forEach(t => countB.set(t, (countB.get(t) ?? 0) + 1));

  const allTags = new Set([...countA.keys(), ...countB.keys()]);
  let intersection = 0;
  let union = 0;
  for (const tag of allTags) {
    const a = countA.get(tag) ?? 0;
    const b = countB.get(tag) ?? 0;
    intersection += Math.min(a, b);
    union += Math.max(a, b);
  }
  return union === 0 ? 1 : intersection / union;
}

// Map from brand+componentName to its inner HTML
const htmlCache = new Map<string, string>();

export function getComponentHtml(brand: string, dataDir: string, componentName: string): string | null {
  const key = `${brand}::${componentName}`;
  if (htmlCache.has(key)) return htmlCache.get(key) ?? null;

  const root = getReport(brand, dataDir);
  const slug = slugify(componentName);

  // Try matching by detail-title text content
  const detailDivs = root.querySelectorAll('.component-detail');
  for (const div of detailDivs) {
    const titleEl = div.querySelector('.detail-title');
    if (!titleEl) continue;
    if (slugify(titleEl.text.trim()) === slug) {
      // Get the detail-section content (excluding screenshot)
      const sections = div.querySelectorAll('.detail-section');
      const html = sections.map(s => s.innerHTML).join('');
      htmlCache.set(key, html);
      return html;
    }
  }
  return null;
}

const BRAND_CONFIG: Record<string, string> = {
  fbto: 'fbto-report',
  cb: 'cb-report',
};

export function structuralScore(
  brandA: string, componentA: string,
  brandB: string, componentB: string
): number {
  const htmlA = getComponentHtml(brandA, BRAND_CONFIG[brandA] ?? `${brandA}-report`, componentA);
  const htmlB = getComponentHtml(brandB, BRAND_CONFIG[brandB] ?? `${brandB}-report`, componentB);

  if (!htmlA || !htmlB) return -1; // not available

  const tagsA = extractTagSequence(htmlA);
  const tagsB = extractTagSequence(htmlB);

  return jaccardTags(tagsA, tagsB);
}
