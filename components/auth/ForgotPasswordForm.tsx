'use client'

// components/auth/ForgotPasswordForm.tsx — form on /forgot-password.
// Submits the email to /api/auth/forgot-password, then shows the API's
// response message. The API always returns the same success message
// regardless of whether the email exists, to prevent enumeration.

import { FormEvent, useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Diçka shkoi keq.')
        return
      }

      setMessage(
        data.message ||
          'Nëse ekziston një llogari me këtë email, do të marrësh një link për rivendosjen e fjalëkalimit.',
      )
    } catch {
      setError('Diçka shkoi keq. Provoni përsëri.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Ke harruar fjalëkalimin?</h1>

          <p>
            Shkruaj email-in tënd dhe do të të dërgojmë një link për ta
            ndryshuar fjalëkalimin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ti@shembull.com"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          {message && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Duke dërguar...' : 'Dërgo linkun'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link href="/login">Kthehu te login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}