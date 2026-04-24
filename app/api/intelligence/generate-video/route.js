import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { auth } from '@/auth';
import { generateVideoWithLuma, pollLumaGeneration } from '@/src/lib/ai/luma';
import { generateVideoWithVeo } from '@/src/lib/ai/veo';

const VIDEO_CREDIT_COST = 24;

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
      aspectRatio = '16:9',
    } = body;

    if (!prompt || !sourceImageUrl) {
      return NextResponse.json(
        { error: 'Prompt and source image are required' },
        { status: 400 }
      );
    }

    /* Credit check for authenticated users */
    if (userId) {
      const subscription = await prisma.subscription.findUnique({ where: { userId } });

      if (subscription) {
        const maxCredits = subscription.plan === 'ENTERPRISE' ? Infinity : 500;
        const usedCredits = subscription.usedCredits || 0;
        const available = subscription.plan === 'ENTERPRISE' ? Infinity : maxCredits - usedCredits;

        if (available < VIDEO_CREDIT_COST) {
          return NextResponse.json(
            { error: `Insufficient credits. Need ${VIDEO_CREDIT_COST}, have ${Math.max(0, available)}.` },
            { status: 429 }
          );
        }
      }
    }

    /* Create video record */
    const video = await prisma.generatedVideo.create({
      data: {
        prompt,
        sourceImageUrl,
        sourceImageName,
        status: 'PENDING',
        engine: engine,
        duration,
        motionStyle,
        cameraStyle,
        style,
        aspectRatio,
        creditsCost: VIDEO_CREDIT_COST,
        userId,
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
      ? await generateVideoWithVeo({ prompt: enrichedPrompt, imageUrl: sourceImageUrl, aspectRatio, duration })
      : await generateVideoWithLuma({ prompt: enrichedPrompt, imageUrl: sourceImageUrl, aspectRatio, duration });

    if (!genResult.success) {
      await updateStatus('FAILED', { metadata: { error: 'Generation failed' } });
      return NextResponse.json(
        { error: 'Video generation failed', id: video.id },
        { status: 500 }
      );
    }

    /* Resolve output — Veo returns completed, Luma needs polling */
    let videoUrl = genResult.mockVideoUrl || genResult.videoUrl || genResult.videoData || null;
    let thumbnailUrl = genResult.thumbnailUrl || null;

    if (engine === 'VEO') {
      /* Veo returns results synchronously — no polling needed */
      if (!videoUrl && !genResult.success) {
        await updateStatus('FAILED', { metadata: { error: 'Veo returned no output' } });
        return NextResponse.json({ error: 'Video generation failed', id: video.id }, { status: 500 });
      }
    } else if (genResult.generationId && !genResult.mockVideoUrl) {
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

    /* Deduct credits */
    if (userId) {
      await prisma.subscription.update({
        where: { userId },
        data: { usedCredits: { increment: VIDEO_CREDIT_COST } },
      }).catch(() => {});
    }

    await updateStatus('COMPLETED', {
      videoUrl,
      thumbnailUrl: thumbnailUrl || sourceImageUrl,
    });

    return NextResponse.json({
      id: video.id,
      status: 'COMPLETED',
      videoUrl,
      thumbnailUrl: thumbnailUrl || sourceImageUrl,
      prompt,
      engine,
      duration,
      creditsCost: VIDEO_CREDIT_COST,
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
