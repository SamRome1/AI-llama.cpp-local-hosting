'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/../lib/supabase/auth-provider'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.push('/home')
      } else {
        router.push('/login')
      }
    }
  }, [authLoading, user, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-gray-400">Loading...</div>
    </main>
  )
}
