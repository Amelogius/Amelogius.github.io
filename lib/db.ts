import { supabase, MEDIA_BUCKET } from "./supabaseClient";
import type { Chirp, Profile } from "./types";

// ---------------------------------------------------------------------------
//  Profiles
// ---------------------------------------------------------------------------

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  return !data;
}

export async function createProfile(profile: {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("profiles").insert({
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
  });
  return { error: error?.message ?? null };
}

export async function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, "display_name" | "bio" | "avatar_url" | "banner_url">>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  return { error: error?.message ?? null };
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const q = query.trim();
  if (!q) return [];
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(25);
  return (data as Profile[]) ?? [];
}

// ---------------------------------------------------------------------------
//  Chirps
// ---------------------------------------------------------------------------

const CHIRP_SELECT =
  "*, author:profiles!chirps_user_id_fkey(*), likes(user_id)";

type RawChirp = Omit<Chirp, "like_count" | "liked_by_me"> & {
  likes: { user_id: string }[];
};

function decorate(rows: RawChirp[], currentUserId?: string | null): Chirp[] {
  return rows.map((row) => {
    const { likes, ...rest } = row;
    const likeRows = likes ?? [];
    return {
      ...rest,
      like_count: likeRows.length,
      liked_by_me: currentUserId
        ? likeRows.some((l) => l.user_id === currentUserId)
        : false,
    };
  });
}

export async function getGlobalFeed(currentUserId?: string | null): Promise<Chirp[]> {
  const { data } = await supabase
    .from("chirps")
    .select(CHIRP_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);
  return decorate((data as RawChirp[]) ?? [], currentUserId);
}

export async function getFollowingFeed(currentUserId: string): Promise<Chirp[]> {
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", currentUserId);

  const ids = (follows ?? []).map((f) => f.following_id);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("chirps")
    .select(CHIRP_SELECT)
    .in("user_id", ids)
    .order("created_at", { ascending: false })
    .limit(50);
  return decorate((data as RawChirp[]) ?? [], currentUserId);
}

export async function getUserChirps(
  userId: string,
  currentUserId?: string | null
): Promise<Chirp[]> {
  const { data } = await supabase
    .from("chirps")
    .select(CHIRP_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return decorate((data as RawChirp[]) ?? [], currentUserId);
}

export async function createChirp(input: {
  user_id: string;
  text: string | null;
  media_url?: string | null;
  is_gif?: boolean;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("chirps").insert({
    user_id: input.user_id,
    text: input.text,
    media_url: input.media_url ?? null,
    is_gif: input.is_gif ?? false,
  });
  return { error: error?.message ?? null };
}

export async function deleteChirp(chirpId: string): Promise<void> {
  await supabase.from("chirps").delete().eq("id", chirpId);
}

// ---------------------------------------------------------------------------
//  Likes
// ---------------------------------------------------------------------------

export async function likeChirp(userId: string, chirpId: string): Promise<void> {
  await supabase.from("likes").insert({ user_id: userId, chirp_id: chirpId });
}

export async function unlikeChirp(userId: string, chirpId: string): Promise<void> {
  await supabase
    .from("likes")
    .delete()
    .eq("user_id", userId)
    .eq("chirp_id", chirpId);
}

// ---------------------------------------------------------------------------
//  Follows
// ---------------------------------------------------------------------------

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
}

export async function getFollowCounts(
  userId: string
): Promise<{ followers: number; following: number }> {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

// ---------------------------------------------------------------------------
//  Storage
// ---------------------------------------------------------------------------

export async function uploadMedia(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

// ---------------------------------------------------------------------------
//  Trends (derived from recent chirps, client side)
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "the","a","an","and","or","but","is","are","was","were","be","to","of","in",
  "on","for","with","at","by","from","up","about","into","over","after","im",
  "this","that","these","those","it","its","i","you","he","she","we","they",
  "my","your","our","their","me","him","her","us","them","so","just","like",
  "have","has","had","do","does","did","will","would","can","could","not","no",
  "yes","get","got","out","if","then","than","too","very","really","what","who",
]);

export type Trend = { tag: string; count: number };

export async function getTrends(limit = 6): Promise<Trend[]> {
  const { data } = await supabase
    .from("chirps")
    .select("text")
    .order("created_at", { ascending: false })
    .limit(200);

  const counts = new Map<string, { tag: string; count: number }>();

  for (const row of (data as { text: string | null }[]) ?? []) {
    if (!row.text) continue;
    const hashtags = row.text.match(/#[\p{L}0-9_]+/gu) ?? [];
    const words = hashtags.length
      ? hashtags
      : row.text.split(/\s+/);

    for (const raw of words) {
      const token = raw.toLowerCase().replace(/[^#\p{L}0-9_]/gu, "");
      const bare = token.replace(/^#/, "");
      if (bare.length < 3 || STOPWORDS.has(bare)) continue;
      const key = token.startsWith("#") ? token : bare;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { tag: key.startsWith("#") ? key : `#${key}`, count: 1 });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
