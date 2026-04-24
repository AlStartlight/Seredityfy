import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ needsVerification: false }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (user && !user.emailVerified) {
      return NextResponse.json({ needsVerification: true });
    }

    return NextResponse.json({ needsVerification: false });
  } catch {
    return NextResponse.json({ needsVerification: false });
  }
}
