import { ConvexError } from "convex/values";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements: (password: string) => {
        if (password.length < 6) {
          throw new ConvexError("Password must be at least 6 characters.");
        }
      },
    }),
  ],
});
