import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const token = String(body.token || '')
    const password = String(body.password || '')

    if (!token || !password) {
      return NextResponse.json(
        {
          error:
            'Token and password are required.',
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            'Password must contain at least 8 characters.',
        },
        { status: 400 }
      )
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          token_hash: tokenHash,
        },
        include: {
          user: true,
        },
      })

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            'This password reset link is invalid or has expired.',
        },
        { status: 400 }
      )
    }

    if (resetToken.used_at) {
      return NextResponse.json(
        {
          error:
            'This password reset link has already been used.',
        },
        { status: 400 }
      )
    }

    if (resetToken.expires_at < new Date()) {
      return NextResponse.json(
        {
          error:
            'This password reset link has expired.',
        },
        { status: 400 }
      )
    }

    if (!resetToken.user.is_active) {
      return NextResponse.json(
        {
          error: 'This account is inactive.',
        },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    )

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.user_id,
        },
        data: {
          password_hash: passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          used_at: new Date(),
        },
      }),

      prisma.passwordResetToken.deleteMany({
        where: {
          user_id: resetToken.user_id,
          id: {
            not: resetToken.id,
          },
        },
      }),
    ])

    return NextResponse.json({
      message:
        'Password has been reset successfully.',
    })
  } catch (error) {
    console.error(
      'Reset password error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Something went wrong. Please try again.',
      },
      { status: 500 }
    )
  }
}