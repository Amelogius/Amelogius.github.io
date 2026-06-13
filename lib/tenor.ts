import type { Gif } from "./types";

const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY;
const ENDPOINT = "https://tenor.googleapis.com/v2";

type TenorResult = {
  id: string;
  content_description?: string;
  media_formats?: {
    gif?: { url: string };
    tinygif?: { url: string };
    nanogif?: { url: string };
  };
};

function mapResults(results: TenorResult[]): Gif[] {
  return results
    .map((r) => {
      const full = r.media_formats?.gif?.url || r.media_formats?.tinygif?.url;
      const preview =
        r.media_formats?.tinygif?.url ||
        r.media_formats?.nanogif?.url ||
        full;
      if (!full || !preview) return null;
      return {
        id: r.id,
        url: full,
        preview,
        description: r.content_description || "GIF",
      } as Gif;
    })
    .filter((g): g is Gif => g !== null);
}

export const isTenorConfigured = Boolean(TENOR_KEY);

export async function fetchTrendingGifs(limit = 24): Promise<Gif[]> {
  if (!TENOR_KEY) return [];
  const res = await fetch(
    `${ENDPOINT}/featured?key=${TENOR_KEY}&limit=${limit}&media_filter=gif,tinygif,nanogif&client_key=chirp`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return mapResults(data.results || []);
}

export async function searchGifs(query: string, limit = 24): Promise<Gif[]> {
  if (!TENOR_KEY) return [];
  if (!query.trim()) return fetchTrendingGifs(limit);
  const res = await fetch(
    `${ENDPOINT}/search?key=${TENOR_KEY}&q=${encodeURIComponent(
      query
    )}&limit=${limit}&media_filter=gif,tinygif,nanogif&client_key=chirp`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return mapResults(data.results || []);
}
