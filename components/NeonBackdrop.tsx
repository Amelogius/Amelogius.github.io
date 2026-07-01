export default function NeonBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Blurred neon blobs drifting in the background. */}
      <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-hotpink/40 blur-[110px] animate-blob" />
      <div className="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full bg-sunset/35 blur-[120px] animate-blob-slow" />
      <div className="absolute -bottom-48 left-1/4 h-[32rem] w-[32rem] rounded-full bg-violet/40 blur-[110px] animate-blob [animation-delay:-8s]" />
      <div className="absolute top-2/3 left-2/3 h-[24rem] w-[24rem] rounded-full bg-neon/25 blur-[100px] animate-blob-slow [animation-delay:-14s]" />
      <div className="absolute -top-24 left-1/2 h-[22rem] w-[22rem] rounded-full bg-sunset/30 blur-[100px] animate-blob [animation-delay:-4s]" />
      <div className="absolute bottom-1/4 -left-24 h-[20rem] w-[20rem] rounded-full bg-hotpink/30 blur-[90px] animate-blob-slow [animation-delay:-20s]" />

      {/* Subtle vignette to keep the center readable. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,13,0.4)_100%)]" />
    </div>
  );
}
