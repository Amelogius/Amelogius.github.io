import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

export type ProfileDoc = Doc<"profiles">;

export function toProfile(profile: ProfileDoc) {
  return {
    id: profile.userId,
    username: profile.username,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl ?? null,
    banner_url: profile.bannerUrl ?? null,
    bio: profile.bio ?? null,
    created_at: new Date(profile._creationTime).toISOString(),
  };
}

export async function getProfileByUserId(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<ProfileDoc | null> {
  return await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
}

export async function decorateChirps(
  ctx: QueryCtx,
  chirps: Doc<"chirps">[],
  currentUserId?: Id<"users"> | null
) {
  return Promise.all(
    chirps.map(async (chirp) => {
      const author = await getProfileByUserId(ctx, chirp.userId);
      const likes = await ctx.db
        .query("likes")
        .withIndex("by_chirp", (q) => q.eq("chirpId", chirp._id))
        .collect();

      return {
        id: chirp._id,
        user_id: chirp.userId,
        text: chirp.text ?? null,
        media_url: chirp.mediaUrl ?? null,
        is_gif: chirp.isGif,
        created_at: new Date(chirp._creationTime).toISOString(),
        author: author ? toProfile(author) : undefined,
        like_count: likes.length,
        liked_by_me: currentUserId
          ? likes.some((like) => like.userId === currentUserId)
          : false,
      };
    })
  );
}
