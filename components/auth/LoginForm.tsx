"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGitHubLogin() {
    setError("");
    setGithubLoading(true);

    try {
      await signIn("github", {
        callbackUrl: "/",
      });
    } catch {
      setGithubLoading(false);
      setError("Unable to sign in with GitHub.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>

          <p>
            Sign in to your real estate account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={githubLoading || loading}
          className="w-full border border-border rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          <FaGithub className="w-5 h-5 " />

          {githubLoading
            ? "Connecting to GitHub..."
            : "Continue with GitHub"}
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-foreground/50">
            OR
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || githubLoading}
            className="auth-button"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link href="/register">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}