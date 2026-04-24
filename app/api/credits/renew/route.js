import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST() {
  try {
    const now = new Date();
    const overdue = await prisma.subscription.findMany({
      where: {
        plan: { not: 'ENTERPRISE' },
        creditResetDate: { lte: now },
      },
    });

    let renewed = 0;
    for (const sub of overdue) {
      const cycle = sub.billingCycle || 'WEEKLY';
      const cycleMs = cycle === 'MONTHLY'
        ? 30 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

      let resetTime = sub.creditResetDate.getTime();
      while (now.getTime() >= resetTime) resetTime += cycleMs;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          usedCredits: 0,
          creditResetDate: new Date(resetTime),
        },
      });
      renewed++;
    }

    return NextResponse.json({ renewed, total: overdue.length });
  } catch (error) {
    console.error('Credit renewal error:', error);
    return NextResponse.json({ error: 'Renewal failed' }, { status: 500 });
  }
}
