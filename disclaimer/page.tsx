"use client"

import Link from "next/link"
import { HardDrive } from "lucide-react"

export default function DisclaimerPage() {
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
            <p className="text-xs text-muted-foreground">Disclaimer</p>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Disclaimer</h1>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>

          <h2>General Information</h2>
          <p>
            The Q‑Saver Service (“we”, “our”, “us”) is provided for informational and organisational purposes only. The content saved by users (posts, replies, tags) is the sole responsibility of the user. We do not endorse, verify, or guarantee the accuracy, completeness, or reliability of any content saved through our Service.
          </p>

          <h2>No Liability</h2>
          <p>
            To the fullest extent permitted by law, we are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from:
          </p>
          <ul>
            <li>Your use of the Service, including any errors or omissions in saved content.</li>
            <li>Any unauthorised access to or alteration of your data.</li>
            <li>Any third‑party content linked to or referenced within saved posts.</li>
          </ul>

          <h2>No Warranty</h2>
          <p>
            The Service is provided “as is” and “as available” without any warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, or non‑infringement.
          </p>

          <h2>External Links</h2>
          <p>
            Saved posts may contain links to external websites. We have no control over the content or practices of those sites and assume no responsibility for their content or privacy policies.
          </p>

          <h2>User Responsibility</h2>
          <p>
            You are solely responsible for ensuring that the content you save does not infringe any intellectual property rights, violate any laws, or contain offensive material. We reserve the right to remove any content that violates our Terms of Service.
          </p>

          <h2>Changes to This Disclaimer</h2>
          <p>
            We may update this disclaimer from time to time. Continued use of the Service constitutes acceptance of the updated disclaimer.
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
