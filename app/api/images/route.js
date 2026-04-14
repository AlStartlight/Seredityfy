import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { getCommunityImages } from '@/src/lib/services/visibility';
import { auth } from '../../../auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const type = searchParams.get('type') || 'community';

    const session = await auth();
    const userId = session?.user?.id;

    if (type === 'community') {
      const result = await getCommunityImages({
        page,
        limit,
        category,
        search,
        sortBy,
        sortOrder,
      });
      return NextResponse.json(result);
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to view your images' },
        { status: 401 }
      );
    }

    const where = { userId };

    if (category) {
      where.metadata = {
        path: ['category'],
        equals: category,
      };
    }

    const [images, total] = await Promise.all([
      prisma.generatedImage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.generatedImage.count({ where }),
    ]);

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const image = await prisma.generatedImage.create({
      data: {
        prompt,
        userId: session.user.id,
        model: model || 'seredityfy-v2',
        status: 'PENDING',
      },
    });

    return NextResponse.json(image, { status: 201 });

  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    );
  }
}
