import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllBrandsData, getSimilarPairs, getScreenshotUrl, buildPairKey } from "@/lib/data";
import { BRANDS } from "@/lib/brands";
import SimilarComponentsSection from "@/components/SimilarComponentsSection";
import type { SimilarCard } from "@/components/SimilarComponentsSection";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  const brandsData = getAllBrandsData();
  const allNames = new Set(
    brandsData.flatMap((b) => Object.keys(b.report.components))
  );
  return Array.from(allNames).map((name) => ({ name: encodeURIComponent(name) }));
}


export default async function ComponentDetail({ params }: Props) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);

  const brandsData = getAllBrandsData();
  const hasAny = brandsData.some((b) => b.report.components[name]);

  // Also check if it exists as a match target (might not be in any brand's components directly)
  const similarPairs = getSimilarPairs('fbto', name).concat(
    brandsData.flatMap(({ config }) => getSimilarPairs(config.id, name))
  );
  const uniquePairs = [...new Map(
    similarPairs.map(p => [`${p.brandA}::${p.componentA}::${p.brandB}::${p.componentB}`, p])
  ).values()].sort((a, b) => b.score - a.score);

  if (!hasAny) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to overview</Link>
        <h1 className="text-2xl font-semibold mt-2">{name}</h1>
      </div>

      {/* Brand panels */}
      <div className={`grid gap-6 grid-cols-1 ${BRANDS.length > 1 ? "md:grid-cols-2" : ""}`}>
        {brandsData.map(({ config, report, selectors }) => {
          const component = report.components[name];
          const selector = selectors[name];
          return (
            <div key={config.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-semibold">{config.name}</h2>

              {/* Screenshot */}
              {(() => {
                const url = getScreenshotUrl(config.id, name);
                return url ? (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Screenshot</p>
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <Image
                        src={url}
                        alt={`${name} on ${config.name}`}
                        width={800}
                        height={500}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: 320 }}
                      />
                    </div>
                  </div>
                ) : (
                  component && (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 h-24 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No screenshot available</span>
                    </div>
                  )
                );
              })()}

              {/* Selector */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Selector</p>
                {selector?.selector ? (
                  <code className="block bg-gray-100 rounded px-3 py-2 text-sm font-mono break-all">
                    {selector.selector}
                  </code>
                ) : (
                  <p className="text-sm text-gray-400 italic">No selector defined</p>
                )}
                {selector?.description && (
                  <p className="text-sm text-gray-500 mt-1">{selector.description}</p>
                )}
              </div>

              {/* Usage */}
              {component ? (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Used on {component.count} page{component.count !== 1 ? "s" : ""}
                  </p>
                  <ul className="space-y-1 max-h-72 overflow-y-auto">
                    {component.pages.map((page) => (
                      <li key={page.url}>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {page.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Not used on this brand</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Similar components section — always shown so the search is always available */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-4">Similar components in other brands</h2>
        <SimilarComponentsSection
          cards={uniquePairs.map((pair): SimilarCard => {
            const isA = pair.componentA === name;
            const otherBrand = isA ? pair.brandB : pair.brandA;
            const otherName = isA ? pair.componentB : pair.componentA;
            return {
              pairKey: buildPairKey(pair),
              brandLabel: brandsData.find(b => b.config.id === otherBrand)?.config.name ?? otherBrand,
              otherName,
              screenshotUrl: getScreenshotUrl(otherBrand, otherName),
              score: pair.score,
              signals: pair.signals,
            };
          })}
          currentBrands={brandsData.filter(b => b.report.components[name]).map(b => b.config.id)}
          currentName={name}
        />
      </section>
    </div>
  );
}
