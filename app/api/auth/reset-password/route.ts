// app/api/auth/reset-password/route.ts — step 2 of password reset.
//
// Flow:
//   1. Hash the incoming token with SHA-256 and look it up
//   2. Validate: exists, not used, not expired, account active
//   3. Hash the new password with bcrypt (cost factor 12)
//   4. In one transaction: update the user's password_hash, mark this
//      token as used (kept for audit), delete any other outstanding
//      tokens for the same user
//
// The token is single-use: `used_at` is set instead of deleting the row
// so we keep a record of when the reset happened.

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/db/prisma'

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const token = String(body.token || '')
    const password = String(body.password || '')

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token-i dhe fjalëkalimi janë të detyrueshëm.' },
        { status: 400 },
      )
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Fjalëkalimi duhet të ketë të paktën ${MIN_PASSWORD_LENGTH} karaktere.`,
        },
        { status: 400 },
      )
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token_hash: tokenHash },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            'Ky link për rivendosjen e fjalëkalimit është i pavlefshëm ose ka skaduar.',
        },
        { status: 400 },
      )
    }

    if (resetToken.used_at) {
      return NextResponse.json(
        {
          error:
            'Ky link për rivendosjen e fjalëkalimit është përdorur tashmë.',
        },
        { status: 400 },
      )
    }

    if (resetToken.expires_at < new Date()) {
      return NextResponse.json(
        {
          error:
            'Ky link për rivendosjen e fjalëkalimit ka skaduar.',
        },
        { status: 400 },
      )
    }

    if (!resetToken.user.is_active) {
      return NextResponse.json(
        { error: 'Kjo llogari është joaktive.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Single transaction so a partial write can't leave the user with a
    // changed password but a still-usable token, or vice versa.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password_hash: passwordHash },
      }),

      // Mark this token used (kept for audit).
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      }),

      // Clean up any other outstanding tokens for the same user.
      prisma.passwordResetToken.deleteMany({
        where: {
          user_id: resetToken.user_id,
          id: { not: resetToken.id },
        },
      }),
    ])

    return NextResponse.json({
      message: 'Fjalëkalimi u rivendos me sukses.',
    })
  } catch (error) {
    console.error('Reset password error:', error)

    return NextResponse.json(
      {
        error: 'Diçka shkoi keq. Provoni përsëri.',
      },
      { status: 500 },
    )
  }
}