// app/api/auth/forgot-password/route.ts — step 1 of password reset.
//
// Anti-enumeration: the response is IDENTICAL whether or not the email
// exists, so attackers can't probe which addresses are registered.
// Same reason the catch block returns the same message.
//
// Token pattern:
//   • Generate a random 32-byte token (sent via email link)
//   • Store only the SHA-256 hash in the DB (a leaked DB doesn't leak tokens)
//   • One hour expiry, previous tokens for the user are invalidated first
//
// Users without a password_hash (GitHub-only sign-ups) get the same
// generic response — there's nothing to reset.

import { NextResponse } from 'next/server'
import crypto from 'crypto'

import { prisma } from '@/lib/db/prisma'
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail'

// Shared across success, silent-skip, and error paths so the response
// shape can't be used to enumerate accounts.
const GENERIC_RESET_MESSAGE =
  'Nëse ekziston një llogari me këtë email, do të marrësh një link për rivendosjen e fjalëkalimit.'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = String(body.email || '')
      .trim()
      .toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'Email-i është i detyrueshëm.' },
        { status: 400 },
      )
    }

    const genericResponse = NextResponse.json({
      message: GENERIC_RESET_MESSAGE,
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

    // Invalidate previous reset links — only the newest one works.
    await prisma.passwordResetToken.deleteMany({
      where: { user_id: user.id },
    })

    // Raw token goes into the email; only its hash is stored.
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

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

    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`

    await sendPasswordResetEmail({
      email: user.email,
      resetUrl,
    })

    return genericResponse
  } catch (error) {
    console.error('Forgot password error:', error)

    // Same response as success so an internal error doesn't leak that the
    // email did/didn't exist.
    return NextResponse.json({ message: GENERIC_RESET_MESSAGE })
  }
}