export interface BrandConfig {
  id: string;
  name: string;
  dataDir: string;
}

export interface ComponentPage {
  url: string;
  filename: string;
}

export interface Component {
  name: string;
  count: number;
  pages: ComponentPage[];
}

export interface ComponentSelector {
  selector: string | null;
  description: string;
}

export interface BrandReport {
  extractedAt: string;
  totalPages: number;
  totalUniqueComponents: number;
  components: Record<string, Component>;
}

export interface BrandData {
  config: BrandConfig;
  report: BrandReport;
  selectors: Record<string, ComponentSelector>;
}

export interface SimilaritySignals {
  name: number;
  visual: number | null;
  structural: number | null;
}

export interface SimilarityPair {
  brandA: string;
  componentA: string;
  brandB: string;
  componentB: string;
  score: number;
  signals: SimilaritySignals;
}

export interface SimilarityData {
  generatedAt: string;
  totalPairs: number;
  pairs: SimilarityPair[];
}

