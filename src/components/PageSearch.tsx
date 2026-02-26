'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PageEntry, ConfirmedPair } from '@/lib/types';

interface Props {
  pages: PageEntry[];
  confirmedPairs: ConfirmedPair[];
}

type PreviewComponent = {
  name: string;
  screenshotUrl: string | null;
  count: number;
  selector: string | null;
  pageCount: number;
  brand: string;
};

export default function PageSearch({ pages, confirmedPairs }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<PreviewComponent | null>(null);
  const hasInitializedCompare = useRef(false);

  const pagesByBrandAndFilename = useMemo(() => {
    const map = new Map<string, PageEntry>();
    for (const page of pages) {
      map.set(`${page.brand}:${page.filename}`, page);
    }
    return map;
  }, [pages]);

  const pagesByKey = useMemo(() => {
    const map = new Map<string, PageEntry>();
    for (const page of pages) {
      map.set(`${page.brand}::${page.url}`, page);
    }
    return map;
  }, [pages]);

  const filtered = query.trim()
    ? pages.filter((p) => p.url.toLowerCase().includes(query.toLowerCase()))
    : pages;

  // Group by brand
  const grouped = new Map<string, PageEntry[]>();
  for (const page of filtered) {
    if (!grouped.has(page.brand)) grouped.set(page.brand, []);
    grouped.get(page.brand)!.push(page);
  }

  const pageKey = (p: PageEntry) => `${p.brand}::${p.url}`;

  useEffect(() => {
    if (hasInitializedCompare.current) return;
    const compareParam = searchParams.get('compare');
    const nextSelected = new Set<string>();
    if (compareParam) {
      for (const entry of compareParam.split(',').map((value) => value.trim()).filter(Boolean)) {
        const separator = entry.indexOf(':');
        if (separator === -1) continue;
        const brand = entry.slice(0, separator);
        const filename = entry.slice(separator + 1);
        const page = pagesByBrandAndFilename.get(`${brand}:${filename}`);
        if (page) {
          nextSelected.add(pageKey(page));
        }
      }
    }
    setSelected(nextSelected);
    hasInitializedCompare.current = true;
  }, [pagesByBrandAndFilename, searchParams]);

  useEffect(() => {
    if (!hasInitializedCompare.current) return;
    const params = new URLSearchParams(searchParams.toString());
    const compare = Array.from(selected)
      .map((key) => {
        const page = pagesByKey.get(key);
        return page ? `${page.brand}:${page.filename}` : null;
      })
      .filter((value): value is string => value !== null);

    if (compare.length > 0) params.set('compare', compare.join(','));
    else params.delete('compare');

    const currentQuery = searchParams.toString();
    const nextQuery = params.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams, selected, pagesByKey]);

  const toggle = (p: PageEntry) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = pageKey(p);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const selectedPages = useMemo(
    () => pages.filter((p) => selected.has(`${p.brand}::${p.url}`)),
    [pages, selected]
  );

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages by URL…"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {pages.length} pages
        {selected.size > 0 && (
          <>
            {' · '}
            <span className="text-blue-600 font-medium">{selected.size} selected</span>
            <button onClick={() => setSelected(new Set())} className="ml-1 text-blue-600 hover:underline">
              (clear)
            </button>
          </>
        )}
      </p>

      {/* Comparison panel */}
      {selectedPages.length >= 2 && (
        <ComparisonPanel pages={selectedPages} confirmedPairs={confirmedPairs} onPreview={setPreview} />
      )}

      {/* Results by brand */}
      {Array.from(grouped.entries()).map(([brand, brandPages]) => (
        <section key={brand}>
          <h2 className="text-lg font-semibold mb-3">
            {brandPages[0].brandName}
            <span className="text-sm font-normal text-gray-400 ml-2">
              {brandPages.length} page{brandPages.length !== 1 ? 's' : ''}
            </span>
          </h2>

          <div className="space-y-3">
            {brandPages.map((page) => (
              <PageCard
                key={pageKey(page)}
                page={page}
                brand={page.brand}
                isSelected={selected.has(pageKey(page))}
                onToggle={() => toggle(page)}
                onPreview={setPreview}
              />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm italic">No pages match your search.</p>
      )}

      {preview && (
        <ComponentPreviewModal
          component={preview}
          brand={preview.brand}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function PageCard({
  page,
  brand,
  isSelected,
  onToggle,
  onPreview,
}: {
  page: PageEntry;
  brand: string;
  isSelected: boolean;
  onToggle: () => void;
  onPreview: (component: PreviewComponent) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 hover:border-blue-400'
          }`}
          title={isSelected ? 'Deselect page' : 'Select page for comparison'}
        >
          {isSelected && <span className="text-xs">✓</span>}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left flex items-center justify-between gap-3 hover:text-blue-600 transition-colors min-w-0"
        >
          <div className="min-w-0">
            <p className="text-sm text-blue-600 font-medium truncate">{page.url}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {page.components.length} component{page.components.length !== 1 ? 's' : ''}
            </p>
          </div>
          <span className="text-gray-400 text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {page.components.map((comp) => (
              <ComponentLink
                key={`${brand}::${comp.name}`}
                component={{ ...comp, brand }}
                onPreview={onPreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonPanel({
  pages,
  confirmedPairs,
  onPreview,
}: {
  pages: PageEntry[];
  confirmedPairs: ConfirmedPair[];
  onPreview: (component: PreviewComponent) => void;
}) {
  const [liveConfirmedPairs, setLiveConfirmedPairs] = useState<ConfirmedPair[]>([]);

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      try {
        const response = await fetch('/api/review', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { reviews?: Record<string, 'confirmed' | 'rejected'> };
        const parsed: ConfirmedPair[] = [];
        for (const [key, status] of Object.entries(data.reviews ?? {})) {
          if (status !== 'confirmed') continue;
          const parts = key.split('::');
          if (parts.length !== 4) continue;
          const [brandA, componentA, brandB, componentB] = parts;
          parsed.push({ brandA, componentA, brandB, componentB });
        }
        if (active) setLiveConfirmedPairs(parsed);
      } catch {
        if (active) setLiveConfirmedPairs([]);
      }
    };
    loadReviews();
    return () => {
      active = false;
    };
  }, []);

  const mergedConfirmedPairs = useMemo(() => {
    const deduped = new Map<string, ConfirmedPair>();
    for (const pair of [...confirmedPairs, ...liveConfirmedPairs]) {
      deduped.set(`${pair.brandA}::${pair.componentA}::${pair.brandB}::${pair.componentB}`, pair);
    }
    return Array.from(deduped.values());
  }, [confirmedPairs, liveConfirmedPairs]);

  const { sharedGroups, uniqueByPage } = useMemo(() => {
    type Member = {
      key: string;
      brand: string;
      name: string;
      screenshotUrl: string | null;
      count: number;
      selector: string | null;
      pageCount: number;
      pageCounts: Map<string, number>;
      pageKeys: Set<string>;
    };

    type Group = {
      members: Member[];
      pageKeys: Set<string>;
    };

    const members = new Map<string, Member>();
    const keysByName = new Map<string, string[]>();

    for (const page of pages) {
      const pageKey = `${page.brand}::${page.url}`;
      for (const component of page.components) {
        const componentKey = `${page.brand}::${component.name}`;
        if (!members.has(componentKey)) {
            members.set(componentKey, {
              key: componentKey,
              brand: page.brand,
              name: component.name,
              screenshotUrl: component.screenshotUrl,
              count: component.count,
              selector: component.selector,
              pageCount: component.pageCount,
              pageCounts: new Map(),
              pageKeys: new Set(),
            });
          }
        members.get(componentKey)!.pageCounts.set(pageKey, component.pageCount);
        members.get(componentKey)!.pageKeys.add(pageKey);
        if (!keysByName.has(component.name)) keysByName.set(component.name, []);
        if (!keysByName.get(component.name)!.includes(componentKey)) {
          keysByName.get(component.name)!.push(componentKey);
        }
      }
    }

    const parent = new Map<string, string>();
    for (const key of members.keys()) parent.set(key, key);

    const find = (node: string): string => {
      const root = parent.get(node);
      if (!root || root === node) return node;
      const resolved = find(root);
      parent.set(node, resolved);
      return resolved;
    };

    const union = (left: string, right: string) => {
      const leftRoot = find(left);
      const rightRoot = find(right);
      if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
    };

    for (const keys of keysByName.values()) {
      for (let i = 1; i < keys.length; i += 1) {
        union(keys[0], keys[i]);
      }
    }

    for (const pair of mergedConfirmedPairs) {
      const keyA = `${pair.brandA}::${pair.componentA}`;
      const keyB = `${pair.brandB}::${pair.componentB}`;
      if (parent.has(keyA) && parent.has(keyB)) {
        union(keyA, keyB);
      }
    }

    const groups = new Map<string, Group>();
    for (const member of members.values()) {
      const root = find(member.key);
      if (!groups.has(root)) {
        groups.set(root, { members: [], pageKeys: new Set() });
      }
      const group = groups.get(root)!;
      group.members.push(member);
      for (const pageKey of member.pageKeys) {
        group.pageKeys.add(pageKey);
      }
    }

    for (const group of groups.values()) {
      group.members.sort((a, b) => a.name.localeCompare(b.name));
    }

    const shared = Array.from(groups.values())
      .filter((group) => group.pageKeys.size >= 2)
      .sort((a, b) => a.members[0].name.localeCompare(b.members[0].name));

    const unique = new Map<string, Group[]>();
    for (const group of groups.values()) {
      if (group.pageKeys.size !== 1) continue;
      const onlyPage = Array.from(group.pageKeys)[0];
      if (!unique.has(onlyPage)) unique.set(onlyPage, []);
      unique.get(onlyPage)!.push(group);
    }
    for (const pageGroups of unique.values()) {
      pageGroups.sort((a, b) => a.members[0].name.localeCompare(b.members[0].name));
    }

    return { sharedGroups: shared, uniqueByPage: unique };
  }, [pages, mergedConfirmedPairs]);

  const pageLabel = (p: PageEntry) => {
    try {
      const u = new URL(p.url);
      return u.pathname === '/' ? u.hostname : u.pathname;
    } catch {
      return p.url;
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-5">
      <h2 className="text-lg font-semibold text-blue-900">
        Comparing {pages.length} pages
      </h2>

      {/* Selected pages summary */}
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <span key={`${p.brand}::${p.url}`} className="inline-flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs">
            <span className="font-semibold text-blue-700">{p.brandName}</span>
            <span className="text-gray-500 truncate max-w-[200px]">{pageLabel(p)}</span>
          </span>
        ))}
      </div>

      {/* Shared components — split into confirmed and likely */}
      {(() => {
        const confirmedShared: typeof sharedGroups = [];
        const likelyShared: typeof sharedGroups = [];
        for (const group of sharedGroups) {
          const groupKeys = new Set(group.members.map((m) => m.key));
          const hasConfirmedPair = mergedConfirmedPairs.some(
            (pair) =>
              pair.brandA !== pair.brandB &&
              groupKeys.has(`${pair.brandA}::${pair.componentA}`) &&
              groupKeys.has(`${pair.brandB}::${pair.componentB}`)
          );
          if (hasConfirmedPair) confirmedShared.push(group);
          else likelyShared.push(group);
        }

        const renderGroup = (group: (typeof sharedGroups)[number]) => {
          // Show all members grouped by brand
          const byBrand = new Map<string, typeof group.members>();
          for (const member of group.members) {
            if (!byBrand.has(member.brand)) byBrand.set(member.brand, []);
            byBrand.get(member.brand)!.push(member);
          }
          return (
            <div
              key={group.members.map((m) => m.key).join('|')}
              className="rounded-lg border border-green-200 bg-white p-3 space-y-2"
            >
              {Array.from(byBrand.entries()).map(([brand, brandMembers]) => (
                <div key={brand}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{brand}</p>
                  <div className="space-y-1">
                    {brandMembers.map((member) => (
                      <button
                        key={member.key}
                        type="button"
                        onClick={() =>
                          onPreview({
                            ...member,
                            pageCount: Array.from(member.pageCounts.values()).reduce((sum, value) => sum + value, 0),
                          })
                        }
                        className="w-full text-left flex items-center gap-2 rounded-md p-1.5 hover:bg-green-50 transition-colors"
                      >
                        {member.screenshotUrl ? (
                          <Image
                            src={member.screenshotUrl}
                            alt={member.name}
                            width={48}
                            height={30}
                            className="rounded border border-gray-200 object-cover bg-gray-50 shrink-0"
                            style={{ width: 48, height: 30 }}
                          />
                        ) : (
                          <div className="w-12 h-[30px] rounded border border-dashed border-gray-200 bg-gray-50 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-gray-700 font-medium truncate block">{member.name}</span>
                          <span className="text-xs text-gray-500">
                            {member.pageCounts.size === 1
                              ? `${Array.from(member.pageCounts.values())[0]}x on page`
                              : `${Array.from(member.pageCounts.values()).reduce((sum, value) => sum + value, 0)}x across ${member.pageCounts.size} pages`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        };

        return sharedGroups.length > 0 ? (
          <>
            {confirmedShared.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-2">
                  ✓ Confirmed same ({confirmedShared.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {confirmedShared.map(renderGroup)}
                </div>
              </div>
            )}
            {likelyShared.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-yellow-700 mb-2">
                  ~ Likely same ({likelyShared.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {likelyShared.map(renderGroup)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-green-700 mb-2">
              ✓ Shared across selected pages (0)
            </h3>
            <p className="text-sm text-gray-400 italic">No components in common.</p>
          </div>
        );
      })()}

      {/* Unique per page */}
      {pages.map((page) => {
        const pk = `${page.brand}::${page.url}`;
        const groups = uniqueByPage.get(pk);
        if (!groups || groups.length === 0) return null;
        return (
          <div key={pk}>
            <h3 className="text-sm font-semibold text-orange-700 mb-2">
              Only on {page.brandName} — {pageLabel(page)} ({groups.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {groups.map((group) => {
                const member = group.members.find((item) => item.pageKeys.has(pk)) ?? group.members[0];
                return (
                  <ComponentLink
                    key={member.key}
                    component={{
                      ...member,
                      pageCount: member.pageCounts.get(pk) ?? member.pageCount,
                    }}
                    highlight="orange"
                    onPreview={onPreview}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComponentLink({
  component,
  highlight,
  subtitle,
  onPreview,
}: {
  component: PreviewComponent;
  highlight?: 'green' | 'orange';
  subtitle?: { name: string; brand: string };
  onPreview: (component: PreviewComponent) => void;
}) {
  const borderClass = highlight === 'green'
    ? 'border-green-200 hover:border-green-300 hover:bg-green-50'
    : highlight === 'orange'
      ? 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
      : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50';

  const thumbnail = component.screenshotUrl ? (
    <Image
      src={component.screenshotUrl}
      alt={component.name}
      width={64}
      height={40}
      className="rounded border border-gray-200 object-cover bg-gray-50 shrink-0"
      style={{ width: 64, height: 40 }}
    />
  ) : (
    <div className="w-16 h-10 rounded border border-dashed border-gray-200 bg-gray-50 shrink-0 flex items-center justify-center">
      <span className="text-[10px] text-gray-300">—</span>
    </div>
  );

  if (subtitle) {
    return (
      <button
        type="button"
        onClick={() => onPreview(component)}
        className={`w-full text-left flex items-center gap-3 rounded-lg border bg-white p-2.5 transition-colors ${borderClass}`}
      >
        {thumbnail}
        <div className="min-w-0">
          <p className="block text-sm text-gray-700 hover:text-blue-600 font-medium truncate">
            {component.name}
          </p>
          <p className="text-xs text-gray-500">{component.pageCount}x on page</p>
          <p className="mt-0.5 block text-xs text-gray-500 truncate">
            ↔ {subtitle.name} ({subtitle.brand.toUpperCase()})
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPreview(component)}
      className={`flex items-center gap-3 rounded-lg border bg-white p-2.5 transition-colors group ${borderClass}`}
    >
      {thumbnail}
      <div className="min-w-0">
        <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium truncate block">
          {component.name}
        </span>
        <span className="text-xs text-gray-500">{component.pageCount}x on page</span>
      </div>
    </button>
  );
}

function ComponentPreviewModal({
  component,
  brand,
  onClose,
}: {
  component: { name: string; screenshotUrl: string | null; count: number; selector: string | null; pageCount: number };
  brand: string;
  onClose: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    setCopyStatus('idle');
  }, [component.name, component.selector]);

  const copySelector = async () => {
    if (!component.selector) return;
    try {
      await navigator.clipboard.writeText(component.selector);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 truncate">{component.name}</h2>
            <span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {brand}
            </span>
          </div>

          {component.screenshotUrl ? (
            <Image
              src={component.screenshotUrl}
              alt={component.name}
              width={800}
              height={400}
              className="w-full max-h-[400px] rounded-lg border border-gray-200 bg-gray-50 object-contain"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm italic text-gray-400">
              No screenshot available
            </div>
          )}

          <p className="text-sm text-gray-600">Appears {component.pageCount}x on this page</p>
          <p className="text-xs text-gray-500">Used on {component.count} pages total</p>

          {component.selector ? (
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <code className="flex-1 block rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-700 break-all">
                  {component.selector}
                </code>
                <button
                  type="button"
                  onClick={copySelector}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  title="Copy selector"
                  aria-label="Copy selector"
                >
                  {copyStatus === 'copied' ? '✓' : '⧉'}
                </button>
              </div>
              {copyStatus === 'copied' && (
                <p className="text-xs text-green-700">Selector copied.</p>
              )}
              {copyStatus === 'failed' && (
                <p className="text-xs text-red-600">Could not copy selector.</p>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">No selector defined</p>
          )}

          <div className="flex justify-end gap-2">
            <Link
              href={`/components/${encodeURIComponent(component.name)}`}
              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              View full details →
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
