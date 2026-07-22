"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HardDrive, KeyRound, Mail, ArrowRight } from "lucide-react"

// Pull keys out of your secure environmental config variables automatically
const SUPABASE_URL = "https://oiwjjpsdtxkagyuhrzfw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd2pqcHNkdHhrYWd5dWhyemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTU0NzgsImV4cCI6MjEwMDI3MTQ3OH0.DhfPMIGJhNE7BH7-ygKtF77rKgtcKFp0f4xHnBCCCRw
";

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

      // Determine the correct Supabase REST endpoint path depending on toggle state
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

      // If we are logging in, extract the access token session parameters and save it locally
      if (!isSignUp && data.access_token) {
        // Securely drop the session token into browser local storage or cookies
        localStorage.setItem("qsaver_session_token", data.access_token)
        document.cookie = `session_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`
        
        alert("🎉 Login Successful! Redirecting to your workspace feed dashboard...")
        router.push("/")
      } else if (isSignUp) {
        alert("✅ Account created successfully! Please check your email inbox to confirm validation, then sign in.")
        setIsSignUp(false) // Toggle back to login block view
      }

    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        
        {/* Branding Logo Block */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <HardDrive className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isSignUp ? "Create your Q-Saver Account" : "Welcome back to Q-Saver"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Enter your details to start saving cross-device cloud clips" : "Log in to view your private database workspace feed"}
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Input Interface Layout */}
        <form onSubmit={handleAuthentication} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 size-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        {/* Form Toggle Link Area */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-medium text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
          >
            {isSignUp ? "Already have a profile slot? Sign In" : "Don't have an account workspace? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  )
}
