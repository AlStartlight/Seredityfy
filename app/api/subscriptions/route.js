import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { SUBSCRIPTION_LIMITS, CREDIT_PLANS } from '@/src/lib/services/visibility';
import { auth } from '../../../auth';

export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const currentUser = searchParams.get('current');

    if (currentUser && session?.user?.id) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      });

      const plan = subscription?.plan || 'FREE';
      const limits = SUBSCRIPTION_LIMITS[plan];
      const maxCredits = limits.weeklyCredits === Infinity ? 999999 : limits.weeklyCredits;
      const usedCredits = subscription?.usedCredits || 0;
      const billingCycle = subscription?.billingCycle || 'WEEKLY';
      const availableCredits = maxCredits - usedCredits;

      return NextResponse.json({
        subscription: subscription || null,
        plan,
        limits,
        billingCycle,
        credits: maxCredits,
        availableCredits,
        usedCredits,
        creditPlans: CREDIT_PLANS,
      }, { status: 200 });
    }

    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(subscriptions, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, plan, validUntil, billingCycle } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, plan' },
        { status: 400 }
      );
    }

    const validPlans = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: FREE, STARTER, PRO, ENTERPRISE' },
        { status: 400 }
      );
    }

    const limits = SUBSCRIPTION_LIMITS[plan];
    const credits = limits.weeklyCredits === Infinity ? 999999 : limits.weeklyCredits;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const cycle = billingCycle || 'WEEKLY';
    const now = new Date();
    const nextReset = new Date(now);
    if (cycle === 'MONTHLY') {
      nextReset.setMonth(nextReset.getMonth() + 1);
    } else {
      nextReset.setDate(nextReset.getDate() + 7);
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        billingCycle: cycle,
        validUntil: validUntil ? new Date(validUntil) : nextReset,
        credits,
        monthlyCredits: credits,
        creditResetDate: nextReset,
        usedCredits: 0,
      },
      create: {
        userId,
        plan,
        billingCycle: cycle,
        validUntil: validUntil ? new Date(validUntil) : nextReset,
        credits,
        monthlyCredits: credits,
        creditResetDate: nextReset,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}
