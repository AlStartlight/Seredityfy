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
      const availableCredits = maxCredits - usedCredits;

      return NextResponse.json({
        subscription: subscription || null,
        plan,
        limits,
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
    const { userId, plan, validUntil } = body;

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

    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        validUntil: validUntil ? new Date(validUntil) : nextWeek,
        credits,
        monthlyCredits: credits,
        creditResetDate: nextWeek,
      },
      create: {
        userId,
        plan,
        validUntil: validUntil ? new Date(validUntil) : nextWeek,
        credits,
        monthlyCredits: credits,
        creditResetDate: nextWeek,
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
