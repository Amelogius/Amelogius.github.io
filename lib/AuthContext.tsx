"use client";

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Profile } from "./types";

type AuthUser = {
  id: Id<"users">;
};

type AuthState = {
  /** True while Convex Auth reads the stored session on startup. */
  initializing: boolean;
  /** True while user/profile queries are loading for an authenticated session. */
  sessionLoading: boolean;
  /** Either auth init or session data is still loading. */
  loading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  profile: Profile | null;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut: authSignOut } = useAuthActions();
  const userId = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );
  const profile = useQuery(
    api.profiles.getByUserId,
    userId ? { userId } : "skip"
  );

  const initializing = isLoading;
  const sessionLoading =
    isAuthenticated &&
    (userId === undefined ||
      (userId !== null && profile === undefined));
  const loading = initializing || sessionLoading;

  const refreshProfile = useCallback(async () => {
    // Convex queries refresh reactively; this exists for API compatibility.
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, [authSignOut]);

  const user =
    isAuthenticated && userId ? { id: userId } : null;

  const value: AuthState = {
    initializing,
    sessionLoading,
    loading,
    isAuthenticated,
    user,
    profile: profile ?? null,
    needsOnboarding:
      isAuthenticated &&
      Boolean(userId) &&
      !sessionLoading &&
      profile === null,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
