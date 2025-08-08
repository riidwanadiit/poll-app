import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  distDir: 'out',
  basePath: isProd ? "/poll-app" : "",
  assetPrefix: isProd ? "/poll-app/" : "",
};

export default nextConfig;
