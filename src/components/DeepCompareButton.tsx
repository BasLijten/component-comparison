'use client';

import { useState, useEffect } from 'react';

interface Props {
  pairKey: string;
}

export default function DeepCompareButton({ pairKey }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [filePath, setFilePath] = useState<string | null>(null);

  // Check on mount if plan.md already exists for this pair
  useEffect(() => {
    fetch(`/api/deep-compare?pairKey=${encodeURIComponent(pairKey)}`)
      .then((r) => r.json())
      .then((d: { exists: boolean; path: string | null }) => {
        if (d.exists) { setStatus('done'); setFilePath(d.path); }
      })
      .catch(() => {});
  }, [pairKey]);

  async function generate() {
    setStatus('loading');
    try {
      const res = await fetch('/api/deep-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairKey }),
      });
      const data = (await res.json()) as { ok: boolean; path: string };
      if (data.ok) { setStatus('done'); setFilePath(data.path); }
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done' && filePath) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          plan.md generated
        </span>
        <span className="text-xs text-gray-400 font-mono truncate max-w-[180px]" title={filePath}>{filePath}</span>
        <button
          onClick={generate}
          className="text-xs text-gray-400 hover:text-blue-600 underline"
          title="Regenerate plan.md"
        >
          regenerate
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={generate}
      disabled={status === 'loading'}
      className={[
        'mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-all',
        status === 'loading'
          ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-not-allowed'
          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 cursor-pointer',
        status === 'error' ? 'border-red-300 text-red-600 bg-red-50' : '',
      ].join(' ')}
    >
      {status === 'loading' ? (
        <>
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
          Generating…
        </>
      ) : status === 'error' ? (
        <>⚠ Failed — retry</>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Deep compare
        </>
      )}
    </button>
  );
}
