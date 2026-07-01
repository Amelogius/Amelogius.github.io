"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Repeat2, MessageCircle, Share, Trash2, BadgeCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Chirp } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { timeAgo } from "@/lib/time";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";

type Props = {
  chirp: Chirp;
  onDeleted?: (id: string) => void;
};

export default function ChirpCard({ chirp, onDeleted }: Props) {
  const { user } = useAuth();
  const likeChirp = useMutation(api.chirps.like);
  const unlikeChirp = useMutation(api.chirps.unlike);
  const deleteChirp = useMutation(api.chirps.remove);
  const [liked, setLiked] = useState(Boolean(chirp.liked_by_me));
  const [likeCount, setLikeCount] = useState(chirp.like_count ?? 0);
  const [retweeted, setRetweeted] = useState(false);
  const [popKey, setPopKey] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const author = chirp.author;
  const isMine = user?.id === chirp.user_id;

  async function toggleLike() {
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    setPopKey((k) => k + 1);
    try {
      const chirpId = chirp.id as Id<"chirps">;
      if (next) await likeChirp({ chirpId });
      else await unlikeChirp({ chirpId });
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  async function handleDelete() {
    if (!isMine) return;
    setDeleting(true);
    await deleteChirp({ chirpId: chirp.id as Id<"chirps"> });
    onDeleted?.(chirp.id);
  }

  return (
    <article
      className={`group relative flex gap-3 border-b border-slate-800/60 px-4 py-4 transition-all duration-300 hover:bg-slate-900/40 hover:shadow-[inset_2px_0_0_0_rgba(255,45,170,0.6),inset_0_0_60px_rgba(255,45,170,0.04)] ${
        deleting ? "opacity-40" : "animate-fade-up"
      }`}
    >
      <Link href={`/profile/${author?.username ?? ""}/`} className="shrink-0">
        <Avatar url={author?.avatar_url} name={author?.display_name ?? "?"} size={48} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            href={`/profile/${author?.username ?? ""}/`}
            className="truncate font-semibold text-white hover:underline"
          >
            {author?.display_name ?? "Unknown"}
          </Link>
          <BadgeCheck className="h-4 w-4 shrink-0 text-neon" />
          <span className="truncate text-slate-500">@{author?.username}</span>
          <span className="text-slate-600">·</span>
          <span className="shrink-0 text-slate-500">{timeAgo(chirp.created_at)}</span>

          {isMine && (
            <button
              onClick={handleDelete}
              className="ml-auto rounded-full p-1.5 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              aria-label="Delete chirp"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {chirp.text && (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-100">
            {chirp.text}
          </p>
        )}

        {chirp.media_url && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={chirp.media_url}
              alt={chirp.is_gif ? "GIF" : "attachment"}
              className="max-h-[32rem] w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="mt-3 flex max-w-md items-center justify-between text-slate-500">
          <button
            onClick={() => setShowComments((s) => !s)}
            className={`group/btn flex items-center gap-2 text-sm transition hover:text-neon ${
              showComments ? "text-neon" : ""
            }`}
          >
            <span className="rounded-full p-2 transition group-hover/btn:bg-neon/10">
              <MessageCircle
                className={`h-[18px] w-[18px] ${showComments ? "fill-neon/20" : ""}`}
              />
            </span>
            {(chirp.comment_count ?? 0) > 0 && (
              <span>{chirp.comment_count}</span>
            )}
          </button>

          <button
            onClick={() => setRetweeted((r) => !r)}
            className={`group/btn flex items-center gap-2 text-sm transition hover:text-emerald-400 ${
              retweeted ? "text-emerald-400" : ""
            }`}
          >
            <span className="rounded-full p-2 transition group-hover/btn:bg-emerald-400/10">
              <Repeat2 className="h-[18px] w-[18px]" />
            </span>
            {retweeted ? 1 : ""}
          </button>

          <button
            onClick={toggleLike}
            disabled={!user}
            className={`group/btn flex items-center gap-2 text-sm transition hover:text-pink-500 disabled:cursor-not-allowed ${
              liked ? "text-pink-500" : ""
            }`}
          >
            <span className="relative rounded-full p-2 transition group-hover/btn:bg-pink-500/10">
              <Heart
                key={popKey}
                className={`h-[18px] w-[18px] ${liked ? "fill-pink-500 animate-pop" : ""}`}
              />
            </span>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          <button className="group/btn flex items-center gap-2 text-sm transition hover:text-violet">
            <span className="rounded-full p-2 transition group-hover/btn:bg-violet/10">
              <Share className="h-[18px] w-[18px]" />
            </span>
          </button>
        </div>

        {showComments && <CommentSection chirpId={chirp.id} />}
      </div>
    </article>
  );
}
