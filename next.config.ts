import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/color-game",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
