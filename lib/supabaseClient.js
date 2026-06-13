import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// We export a single shared browser client. Because this app is a fully
// client-side static export, every query/mutation runs in the browser using
// the public anon key. Row Level Security (see supabase/schema.sql) is what
// keeps the data safe.
if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the build – just warn. The UI shows a friendly setup message.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn(
      "[Chirp] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.local.example to .env.local and fill in your keys."
    );
  }
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Name of the public Storage bucket used for image uploads.
export const MEDIA_BUCKET = "media";
