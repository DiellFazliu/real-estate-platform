'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa'

interface LoginFormProps {
  callbackUrl?: string
}

export default function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result || result.error) {
      setError('Email ose fjalëkalim i gabuar.')
      return
    }

    // ⭐ RIDREJTO NË CALLBACK URL
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGitHubLogin() {
    setError('')
    setGithubLoading(true)

    try {
      await signIn('github', {
        callbackUrl, // ⭐ CALLBACK URL
      })
    } catch {
      setGithubLoading(false)
      setError('Nuk mund të kyçet me GitHub.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Mirë se vjen përsëri</h1>

          <p>Kyçu në llogarinë tënde të pasurive të patundshme.</p>
        </div>

        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={githubLoading || loading}
          className="w-full border border-border rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          <FaGithub className="w-5 h-5" />

          {githubLoading ? 'Duke u kyçur...' : 'Vazhdo me GitHub'}
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-foreground/50">OSE</span>
          <div className="h-px flex-1 bg-border" />
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Fjalëkalimi</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            disabled={loading || githubLoading}
            className="auth-button"
          >
            {loading ? 'Duke u kyçur...' : 'Kyçu'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Nuk ke llogari?{' '}
            {/* ⭐ KALON CALLBACK URL */}
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              Krijo një
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}