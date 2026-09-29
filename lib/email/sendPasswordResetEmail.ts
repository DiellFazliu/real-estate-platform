// lib/email/sendPasswordResetEmail.ts — Nodemailer wrapper for password
// reset emails. Uses Gmail SMTP with an app password (not the account
// password). The `from` header is the same Gmail account we authenticate
// with, which is required by Gmail's anti-spoofing rules.

import nodemailer from 'nodemailer'

// Created once at module load and reused for every send — nodemailer
// pools the SMTP connection internally. Environment variables are checked
// at call time so a missing config throws a clear error instead of a
// silent SMTP failure.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Escapes a string for safe interpolation into HTML. The reset URL is
// generated server-side from a crypto-random hex token, so it *should*
// already be safe, but escaping is defense-in-depth against future
// callers passing something less controlled.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string
  resetUrl: string
}) {
  const from = process.env.GMAIL_USER
  const password = process.env.GMAIL_APP_PASSWORD

  if (!from) {
    throw new Error('GMAIL_USER is not configured')
  }

  if (!password) {
    throw new Error('GMAIL_APP_PASSWORD is not configured')
  }

  const safeResetUrl = escapeHtml(resetUrl)

  await transporter.sendMail({
    from: `"Villaron" <${from}>`,
    to: email,
    subject: 'Rivendos fjalëkalimin e Villaron',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      ">
        <h2>Rivendos fjalëkalimin e Villaron</h2>

        <p>
          Kemi marrë një kërkesë për të rivendosur fjalëkalimin e llogarisë tënde në Villaron.
        </p>

        <p>
          Kliko butonin më poshtë për të zgjedhur një fjalëkalim të ri.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${safeResetUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #6B4C3B;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Rivendos fjalëkalimin
          </a>
        </div>

        <p>Ky link skadon pas 1 ore.</p>

        <p>
          Nëse nuk e ke kërkuar ti këtë rivendosje, mund ta injorosh këtë email.
        </p>

        <p>— Villaron</p>
      </div>
    `,
  })
}