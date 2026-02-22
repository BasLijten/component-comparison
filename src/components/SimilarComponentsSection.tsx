'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReviewButtons from '@/components/ReviewButtons';
import DeepCompareButton from '@/components/DeepCompareButton';
import type { ReviewStatus } from '@/app/api/review/route';
import type { ComponentSearchItem } from '@/app/api/components/route';
import type { ManualPair } from '@/app/api/manual-pairs/route';

export interface SimilarCard {
  pairKey: string;
  brandLabel: string;
  otherName: string;
  screenshotUrl: string | null;
  score: number;
  signals: { name: number | null; visual: number | null; structural: number | null };
  isManual?: boolean;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? 'bg-green-500' : score >= 0.5 ? 'bg-yellow-500' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 0.7) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Likely same</span>;
  if (score >= 0.5) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Possibly same</span>;
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Maybe same</span>;
}

function SimilarCardItem({
  card,
  onReviewChange,
  onRemove,
  showDeepCompare,
}: {
  card: SimilarCard;
  onReviewChange: () => void;
  onRemove?: () => void;
  showDeepCompare?: boolean;
}) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors relative">
      {card.isManual && onRemove && (
        <button
          onClick={onRemove}
          title="Remove this manually added comparison"
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
        >
          ×
        </button>
      )}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs text-gray-400">{card.brandLabel}</span>
        <ConfidenceBadge score={card.score} />
        {card.isManual && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">manual</span>
        )}
      </div>
      <Link href={`/components/${encodeURIComponent(card.otherName)}`} className="block">
        <span className="text-sm font-medium text-blue-600 hover:underline block mb-2">{card.otherName}</span>
        {card.screenshotUrl && (
          <Image
            src={card.screenshotUrl}
            alt={card.otherName}
            width={400}
            height={250}
            className="rounded border border-gray-200 object-cover bg-white w-full"
          />
        )}
      </Link>
      <ScoreBar score={card.score} />
      <div className="flex gap-3 mt-1 text-xs text-gray-400">
        {card.signals.name !== null && <span>Name: {Math.round(card.signals.name * 100)}%</span>}
        {card.signals.visual !== null && <span>Visual: {Math.round(card.signals.visual * 100)}%</span>}
        {card.signals.structural !== null && <span>Structure: {Math.round(card.signals.structural * 100)}%</span>}
      </div>
      <ReviewButtons pairKey={card.pairKey} onReviewChange={onReviewChange} />
      {showDeepCompare && <DeepCompareButton pairKey={card.pairKey} />}
    </div>
  );
}

/* ── Canonical key (mirrors /api/manual-pairs logic) ─────── */
function canonicalKey(brandA: string, compA: string, brandB: string, compB: string): string {
  if (brandA < brandB || (brandA === brandB && compA <= compB)) {
    return `${brandA}::${compA}::${brandB}::${compB}`;
  }
  return `${brandB}::${compB}::${brandA}::${compA}`;
}

