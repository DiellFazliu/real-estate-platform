import { NextResponse } from 'next/server'
import crypto from 'crypto'

import { prisma } from '@/lib/db/prisma'
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = String(body.email || '')
      .trim()
      .toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      )
    }

    // Always return the same response so we don't reveal
    // whether an email belongs to an account.
    const genericResponse = NextResponse.json({
      message:
        'If an account exists for this email, you will receive a password reset link.',
    })

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        is_active: true,
      },
    })

    // GitHub-only accounts have no password_hash.
    if (!user || !user.is_active || !user.password_hash) {
      return genericResponse
    }

    // Invalidate previous reset links.
    await prisma.passwordResetToken.deleteMany({
      where: {
        user_id: user.id,
      },
    })

    // Generate a secure random token.
    const rawToken = crypto.randomBytes(32).toString('hex')

    // Store only the hash in the database.
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    )

    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    })

    const baseUrl =
      process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000'

    const resetUrl =
      `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`

    await sendPasswordResetEmail({
      email: user.email,
      resetUrl,
    })

    return genericResponse
  } catch (error) {
    console.error('Forgot password error:', error)

    // Don't expose internal errors.
    return NextResponse.json({
      message:
        'If an account exists for this email, you will receive a password reset link.',
    })
  }
}