"use client"

import Link from "next/link"
import { HardDrive } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Logo / Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <HardDrive className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Q-Saver</h1>
            <p className="text-xs text-muted-foreground">Privacy Policy</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <p>
            Q-Saver (“we”, “our”, “us”) respects your privacy. This policy explains how we collect, use, and protect your personal information when you use our website and browser extension (collectively, the “Service”).
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li><strong>Account Data:</strong> When you sign up, we collect your email address and a display name.</li>
            <li><strong>Saved Content:</strong> The posts, replies, and tags you save from Quora are stored in our database to provide the Service.</li>
            <li><strong>Usage Data:</strong> We may collect anonymous analytics about how you interact with the Service (e.g., page views, feature usage).</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To authenticate you and provide a personalised experience.</li>
            <li>To store and retrieve your saved posts across devices.</li>
            <li>To improve our Service and fix issues.</li>
            <li>To send you important service updates (e.g., security alerts).</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          <p>
            Your data is stored securely on <strong>Supabase</strong> (Postgres database) and <strong>Vercel</strong> (our hosting provider). We use industry‑standard encryption (SSL/TLS) for data in transit and at rest.
          </p>

          <h2>4. Third‑Party Services</h2>
          <ul>
            <li><strong>Supabase:</strong> Authentication and database.</li>
            <li><strong>Vercel:</strong> Hosting and serverless functions.</li>
          </ul>
          <p>These providers have their own privacy policies, which we encourage you to review.</p>

          <h2>5. Your Rights</h2>
          <ul>
            <li><strong>Access:</strong> You can view your stored data at any time through the dashboard.</li>
            <li><strong>Correction:</strong> You can update your display name in Settings.</li>
            <li><strong>Deletion:</strong> You can delete individual posts or your entire account by contacting us.</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>
            We use a session cookie to keep you logged in. No tracking cookies are used for advertising.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this policy occasionally. We will notify you of any material changes via email or a notice on the Service.
          </p>

          <h2>8. Contact</h2>
          <p>
            For any privacy‑related questions, please email us at: <strong>support@qsaver.com</strong>.
          </p>

          <hr className="my-8" />
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
