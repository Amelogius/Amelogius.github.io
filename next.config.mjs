/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export so it can be hosted on GitHub Pages.
  output: "export",
  // GitHub Pages serves files without rewrites, so trailing slashes map to /folder/index.html.
  trailingSlash: true,
  // next/image optimization needs a server; disable it for static export.
  images: {
    unoptimized: true,
  },
  eslint: {
    // Don't fail the static export build on lint warnings.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
