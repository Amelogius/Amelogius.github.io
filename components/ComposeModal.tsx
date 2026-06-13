"use client";

import { X } from "lucide-react";
import Composer from "./Composer";

export default function ComposeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-xl overflow-hidden rounded-none sm:mt-10 sm:rounded-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <span className="font-bold text-white">New chirp</span>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Composer onPosted={onClose} />
      </div>
    </div>
  );
}
