import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
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

    const validPlans = ['FREE', 'PRO', 'ENTERPRISE'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: FREE, PRO, ENTERPRISE' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
      create: {
        userId,
        plan,
        validUntil: validUntil ? new Date(validUntil) : null,
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
