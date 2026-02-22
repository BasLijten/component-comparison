import { NextResponse } from 'next/server';
import { getAllBrandsData, getScreenshotUrl } from '@/lib/data';
import { BRANDS } from '@/lib/brands';

export interface ComponentSearchItem {
  brand: string;
  brandLabel: string;
  name: string;
  screenshotUrl: string | null;
}

export async function GET() {
  const brandsData = getAllBrandsData();
  const items: ComponentSearchItem[] = [];

  for (const { config, report } of brandsData) {
    const brandLabel = BRANDS.find((b) => b.id === config.id)?.name ?? config.id;
    for (const name of Object.keys(report.components)) {
      items.push({
        brand: config.id,
        brandLabel,
        name,
        screenshotUrl: getScreenshotUrl(config.id, name),
      });
    }
  }

  // Sort alphabetically by name for consistent ordering
  items.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(items);
}
