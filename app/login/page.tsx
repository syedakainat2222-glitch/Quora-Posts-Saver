"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HardDrive, KeyRound, Mail, ArrowRight, Sparkles } from "lucide-react"

// Supabase config
const SUPABASE_URL = "https://oiwjjpsdtxkagyuhrzfw.supabase.co";
const SUPABASE_ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd2pqcHNkdHhrYWd5dWhyemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTU0NzgsImV4cCI6MjEwMDI3MTQ3OH0.DhfPMIGJhNE7BH7-ygKtF77rKgtcKFp0f4xHnBCCCRw`;

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.")
      }

      const endpoint = isSignUp ? "signup" : "token?grant_type=password"
      const authUrl = `${SUPABASE_URL}/auth/v1/${endpoint}`

      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY || ""
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error_description || data.error || "Authentication procedure failed.")
      }

      if (!isSignUp && data.access_token) {
        localStorage.setItem("qsaver_session_token", data.access_token)
        document.cookie = `session_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`
        
        alert("🎉 Login Successful! Redirecting to your workspace feed dashboard...")
        router.push("/")
      } else if (isSignUp) {
        alert("✅ Account created successfully! Please check your email inbox to confirm validation, then sign in.")
        setIsSignUp(false)
      }

    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 dark:from-slate-950 dark:to-slate-900">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 size-96 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10"></div>
        <div className="absolute -bottom-20 -right-20 size-96 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-500/10"></div>
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/80 dark:shadow-zinc-800/30">
        
        {/* Branding */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <HardDrive className="size-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            {isSignUp
              ? "Start saving your favourite Quora insights – all in one place."
              : "Sign in to access your private knowledge library."}
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-50/80 p-4 text-sm font-medium text-red-700 backdrop-blur-sm dark:bg-red-950/30 dark:text-red-300">
            <span className="mr-2">⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuthentication} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] hover:shadow-blue-500/40 disabled:opacity-60 disabled:hover:scale-100"
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                "Processing…"
              ) : isSignUp ? (
                <>
                  Create account
                  <Sparkles className="size-4" />
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-200/50 dark:border-zinc-800/50">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-transparent border-none cursor-pointer transition"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
