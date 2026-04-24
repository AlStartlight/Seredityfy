import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return new Response(
        `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0a1a;color:#fff;text-align:center;padding:2rem;">
          <div><h1 style="color:#f87171;">Invalid Link</h1><p>This verification link is missing required parameters.</p></div>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.identifier !== email) {
      return new Response(
        `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0a1a;color:#fff;text-align:center;padding:2rem;">
          <div><h1 style="color:#f87171;">Invalid Token</h1><p>This verification link is invalid or has already been used.</p></div>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (new Date() > record.expires) {
      return new Response(
        `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0a1a;color:#fff;text-align:center;padding:2rem;">
          <div><h1 style="color:#f87171;">Link Expired</h1><p>This verification link has expired. Please request a new one.</p></div>
        </body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html' } }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    return new Response(
      `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0a1a;color:#fff;text-align:center;padding:2rem;">
        <div>
          <div style="width:64px;height:64px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style="color:#22c55e;">Email Verified!</h1>
          <p style="color:#a1a1aa;margin-bottom:2rem;">Your email has been verified. You can now log in.</p>
          <a href="/login" style="display:inline-block;padding:0.75rem 2rem;border-radius:12px;background:#7c3aed;color:white;text-decoration:none;font-weight:bold;">Go to Login</a>
        </div>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('[verify-email] error:', error);
    return new Response(
      `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0a1a;color:#fff;text-align:center;padding:2rem;">
        <div><h1 style="color:#f87171;">Verification Failed</h1><p>Something went wrong. Please try again.</p></div>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
