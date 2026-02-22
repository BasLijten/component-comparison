'use client';

import { useState, useEffect } from 'react';
import type { ReviewStatus } from '@/app/api/review/route';

interface Props {
  pairKey: string;
  /** Called after a review is saved so parent can re-sort */
  onReviewChange?: () => void;
}

const STATUS_CONFIG = {
  confirmed: {
    label: 'Same component',
    bg: 'bg-green-600',
    text: 'text-white',
    ring: 'ring-2 ring-green-700',
    icon: '✓',
  },
  rejected: {
    label: 'Not the same',
    bg: 'bg-red-600',
    text: 'text-white',
    ring: 'ring-2 ring-red-700',
    icon: '✕',
  },
} as const;

export default function ReviewButtons({ pairKey, onReviewChange }: Props) {
  const [status, setStatus] = useState<ReviewStatus>('unreviewed');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/review')
      .then((r) => r.json())
      .then((data: { reviews: Record<string, ReviewStatus> }) => {
        setStatus(data.reviews[pairKey] ?? 'unreviewed');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pairKey]);

  async function setReview(next: ReviewStatus) {
    if (saving) return;
    const newStatus = status === next ? 'unreviewed' : next;
    setSaving(true);
    try {
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairKey, status: newStatus }),
      });
      setStatus(newStatus);
      onReviewChange?.();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-7 w-40 rounded bg-gray-100 animate-pulse mt-2" />;
  }

  return (
    <div className="flex gap-2 mt-2">
      {(['confirmed', 'rejected'] as const).map((s) => {
        const cfg = STATUS_CONFIG[s];
        const active = status === s;
        return (
          <button
            key={s}
            onClick={() => setReview(s)}
            disabled={saving}
            title={active ? `Click to undo "${cfg.label}"` : cfg.label}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all',
              active
                ? `${cfg.bg} ${cfg.text} ${cfg.ring}`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span>{cfg.icon}</span>
            {cfg.label}
          </button>
        );
      })}
      {status !== 'unreviewed' && (
        <span className={`flex items-center text-xs font-semibold ml-1 ${status === 'confirmed' ? 'text-green-700' : 'text-red-700'}`}>
          {status === 'confirmed' ? '● Confirmed' : '● Rejected'}
        </span>
      )}
    </div>
  );
}
