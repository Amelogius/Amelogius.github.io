import { v } from "convex/values";
import { query } from "./_generated/server";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "to",
  "of", "in", "on", "for", "with", "at", "by", "from", "up", "about", "into",
  "over", "after", "im", "this", "that", "these", "those", "it", "its", "i",
  "you", "he", "she", "we", "they", "my", "your", "our", "their", "me", "him",
  "her", "us", "them", "so", "just", "like", "have", "has", "had", "do",
  "does", "did", "will", "would", "can", "could", "not", "no", "yes", "get",
  "got", "out", "if", "then", "than", "too", "very", "really", "what", "who",
]);

export const get = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 6 }) => {
    const chirps = await ctx.db.query("chirps").order("desc").take(200);
    const counts = new Map<string, { tag: string; count: number }>();

    for (const chirp of chirps) {
      if (!chirp.text) continue;
      const hashtags = chirp.text.match(/#[\p{L}0-9_]+/gu) ?? [];
      const words = hashtags.length ? hashtags : chirp.text.split(/\s+/);

      for (const raw of words) {
        const token = raw.toLowerCase().replace(/[^#\p{L}0-9_]/gu, "");
        const bare = token.replace(/^#/, "");
        if (bare.length < 3 || STOPWORDS.has(bare)) continue;
        const key = token.startsWith("#") ? token : bare;
        const existing = counts.get(key);
        if (existing) existing.count += 1;
        else
          counts.set(key, {
            tag: key.startsWith("#") ? key : `#${key}`,
            count: 1,
          });
      }
    }

    return [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
});
