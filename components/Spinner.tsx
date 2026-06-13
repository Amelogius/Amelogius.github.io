export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-slate-600 border-t-neon"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}

export function ChirpSkeleton() {
  return (
    <div className="flex gap-3 border-b border-slate-800/60 px-4 py-4">
      <div className="skeleton h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  );
}
