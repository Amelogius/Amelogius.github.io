"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  BadgeCheck,
  Settings2,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  getProfileByUsername,
  getUserChirps,
  getFollowCounts,
  isFollowing,
  followUser,
  unfollowUser,
} from "@/lib/db";
import type { Chirp, Profile } from "@/lib/types";
import Avatar from "./Avatar";
import ChirpCard from "./ChirpCard";
import { ChirpSkeleton, Spinner } from "./Spinner";

export default function ProfileView({ username }: { username: string }) {
  const { user, profile: me } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chirps, setChirps] = useState<Chirp[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isMe = me?.username?.toLowerCase() === username.toLowerCase();

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const p = await getProfileByUsername(username);
    if (!p) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProfile(p);
    const [userChirps, followCounts] = await Promise.all([
      getUserChirps(p.id, user?.id),
      getFollowCounts(p.id),
    ]);
    setChirps(userChirps);
    setCounts(followCounts);
    if (user && user.id !== p.id) {
      setFollowing(await isFollowing(user.id, p.id));
    }
    setLoading(false);
  }, [username, user]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFollow() {
    if (!user || !profile) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setCounts((c) => ({ ...c, followers: c.followers + (next ? 1 : -1) }));
    try {
      if (next) await followUser(user.id, profile.id);
      else await unfollowUser(user.id, profile.id);
    } catch {
      setFollowing(!next);
      setCounts((c) => ({ ...c, followers: c.followers + (next ? -1 : 1) }));
    } finally {
      setBusy(false);
    }
  }

  function handleDeleted(id: string) {
    setChirps((prev) => prev.filter((c) => c.id !== id));
  }

  if (notFound) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-2xl font-bold text-white">@{username}</p>
        <p className="mt-2 text-slate-500">This account doesn’t exist.</p>
        <Link href="/" className="btn-ghost mt-6 inline-block px-6 py-2">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="glass-strong sticky top-0 z-30 flex items-center gap-4 px-4 py-2">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="font-bold text-white">
            {loading ? "Profile" : profile?.display_name}
          </p>
          {!loading && (
            <p className="text-xs text-slate-500">{chirps.length} chirps</p>
          )}
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-40 w-full bg-gradient-to-br from-violet/40 via-slate-900 to-neon/30 sm:h-52">
        {profile?.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.banner_url}
            alt="banner"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute -bottom-12 left-4">
          <div className="rounded-full ring-4 ring-base">
            <Avatar
              url={profile?.avatar_url}
              name={profile?.display_name ?? username}
              size={96}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end px-4 pt-3">
        {isMe ? (
          <button className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
            <Settings2 className="h-4 w-4" /> Edit profile
          </button>
        ) : user ? (
          <button
            onClick={toggleFollow}
            disabled={busy}
            className={
              following
                ? "btn-ghost px-5 py-2 text-sm hover:border-red-500 hover:text-red-400"
                : "btn-neon px-5 py-2 text-sm"
            }
          >
            {busy ? (
              <Spinner size={16} />
            ) : following ? (
              "Following"
            ) : (
              "Follow"
            )}
          </button>
        ) : null}
      </div>

      <div className="px-4 pb-4 pt-2">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-28" />
          </div>
        ) : (
          <>
            <h1 className="flex items-center gap-1.5 text-xl font-black text-white">
              {profile?.display_name}
              <BadgeCheck className="h-5 w-5 text-neon" />
            </h1>
            <p className="text-slate-500">@{profile?.username}</p>
            {profile?.bio && (
              <p className="mt-3 whitespace-pre-wrap text-slate-200">
                {profile.bio}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Joined{" "}
              {profile &&
                new Date(profile.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
            </div>
            <div className="mt-3 flex gap-5 text-sm">
              <span className="text-slate-400">
                <span className="font-bold text-white">{counts.following}</span>{" "}
                Following
              </span>
              <span className="text-slate-400">
                <span className="font-bold text-white">{counts.followers}</span>{" "}
                Followers
              </span>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-slate-800">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <ChirpSkeleton key={i} />)
        ) : chirps.length === 0 ? (
          <p className="px-6 py-16 text-center text-slate-500">
            No chirps yet.
          </p>
        ) : (
          chirps.map((c) => (
            <ChirpCard
              key={c.id}
              chirp={{ ...c, author: profile ?? undefined }}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
