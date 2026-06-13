"use client";

import { useRef, useState } from "react";
import { ImagePlus, Film, X, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/AuthContext";
import { convexErrorMessage } from "@/lib/convexErrors";
import Avatar from "./Avatar";
import GifPicker from "./GifPicker";
import { Spinner } from "./Spinner";
import type { Gif } from "@/lib/types";

const MAX = 280;

type Props = {
  onPosted?: () => void;
};

export default function Composer({ onPosted }: Props) {
  const { user, profile } = useAuth();
  const createChirp = useMutation(api.chirps.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{ url: string; isGif: boolean } | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const remaining = MAX - text.length;
  const overLimit = remaining < 0;
  const canPost =
    !!user && !posting && !overLimit && (text.trim().length > 0 || !!media || !!localFile);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMedia(null);
    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
  }

  function pickGif(gif: Gif) {
    setLocalFile(null);
    setLocalPreview(null);
    setMedia({ url: gif.url, isGif: true });
    setShowGif(false);
  }

  function clearMedia() {
    setMedia(null);
    setLocalFile(null);
    setLocalPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (!user || !canPost) return;
    setPosting(true);
    try {
      let mediaUrl = media?.url;
      let storageId: Id<"_storage"> | undefined;
      let isGif = media?.isGif ?? false;

      if (localFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": localFile.type },
          body: localFile,
        });
        if (!result.ok) {
          throw new Error("Upload failed.");
        }
        const json = (await result.json()) as { storageId: Id<"_storage"> };
        storageId = json.storageId;
        mediaUrl = undefined;
        isGif = false;
      }

      await createChirp({
        text: text.trim() || undefined,
        mediaUrl,
        storageId,
        isGif,
      });

      setText("");
      clearMedia();
      onPosted?.();
    } catch (error) {
      alert(`Could not post: ${convexErrorMessage(error)}`);
    } finally {
      setPosting(false);
    }
  }

  const previewSrc = localPreview ?? media?.url ?? null;

  return (
    <div className="border-b border-slate-800/60 px-4 py-4">
      <div className="flex gap-3">
        <Avatar url={profile?.avatar_url} name={profile?.display_name ?? "?"} size={48} />

        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's chirping?"
            rows={2}
            className="w-full resize-none bg-transparent text-lg text-slate-100 placeholder:text-slate-500 outline-none"
          />

          {previewSrc && (
            <div className="relative mt-2 inline-block max-w-full overflow-hidden rounded-2xl border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt="preview" className="max-h-80 w-auto" />
              <button
                onClick={clearMedia}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-black"
                aria-label="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-neon">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-full p-2 transition hover:bg-neon/10 active:scale-90"
                aria-label="Add image"
                title="Add image"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowGif(true)}
                className="rounded-full p-2 transition hover:bg-neon/10 active:scale-90"
                aria-label="Add GIF"
                title="Add GIF"
              >
                <Film className="h-5 w-5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <span
                  className={`text-sm tabular-nums ${
                    overLimit
                      ? "text-red-400"
                      : remaining <= 20
                      ? "text-amber-400"
                      : "text-slate-500"
                  }`}
                >
                  {remaining}
                </span>
              )}
              <button
                onClick={submit}
                disabled={!canPost}
                className="btn-neon flex items-center gap-2 px-5 py-2 text-sm"
              >
                {posting ? (
                  <Spinner size={16} />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Chirp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showGif && <GifPicker onSelect={pickGif} onClose={() => setShowGif(false)} />}
    </div>
  );
}
