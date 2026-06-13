import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";

// Required for `output: 'export'`. Usernames are created at runtime, so we
// emit a single placeholder page at build time (Next.js rejects an empty list).
// Direct visits and client navigations for real usernames are handled by the
// SPA fallback in app/not-found.tsx (404.html on static hosts).
export function generateStaticParams() {
  return [{ username: "_" }];
}

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <AppShell hideRightSidebar>
      <ProfileView username={decodeURIComponent(params.username)} />
    </AppShell>
  );
}
