import Link from "next/link";
import Image from "next/image";
import { getAllBrandsData, buildSimilarityLookup, getScreenshotUrl, buildPairKey } from "@/lib/data";
import ReviewBadge from "@/components/ReviewBadge";
import type { SimilarityPair } from "@/lib/types";

function confidenceBadge(score: number) {
  if (score >= 0.7) return { label: "Likely same", color: "bg-green-100 text-green-700" };
  if (score >= 0.5) return { label: "Possibly same", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Maybe same", color: "bg-orange-100 text-orange-700" };
}

export default function Home() {
  const brandsData = getAllBrandsData();
  const similarityLookup = buildSimilarityLookup();

  // Collect the union of all component names across all brands
  const allComponentNames = Array.from(
    new Set(brandsData.flatMap((b) => Object.keys(b.report.components)))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <section>
        <h1 className="text-2xl font-semibold mb-4">Overview</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brandsData.map(({ config, report }) => (
            <div key={config.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">{config.name}</p>
              <p className="text-3xl font-bold mt-1">{report.totalUniqueComponents}</p>
              <p className="text-xs text-gray-400 mt-1">components across {report.totalPages} pages</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Components ({allComponentNames.length} unique)</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Component</th>
                {brandsData.map(({ config }) => (
                  <th key={config.id} className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                    {config.name}
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium text-gray-600">Similar across brands</th>
              </tr>
            </thead>
            <tbody>
              {allComponentNames.map((name) => {
                // Find best similarity pair involving this component
                let bestMatch: { score: number; otherBrand: string; otherName: string; pair: SimilarityPair } | null = null;
                for (const { config } of brandsData) {
                  const key = `${config.id}::${name}`;
                  const pairs = similarityLookup.get(key);
                  if (pairs && pairs.length > 0) {
                    const best = pairs[0];
                    if (!bestMatch || best.score > bestMatch.score) {
                      const isA = best.brandA === config.id && best.componentA === name;
                      bestMatch = {
                        score: best.score,
                        otherBrand: isA ? best.brandB : best.brandA,
                        otherName: isA ? best.componentB : best.componentA,
                        pair: best,
                      };
                    }
                  }
                }

                return (
                  <tr key={name} className="border-b border-gray-50 hover:bg-blue-50 transition-colors align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/components/${encodeURIComponent(name)}`}
                        className="flex flex-col gap-2 group"
                      >
                        <span className="text-blue-600 group-hover:underline font-medium">{name}</span>
                        {/* Screenshot below the name */}
                        {(() => {
                          const brandWithShot = brandsData.find(b => b.report.components[name]);
                          const url = brandWithShot ? getScreenshotUrl(brandWithShot.config.id, name) : null;
                          return url ? (
                            <Image
                              src={url}
                              alt={name}
                              width={200}
                              height={120}
                              className="rounded border border-gray-200 object-cover bg-gray-50 w-full max-w-[200px]"
                            />
                          ) : null;
                        })()}
                      </Link>
                    </td>
                    {brandsData.map(({ config, report }) => {
                      const component = report.components[name];
                      return (
                        <td key={config.id} className="text-center px-4 py-3 text-gray-600 align-top">
                          {component ? (
                            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 min-w-[2rem]">
                              {component.count}
                            </span>
                          ) : (
                            <span className="text-gray-300">–</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 align-top">
                      {bestMatch && (
                        <>
                          <Link
                            href={`/components/${encodeURIComponent(bestMatch.otherName)}`}
                            className="flex flex-col gap-2 group"
                            title={`Score: ${(bestMatch.score * 100).toFixed(0)}%`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceBadge(bestMatch.score).color}`}>
                                {confidenceBadge(bestMatch.score).label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 group-hover:underline font-medium">
                              {bestMatch.otherName}
                            </span>
                            {(() => {
                              const url = getScreenshotUrl(bestMatch.otherBrand, bestMatch.otherName);
                              return url ? (
                                <Image
                                  src={url}
                                  alt={bestMatch.otherName}
                                  width={200}
                                  height={120}
                                  className="rounded border border-gray-200 object-cover bg-gray-50 w-full max-w-[200px]"
                                />
                              ) : null;
                            })()}
                          </Link>
                          <ReviewBadge pairKey={buildPairKey(bestMatch.pair)} />
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
