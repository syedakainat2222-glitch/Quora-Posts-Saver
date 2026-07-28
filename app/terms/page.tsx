"use client"

import Link from "next/link"
import { HardDrive } from "lucide-react"

export default function TermsPage() {
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
            <p className="text-xs text-muted-foreground">Terms of Service</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Terms of Service</h1>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By using the Q‑Saver Service (“we”, “our”, “us”), you agree to be bound by these Terms. If you do not agree, please discontinue use immediately.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use the Service. By using the Service, you represent that you are at least 13 and have the legal capacity to enter into this agreement.
          </p>

          <h2>3. Account Registration</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate and complete information during registration.</li>
            <li>You are solely responsible for all activities that occur under your account.</li>
          </ul>

          <h2>4. User Content</h2>
          <ul>
            <li>You retain ownership of the content you save.</li>
            <li>By saving content, you grant us a non‑exclusive, worldwide, royalty‑free license to store, display, and process it in order to provide the Service.</li>
            <li>You agree not to save content that is illegal, defamatory, obscene, or infringes on third‑party rights.</li>
          </ul>

          <h2>5. Prohibited Uses</h2>
          <p>You may not use the Service to:</p>
          <ul>
            <li>Violate any applicable law or regulation.</li>
            <li>Impersonate any person or entity.</li>
            <li>Interfere with or disrupt the integrity of the Service.</li>
            <li>Attempt to gain unauthorised access to any part of the Service.</li>
          </ul>

          <h2>6. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time, with or without cause, if we believe you have violated these Terms. You may also delete your account at any time by contacting us.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            All software, design, logos, and content (excluding user‑saved content) are the property of Q‑Saver and protected by copyright and trademark laws.
          </p>

          <h2>8. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of any material changes via email or by posting a notice on the Service. Continued use after changes constitutes acceptance of the new Terms.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the jurisdiction in which we operate, without regard to conflict of law principles.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have any questions about these Terms, please email us at: <strong>support@qsaver.com</strong>.
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
