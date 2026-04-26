import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/auth';
import { pollVeoOperation } from '@/src/lib/ai/veo';

function applyCloudinaryWatermark(videoUrl) {
  if (!videoUrl || !videoUrl.includes('cloudinary.com/') || !videoUrl.includes('/upload/')) return videoUrl;
  const wm = 'l_text:Arial_18_bold_italic:seredityfy.art,co_white,o_75,g_south_east,x_16,y_12';
  return videoUrl.replace('/upload/', `/upload/${wm}/`);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const video = await prisma.generatedVideo.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    /* Already settled */
    if (video.status === 'COMPLETED') {
      return NextResponse.json({
        id, status: 'COMPLETED',
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        platform: video.metadata?.platform,
        aspectRatio: video.aspectRatio,
        resolution: video.metadata?.resolution,
        watermarked: video.metadata?.watermarked ?? false,
        creditsCost: video.creditsCost,
      });
    }
    if (video.status === 'FAILED') {
      return NextResponse.json({ id, status: 'FAILED' });
    }

    /* Poll Veo operation */
    const operationName = video.metadata?.operationName;
    if (!operationName) {
      return NextResponse.json({ id, status: video.status });
    }

    const poll = await pollVeoOperation(operationName);

    if (!poll.done) {
      return NextResponse.json({ id, status: 'PROCESSING' });
    }

    if (!poll.success) {
      await prisma.generatedVideo.update({ where: { id }, data: { status: 'FAILED' } });
      return NextResponse.json({ id, status: 'FAILED', error: poll.error });
    }

    /* Done — apply watermark + deduct credits */
    const isFreeUser = video.metadata?.watermarked ?? true;
    const rawUrl = poll.videoUrl || poll.videoData;
    const finalUrl = isFreeUser ? applyCloudinaryWatermark(rawUrl) : rawUrl;

    const [updated] = await Promise.all([
      prisma.generatedVideo.update({
        where: { id },
        data: { status: 'COMPLETED', videoUrl: finalUrl, thumbnailUrl: finalUrl },
      }),
      video.userId
        ? prisma.subscription.update({
            where: { userId: video.userId },
            data: { usedCredits: { increment: video.creditsCost ?? 0 } },
          }).catch(() => {})
        : Promise.resolve(),
    ]);

    return NextResponse.json({
      id, status: 'COMPLETED',
      videoUrl: updated.videoUrl,
      thumbnailUrl: updated.thumbnailUrl || video.sourceImageUrl,
      duration: video.duration,
      platform: video.metadata?.platform,
      aspectRatio: video.aspectRatio,
      resolution: video.metadata?.resolution,
      watermarked: isFreeUser,
      creditsCost: video.creditsCost,
    });

  } catch (err) {
    console.error('[generate-video/status]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
