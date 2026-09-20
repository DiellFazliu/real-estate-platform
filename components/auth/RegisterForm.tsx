'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaGithub } from 'react-icons/fa'
import Link from 'next/link'

interface RegisterFormProps {
  callbackUrl?: string
}

export default function RegisterForm({
  callbackUrl = '/',
}: RegisterFormProps) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen.')
      return
    }

    if (password.length < 8) {
      setError('Fjalëkalimi duhet të ketë së paku 8 karaktere.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Nuk mund të krijohej llogaria.')
        setLoading(false)
        return
      }

      const loginResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.error) {
        setError(
          'Llogaria u krijua, por login automatik dështoi. Kyçu manualisht.'
        )
        setLoading(false)
        return
      }

      // ⭐ RIDREJTO NË CALLBACK URL
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      console.error(error)
      setError('Diçka shkoi keq. Provo përsëri.')
      setLoading(false)
    }
  }

  async function handleGitHubRegister() {
    setError('')
    setGithubLoading(true)

    try {
      await signIn('github', {
        callbackUrl, // ⭐ CALLBACK URL
      })
    } catch (error) {
      console.error(error)
      setGithubLoading(false)
      setError('Nuk mund të regjistrohesh me GitHub.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Krijo Llogari</h1>
          <p>Gjej pronën tënde të ardhshme me ne.</p>
        </div>

        <button
          type="button"
          onClick={handleGitHubRegister}
          disabled={githubLoading || loading}
          className="w-full border border-border rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          <FaGithub className="w-5 h-5" />

          {githubLoading
            ? 'Duke u lidhur me GitHub...'
            : 'Vazhdo me GitHub'}
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-foreground/50">OSE</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Emri i Plotë</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Filan Fisteku"
              required
            />
          </div>

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
            <label htmlFor="phone">Telefoni</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+383 44 123 456"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Fjalëkalimi</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimumi 8 karaktere"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmo Fjalëkalimin</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Përsërit fjalëkalimin"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            disabled={loading || githubLoading}
            className="auth-button"
          >
            {loading ? 'Duke u regjistruar...' : 'Krijo Llogari'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Ke llogari?{' '}
            {/* ⭐ KALON CALLBACK URL */}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              Kyçu
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}