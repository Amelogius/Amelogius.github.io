import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";

// Required for `output: 'export'`. Usernames are created at runtime and are not
// known at build time, so we emit no prebuilt pages here. Direct visits and
// client navigations are resolved by the SPA fallback in app/not-found.tsx
// (served as 404.html on static hosts like GitHub Pages), which renders this
// same ProfileView based on the URL.
export function generateStaticParams() {
  return [] as { username: string }[];
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
