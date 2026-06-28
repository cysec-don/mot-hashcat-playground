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
  // Fix Prisma client module resolution error with Turbopack.
  // This tells Next.js to NOT bundle @prisma/client and instead resolve it
  // at runtime from node_modules, preventing the "Cannot find module
  // '@prisma/client-<hash>'" error.
  serverExternalPackages: ["@prisma/client", "@prisma/client/runtime", ".prisma/client"],
  // Allow dev origins for preview
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
