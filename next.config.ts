import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent mywebsites/ has its own lockfile; without this Turbopack scans the
  // whole workspace and can hang forever on "Compiling /".
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
