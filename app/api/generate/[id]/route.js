import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { getJobStatus } from '@/src/lib/queue/imageQueue';
import { auth } from '../../../../auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const image = await prisma.generatedImage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const response = {
      id: image.id,
      status: image.status,
      prompt: image.prompt,
      enhancedPrompt: image.enhancedPrompt,
      imageUrl: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
      model: image.model,
      generationMode: image.generationMode,
      metadata: image.metadata,
      visibility: image.visibility,
      width: image.width,
      height: image.height,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      user: image.user,
    };

    if (image.status === 'PENDING') {
      try {
        response.jobStatus = await getJobStatus(id);
      } catch {
        response.jobStatus = { status: 'queue_unavailable' };
      }
    }

    return NextResponse.json(response);

  } catch (err) {
    console.error('Image status error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const image = await prisma.generatedImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (image.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this image' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { visibility, metadata } = body;

    const updateData = {};
    
    if (visibility !== undefined) {
      const { canShareToCommunity } = await import('@/src/lib/services/visibility');
      
      const canShare = await canShareToCommunity(session.user.id);
      if (visibility === 'PUBLIC' && !canShare) {
        return NextResponse.json(
          { error: 'Your plan does not allow public sharing. Upgrade to share to community.' },
          { status: 403 }
        );
      }
      updateData.visibility = visibility;
    }
    
    if (metadata !== undefined) {
      updateData.metadata = {
        ...image.metadata,
        ...metadata,
      };
    }

    const updated = await prisma.generatedImage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      image: updated,
    });

  } catch (err) {
    console.error('Image update error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const image = await prisma.generatedImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    if (image.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this image' },
        { status: 403 }
      );
    }

    await prisma.generatedImage.delete({
      where: { id },
    });

    if (image.imageUrl) {
      const { deleteImage } = await import('@/src/lib/storage/cloudinary');
      const publicId = image.imageUrl.split('/').pop().split('.')[0];
      await deleteImage(publicId);
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });

  } catch (err) {
    console.error('Image delete error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
