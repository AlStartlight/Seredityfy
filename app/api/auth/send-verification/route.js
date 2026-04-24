import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/src/lib/prisma';
import { validateEmail } from '@/src/lib/email/validate';
import { sendVerificationEmail } from '@/src/lib/email/send';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const validation = await validateEmail(email);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    // Delete stale tokens for this email before creating a new one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const result  = await sendVerificationEmail({ email, name: user.name, token });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.art';

    if (result.sent) {
      return NextResponse.json({ message: 'Verification email sent' });
    }

    // Server-side send failed — let the browser retry via EmailJS directly
    if (result.clientFallback) {
      return NextResponse.json({
        message: 'Please send via browser',
        clientEmailNeeded: true,
        verifyToken: token,
        siteUrl,
      });
    }

    return NextResponse.json({ error: result.reason }, { status: 500 });
  } catch (error) {
    console.error('[send-verification] error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
