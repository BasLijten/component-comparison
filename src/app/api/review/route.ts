import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export type ReviewStatus = 'confirmed' | 'rejected' | 'unreviewed';

export interface ReviewData {
  reviews: Record<string, ReviewStatus>;
}

const REVIEW_FILE = path.join(process.cwd(), '..', 'data', 'manual-review.json');

function readReviews(): ReviewData {
  try {
    return JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf-8')) as ReviewData;
  } catch {
    return { reviews: {} };
  }
}

function writeReviews(data: ReviewData): void {
  fs.writeFileSync(REVIEW_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return NextResponse.json(readReviews());
}

export async function POST(request: NextRequest) {
  const { pairKey, status }: { pairKey: string; status: ReviewStatus } = await request.json();
  if (!pairKey || !['confirmed', 'rejected', 'unreviewed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const data = readReviews();
  if (status === 'unreviewed') {
    delete data.reviews[pairKey];
  } else {
    data.reviews[pairKey] = status;
  }
  writeReviews(data);
  return NextResponse.json({ ok: true, pairKey, status });
}
