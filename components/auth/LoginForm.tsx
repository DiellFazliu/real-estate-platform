'use client'

// components/auth/LoginForm.tsx — email/password + GitHub sign-in.
// The `callbackUrl` prop comes from the page wrapper, which sanitizes it
// to a same-origin path before passing it here, so it's safe to use as a
// redirect target after signIn succeeds.

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa'
import { Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)

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

    // Manual redirect so we can hit the exact sanitized callbackUrl.
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGitHubLogin() {
    setError('')
    setGithubLoading(true)

    try {
      // GitHub OAuth is a full-page redirect — NextAuth handles the
      // return trip and respects callbackUrl after authorization.
      await signIn('github', { callbackUrl })
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
            <div className="flex items-center justify-between">
              <label htmlFor="password">Fjalëkalimi</label>

              <Link
                href="/forgot-password"
                className="text-sm text-[#6B4C3B] hover:underline"
              >
                Ke harruar fjalëkalimin?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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