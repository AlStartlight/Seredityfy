import { NextResponse } from 'next/server';

// Candidate variable names Vercel/Supabase integration may inject
const DB_CANDIDATES = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'SUPABASE_DB_URL',
  'DATABASE_PRISMA_URL',
];

export async function GET() {
  // Show which DB-related vars exist (masked after first 20 chars)
  const dbVars = {};
  for (const key of DB_CANDIDATES) {
    const val = process.env[key];
    dbVars[key] = val
      ? `SET (${val.slice(0, 20)}...)`
      : 'NOT SET';
  }

  // Show all env var NAMES that contain "SUPA", "POSTGRES", or "DATABASE"
  const relatedKeys = Object.keys(process.env).filter(k =>
    /SUPA|POSTGRES|DATABASE|PRISMA/i.test(k)
  );

  const report = {
    timestamp: new Date().toISOString(),
    env: {
      nextauth_url:    !!process.env.NEXTAUTH_URL,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      google_client:   !!process.env.GOOGLE_CLIENT_ID,
    },
    db_candidates: dbVars,
    related_keys_found: relatedKeys,
    db: null,
    status: 'pending',
  };

  // Try to connect with whichever URL is available
  const activeUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!activeUrl) {
    report.status = 'error';
    report.db = 'No database URL found in any known variable name';
    return NextResponse.json(report, { status: 503 });
  }

  try {
    // Lazy import so module load doesn't crash if no URL
    const { default: prisma } = await import('@/src/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    report.db = 'connected';
    report.status = 'ok';
  } catch (err) {
    report.status = 'error';
    report.db = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(report, { status: report.status === 'ok' ? 200 : 503 });
}