/* ── Search / add UI ─────────────────────────────────────── */
function AddComparisonSearch({
  currentBrands,
  currentName,
  existingPairKeys,
  allComponents,
  onAdded,
}: {
  currentBrands: string[];
  currentName: string;
  existingPairKeys: Set<string>;
  allComponents: ComponentSearchItem[];
  onAdded: () => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const lower = query.trim().toLowerCase();
  const results = lower.length === 0 ? [] : allComponents
    .filter((c) => {
      if (c.name === currentName) return false;
      if (!c.name.toLowerCase().includes(lower)) return false;
      const currentBrand = currentBrands.find((b) => b !== c.brand) ?? currentBrands[0];
      const key = canonicalKey(currentBrand, currentName, c.brand, c.name);
      return !existingPairKeys.has(key);
    })
    .slice(0, 12);

  async function handleSelect(item: ComponentSearchItem) {
    if (adding) return;
    setAdding(true);
    setOpen(false);
    setQuery('');
    const currentBrand = currentBrands.find((b) => b !== item.brand) ?? currentBrands[0];
    await fetch('/api/manual-pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandA: currentBrand, componentA: currentName, brandB: item.brand, componentB: item.name }),
    });
    setAdding(false);
    onAdded();
  }

  return (
    <div ref={containerRef} className="relative mb-2">
      <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          placeholder="Add a component to compare…"
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.trim()) setOpen(true); }}
        />
        {adding && <span className="text-xs text-blue-500 animate-pulse">Adding…</span>}
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {results.map((item) => (
            <li key={`${item.brand}::${item.name}`}>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left"
                onClick={() => handleSelect(item)}
              >
                {item.screenshotUrl ? (
                  <Image
                    src={item.screenshotUrl}
                    alt={item.name}
                    width={60}
                    height={38}
                    className="rounded border border-gray-200 object-cover bg-gray-50 flex-shrink-0"
                    style={{ width: 60, height: 38 }}
                  />
                ) : (
                  <div className="w-[60px] h-[38px] rounded border border-gray-100 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-300 text-xs">–</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.brandLabel}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && lower.length > 0 && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl px-4 py-3 text-sm text-gray-400">
          No matching components found
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
interface GroupDef {
  title: string;
  headerClass: string;
  cards: SimilarCard[];
  isConfirmed?: boolean;
}

export default function SimilarComponentsSection({
  cards: initialCards,
  currentBrands,
  currentName,
}: {
  cards: SimilarCard[];
  currentBrands: string[];
  currentName: string;
}) {
  const [reviews, setReviews] = useState<Record<string, ReviewStatus>>({});
  const [manualCards, setManualCards] = useState<SimilarCard[]>([]);
  const [allComponents, setAllComponents] = useState<ComponentSearchItem[]>([]);
  const [, forceRender] = useState(0);

  function fetchAll() {
    Promise.all([
      fetch('/api/review').then((r) => r.json() as Promise<{ reviews: Record<string, ReviewStatus> }>),
      fetch('/api/manual-pairs').then((r) => r.json() as Promise<ManualPair[]>),
    ]).then(([reviewData, pairs]) => {
      setReviews(reviewData.reviews);
      const existingKeys = new Set(initialCards.map((c) => c.pairKey));
      const built: SimilarCard[] = pairs
        .map((p): SimilarCard | null => {
          if (p.componentA !== currentName && p.componentB !== currentName) return null;
          const key = `${p.brandA}::${p.componentA}::${p.brandB}::${p.componentB}`;
          if (existingKeys.has(key)) return null;
          const isA = p.componentA === currentName;
          const otherBrand = isA ? p.brandB : p.brandA;
          const otherName = isA ? p.componentB : p.componentA;
          return { pairKey: key, brandLabel: otherBrand, otherName, screenshotUrl: null, score: 0.5, signals: { name: null, visual: null, structural: null }, isManual: true };
        })
        .filter((c): c is SimilarCard => c !== null);
      setManualCards(built);
      forceRender((n) => n + 1);
    }).catch(() => {});
  }

  useEffect(() => {
    fetchAll();
    fetch('/api/components')
      .then((r) => r.json() as Promise<ComponentSearchItem[]>)
      .then(setAllComponents)
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Enrich manual cards with brand labels and screenshot URLs
  const enrichedManual = manualCards.map((card) => {
    const match = allComponents.find((c) => c.name === card.otherName);
    return { ...card, brandLabel: match?.brandLabel ?? card.brandLabel, screenshotUrl: match?.screenshotUrl ?? null };
  });

  const allCards = [...initialCards, ...enrichedManual];
  const existingPairKeys = new Set(allCards.map((c) => c.pairKey));

  const confirmed = allCards.filter((c) => reviews[c.pairKey] === 'confirmed');
  const rejected  = allCards.filter((c) => reviews[c.pairKey] === 'rejected');
  const unclear   = allCards.filter((c) => !reviews[c.pairKey] || reviews[c.pairKey] === 'unreviewed');

  const groups: GroupDef[] = [
    { title: `✓ Confirmed same (${confirmed.length})`, headerClass: 'text-green-700 bg-green-50 border-green-200', cards: confirmed, isConfirmed: true },
    { title: `? Needs review (${unclear.length})`,     headerClass: 'text-yellow-700 bg-yellow-50 border-yellow-200', cards: unclear },
    { title: `✕ Not the same (${rejected.length})`,    headerClass: 'text-red-700 bg-red-50 border-red-200', cards: rejected },
  ];

  async function removePair(pairKey: string) {
    await fetch('/api/manual-pairs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pairKey }) });
    fetchAll();
  }

  return (
    <div className="space-y-6">
      <AddComparisonSearch
        currentBrands={currentBrands}
        currentName={currentName}
        existingPairKeys={existingPairKeys}
        allComponents={allComponents}
        onAdded={fetchAll}
      />

      {groups.map((group) => {
        if (group.cards.length === 0) return null;
        return (
          <div key={group.title}>
            <h3 className={`text-sm font-semibold px-3 py-1.5 rounded-lg border mb-3 inline-block ${group.headerClass}`}>
              {group.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.cards.map((card) => (
                <SimilarCardItem
                  key={card.pairKey}
                  card={card}
                  onReviewChange={fetchAll}
                  onRemove={card.isManual ? () => removePair(card.pairKey) : undefined}
                  showDeepCompare={group.isConfirmed}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
