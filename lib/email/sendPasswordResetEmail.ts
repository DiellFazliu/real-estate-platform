import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

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

  await transporter.sendMail({
    from: `"Villaron" <${from}>`,
    to: email,
    subject: 'Reset your Villaron password',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      ">
        <h2>Reset your Villaron password</h2>

        <p>
          We received a request to reset your Villaron account password.
        </p>

        <p>
          Click the button below to choose a new password.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #6B4C3B;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Reset password
          </a>
        </div>

        <p>This link will expire in 1 hour.</p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <p>— Villaron</p>
      </div>
    `,
  })
}