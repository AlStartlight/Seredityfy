import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            prompt: true,
            imageUrl: true,
            status: true,
            model: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            validUntil: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
