import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, { followerId, followingId }) => {
    const row = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .unique();
    return Boolean(row);
  },
});

export const getCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [followers, following] = await Promise.all([
      ctx.db
        .query("follows")
        .withIndex("by_following", (q) => q.eq("followingId", userId))
        .collect(),
      ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", userId))
        .collect(),
    ]);

    return { followers: followers.length, following: following.length };
  },
});

export const follow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, { followingId }) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) throw new ConvexError("Not authenticated.");
    if (followerId === followingId) throw new ConvexError("Cannot follow yourself.");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .unique();
    if (existing) return;

    await ctx.db.insert("follows", { followerId, followingId });
  },
});

export const unfollow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, { followingId }) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) throw new ConvexError("Not authenticated.");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
