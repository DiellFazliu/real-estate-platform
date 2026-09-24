'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen.')
      return
    }

    if (password.length < 8) {
      setError(
        'Fjalëkalimi duhet të ketë së paku 8 karaktere.'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        '/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.error ||
            'Nuk mund të ndryshohej fjalëkalimi.'
        )
        return
      }

      setSuccess(
        'Fjalëkalimi u ndryshua me sukses. Po të ridrejtojmë në login...'
      )

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError(
        'Diçka shkoi keq. Provo përsëri.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset password</h1>

          <p>
            Vendos një fjalëkalim të ri për
            llogarinë tënde.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="password">
              Fjalëkalimi i ri
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Minimumi 8 karaktere"
              required
              disabled={loading || !!success}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Konfirmo fjalëkalimin
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Përsërit fjalëkalimin"
              required
              disabled={loading || !!success}
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="auth-button"
          >
            {loading
              ? 'Duke ndryshuar...'
              : 'Ndrysho fjalëkalimin'}
          </button>
        </form>

        {!success && (
          <div className="auth-footer">
            <p>
              <Link href="/login">
                Kthehu te login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

