import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_username", ["username"]),

  chirps: defineTable({
    userId: v.id("users"),
    text: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    isGif: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .searchIndex("search_text", { searchField: "text" }),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

  likes: defineTable({
    userId: v.id("users"),
    chirpId: v.id("chirps"),
  })
    .index("by_user_chirp", ["userId", "chirpId"])
    .index("by_chirp", ["chirpId"]),

  comments: defineTable({
    userId: v.id("users"),
    chirpId: v.id("chirps"),
    text: v.string(),
  })
    .index("by_chirp", ["chirpId"])
    .index("by_user", ["userId"]),
});
