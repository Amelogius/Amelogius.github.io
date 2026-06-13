"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";
import { Spinner } from "@/components/Spinner";

// On static hosts (GitHub Pages) any unknown path is served this page as
// 404.html. We use it as a single-page-app fallback so dynamic routes like
// /profile/<username>/ keep working even though they aren't prebuilt.
export default function NotFound() {
  const [resolved, setResolved] = useState(false);
  const [profileUser, setProfileUser] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "");
    const match = path.match(/\/profile\/([^/]+)$/);
    if (match) {
      setProfileUser(decodeURIComponent(match[1]));
    }
    setResolved(true);
  }, []);

  if (!resolved) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (profileUser) {
    return (
      <AppShell hideRightSidebar>
        <ProfileView username={profileUser} />
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-6xl font-black neon-text">404</h1>
      <p className="text-slate-400">This page flew off into the neon void.</p>
      <Link href="/" className="btn-neon px-6 py-2.5">
        Back to Chirp
      </Link>
    </div>
  );
}
