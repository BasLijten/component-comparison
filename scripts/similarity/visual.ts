/**
 * Computes visual similarity between two component screenshots using perceptual hashing (pHash).
 * Uses DCT-based 64-bit hash; similarity = 1 - normalizedHammingDistance.
 */
import sharp from 'sharp';

const HASH_SIZE = 8; // 8x8 = 64-bit hash

async function getPixels(pngPath: string): Promise<number[][]> {
  const { data, info } = await sharp(pngPath)
    .greyscale()
    .resize(HASH_SIZE * 4, HASH_SIZE * 4, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: number[][] = [];
  for (let y = 0; y < info.height; y++) {
    pixels.push([]);
    for (let x = 0; x < info.width; x++) {
      pixels[y].push(data[y * info.width + x] / 255);
    }
  }
  return pixels;
}

/** Compute 1D DCT of an array */
function dct1d(signal: number[]): number[] {
  const N = signal.length;
  return Array.from({ length: N }, (_, k) => {
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += signal[n] * Math.cos((Math.PI / N) * (n + 0.5) * k);
    }
    return sum;
  });
}

/** Compute 2D DCT by applying 1D DCT on rows then columns */
function dct2d(pixels: number[][]): number[][] {
  const rows = pixels.map(row => dct1d(row));
  const cols: number[][] = Array.from({ length: rows[0].length }, () => []);
  for (let x = 0; x < rows[0].length; x++) {
    const col = rows.map(row => row[x]);
    const dctCol = dct1d(col);
    dctCol.forEach((v, y) => { cols[x][y] = v; });
  }
  // Reorganize: result[y][x]
  return Array.from({ length: rows.length }, (_, y) =>
    Array.from({ length: cols.length }, (_, x) => cols[x][y])
  );
}

async function computePhash(pngPath: string): Promise<bigint> {
  const pixels = await getPixels(pngPath);
  const dct = dct2d(pixels);

  // Take top-left 8x8 block (low frequencies)
  const topLeft: number[] = [];
  for (let y = 0; y < HASH_SIZE; y++) {
    for (let x = 0; x < HASH_SIZE; x++) {
      topLeft.push(dct[y][x]);
    }
  }

  // Exclude DC component (index 0) for mean calculation
  const mean = topLeft.slice(1).reduce((a, b) => a + b, 0) / (topLeft.length - 1);

  // Build 64-bit hash: 1 if pixel > mean
  let hash = 0n;
  for (const v of topLeft) {
    hash = (hash << 1n) | (v > mean ? 1n : 0n);
  }
  return hash;
}

function hammingDistance(a: bigint, b: bigint): number {
  let diff = a ^ b;
  let count = 0;
  while (diff > 0n) {
    count += Number(diff & 1n);
    diff >>= 1n;
  }
  return count;
}

export async function visualScore(pathA: string, pathB: string): Promise<number> {
  try {
    const [hashA, hashB] = await Promise.all([computePhash(pathA), computePhash(pathB)]);
    const dist = hammingDistance(hashA, hashB);
    return 1 - dist / 64;
  } catch {
    return -1; // -1 signals "not available"
  }
}
