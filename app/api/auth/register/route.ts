import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";

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

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = (error as any)?.code ?? null;
    console.error("[register] error:", code, message);

    // Always expose detail so Vercel Function Logs + client can show real cause.
    // Remove the `detail` field once production is stable.
    return NextResponse.json(
      { error: "Failed to create user", detail: message, code },
      { status: 500 }
    );
  }
}
