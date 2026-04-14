import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { getCommunityImages } from '@/src/lib/services/visibility';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await getCommunityImages({
      page,
      limit,
      category,
      search,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching community gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community gallery' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageId, reason } = body;

    if (!imageId || !reason) {
      return NextResponse.json(
        { error: 'Image ID and reason are required' },
        { status: 400 }
      );
    }

    const image = await prisma.generatedImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (image.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { error: 'Can only report public images' },
        { status: 400 }
      );
    }

    const report = await prisma.imageReport.create({
      data: {
        imageId,
        reporterId: body.reporterId || 'anonymous',
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      report,
      message: 'Report submitted successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
