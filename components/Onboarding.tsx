"use client";

import { useState } from "react";
import { Feather, AtSign, Check, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/AuthContext";
import { convexErrorMessage } from "@/lib/convexErrors";
import { Spinner } from "./Spinner";

const HANDLE_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function Onboarding() {
  const { user, signOut } = useAuth();
  const createProfile = useMutation(api.profiles.create);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validFormat = HANDLE_RE.test(username);
  const availability = useQuery(
    api.profiles.isUsernameAvailable,
    validFormat ? { username } : "skip"
  );
  const checking = validFormat && availability === undefined;
  const available = validFormat ? availability : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!validFormat) {
      setError("Handle must be 3–20 chars: letters, numbers, underscores.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please choose a display name.");
      return;
    }
    if (!available) {
      setError("That handle was just taken. Try another.");
      return;
    }
    setSaving(true);
    try {
      await createProfile({
        username,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });
    } catch (err) {
      setError(convexErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 animate-fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-neon-grad shadow-neon">
            <Feather className="h-8 w-8 text-slate-950" />
          </span>
          <h1 className="text-2xl font-black text-white">Claim your handle</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pick a unique username and name to start chirping.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Username (handle)
            </label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="amelogius"
                className="input-field pl-9 pr-9"
                maxLength={20}
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking ? (
                  <Spinner size={16} />
                ) : available === true && validFormat ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : available === false || (username && !validFormat) ? (
                  <X className="h-4 w-4 text-red-400" />
                ) : null}
              </span>
            </div>
            {username && !validFormat && (
              <p className="mt-1 text-xs text-amber-400">
                3–20 characters, letters/numbers/underscores only.
              </p>
            )}
            {available === false && validFormat && (
              <p className="mt-1 text-xs text-red-400">Handle already taken.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Amelogius"
              className="input-field"
              maxLength={40}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Bio <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Neon dreamer. Building cool things."
              rows={2}
              className="input-field resize-none"
              maxLength={160}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving || !validFormat || !displayName.trim() || !available}
            className="btn-neon flex w-full items-center justify-center gap-2 py-3"
          >
            {saving ? <Spinner size={18} /> : "Enter Chirp"}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
