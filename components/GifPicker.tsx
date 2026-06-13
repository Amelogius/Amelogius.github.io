"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchGifs, isKlipyConfigured } from "@/lib/klipy";
import type { Gif } from "@/lib/types";
import { Spinner } from "./Spinner";

type Props = {
  onSelect: (gif: Gif) => void;
  onClose: () => void;
};

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isKlipyConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const results = await searchGifs(query);
      setGifs(results);
      setLoading(false);
    }, 350);
    return () => clearTimeout(debounce.current);
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="glass-strong flex h-[80vh] w-full max-w-lg flex-col rounded-t-2xl sm:rounded-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-800 p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search KLIPY"
              className="input-field pl-9 py-2"
            />
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {!isKlipyConfigured ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-slate-400">
              <p className="font-semibold text-slate-200">KLIPY not configured</p>
              <p className="text-sm">
                Add{" "}
                <code className="rounded bg-slate-800 px-1 text-neon">
                  NEXT_PUBLIC_KLIPY_API_KEY
                </code>{" "}
                to your <code className="text-neon">.env.local</code> to enable
                GIF search.
              </p>
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size={28} />
            </div>
          ) : gifs.length === 0 ? (
            <p className="mt-10 text-center text-slate-500">No GIFs found.</p>
          ) : (
            <div className="columns-2 gap-2 sm:columns-3">
              {gifs.map((gif) => (
                // eslint-disable-next-line @next/next/no-img-element
                <button
                  key={gif.id}
                  onClick={() => onSelect(gif)}
                  className="mb-2 block w-full overflow-hidden rounded-lg ring-1 ring-slate-800 transition hover:ring-2 hover:ring-neon active:scale-95"
                >
                  <img
                    src={gif.preview}
                    alt={gif.description}
                    loading="lazy"
                    className="w-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-2 text-center text-[11px] text-slate-500">
          Powered by KLIPY
        </div>
      </div>
    </div>
  );
}
