import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(request) {
  try {
    const { prompt, userId, model = 'default' } = await request.json();
    if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

    const image = await prisma.generatedImage.create({
      data: { prompt, userId: userId ?? null, model, status: 'PENDING', imageUrl: '' }
    });

    // TODO: plug in real AI generation service here
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
