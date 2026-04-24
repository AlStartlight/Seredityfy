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
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      google_client:   !!process.env.GOOGLE_CLIENT_ID,
    },
    db: null,
    status: 'pending',
  };

  if (!activeUrl) {
    report.status = 'error';
    report.db = 'No database URL found in any known variable';
    return NextResponse.json(report, { status: 503 });
  }

  try {
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
