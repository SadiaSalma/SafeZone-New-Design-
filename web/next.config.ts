import type { NextConfig } from "next";

// Where the FastAPI backend runs. Can be changed with an API_URL setting later.
const API_URL = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Forwarding rule: the browser asks the website (port 3000) for /api/...,
  // and the website quietly passes the request on to the backend (port 8000).
  // So the browser only ever talks to ONE address - simpler and safer.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
