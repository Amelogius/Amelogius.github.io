import { ConvexError } from "convex/values";

export function convexErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data = error.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data) {
      return String((data as { message: unknown }).message);
    }
    return "Something went wrong.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
