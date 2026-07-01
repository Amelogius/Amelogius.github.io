"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Trash2, BadgeCheck } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Comment } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { timeAgo } from "@/lib/time";
import { convexErrorMessage } from "@/lib/convexErrors";
import Avatar from "./Avatar";
import { Spinner } from "./Spinner";

const MAX = 280;

type Props = {
  chirpId: string;
};

export default function CommentSection({ chirpId }: Props) {
  const { user, profile } = useAuth();
  const comments = useQuery(api.comments.getByChirp, {
    chirpId: chirpId as Id<"chirps">,
  }) as Comment[] | undefined;
  const createComment = useMutation(api.comments.create);
  const removeComment = useMutation(api.comments.remove);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const canSend = !!user && !sending && text.trim().length > 0 && text.length <= MAX;

  async function submit() {
    if (!canSend) return;
    setSending(true);
    try {
      await createComment({
        chirpId: chirpId as Id<"chirps">,
        text: text.trim(),
      });
      setText("");
    } catch (error) {
      alert(`Could not comment: ${convexErrorMessage(error)}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 animate-fade-up rounded-2xl border border-slate-800/80 bg-slate-950/40 p-3">
      {user && (
        <div className="flex items-center gap-2">
          <Avatar
            url={profile?.avatar_url}
            name={profile?.display_name ?? "?"}
            size={32}
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Chirp your reply…"
            maxLength={MAX + 20}
            className="min-w-0 flex-1 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-fuchsia-500/70 focus:shadow-[0_0_16px_rgba(255,0,170,0.25)]"
          />
          <button
            onClick={submit}
            disabled={!canSend}
            className="btn-neon flex h-9 w-9 items-center justify-center"
            aria-label="Send comment"
          >
            {sending ? <Spinner size={14} /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}

      <div className={user ? "mt-3" : ""}>
        {comments === undefined ? (
          <div className="flex justify-center py-4">
            <Spinner size={20} />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-2 text-center text-sm text-slate-500">
            No replies yet — be the first!
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="group/comment flex gap-2">
                <Link
                  href={`/profile/${comment.author?.username ?? ""}/`}
                  className="shrink-0"
                >
                  <Avatar
                    url={comment.author?.avatar_url}
                    name={comment.author?.display_name ?? "?"}
                    size={32}
                  />
                </Link>
                <div className="min-w-0 flex-1 rounded-2xl bg-slate-900/60 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Link
                      href={`/profile/${comment.author?.username ?? ""}/`}
                      className="truncate font-semibold text-white hover:underline"
                    >
                      {comment.author?.display_name ?? "Unknown"}
                    </Link>
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-neon" />
                    <span className="truncate text-slate-500">
                      @{comment.author?.username}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="shrink-0 text-slate-500">
                      {timeAgo(comment.created_at)}
                    </span>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() =>
                          removeComment({
                            commentId: comment.id as Id<"comments">,
                          })
                        }
                        className="ml-auto rounded-full p-1 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover/comment:opacity-100"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                    {comment.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
