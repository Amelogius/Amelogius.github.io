import type { Gif } from "./types";

const KLIPY_KEY = process.env.NEXT_PUBLIC_KLIPY_API_KEY;
const ENDPOINT = KLIPY_KEY
  ? `https://api.klipy.com/api/v1/${KLIPY_KEY}/gifs`
  : null;

type KlipyFile = {
  gif?: string;
  webp?: string;
  mp4?: string;
};

type KlipyResult = {
  id?: string;
  slug?: string;
  title?: string;
  type?: string;
  file?: KlipyFile;
  files?: KlipyFile;
};

type KlipyResponse = {
  result?: boolean;
  data?: {
    data?: KlipyResult[];
  };
};

function getFiles(item: KlipyResult): KlipyFile | undefined {
  return item.file ?? item.files;
}

function mapResults(results: KlipyResult[]): Gif[] {
  return results
    .filter((r) => r.type !== "ad")
    .map((r) => {
      const files = getFiles(r);
      const full = files?.gif || files?.webp;
      const preview = files?.webp || files?.gif || full;
      if (!full || !preview) return null;
      return {
        id: r.slug || r.id || full,
        url: full,
        preview,
        description: r.title || "GIF",
      } as Gif;
    })
    .filter((g): g is Gif => g !== null);
}

export const isKlipyConfigured = Boolean(KLIPY_KEY);

async function fetchKlipy(path: string): Promise<Gif[]> {
  if (!ENDPOINT) return [];
  const res = await fetch(`${ENDPOINT}${path}`);
  if (!res.ok) return [];
  const data = (await res.json()) as KlipyResponse;
  return mapResults(data.data?.data || []);
}

export async function fetchTrendingGifs(limit = 24): Promise<Gif[]> {
  return fetchKlipy(`/trending?per_page=${limit}`);
}

export async function searchGifs(query: string, limit = 24): Promise<Gif[]> {
  if (!query.trim()) return fetchTrendingGifs(limit);
  return fetchKlipy(
    `/search?q=${encodeURIComponent(query)}&per_page=${limit}`
  );
}
