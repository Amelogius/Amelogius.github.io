# 🐦 Chirp

A stylish, **cyberpunk / minimal-dark** Twitter clone built with **Next.js 14 (App Router)**,
**Convex**, **Tailwind CSS** and **Lucide** icons.

Everything is **client-side only** and the app is built with `output: 'export'`, so it deploys
as a fully static site (e.g. **GitHub Pages** — this repo is wired up for `amelogius.me`).

![theme](https://img.shields.io/badge/theme-cyberpunk-00F0FF) ![stack](https://img.shields.io/badge/Next.js-14-black) ![db](https://img.shields.io/badge/Convex-FF6B6B)

---

## ✨ Features

- **Auth** (email + password) via [Convex Auth](https://labs.convex.dev/auth).
- **Onboarding flow** — new users must pick a unique `@handle` and display name before entering.
- **Feed** with two tabs: **Global** (chronological) and **Following**.
- **Composer** with text, **image upload** (Convex file storage) and **GIF search** (KLIPY API).
- **Like** & retweet interactions (likes are persisted in the DB).
- **Search page** — live client-side user search + derived **Trending topics**.
- **Profiles** — banner, avatar, bio, follower/following counts, follow/unfollow, user's chirps.
- **3-column responsive layout** with glassmorphism, neon accents, and springy micro-animations.
- **Live reactive feeds** via Convex subscriptions (no polling needed).

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
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_KLIPY_API_KEY=your-klipy-api-key
```

> `NEXT_PUBLIC_CONVEX_URL` is exposed to the browser because the app is 100% client-side.
> Auth and data access rules are enforced by Convex functions on the backend.

### 3. Set up Convex

Create a Convex project and deploy the schema/functions:

```bash
npx convex dev
```

This starts the Convex dev server, deploys `convex/` to your project, and writes
`NEXT_PUBLIC_CONVEX_URL` into `.env.local`. Keep it running alongside the Next.js dev server.

### 4. Get a KLIPY API key (for GIFs)

Create a key at the [KLIPY Partner Panel](https://partner.klipy.com)
and put it in `NEXT_PUBLIC_KLIPY_API_KEY`. (GIF search degrades gracefully if omitted.)

### 5. Run it

```bash
npm run dev      # starts Next.js + Convex in parallel → http://localhost:3000
npm run build    # static export into ./out
```

---

## 🗄️ Database schema

```text
profiles ( userId → users, username UNIQUE, displayName, avatarUrl, bannerUrl, bio )
chirps   ( userId → users, text, mediaUrl, isGif )
follows  ( followerId → users, followingId → users )
likes    ( userId → users, chirpId → chirps )
```

Auth tables (`users`, sessions, etc.) come from Convex Auth's `authTables`.

Access control is enforced in Convex mutations/queries — reads are public, writes require
authentication and ownership checks.

---

## 📦 Deploying to GitHub Pages

`next.config.mjs` already sets `output: 'export'`, `trailingSlash: true` and unoptimized images.
A build produces a static `out/` folder.

Because usernames are created at runtime, the dynamic route `/profile/[username]` cannot
be pre-rendered. Instead, `app/not-found.tsx` acts as an **SPA fallback**: GitHub Pages serves it
as `404.html` for any unknown path, and it re-renders the correct profile from the URL on the client.

A `.nojekyll` file and a `CNAME` (`amelogius.me`) are included.

The included GitHub Actions workflow deploys Convex functions and builds the static site:

```yaml
- run: npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
  env:
    CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
    NEXT_PUBLIC_KLIPY_API_KEY: ${{ secrets.NEXT_PUBLIC_KLIPY_API_KEY }}
```

Set up a [Convex deploy key](https://docs.convex.dev/production/hosting/) as the
`CONVEX_DEPLOY_KEY` GitHub secret.

---

## 🧩 Project structure

```
app/
  layout.tsx                  Root layout + Convex + Auth providers
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
convex/
  schema.ts                   Tables + Convex Auth tables
  auth.ts  http.ts             Convex Auth (password provider)
  profiles.ts  chirps.ts       Queries & mutations
  follows.ts  trends.ts  files.ts  users.ts
lib/
  ConvexClientProvider.tsx    Convex + ConvexAuth provider
  AuthContext.tsx             Session + profile state
  convexErrors.ts  klipy.ts  time.ts  types.ts
```

State management uses React hooks plus Convex's reactive `useQuery` / `useMutation` hooks
for live data, and a small Context for auth session state.
