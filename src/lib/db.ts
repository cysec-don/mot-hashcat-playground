// Prisma client singleton with robust initialization
// The dynamic require approach works around Turbopack's module resolution issues
// with @prisma/client-<hash> by resolving at runtime instead of bundle time.

let prismaClient: any = null;

function getPrismaClient() {
  if (prismaClient) return prismaClient;

  const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined;
  };

  if (globalForPrisma.prisma) {
    prismaClient = globalForPrisma.prisma;
    return prismaClient;
  }

  try {
    // Use require instead of import to avoid Turbopack bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    prismaClient = new PrismaClient({
      log: ["error", "warn"],
    });
  } catch (e) {
    console.error("Failed to initialize Prisma client:", e);
    throw e;
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaClient;
  }

  return prismaClient;
}

export const db = getPrismaClient();
