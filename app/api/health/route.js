import { NextResponse } from 'next/server';

const DB_CANDIDATES = [
  'DATABASE_URL',
  'seredityfy_POSTGRES_PRISMA_URL',
  'seredityfy_POSTGRES_URL',
  'seredityfy_POSTGRES_URL_NON_POOLING',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
];

export async function GET() {
  const dbVars = {};
  for (const key of DB_CANDIDATES) {
    const val = process.env[key];
    dbVars[key] = val ? `SET (${val.slice(0, 28)}...)` : 'NOT SET';
  }

  const activeUrl =
    process.env.DATABASE_URL ||
    process.env.seredityfy_POSTGRES_PRISMA_URL ||
    process.env.seredityfy_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  const report = {
    timestamp: new Date().toISOString(),
    active_db_url: activeUrl ? `${activeUrl.slice(0, 28)}...` : null,
    db_candidates: dbVars,
    env: {
      nextauth_url:    !!process.env.NEXTAUTH_URL,
      auth_url:        !!process.env.AUTH_URL,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      auth_secret:     !!process.env.AUTH_SECRET,
      google_client:   !!process.env.GOOGLE_CLIENT_ID,
    },
    db_connect: null,
    db_tables:  null,
    status: 'pending',
  };

  if (!activeUrl) {
    report.status = 'error';
    report.db_connect = 'No database URL found';
    return NextResponse.json(report, { status: 503 });
  }

  try {
    const { default: prisma } = await import('@/src/lib/prisma');

    // 1. Basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    report.db_connect = 'ok';

    // 2. Check if schema tables exist
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    report.db_tables = tables.map(t => t.tablename);

    report.status = report.db_tables.length === 0 ? 'no_tables' : 'ok';
  } catch (err) {
    report.status = 'error';
    report.db_connect = err instanceof Error ? err.message : String(err);
  }

  const httpStatus = report.status === 'ok' ? 200 : 503;
  return NextResponse.json(report, { status: httpStatus });
}
