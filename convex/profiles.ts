import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { getProfileByUserId, toProfile } from "./lib";

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await getProfileByUserId(ctx, userId);
    return profile ? toProfile(profile) : null;
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username.toLowerCase()))
      .unique();
    return profile ? toProfile(profile) : null;
  },
});

export const isUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username.toLowerCase()))
      .unique();
    return !profile;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchQuery }) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const profiles = await ctx.db.query("profiles").collect();
    return profiles
      .filter(
        (profile) =>
          profile.username.toLowerCase().includes(q) ||
          profile.displayName.toLowerCase().includes(q)
      )
      .slice(0, 25)
      .map(toProfile);
  },
});

export const create = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const username = args.username.toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      throw new ConvexError("Invalid username.");
    }

    const existing = await getProfileByUserId(ctx, userId);
    if (existing) throw new ConvexError("Profile already exists.");

    const taken = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
    if (taken) throw new ConvexError("Username already taken.");

    await ctx.db.insert("profiles", {
      userId,
      username,
      displayName: args.displayName.trim(),
      bio: args.bio?.trim() || undefined,
      avatarUrl: args.avatarUrl,
    });
  },
});

export const update = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated.");

    const profile = await getProfileByUserId(ctx, userId);
    if (!profile) throw new ConvexError("Profile not found.");

    await ctx.db.patch(profile._id, {
      ...(args.displayName !== undefined
        ? { displayName: args.displayName.trim() }
        : {}),
      ...(args.bio !== undefined ? { bio: args.bio.trim() || undefined } : {}),
      ...(args.avatarUrl !== undefined ? { avatarUrl: args.avatarUrl } : {}),
      ...(args.bannerUrl !== undefined ? { bannerUrl: args.bannerUrl } : {}),
    });
  },
});
