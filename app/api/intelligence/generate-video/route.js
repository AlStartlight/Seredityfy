import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/auth';
import { generateVideoWithLuma, pollLumaGeneration } from '@/src/lib/ai/luma';
import { generateVideoWithVeo, startVeoOperation } from '@/src/lib/ai/veo';

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

    const enrichedPrompt = `${prompt}, camera: ${cameraStyle}, motion: ${motionStyle}, style: ${style}`;

    /* ── VEO: async — start operation, return 202, client polls /status ── */
    if (engine === 'VEO') {
      const started = await startVeoOperation({
        prompt: enrichedPrompt,
        imageUrl: sourceImageUrl,
        durationSeconds: duration,
        aspectRatio,
        resolution,
      });

      if (!started.success) {
        await updateStatus('FAILED', { metadata: { error: started.error, platform, resolution } });
        return NextResponse.json({ error: started.error || 'Failed to start Veo generation', id: video.id }, { status: 500 });
      }

      await prisma.generatedVideo.update({
        where: { id: video.id },
        data: { metadata: { platform, resolution, watermarked: isFreeUser, operationName: started.operationName } },
      });

      return NextResponse.json({
        id: video.id,
        status: 'PROCESSING',
        operationName: started.operationName,
        platform,
        aspectRatio,
        resolution,
        duration,
        watermarked: isFreeUser,
        creditsCost: creditCost,
      }, { status: 202 });
    }

    /* ── Non-VEO (Luma etc.): synchronous ───────────────────────────────── */
    const genResult = await generateVideoWithLuma({ prompt: enrichedPrompt, imageUrl: sourceImageUrl, aspectRatio, duration });

    if (!genResult.success) {
      await updateStatus('FAILED', { metadata: { error: 'Generation failed', platform, resolution } });
      return NextResponse.json({ error: 'Video generation failed', id: video.id }, { status: 500 });
    }

    let videoUrl = genResult.mockVideoUrl || genResult.videoUrl || genResult.videoData || null;
    let thumbnailUrl = genResult.thumbnailUrl || null;

    if (genResult.generationId && !genResult.mockVideoUrl) {
      const pollStart = Date.now();
      while (Date.now() - pollStart < 55_000) {
        await new Promise(r => setTimeout(r, 3_000));
        const p = await pollLumaGeneration(genResult.generationId);
        if (p.state === 'completed') { videoUrl = p.videoUrl; thumbnailUrl = p.thumbnailUrl; break; }
        if (p.state === 'failed') {
          await updateStatus('FAILED', { metadata: { error: p.error } });
          return NextResponse.json({ error: p.error || 'Video generation failed', id: video.id }, { status: 500 });
        }
      }
    }

    const finalVideoUrl = isFreeUser ? applyCloudinaryWatermark(videoUrl) : videoUrl;

    if (userId) {
      await prisma.subscription.update({ where: { userId }, data: { usedCredits: { increment: creditCost } } }).catch(() => {});
    }

    await updateStatus('COMPLETED', { videoUrl: finalVideoUrl, thumbnailUrl: thumbnailUrl || sourceImageUrl });

    return NextResponse.json({
      id: video.id, status: 'COMPLETED',
      videoUrl: finalVideoUrl, thumbnailUrl: thumbnailUrl || sourceImageUrl,
      prompt, engine, duration, platform, aspectRatio, resolution,
      watermarked: isFreeUser, creditsCost: creditCost, creditPerSecond: CREDIT_PER_SECOND,
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
