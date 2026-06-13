"use client";

import { Globe, Users, RefreshCw } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/AuthContext";
import type { Chirp } from "@/lib/types";
import Composer from "./Composer";
import ChirpCard from "./ChirpCard";
import { ChirpSkeleton } from "./Spinner";
import { useState } from "react";

type Tab = "global" | "following";

export default function Feed() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("global");

  const globalFeed = useQuery(api.chirps.getGlobalFeed, {
    currentUserId: user?.id,
  });
  const followingFeed = useQuery(
    api.chirps.getFollowingFeed,
    tab === "following" && user ? { currentUserId: user.id } : "skip"
  );

  const chirps = (tab === "following" ? followingFeed : globalFeed) as
    | Chirp[]
    | undefined;
  const loading = chirps === undefined;

  function handleDeleted(chirpId: string) {
    // Convex queries update reactively; local filter is optional.
    void chirpId;
  }

  return (
    <div>
      <header className="glass-strong sticky top-0 z-30 flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-black neon-text">Home</h1>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-neon active:rotate-180"
          aria-label="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </header>

      <div className="glass-strong sticky top-[52px] z-20 grid grid-cols-2 border-b border-slate-800">
        <TabButton
          active={tab === "global"}
          onClick={() => setTab("global")}
          icon={<Globe className="h-4 w-4" />}
          label="Global"
        />
        <TabButton
          active={tab === "following"}
          onClick={() => setTab("following")}
          icon={<Users className="h-4 w-4" />}
          label="Following"
        />
      </div>

      {user && <Composer />}

      {loading ? (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <ChirpSkeleton key={i} />
          ))}
        </div>
      ) : chirps.length === 0 ? (
        <div className="px-6 py-16 text-center text-slate-500">
          {tab === "following" ? (
            <p>
              Your following feed is empty. Follow some people to see their
              chirps here!
            </p>
          ) : (
            <p>No chirps yet. Be the first to break the silence ✨</p>
          )}
        </div>
      ) : (
        <div>
          {chirps.map((c) => (
            <ChirpCard key={c.id} chirp={c} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
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
      className={`relative flex items-center justify-center gap-2 py-4 text-sm font-semibold transition hover:bg-slate-800/40 ${
        active ? "text-white" : "text-slate-500"
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-0 h-1 w-16 rounded-full bg-neon-grad shadow-neon" />
      )}
    </button>
  );
}
