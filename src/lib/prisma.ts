import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercel's Supabase integration injects vars with a project-name prefix
// (e.g. seredityfy_POSTGRES_PRISMA_URL). Fall back through known names so
// the app works regardless of which variable is present.
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.seredityfy_POSTGRES_PRISMA_URL ||
  process.env.seredityfy_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error(
    '[prisma] No database URL found. Checked: DATABASE_URL, ' +
    'seredityfy_POSTGRES_PRISMA_URL, seredityfy_POSTGRES_URL, ' +
    'POSTGRES_PRISMA_URL, POSTGRES_URL'
  );
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
