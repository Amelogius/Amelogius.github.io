"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, TrendingUp, Hash, BadgeCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import { Spinner } from "@/components/Spinner";
import { searchProfiles, getTrends, type Trend } from "@/lib/db";
import type { Profile } from "@/lib/types";

function SearchInner() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Profile[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(Boolean(initial));

  useEffect(() => {
    getTrends(10).then(setTrends);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    setTouched(true);
    const t = setTimeout(async () => {
      setResults(await searchProfiles(q));
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <header className="glass-strong sticky top-0 z-30 px-4 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people and topics"
            className="input-field pl-11"
          />
        </div>
      </header>

      {!touched && (
        <section className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <TrendingUp className="h-5 w-5 text-neon" /> Trending now
          </h2>
          <div className="glass overflow-hidden rounded-2xl">
            {trends.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No trends yet — get chirping with #hashtags!
              </p>
            ) : (
              trends.map((t, i) => (
                <button
                  key={t.tag}
                  onClick={() => setQuery(t.tag)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-800/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-slate-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Hash className="h-4 w-4 text-violet" />
                    <span className="font-semibold text-slate-100">
                      {t.tag.replace(/^#/, "")}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {t.count} chirps
                  </span>
                </button>
              ))
            )}
          </div>
        </section>
      )}

      {touched && (
        <section>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size={28} />
            </div>
          ) : results.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-500">
              No users match “{query}”.
            </p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.username}/`}
                className="flex items-center gap-3 border-b border-slate-800/60 px-4 py-4 transition hover:bg-slate-900/40"
              >
                <Avatar url={p.avatar_url} name={p.display_name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 font-semibold text-white">
                    <span className="truncate">{p.display_name}</span>
                    <BadgeCheck className="h-4 w-4 shrink-0 text-neon" />
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    @{p.username}
                  </p>
                  {p.bio && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                      {p.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell hideRightSidebar>
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner size={28} />
          </div>
        }
      >
        <SearchInner />
      </Suspense>
    </AppShell>
  );
}
