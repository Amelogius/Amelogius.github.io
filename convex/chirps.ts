import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { decorateChirps } from "./lib";

export const getGlobalFeed = query({
  args: { currentUserId: v.optional(v.id("users")) },
  handler: async (ctx, { currentUserId }) => {
    const chirps = await ctx.db.query("chirps").order("desc").take(50);
    return decorateChirps(ctx, chirps, currentUserId ?? null);
  },
});

export const getFollowingFeed = query({
  args: { currentUserId: v.id("users") },
  handler: async (ctx, { currentUserId }) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", currentUserId))
      .collect();

    const followingIds = new Set(follows.map((f) => f.followingId));
    if (followingIds.size === 0) return [];

    const chirps = await ctx.db.query("chirps").order("desc").take(200);
    const filtered = chirps
      .filter((chirp) => followingIds.has(chirp.userId))
      .slice(0, 50);

    return decorateChirps(ctx, filtered, currentUserId);
  },
});

export const getByUser = query({
  args: {
    userId: v.id("users"),
    currentUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId, currentUserId }) => {
    const chirps = await ctx.db
      .query("chirps")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    return decorateChirps(ctx, chirps, currentUserId ?? null);
  },
});

export const create = mutation({
  args: {
    text: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    isGif: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const text = args.text?.trim() || undefined;
    let mediaUrl = args.mediaUrl;
    if (args.storageId) {
      mediaUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
    }
    if (!text && !mediaUrl) {
      throw new ConvexError("Chirp must have text or media.");
    }

    await ctx.db.insert("chirps", {
      userId,
      text,
      mediaUrl,
      isGif: args.isGif ?? false,
    });
  },
});

export const remove = mutation({
  args: { chirpId: v.id("chirps") },
  handler: async (ctx, { chirpId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const chirp = await ctx.db.get(chirpId);
    if (!chirp) throw new ConvexError("Chirp not found.");
    if (chirp.userId !== userId) throw new ConvexError("Not allowed.");

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_chirp", (q) => q.eq("chirpId", chirpId))
      .collect();
    await Promise.all(likes.map((like) => ctx.db.delete(like._id)));
    await ctx.db.delete(chirpId);
  },
});

export const like = mutation({
  args: { chirpId: v.id("chirps") },
  handler: async (ctx, { chirpId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_chirp", (q) =>
        q.eq("userId", userId).eq("chirpId", chirpId)
      )
      .unique();
    if (existing) return;

    await ctx.db.insert("likes", { userId, chirpId });
  },
});

export const unlike = mutation({
  args: { chirpId: v.id("chirps") },
  handler: async (ctx, { chirpId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_chirp", (q) =>
        q.eq("userId", userId).eq("chirpId", chirpId)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
