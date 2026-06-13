# 🐦 Chirp

A stylish, **cyberpunk / minimal-dark** Twitter clone built with **Next.js 14 (App Router)**,
**Supabase**, **Tailwind CSS** and **Lucide** icons.

Everything is **client-side only** and the app is built with `output: 'export'`, so it deploys
as a fully static site (e.g. **GitHub Pages** — this repo is wired up for `amelogius.me`).

![theme](https://img.shields.io/badge/theme-cyberpunk-00F0FF) ![stack](https://img.shields.io/badge/Next.js-14-black) ![db](https://img.shields.io/badge/Supabase-3ECF8E)

---

## ✨ Features

- **Auth** (email + password) via Supabase Auth.
- **Onboarding flow** — new users must pick a unique `@handle` and display name before entering.
- **Feed** with two tabs: **Global** (chronological) and **Following**.
- **Composer** with text, **image upload** (Supabase Storage) and **GIF search** (Tenor API).
- **Like** & retweet interactions (likes are persisted in the DB).
- **Search page** — live client-side user search + derived **Trending topics**.
- **Profiles** — banner, avatar, bio, follower/following counts, follow/unfollow, user's chirps.
- **3-column responsive layout** with glassmorphism, neon accents, and springy micro-animations.
- Near-realtime feed via lightweight polling (works on static hosting).

## 🎨 Design system

| Token        | Value                      |
| ------------ | -------------------------- |
| Background   | `#0B0F19` (deep dark)      |
| Accent 1     | `#00F0FF` (neon cyan)      |
| Accent 2     | `#8A2BE2` (violet)         |
| Glass        | `backdrop-blur-md bg-slate-900/60 border border-slate-800` |

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your keys:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_TENOR_API_KEY=your-tenor-api-key
```

> All variables are `NEXT_PUBLIC_*` because the app is 100% client-side. Only use the **anon**
> Supabase key — data is protected by Row Level Security, not by hiding the key.

### 3. Set up the database

Open the **Supabase SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
It creates the tables, indexes, RLS policies and the public `media` storage bucket.

In **Supabase → Authentication → Providers → Email**, you can disable "Confirm email" during
development so sign-up flows straight into onboarding.

### 4. Get a Tenor API key (for GIFs)

Create a key at the [Google / Tenor developer console](https://developers.google.com/tenor/guides/quickstart)
and put it in `NEXT_PUBLIC_TENOR_API_KEY`. (GIF search degrades gracefully if omitted.)

### 5. Run it

```bash
npm run dev      # http://localhost:3000
npm run build    # static export into ./out
```

---

## 🗄️ Database schema

```text
profiles ( id PK → auth.users, username UNIQUE, display_name, avatar_url, banner_url, bio, created_at )
chirps   ( id PK, user_id → profiles, text, media_url, is_gif, created_at )
follows  ( follower_id → profiles, following_id → profiles, PK(follower_id, following_id) )
likes    ( user_id → profiles, chirp_id → chirps, PK(user_id, chirp_id) )
```

All tables have RLS enabled: everything is world-readable, but you may only write your own rows.

---

## 📦 Deploying to GitHub Pages

`next.config.mjs` already sets `output: 'export'`, `trailingSlash: true` and unoptimized images.
A build produces a static `out/` folder.

Because Supabase usernames are created at runtime, the dynamic route `/profile/[username]` cannot
be pre-rendered. Instead, `app/not-found.tsx` acts as an **SPA fallback**: GitHub Pages serves it
as `404.html` for any unknown path, and it re-renders the correct profile from the URL on the client.

A `.nojekyll` file and a `CNAME` (`amelogius.me`) are included.

A minimal GitHub Actions workflow:

```yaml
name: Deploy
on:
  push: { branches: [main] }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_TENOR_API_KEY: ${{ secrets.NEXT_PUBLIC_TENOR_API_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: out }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

---

## 🧩 Project structure

```
app/
  layout.tsx                  Root layout + AuthProvider
  page.tsx                    Home feed
  login/page.tsx              Auth (login / register)
  search/page.tsx             Explore: user search + trends
  profile/[username]/page.tsx Profile route (static-export wrapper)
  not-found.tsx               SPA fallback (404.html) for dynamic profiles
  globals.css                 Design system + utilities
components/
  AppShell.tsx                3-column layout, auth gating, onboarding gate
  Sidebar.tsx  RightSidebar.tsx  BottomNav.tsx
  Feed.tsx     ChirpCard.tsx     Composer.tsx  ComposeModal.tsx
  GifPicker.tsx  ProfileView.tsx  Onboarding.tsx
  Avatar.tsx   Spinner.tsx
lib/
  supabaseClient.js           Shared Supabase browser client
  db.ts                       All queries/mutations (profiles, chirps, likes, follows, trends)
  AuthContext.tsx             Session + profile state (useState/useEffect only)
  tenor.ts  time.ts  types.ts
supabase/
  schema.sql                  Tables, indexes, RLS, storage bucket
```

State management uses **only** standard React hooks (`useState`, `useEffect`) plus a small
Context for the auth session — no external state libraries.
