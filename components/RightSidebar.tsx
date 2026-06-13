"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Hash } from "lucide-react";
import { getTrends, searchProfiles, type Trend } from "@/lib/db";
import type { Profile } from "@/lib/types";
import Avatar from "./Avatar";

export default function RightSidebar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getTrends(6).then(setTrends);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      setResults(await searchProfiles(q));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search/?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-4 overflow-y-auto py-4 pl-4 lg:flex">
      <form onSubmit={submitSearch} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Chirp"
          className="input-field pl-11"
        />
      </form>

      {query.trim() && (
        <div className="glass overflow-hidden rounded-2xl">
          {searching && (
            <p className="px-4 py-3 text-sm text-slate-500">Searching…</p>
          )}
          {!searching && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-500">No users found.</p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/profile/${p.username}/`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-800/50"
            >
              <Avatar url={p.avatar_url} name={p.display_name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {p.display_name}
                </p>
                <p className="truncate text-xs text-slate-500">@{p.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
          <TrendingUp className="h-5 w-5 text-neon" /> Trending
        </h2>
        {trends.length === 0 ? (
          <p className="text-sm text-slate-500">
            No trends yet — start chirping with #hashtags!
          </p>
        ) : (
          <ul className="space-y-1">
            {trends.map((t, i) => (
              <Link
                key={t.tag}
                href={`/search/?q=${encodeURIComponent(t.tag)}`}
                className="-mx-2 flex items-center justify-between rounded-xl px-2 py-2 transition hover:bg-slate-800/50"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">{i + 1}</span>
                  <Hash className="h-4 w-4 text-violet" />
                  <span className="font-semibold text-slate-100">
                    {t.tag.replace(/^#/, "")}
                  </span>
                </span>
                <span className="text-xs text-slate-500">{t.count}</span>
              </Link>
            ))}
          </ul>
        )}
      </div>

      <div className="glass rounded-2xl p-4 text-xs leading-relaxed text-slate-500">
        <p className="mb-1 font-semibold text-slate-300">Chirp</p>
        <p>
          A neon-soaked microblog built with Next.js, Supabase & Tailwind. Static
          export ready.
        </p>
      </div>
    </aside>
  );
}
