import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // M12: hide X-Powered-By header
  poweredByHeader: false,
  // L15: disable source maps in production to prevent source code leakage
  productionBrowserSourceMaps: false,
  // H4: limit request body size — enforced at the application layer in parseJsonObjectBody
  // (Next.js 16 doesn't expose a config-level bodySizeLimit for App Router; we cap in code)
};

export default nextConfig;
