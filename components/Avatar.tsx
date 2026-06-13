"use client";

import { useMemo } from "react";

type Props = {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
};

// Deterministic gradient based on the name so avatars look unique & on-brand.
function gradientFor(name: string): string {
  const palettes = [
    "from-[#00F0FF] to-[#8A2BE2]",
    "from-[#8A2BE2] to-[#FF2BD1]",
    "from-[#00F0FF] to-[#22D3EE]",
    "from-[#7C3AED] to-[#00F0FF]",
    "from-[#F472B6] to-[#8A2BE2]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

export default function Avatar({ url, name, size = 48, className = "" }: Props) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  const gradient = useMemo(() => gradientFor(name || "?"), [name]);

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ring-1 ring-slate-700 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-bold text-slate-950 ring-1 ring-slate-700 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
