import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      database_url: !!process.env.DATABASE_URL,
      nextauth_url: !!process.env.NEXTAUTH_URL,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      google_client_id: !!process.env.GOOGLE_CLIENT_ID,
    },
    db: null,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = 'connected';
  } catch (err) {
    checks.status = 'error';
    checks.db = err instanceof Error ? err.message : String(err);
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
