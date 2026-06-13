"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User as UserIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function BottomNav({ onCompose }: { onCompose?: () => void }) {
  const { profile } = useAuth();
  const pathname = usePathname();

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

  return (
    <nav className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-2 py-2 sm:hidden">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={`rounded-full p-3 transition ${
            isActive(href) ? "text-neon" : "text-slate-400"
          }`}
          aria-label={label}
        >
          <Icon className="h-6 w-6" />
        </Link>
      ))}
      <button
        onClick={onCompose}
        className="btn-neon grid h-12 w-12 place-items-center"
        aria-label="New chirp"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    </nav>
  );
}
