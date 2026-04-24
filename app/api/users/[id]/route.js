import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '../../../../auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

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

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id || session.user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    const updated = await prisma.user.update({
      where: { id },
      data: { ...(name !== undefined && { name: name.trim() || null }) },
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
