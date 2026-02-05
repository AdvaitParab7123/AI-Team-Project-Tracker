import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";

// Enable connection pooling for serverless environments
if (process.env.VERCEL_ENV) {
  neonConfig.poolQueryViaFetch = true;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
