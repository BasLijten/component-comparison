'use client';

import { useState, useEffect } from 'react';
import type { ReviewStatus } from '@/app/api/review/route';

interface Props {
  pairKey: string;
}

export default function ReviewBadge({ pairKey }: Props) {
  const [status, setStatus] = useState<ReviewStatus | null>(null);

  useEffect(() => {
    fetch('/api/review')
      .then((r) => r.json())
      .then((data: { reviews: Record<string, ReviewStatus> }) => {
        setStatus(data.reviews[pairKey] ?? 'unreviewed');
      })
      .catch(() => setStatus('unreviewed'));
  }, [pairKey]);

  if (!status || status === 'unreviewed') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
        status === 'confirmed'
          ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
          : 'bg-red-100 text-red-700 ring-1 ring-red-300'
      }`}
    >
      {status === 'confirmed' ? '✓ Confirmed same' : '✕ Not the same'}
    </span>
  );
}
