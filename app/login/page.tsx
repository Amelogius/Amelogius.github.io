"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Feather, Mail, Lock, Sparkles } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { isConvexConfigured } from "@/lib/ConvexClientProvider";
import { useAuth } from "@/lib/AuthContext";
import { convexErrorMessage } from "@/lib/convexErrors";
import { Spinner } from "@/components/Spinner";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated, initializing } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isConvexConfigured) {
      setError("Convex is not configured. See .env.local.example.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", mode === "login" ? "signIn" : "signUp");
      const result = await signIn("password", formData);
      if (result.signingIn) {
        router.replace("/");
      } else {
        setError("Sign in did not complete. Please try again.");
      }
    } catch (err) {
      setError(convexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (initializing || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-violet/30 blur-3xl" />

      <div className="glass-strong relative z-10 w-full max-w-md rounded-3xl p-8 animate-fade-up">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-neon-grad shadow-neon">
            <Feather className="h-9 w-9 text-slate-950" />
          </span>
          <h1 className="text-3xl font-black neon-text">Chirp</h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "login"
              ? "Welcome back to the neon timeline."
              : "Join the neon timeline."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field pl-9"
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-9"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-neon flex w-full items-center justify-center gap-2 py-3"
          >
            {submitting ? (
              <Spinner size={18} />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {mode === "login" ? "Sign in" : "Create account"}
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === "login" ? "New to Chirp?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="font-semibold text-neon transition hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
