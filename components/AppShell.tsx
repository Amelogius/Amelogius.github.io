"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import BottomNav from "./BottomNav";
import Onboarding from "./Onboarding";
import { Spinner } from "./Spinner";
import ComposeModal from "./ComposeModal";

type Props = {
  children: ReactNode;
  // Some pages (e.g. profile) are public and shouldn't force a login redirect.
  requireAuth?: boolean;
  // Hide the right sidebar (e.g. the dedicated search page renders its own).
  hideRightSidebar?: boolean;
};

export default function AppShell({
  children,
  requireAuth = true,
  hideRightSidebar = false,
}: Props) {
  const { loading, user, needsOnboarding } = useAuth();
  const router = useRouter();
  const [compose, setCompose] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.replace("/login/");
    }
  }, [loading, requireAuth, user, router]);

  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  if (needsOnboarding) {
    return <Onboarding />;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 sm:px-4">
      <Sidebar onCompose={() => setCompose(true)} />

      <main className="min-h-screen w-full flex-1 border-x border-slate-800/60 pb-20 sm:pb-0">
        {children}
      </main>

      {!hideRightSidebar && <RightSidebar />}

      <BottomNav onCompose={() => setCompose(true)} />

      {compose && user && <ComposeModal onClose={() => setCompose(false)} />}
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong w-full max-w-lg rounded-3xl p-8 text-center">
        <h1 className="mb-2 text-2xl font-black neon-text">Chirp needs setup</h1>
        <p className="mb-4 text-slate-300">
          Add your Supabase credentials to start. Copy{" "}
          <code className="rounded bg-slate-800 px-1 text-neon">
            .env.local.example
          </code>{" "}
          to <code className="rounded bg-slate-800 px-1 text-neon">.env.local</code>{" "}
          and fill in:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-slate-950/70 p-4 text-left text-xs text-slate-300">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_TENOR_API_KEY=...`}
        </pre>
        <p className="mt-4 text-sm text-slate-500">
          Then run the SQL in{" "}
          <code className="text-neon">supabase/schema.sql</code> and restart the
          dev server.
        </p>
      </div>
    </div>
  );
}
