import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { getProfileByUserId, toProfile } from "./lib";

export const getByChirp = query({
  args: { chirpId: v.id("chirps") },
  handler: async (ctx, { chirpId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_chirp", (q) => q.eq("chirpId", chirpId))
      .order("asc")
      .collect();

    return Promise.all(
      comments.map(async (comment) => {
        const author = await getProfileByUserId(ctx, comment.userId);
        return {
          id: comment._id,
          user_id: comment.userId,
          chirp_id: comment.chirpId,
          text: comment.text,
          created_at: new Date(comment._creationTime).toISOString(),
          author: author ? toProfile(author) : undefined,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    chirpId: v.id("chirps"),
    text: v.string(),
  },
  handler: async (ctx, { chirpId, text }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const trimmed = text.trim();
    if (!trimmed) throw new ConvexError("Comment cannot be empty.");
    if (trimmed.length > 280) throw new ConvexError("Comment too long.");

    const chirp = await ctx.db.get(chirpId);
    if (!chirp) throw new ConvexError("Chirp not found.");

    await ctx.db.insert("comments", { userId, chirpId, text: trimmed });
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new ConvexError("Comment not found.");
    if (comment.userId !== userId) throw new ConvexError("Not allowed.");

    await ctx.db.delete(commentId);
  },
});
