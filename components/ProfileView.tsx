"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  BadgeCheck,
  Settings2,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/AuthContext";
import type { Chirp } from "@/lib/types";
import Avatar from "./Avatar";
import ChirpCard from "./ChirpCard";
import { ChirpSkeleton, Spinner } from "./Spinner";

export default function ProfileView({ username }: { username: string }) {
  const { user, profile: me } = useAuth();
  const router = useRouter();
  const followUser = useMutation(api.follows.follow);
  const unfollowUser = useMutation(api.follows.unfollow);
  const [busy, setBusy] = useState(false);

  const profile = useQuery(api.profiles.getByUsername, { username });
  const chirps = useQuery(
    api.chirps.getByUser,
    profile ? { userId: profile.id as Id<"users">, currentUserId: user?.id } : "skip"
  ) as Chirp[] | undefined;
  const counts = useQuery(
    api.follows.getCounts,
    profile ? { userId: profile.id as Id<"users"> } : "skip"
  );
  const following = useQuery(
    api.follows.isFollowing,
    user && profile && user.id !== profile.id
      ? { followerId: user.id, followingId: profile.id as Id<"users"> }
      : "skip"
  );

  const loading = profile === undefined;
  const notFound = profile === null;
  const isMe = me?.username?.toLowerCase() === username.toLowerCase();

  async function toggleFollow() {
    if (!user || !profile) return;
    setBusy(true);
    try {
      const followingId = profile.id as Id<"users">;
      if (following) await unfollowUser({ followingId });
      else await followUser({ followingId });
    } finally {
      setBusy(false);
    }
  }

  function handleDeleted(id: string) {
    void id;
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
            <p className="text-xs text-slate-500">{chirps?.length ?? 0} chirps</p>
          )}
        </div>
      </header>

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
                <span className="font-bold text-white">{counts?.following ?? 0}</span>{" "}
                Following
              </span>
              <span className="text-slate-400">
                <span className="font-bold text-white">{counts?.followers ?? 0}</span>{" "}
                Followers
              </span>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-slate-800">
        {loading || chirps === undefined ? (
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
