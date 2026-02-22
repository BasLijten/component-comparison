import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export interface ManualPair {
  brandA: string;
  componentA: string;
  brandB: string;
  componentB: string;
  addedAt: string;
}

interface ReviewFile {
  reviews: Record<string, string>;
  manualPairs: ManualPair[];
}

const REVIEW_FILE = path.join(process.cwd(), '..', 'data', 'manual-review.json');

function read(): ReviewFile {
  try {
    const raw = JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf-8')) as ReviewFile;
    return { reviews: raw.reviews ?? {}, manualPairs: raw.manualPairs ?? [] };
  } catch {
    return { reviews: {}, manualPairs: [] };
  }
}

function write(data: ReviewFile): void {
  fs.writeFileSync(REVIEW_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** Canonical pair key — brands sorted alphabetically so the key is the same regardless of add direction */
export function pairKey(brandA: string, compA: string, brandB: string, compB: string): string {
  if (brandA < brandB || (brandA === brandB && compA <= compB)) {
    return `${brandA}::${compA}::${brandB}::${compB}`;
  }
  return `${brandB}::${compB}::${brandA}::${compA}`;
}

export async function GET() {
  return NextResponse.json(read().manualPairs);
}

export async function POST(request: NextRequest) {
  const { brandA, componentA, brandB, componentB } =
    (await request.json()) as Omit<ManualPair, 'addedAt'>;

  if (!brandA || !componentA || !brandB || !componentB) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const data = read();
  const key = pairKey(brandA, componentA, brandB, componentB);

  // Derive canonical ordering from the key
  const [kBrandA, kCompA, kBrandB, kCompB] = key.split('::');
  const alreadyExists = data.manualPairs.some(
    (p) => p.brandA === kBrandA && p.componentA === kCompA && p.brandB === kBrandB && p.componentB === kCompB
  );

  if (alreadyExists) {
    return NextResponse.json({ ok: true, pairKey: key, alreadyExists: true });
  }

  data.manualPairs.push({ brandA: kBrandA, componentA: kCompA, brandB: kBrandB, componentB: kCompB, addedAt: new Date().toISOString() });
  write(data);
  return NextResponse.json({ ok: true, pairKey: key });
}

export async function DELETE(request: NextRequest) {
  const { pairKey: key } = (await request.json()) as { pairKey: string };
  const data = read();
  const [kBrandA, kCompA, kBrandB, kCompB] = key.split('::');
  data.manualPairs = data.manualPairs.filter(
    (p) => !(p.brandA === kBrandA && p.componentA === kCompA && p.brandB === kBrandB && p.componentB === kCompB)
  );
  // Also remove any review for this pair
  delete data.reviews[key];
  write(data);
  return NextResponse.json({ ok: true });
}
