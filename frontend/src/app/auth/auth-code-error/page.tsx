'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-xl p-8 bg-zinc-900/60 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-6">
          There was an error with your authentication link. It may have expired or been invalid.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2 rounded-lg bg-emerald-600 text-sm font-semibold hover:bg-emerald-700 transition"
        >
          Back to Login
        </Link>
      </div>
    </main>
  )
}
