"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  User as UserIcon,
  LogOut,
  Sparkles,
  Feather,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "./Avatar";

export default function Sidebar({ onCompose }: { onCompose?: () => void }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search/", label: "Explore", icon: Search },
    {
      href: profile ? `/profile/${profile.username}/` : "/",
      label: "Profile",
      icon: UserIcon,
    },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.replace(/\/$/, ""));
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login/");
  }

  return (
    <aside className="sticky top-0 hidden h-screen flex-col justify-between px-2 py-4 sm:flex sm:w-20 xl:w-64">
      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="mb-2 flex items-center gap-2 px-3 py-2 xl:px-4"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon-grad shadow-neon">
            <Feather className="h-6 w-6 text-slate-950" />
          </span>
          <span className="hidden text-2xl font-black neon-text xl:inline">
            Chirp
          </span>
        </Link>

        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={`nav-link justify-center xl:justify-start ${
              isActive(href) ? "nav-link-active" : ""
            }`}
          >
            <Icon
              className={`h-6 w-6 ${
                isActive(href) ? "text-neon" : ""
              }`}
            />
            <span className="hidden xl:inline">{label}</span>
          </Link>
        ))}

        <button
          onClick={onCompose}
          className="btn-neon mt-3 flex items-center justify-center gap-2 py-3 xl:px-6"
        >
          <Sparkles className="h-5 w-5" />
          <span className="hidden xl:inline">Chirp</span>
        </button>
      </div>

      {profile && (
        <div className="glass mt-4 flex items-center gap-3 rounded-2xl p-2 xl:p-3">
          <Link href={`/profile/${profile.username}/`}>
            <Avatar
              url={profile.avatar_url}
              name={profile.display_name}
              size={40}
            />
          </Link>
          <div className="hidden min-w-0 flex-1 xl:block">
            <p className="truncate text-sm font-semibold text-white">
              {profile.display_name}
            </p>
            <p className="truncate text-xs text-slate-500">@{profile.username}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="hidden rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400 xl:block"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      )}
    </aside>
  );
}
