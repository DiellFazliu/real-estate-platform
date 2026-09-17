import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || null;
    const bio = body.bio?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);

    // Check whether another user already has this email
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use." },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        phone,
        bio,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}