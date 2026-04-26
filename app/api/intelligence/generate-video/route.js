import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/auth';
import { generateVideoWithLuma, pollLumaGeneration } from '@/src/lib/ai/luma';
import { generateVideoWithVeo } from '@/src/lib/ai/veo';

export const maxDuration = 60;

const CREDIT_PER_SECOND = 24;
const calcCreditCost = (durationSeconds) => Math.max(1, durationSeconds) * CREDIT_PER_SECOND;

// Inject Cloudinary text overlay without re-encoding — works for FREE users
function applyCloudinaryWatermark(videoUrl) {
  if (!videoUrl || !videoUrl.includes('cloudinary.com/') || !videoUrl.includes('/upload/')) {
    return videoUrl;
  }
  const watermark = 'l_text:Arial_18_bold_italic:seredityfy.art,co_white,o_75,g_south_east,x_16,y_12';
  return videoUrl.replace('/upload/', `/upload/${watermark}/`);
}

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const body = await request.json();
    const {
      prompt,
      sourceImageUrl,
      sourceImageName = 'untitled',
      engine = 'LUMA',
      duration = 8,
      motionStyle = 'cinematic',
      cameraStyle = 'slow push in',
      style = 'ultra realistic',
      platform = 'youtube',
      aspectRatio = '16:9',
      resolution = '720p',
    } = body;

    if (!prompt || !sourceImageUrl) {
      return NextResponse.json(
        { error: 'Prompt and source image are required' },
        { status: 400 }
      );
    }

    const creditCost = calcCreditCost(duration);

    /* Fetch subscription once — reused for credit check + watermark decision */
    let subscription = null;
    let userPlan = 'FREE';
    if (userId) {
      subscription = await prisma.subscription.findUnique({ where: { userId } });
      userPlan = subscription?.plan ?? 'FREE';

      if (subscription) {
        const available = userPlan === 'ENTERPRISE'
          ? Infinity
          : (subscription.credits ?? 40) - (subscription.usedCredits ?? 0);

        if (available < creditCost) {
          return NextResponse.json(
            {
              error: `Insufficient credits. Need ${creditCost} (${duration}s × ${CREDIT_PER_SECOND} CR/s), have ${Math.max(0, available)}.`,
              creditCost,
              available: Math.max(0, available),
              creditPerSecond: CREDIT_PER_SECOND,
            },
            { status: 429 }
          );
        }
      }
    }

    const isFreeUser = userPlan === 'FREE';

    /* Create video record */
    const video = await prisma.generatedVideo.create({
      data: {
        prompt,
        sourceImageUrl,
        sourceImageName,
        status: 'PENDING',
        engine,
        duration,
        motionStyle,
        cameraStyle,
        style,
        aspectRatio,
        creditsCost: creditCost,
        userId,
        metadata: { platform, resolution, watermarked: isFreeUser },
      },
    });

    const updateStatus = async (status, extra = {}) => {
      await prisma.generatedVideo.update({
        where: { id: video.id },
        data: { status, ...extra },
      });
    };

    await updateStatus('PROCESSING');

    /* Call Veo or fallback engine */
    const enrichedPrompt = `${prompt}, camera: ${cameraStyle}, motion: ${motionStyle}, style: ${style}`;
    const genResult = engine === 'VEO'
      ? await generateVideoWithVeo({ prompt: enrichedPrompt, imageUrl: sourceImageUrl, aspectRatio, resolution, duration })
      : await generateVideoWithLuma({ prompt: enrichedPrompt, imageUrl: sourceImageUrl, aspectRatio, duration });

    if (!genResult.success) {
      await updateStatus('FAILED', { metadata: { error: 'Generation failed', platform, resolution } });
      return NextResponse.json(
        { error: 'Video generation failed', id: video.id },
        { status: 500 }
      );
    }

    /* Resolve output — Veo returns completed, Luma may need polling */
    let videoUrl = genResult.mockVideoUrl || genResult.videoUrl || genResult.videoData || null;
    let thumbnailUrl = genResult.thumbnailUrl || null;

    if (engine !== 'VEO' && genResult.generationId && !genResult.mockVideoUrl) {
      /* Luma polling loop */
      const pollStart = Date.now();
      const POLL_TIMEOUT = 60_000;
      const POLL_INTERVAL = 3_000;

      while (Date.now() - pollStart < POLL_TIMEOUT) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
        const pollResult = await pollLumaGeneration(genResult.generationId);

        if (pollResult.state === 'completed') {
          videoUrl = pollResult.videoUrl;
          thumbnailUrl = pollResult.thumbnailUrl;
          break;
        }
        if (pollResult.state === 'failed') {
          await updateStatus('FAILED', { metadata: { error: pollResult.error } });
          return NextResponse.json(
            { error: pollResult.error || 'Video generation failed', id: video.id },
            { status: 500 }
          );
        }
      }
    }

    /* Apply Cloudinary watermark for FREE users */
    const finalVideoUrl = isFreeUser ? applyCloudinaryWatermark(videoUrl) : videoUrl;

    /* Deduct credits */
    if (userId) {
      await prisma.subscription.update({
        where: { userId },
        data: { usedCredits: { increment: creditCost } },
      }).catch(() => {});
    }

    await updateStatus('COMPLETED', {
      videoUrl: finalVideoUrl,
      thumbnailUrl: thumbnailUrl || sourceImageUrl,
    });

    return NextResponse.json({
      id: video.id,
      status: 'COMPLETED',
      videoUrl: finalVideoUrl,
      thumbnailUrl: thumbnailUrl || sourceImageUrl,
      prompt,
      engine,
      duration,
      platform,
      aspectRatio,
      resolution,
      watermarked: isFreeUser,
      creditsCost: creditCost,
      creditPerSecond: CREDIT_PER_SECOND,
    }, { status: 201 });

  } catch (err) {
    console.error('[generate-video]', err);
    return NextResponse.json(
      { error: err.message, status: 'FAILED' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page = parseInt(searchParams.get('page') || '1');

    const where = userId ? { userId } : {};

    const [videos, total] = await Promise.all([
      prisma.generatedVideo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.generatedVideo.count({ where }),
    ]);

    return NextResponse.json({
      videos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[generate-video GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
