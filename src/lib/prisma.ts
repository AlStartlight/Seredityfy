import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel Supabase integration injects vars with a project-name prefix.
// Fall back through all known names.
const rawUrl =
  process.env.DATABASE_URL ||
  process.env.seredityfy_POSTGRES_PRISMA_URL ||
  process.env.seredityfy_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

// Supabase pooler (pgbouncer) requires ?pgbouncer=true so Prisma
// disables prepared statements — without it, code 42P05 is thrown.
function withPgbouncer(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.includes('pgbouncer=true')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}pgbouncer=true&connection_limit=1`;
}

const dbUrl = withPgbouncer(rawUrl);

if (!dbUrl) {
  console.error('[prisma] No database URL found in any known env var.');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
