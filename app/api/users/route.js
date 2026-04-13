import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
      },
      create: {
        email,
        name: name || null,
      },
      include: {
        images: {
          select: {
            id: true,
            prompt: true,
            imageUrl: true,
            status: true,
            createdAt: true,
          },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            validUntil: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create or update user' },
      { status: 500 }
    );
  }
}
