import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In production (Vercel serverless) do NOT cache on globalThis —
// each function invocation should use a fresh client that respects
// the connection-pool URL (pgbouncer). Only cache in development
// to avoid "too many connections" from hot-reload.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
