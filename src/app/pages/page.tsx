import { getAllPagesData, getConfirmedPairs } from '@/lib/data';
import PageSearch from '@/components/PageSearch';
import { Suspense } from 'react';

export default function PagesPage() {
  const pages = getAllPagesData();
  const confirmedPairs = getConfirmedPairs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse pages across all brands and see which components are used on each.
        </p>
      </div>
      <Suspense fallback={<div className="text-sm text-gray-500">Loading pages…</div>}>
        <PageSearch pages={pages} confirmedPairs={confirmedPairs} />
      </Suspense>
    </div>
  );
}
