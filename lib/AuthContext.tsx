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

  const authLoading =
    isLoading || (isAuthenticated && userId === undefined);
  const profileLoading = Boolean(userId) && profile === undefined;
  const loading = authLoading || profileLoading;

  const refreshProfile = useCallback(async () => {
    // Convex queries refresh reactively; this exists for API compatibility.
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, [authSignOut]);

  const user =
    isAuthenticated && userId ? { id: userId } : null;

  const value: AuthState = {
    loading,
    isAuthenticated,
    user,
    profile: profile ?? null,
    needsOnboarding:
      isAuthenticated &&
      Boolean(userId) &&
      !profileLoading &&
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
