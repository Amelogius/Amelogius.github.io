-- ============================================================================
--  Chirp – Supabase schema
--  Run this in the Supabase SQL editor (one time) to set up the database.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  display_name text not null,
  avatar_url  text,
  banner_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

create table if not exists public.chirps (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  text        text,
  media_url   text,
  is_gif      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.likes (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  chirp_id   uuid not null references public.chirps (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, chirp_id)
);

-- ---------------------------------------------------------------------------
--  Helpful indexes
-- ---------------------------------------------------------------------------
create index if not exists chirps_created_at_idx on public.chirps (created_at desc);
create index if not exists chirps_user_id_idx    on public.chirps (user_id);
create index if not exists follows_following_idx  on public.follows (following_id);
create index if not exists likes_chirp_idx        on public.likes (chirp_id);

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.chirps   enable row level security;
alter table public.follows  enable row level security;
alter table public.likes    enable row level security;

-- profiles: world-readable, you may only insert/update your own row.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- chirps: world-readable, you may only create/delete your own.
drop policy if exists "chirps_select" on public.chirps;
create policy "chirps_select" on public.chirps for select using (true);

drop policy if exists "chirps_insert" on public.chirps;
create policy "chirps_insert" on public.chirps for insert with check (auth.uid() = user_id);

drop policy if exists "chirps_delete" on public.chirps;
create policy "chirps_delete" on public.chirps for delete using (auth.uid() = user_id);

-- follows: world-readable, you may only manage rows where you are the follower.
drop policy if exists "follows_select" on public.follows;
create policy "follows_select" on public.follows for select using (true);

drop policy if exists "follows_insert" on public.follows;
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists "follows_delete" on public.follows;
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

-- likes: world-readable, you may only manage your own likes.
drop policy if exists "likes_select" on public.likes;
create policy "likes_select" on public.likes for select using (true);

drop policy if exists "likes_insert" on public.likes;
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete" on public.likes;
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
--  Storage bucket for image uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_auth_write" on storage.objects;
create policy "media_auth_write" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
