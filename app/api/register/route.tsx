import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      phone,
    } = body;

    // ----------------------------------------
    // Validation
    // ----------------------------------------

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Name, email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // Check existing user
    // ----------------------------------------

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------
    // Find normal USER role
    // ----------------------------------------

    const userRole = await prisma.role.findFirst({
      where: {
        name: "USER",
      },
    });

    if (!userRole) {
      return NextResponse.json(
        {
          error:
            "USER role does not exist. Please seed the database first.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------
    // Hash password
    // ----------------------------------------

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // ----------------------------------------
    // Create user
    // ----------------------------------------

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        phone: phone
          ? String(phone).trim()
          : null,
        role_id: userRole.id,
        is_active: true,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while creating the account.",
      },
      {
        status: 500,
      }
    );
  }
}