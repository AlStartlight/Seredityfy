import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/src/lib/prisma";
import { validateEmail } from "@/src/lib/email/validate";
import { sendVerificationEmail } from "@/src/lib/email/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const validation = await validateEmail(email);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const emailResult = await sendVerificationEmail({
      email,
      name: name || undefined,
      token,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.art';

    return NextResponse.json(
      {
        message: "Account created. Please check your email for the verification link.",
        emailSent: emailResult.sent,
        // When server-side send fails, pass everything the browser needs to
        // call EmailJS directly. The browser Origin header satisfies EmailJS
        // allowed-origins check — no private key required.
        ...(emailResult.clientFallback && {
          clientEmailNeeded: true,
          verifyToken: token,
          siteUrl,
          emailjsConfig: {
            serviceId:  process.env.EMAILJS_SERVICE_ID  ?? '',
            templateId: process.env.EMAILJS_TEMPLATE_ID ?? '',
            publicKey:  process.env.EMAILJS_USER_ID     ?? '',
          },
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = (error as any)?.code ?? null;
    console.error("[register] error:", code, message);

    return NextResponse.json(
      { error: "Failed to create user", detail: message, code },
      { status: 500 }
    );
  }
}
