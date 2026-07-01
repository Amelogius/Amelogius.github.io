"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search as SearchIcon,
  TrendingUp,
  Hash,
  BadgeCheck,
  MessageSquareText,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import ChirpCard from "@/components/ChirpCard";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/lib/AuthContext";
import type { Chirp, Profile } from "@/lib/types";

type Tab = "chirps" | "people";

function SearchInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [debouncedQuery, setDebouncedQuery] = useState(initial);
  const [touched, setTouched] = useState(Boolean(initial));
  const [tab, setTab] = useState<Tab>("chirps");

  const trends = useQuery(api.trends.get, { limit: 10 });

  const active = debouncedQuery.trim();
  const chirpResults = useQuery(
    api.chirps.search,
    active && tab === "chirps"
      ? { query: active, currentUserId: user?.id }
      : "skip"
  ) as Chirp[] | undefined;
  const peopleResults = useQuery(
    api.profiles.search,
    active && tab === "people" ? { query: active } : "skip"
  ) as Profile[] | undefined;

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setDebouncedQuery("");
      return;
    }
    setTouched(true);
    const t = setTimeout(() => setDebouncedQuery(q), 250);
    return () => clearTimeout(t);
  }, [query]);

  const loading =
    Boolean(active) &&
    (tab === "chirps" ? chirpResults === undefined : peopleResults === undefined);

  return (
    <div>
      <header className="glass-strong sticky top-0 z-30 px-4 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chirps, people and topics"
            className="input-field pl-11"
          />
        </div>

        {touched && (
          <div className="mt-3 flex gap-2">
            <TabPill
              active={tab === "chirps"}
              onClick={() => setTab("chirps")}
              icon={<MessageSquareText className="h-4 w-4" />}
              label="Chirps"
            />
            <TabPill
              active={tab === "people"}
              onClick={() => setTab("people")}
              icon={<Users className="h-4 w-4" />}
              label="People"
            />
          </div>
        )}
      </header>

      {!touched && (
        <section className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <TrendingUp className="h-5 w-5 text-neon" /> Trending now
          </h2>
          <div className="glass overflow-hidden rounded-2xl">
            {!trends || trends.length === 0 ? (
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
          ) : tab === "chirps" ? (
            !chirpResults || chirpResults.length === 0 ? (
              <p className="px-6 py-10 text-center text-slate-500">
                No chirps match “{query}”.
              </p>
            ) : (
              chirpResults.map((c) => <ChirpCard key={c.id} chirp={c} />)
            )
          ) : !peopleResults || peopleResults.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-500">
              No users match “{query}”.
            </p>
          ) : (
            peopleResults.map((p) => (
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

function TabPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
        active
          ? "bg-neon-grad text-slate-950 shadow-neon"
          : "border border-slate-700 text-slate-400 hover:border-fuchsia-500/60 hover:text-fuchsia-300"
      }`}
    >
      {icon}
      {label}
    </button>
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
